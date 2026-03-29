"""
update_data.py
--------------
Fetches from two publicly accessible NSE Archives endpoints (no IP blocking):

1. ind_close_all_DDMMYYYY.csv   → daily P/E, P/B, DY for each index
2. ind_nifty*list.csv           → constituent symbols per index (static composition)
3. sec_bhavdata_full_DDMMYYYY.csv → daily OHLCV / price data for all NSE stocks

Writes to MongoDB Atlas:
  - history_{index_slug}  : daily valuation entry (PE, PB, DY)
  - constituents          : per-index stock list with today's price data
"""

import io
import os
import csv
import urllib.parse
import urllib.request
from datetime import date
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

# NSE CSV "Index Name" → MongoDB collection slug (for valuation history)
INDEX_MAP = {
    "Nifty 50":              "nifty-50",
    "Nifty Next 50":         "nifty-next-50",
    "Nifty Midcap 150":      "nifty-midcap-150",
    "Nifty Smallcap 250":    "nifty-smallcap-250",
    "NIFTY LargeMidcap 250": "nifty-largemidcap-250",
    "Nifty 500":             "nifty-500",
}

# index_id → URL slug for the constituent list CSV
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
    # Strip leading/trailing whitespace from all keys and values
    return [{k.strip(): v.strip() for k, v in row.items()} for row in reader]


# ---------------------------------------------------------------------------
# 1. Valuation history (PE, PB, DY)
# ---------------------------------------------------------------------------
def update_valuations(today: date):
    """Write daily PE/PB/DY to history_{index} collections."""
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
    """
    Download the NSE full bhavcopy CSV and return a dict keyed by SYMBOL
    containing price/volume details for EQ-series stocks only.
    """
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
            # TURNOVER_LACS is in lakhs — convert to crores for consistency
            "tradedValue":  round(safe_float(r.get("TURNOVER_LACS", "0")) / 100, 2),
        }
    print(f"  Bhavcopy loaded: {len(lookup)} EQ symbols")
    return lookup


def update_constituents(today: date, bhavcopy: Dict[str, Dict]):
    """
    For each index, download the constituent symbol list CSV, merge with
    bhavcopy prices, and upsert into the 'constituents' MongoDB collection.
    """
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
        return

    # Step 3: Constituents
    print("\n--- Updating constituents ---")
    update_constituents(today, bhavcopy)

    print("\n=== Done ===")


if __name__ == "__main__":
    main()
