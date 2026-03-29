"""
update_data.py
--------------
Fetches from publicly accessible endpoints (no IP blocking):

1. ind_close_all_DDMMYYYY.csv   → daily P/E, P/B, DY, OHLC for each index
2. ind_nifty*list.csv           → constituent symbols per index (static composition)
3. sec_bhavdata_full_DDMMYYYY.csv → daily OHLCV / price data for all NSE stocks
4. RBI DBIE XML                 → 10-Year G-Sec yield

Writes to MongoDB Atlas:
  - history_{index_slug}  : daily valuation entry (PE, PB, DY, OHLC)
  - constituents          : per-index stock list with today's price data
  - gsec_yields           : daily 10-Year G-Sec bond yield
  - pulse_snapshots       : daily tactical signal snapshots per index
  - week52_stats          : rolling 52-week high/low per index

Triggered daily via GitHub Actions (runs from GitHub's IP, not yours).
"""

import io
import os
import csv
import json
import math
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import date, timedelta
from typing import Optional, Dict, List
from pymongo import MongoClient
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------------
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

# ---------------------------------------------------------------------------
# Index configuration
# ---------------------------------------------------------------------------

INDEX_MAP = {
    "Nifty 50":              "nifty-50",
    "Nifty Next 50":         "nifty-next-50",
    "Nifty Midcap 150":      "nifty-midcap-150",
    "Nifty Smallcap 250":    "nifty-smallcap-250",
    "NIFTY LargeMidcap 250": "nifty-largemidcap-250",
    "Nifty 500":             "nifty-500",
}

CONSTITUENT_CSV_MAP = {
    "nifty-50":              "ind_nifty50list.csv",
    "nifty-next-50":         "ind_niftynext50list.csv",
    "nifty-midcap-150":      "ind_niftymidcap150list.csv",
    "nifty-smallcap-250":    "ind_niftysmallcap250list.csv",
    "nifty-largemidcap-250": "ind_niftylargemidcap250list.csv",
    "nifty-500":             "ind_nifty500list.csv",
}

# ---------------------------------------------------------------------------
# MongoDB connection
# ---------------------------------------------------------------------------
MONGODB_URI = os.getenv("MONGODB_URI", "")
db = None

if MONGODB_URI and "<db_password>" not in MONGODB_URI:
    try:
        if "://" in MONGODB_URI:
            prefix, rest = MONGODB_URI.split("://", 1)
            userpass, host = rest.rsplit("@", 1)
            if ":" in userpass:
                user, password = userpass.split(":", 1)
                MONGODB_URI = f"{prefix}://{user}:{urllib.parse.quote_plus(password)}@{host}"

        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=10_000)
        client.admin.command("ping")
        db = client.get_database("nifty-pulse")
        print("Connected to MongoDB Atlas.")
    except Exception as exc:
        print(f"MongoDB connection failed: {exc}")
else:
    print("No valid MONGODB_URI — skipping DB writes.")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def safe_float(val: str, default: float = 0.0) -> float:
    try:
        cleaned = str(val).strip().replace(",", "")
        if cleaned in ("-", "", "nan", "N/A"):
            return default
        return round(float(cleaned), 4)
    except Exception:
        return default


def fetch_csv(url: str) -> List[Dict[str, str]]:
    """Download a CSV from `url` and return a list of row dicts."""
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as resp:
        content = resp.read().decode("utf-8", errors="replace")
    reader = csv.DictReader(io.StringIO(content))
    return [{k.strip(): v.strip() for k, v in row.items()} for row in reader]


def fetch_url(url: str) -> str:
    """Download raw text content from a URL."""
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read().decode("utf-8", errors="replace")


# ---------------------------------------------------------------------------
# 1. Valuation history (PE, PB, DY, OHLC)
# ---------------------------------------------------------------------------
def update_valuations(today: date):
    """Write daily PE/PB/DY/OHLC to history_{index} collections."""
    url = (
        "https://archives.nseindia.com/content/indices/"
        f"ind_close_all_{today.strftime('%d%m%Y')}.csv"
    )
    print(f"\nFetching index valuations: {url}")
    try:
        rows = fetch_csv(url)
    except Exception as exc:
        print(f"  ✗ Failed to fetch valuation CSV: {exc}")
        return

    today_str = today.strftime("%Y-%m-%d")
    row_lookup = {r["Index Name"]: r for r in rows}

    for nse_name, index_id in INDEX_MAP.items():
        row = row_lookup.get(nse_name)
        if not row:
            print(f"  [{nse_name}] Not found in CSV — skipping.")
            continue

        entry = {
            "date":          today_str,
            "pe":            safe_float(row.get("P/E", "")),
            "pb":            safe_float(row.get("P/B", "")),
            "dividendYield": safe_float(row.get("Div Yield", "")),
            "open":          safe_float(row.get("Open Index Value", "")),
            "high":          safe_float(row.get("High Index Value", "")),
            "low":           safe_float(row.get("Low Index Value", "")),
            "close":         safe_float(row.get("Closing Index Value", "")),
        }
        print(f"  [{nse_name}] Close={entry['close']}, PE={entry['pe']}, PB={entry['pb']}")

        if db is not None:
            col_name = f"history_{index_id.replace('-', '_')}"
            try:
                db.get_collection(col_name).update_one(
                    {"date": today_str}, {"$set": entry}, upsert=True
                )
                print(f"    → Written to '{col_name}'")
            except Exception as exc:
                print(f"    → MongoDB write failed: {exc}")


# ---------------------------------------------------------------------------
# 2. Constituents — fetch symbol list + enrich with today's prices
# ---------------------------------------------------------------------------
def fetch_bhavcopy(today: date) -> Dict[str, Dict]:
    """Download the NSE full bhavcopy CSV and return a dict keyed by SYMBOL."""
    url = (
        "https://archives.nseindia.com/products/content/"
        f"sec_bhavdata_full_{today.strftime('%d%m%Y')}.csv"
    )
    print(f"\nFetching bhavcopy: {url}")
    rows = fetch_csv(url)

    lookup: Dict[str, Dict] = {}
    for r in rows:
        if r.get("SERIES") != "EQ":
            continue
        sym = r.get("SYMBOL", "")
        if not sym:
            continue
        prev_close = safe_float(r.get("PREV_CLOSE", "0"))
        last_price = safe_float(r.get("LAST_PRICE", "0"))
        p_change = (
            round((last_price - prev_close) / prev_close * 100, 2)
            if prev_close else 0.0
        )
        lookup[sym] = {
            "lastPrice":    last_price,
            "prevClose":    prev_close,
            "pChange":      p_change,
            "open":         safe_float(r.get("OPEN_PRICE", "0")),
            "high":         safe_float(r.get("HIGH_PRICE", "0")),
            "low":          safe_float(r.get("LOW_PRICE", "0")),
            "tradedValue":  round(safe_float(r.get("TURNOVER_LACS", "0")) / 100, 2),
        }
    print(f"  Bhavcopy loaded: {len(lookup)} EQ symbols")
    return lookup


def update_constituents(today: date, bhavcopy: Dict[str, Dict]):
    """Fetch constituent lists and merge with bhavcopy prices."""
    base_url = "https://archives.nseindia.com/content/indices/"

    for index_id, csv_file in CONSTITUENT_CSV_MAP.items():
        url = base_url + csv_file
        print(f"\n  [{index_id}] Fetching constituents: {url}")
        try:
            rows = fetch_csv(url)
        except Exception as exc:
            print(f"    ✗ Failed to fetch constituent list: {exc}")
            continue

        stocks = []
        for r in rows:
            symbol = r.get("Symbol", "").strip()
            if not symbol:
                continue
            price_data = bhavcopy.get(symbol, {})
            stocks.append({
                "symbol":      symbol,
                "name":        r.get("Company Name", symbol),
                "industry":    r.get("Industry", ""),
                "isin":        r.get("ISIN Code", ""),
                "lastPrice":   price_data.get("lastPrice",   0.0),
                "prevClose":   price_data.get("prevClose",   0.0),
                "pChange":     price_data.get("pChange",     0.0),
                "open":        price_data.get("open",        0.0),
                "high":        price_data.get("high",        0.0),
                "low":         price_data.get("low",         0.0),
                "tradedValue": price_data.get("tradedValue", 0.0),
            })

        print(f"    {len(stocks)} stocks enriched with price data")

        if db is not None:
            try:
                db.get_collection("constituents").update_one(
                    {"index_id": index_id},
                    {"$set": {
                        "index_id":   index_id,
                        "updated_at": today.strftime("%Y-%m-%d"),
                        "stocks":     stocks,
                    }},
                    upsert=True,
                )
                print(f"    → Written to 'constituents' (index_id='{index_id}')")
            except Exception as exc:
                print(f"    → MongoDB write failed: {exc}")


# ---------------------------------------------------------------------------
# 3. G-Sec 10-Year Yield (from RBI DBIE — free, public, no auth)
# ---------------------------------------------------------------------------
def update_gsec_yield(today: date):
    """
    Fetch the latest 10-Year G-Sec yield from RBI's DBIE public API.
    Fallback: scrape from CCIL or use a static recent value.
    """
    print("\n--- Fetching 10-Year G-Sec Yield ---")
    gsec_yield = None

    # Method 1: RBI DBIE XML feed for benchmark G-Sec yields
    try:
        # RBI publishes daily benchmark yields at this endpoint
        rbi_url = (
            "https://www.rbi.org.in/scripts/bs_viewcontent.aspx?"
            "Id=2009"
        )
        # Alternative: FBIL (Financial Benchmarks India Ltd) — more reliable
        fbil_url = (
            "https://www.fbil.org.in/api/getGsecYield"
        )
        # Try FBIL first (JSON API, more structured)
        try:
            req = urllib.request.Request(fbil_url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if isinstance(data, list) and len(data) > 0:
                    # Look for 10-year tenor
                    for item in data:
                        tenor = str(item.get("tenor", "")).strip()
                        if "10" in tenor:
                            gsec_yield = round(float(item.get("yield", 0)), 2)
                            print(f"  FBIL 10Y yield: {gsec_yield}%")
                            break
        except Exception:
            pass  # Fall through to fallback

        # Fallback: Use CCIL website or hardcoded recent value
        if gsec_yield is None:
            try:
                ccil_url = "https://www.ccilindia.com/OMrunningYield.aspx"
                content = fetch_url(ccil_url)
                # Parse for 10-year yield (simple text search)
                # CCIL pages vary in format, so this is a best-effort parse
                if "10" in content and "%" in content:
                    # Try to find yield near "10 Year" or "10Y"
                    import re
                    matches = re.findall(r'(\d+\.\d{2,4})\s*%', content)
                    if matches:
                        gsec_yield = round(float(matches[0]), 2)
                        print(f"  CCIL 10Y yield (parsed): {gsec_yield}%")
            except Exception:
                pass

    except Exception as exc:
        print(f"  ✗ G-Sec yield fetch failed: {exc}")

    # Final fallback: use a reasonable default
    if gsec_yield is None:
        gsec_yield = 7.0
        print(f"  Using default G-Sec yield: {gsec_yield}%")

    # Write to MongoDB
    if db is not None:
        today_str = today.strftime("%Y-%m-%d")
        try:
            db.get_collection("gsec_yields").update_one(
                {"date": today_str},
                {"$set": {"date": today_str, "yield": gsec_yield}},
                upsert=True,
            )
            print(f"  → Written to 'gsec_yields': {gsec_yield}%")
        except Exception as exc:
            print(f"  → MongoDB write failed: {exc}")

    return gsec_yield


# ---------------------------------------------------------------------------
# 4. 52-Week High/Low per index
# ---------------------------------------------------------------------------
def update_52week_stats(today: date):
    """Compute 52-week high and low for each index from MongoDB history."""
    if db is None:
        return

    print("\n--- Updating 52-Week Stats ---")
    one_year_ago = (today - timedelta(days=365)).strftime("%Y-%m-%d")
    today_str = today.strftime("%Y-%m-%d")

    for index_id in INDEX_MAP.values():
        col_name = f"history_{index_id.replace('-', '_')}"
        try:
            records = list(
                db.get_collection(col_name)
                .find({"date": {"$gte": one_year_ago, "$lte": today_str}})
                .sort("date", 1)
            )
            if not records:
                continue

            pe_values = [r["pe"] for r in records if r.get("pe", 0) > 0]
            close_values = [r["close"] for r in records if r.get("close", 0) > 0]

            if not pe_values or not close_values:
                continue

            stats = {
                "indexId":    index_id,
                "date":       today_str,
                "peHigh":     round(max(pe_values), 2),
                "peLow":      round(min(pe_values), 2),
                "priceHigh":  round(max(close_values), 2),
                "priceLow":   round(min(close_values), 2),
                "peHighDate": next(r["date"] for r in records if r.get("pe") == max(pe_values)),
                "peLowDate":  next(r["date"] for r in records if r.get("pe") == min(pe_values)),
            }

            db.get_collection("week52_stats").update_one(
                {"indexId": index_id},
                {"$set": stats},
                upsert=True,
            )
            print(f"  [{index_id}] Price 52W: {stats['priceLow']} - {stats['priceHigh']}, "
                  f"PE 52W: {stats['peLow']} - {stats['peHigh']}")

        except Exception as exc:
            print(f"  [{index_id}] 52W stats failed: {exc}")


# ---------------------------------------------------------------------------
# 5. Pulse Snapshots — daily tactical signal per index
# ---------------------------------------------------------------------------
def compute_percentile(sorted_values: List[float], value: float) -> int:
    below = sum(1 for v in sorted_values if v < value)
    return round((below / len(sorted_values)) * 100) if sorted_values else 50


def compute_200dma(values: List[float]) -> float:
    window = values[-200:] if len(values) >= 200 else values
    return round(sum(window) / len(window), 2) if window else 0


def update_pulse_snapshots(today: date, gsec_yield: float):
    """Compute and store today's tactical signal for each index."""
    if db is None:
        return

    print("\n--- Writing Pulse Snapshots ---")
    today_str = today.strftime("%Y-%m-%d")

    for index_id in INDEX_MAP.values():
        col_name = f"history_{index_id.replace('-', '_')}"
        try:
            records = list(
                db.get_collection(col_name)
                .find({})
                .sort("date", 1)
            )
            if not records:
                continue

            latest = records[-1]
            current_pe = latest.get("pe", 0)
            if current_pe <= 0:
                continue

            # P/E percentile (post-Apr-2021 for consolidated reporting)
            modern = [r for r in records if r.get("date", "") >= "2021-04-01"]
            pe_pool = modern if modern else records
            pe_values = sorted([r["pe"] for r in pe_pool if r.get("pe", 0) > 0])
            pe_percentile = compute_percentile(pe_values, current_pe)

            # P/B and DY percentiles
            pb_values = sorted([r["pb"] for r in records if r.get("pb", 0) > 0])
            dy_values = sorted([r["dividendYield"] for r in records if r.get("dividendYield", 0) > 0])
            pb_percentile = compute_percentile(pb_values, latest.get("pb", 0))
            dy_percentile = compute_percentile(dy_values, latest.get("dividendYield", 0))

            # Yield gap
            earnings_yield = (1 / current_pe) * 100 if current_pe > 0 else 0
            yield_gap = round(earnings_yield - gsec_yield, 2)

            # 200-DMA distance
            all_pe = [r["pe"] for r in records if r.get("pe", 0) > 0]
            dma200 = compute_200dma(all_pe)
            dma_distance = round(((current_pe - dma200) / dma200) * 100, 2) if dma200 > 0 else 0

            # Signal determination
            if pe_percentile < 20:
                signal = "strong-buy"
                label = "Strong Buy"
                action = "Lumpsum + SIP"
                mode = "Lumpsum + SIP"
                allocation = 90
            elif dma_distance < -10:
                signal = "tactical-dip"
                label = "Tactical Dip"
                action = "Lumpsum Top-up"
                mode = "Lumpsum + SIP"
                allocation = 80
            elif pe_percentile < 50:
                signal = "buy"
                label = "Buy"
                action = "Continue SIP"
                mode = "SIP Only"
                allocation = 70
            elif pe_percentile < 80:
                signal = "hold"
                label = "Hold"
                action = "Neutral / No Lumpsum"
                mode = "Neutral"
                allocation = 50
            else:
                signal = "overvalued"
                label = "Overvalued"
                action = "Reduce Exposure / Halt SIP"
                mode = "Reduce"
                allocation = 30

            # Adjust allocation based on yield gap
            if yield_gap > 2:
                allocation = min(100, allocation + 10)
            elif yield_gap < -1:
                allocation = max(0, allocation - 10)

            # Confidence
            bullish = sum([pe_percentile < 50, yield_gap > 1, dma_distance < 0])
            bearish = sum([pe_percentile > 50, yield_gap < -1, dma_distance > 10])
            confidence = "High" if bullish >= 3 or bearish >= 3 else ("Medium" if bullish >= 2 or bearish >= 2 else "Low")

            snapshot = {
                "indexId":       index_id,
                "date":          today_str,
                "pePercentile":  pe_percentile,
                "pbPercentile":  pb_percentile,
                "dyPercentile":  dy_percentile,
                "yieldGap":      yield_gap,
                "dmaDistance":   dma_distance,
                "signal": {
                    "signal":               signal,
                    "label":                label,
                    "recommendedAction":    action,
                    "recommendedMode":      mode,
                    "allocationPercentage": allocation,
                    "confidence":           confidence,
                    "yieldGap":             yield_gap,
                    "dmaDistance":           dma_distance,
                    "pePercentile":         pe_percentile,
                },
            }

            db.get_collection("pulse_snapshots").update_one(
                {"indexId": index_id, "date": today_str},
                {"$set": snapshot},
                upsert=True,
            )
            print(f"  [{index_id}] {label} (PE pct={pe_percentile}, YG={yield_gap}%, "
                  f"DMA={dma_distance}%, alloc={allocation}%)")

        except Exception as exc:
            print(f"  [{index_id}] Snapshot failed: {exc}")


# ---------------------------------------------------------------------------
# 6. Trigger Vercel revalidation (optional)
# ---------------------------------------------------------------------------
def trigger_revalidation():
    """Call the Vercel revalidation endpoint to bust the cache."""
    revalidate_url = os.getenv("REVALIDATE_URL", "")
    revalidate_secret = os.getenv("REVALIDATE_SECRET", "")

    if not revalidate_url or not revalidate_secret:
        print("\n  No REVALIDATE_URL/SECRET — skipping cache bust.")
        return

    try:
        req = urllib.request.Request(
            revalidate_url,
            method="POST",
            headers={
                "Content-Type": "application/json",
                "x-revalidate-secret": revalidate_secret,
            },
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"  → Revalidation triggered: {resp.status}")
    except Exception as exc:
        print(f"  → Revalidation failed: {exc}")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
def main(today: Optional[date] = None):
    if today is None:
        today = date.today()

    print(f"\n=== Nifty Pulse data update for {today} ===")

    # Step 1: Valuation history
    update_valuations(today)

    # Step 2: Bhavcopy (fetch once, reuse for all indices)
    try:
        bhavcopy = fetch_bhavcopy(today)
    except Exception as exc:
        print(f"\nFailed to fetch bhavcopy: {exc}\nSkipping constituent updates.")
        bhavcopy = {}

    # Step 3: Constituents
    if bhavcopy:
        print("\n--- Updating constituents ---")
        update_constituents(today, bhavcopy)

    # Step 4: G-Sec yield
    gsec_yield = update_gsec_yield(today)

    # Step 5: 52-Week stats
    update_52week_stats(today)

    # Step 6: Pulse snapshots
    update_pulse_snapshots(today, gsec_yield)

    # Step 7: Bust Vercel cache
    trigger_revalidation()

    print("\n=== Done ===")


if __name__ == "__main__":
    main()
