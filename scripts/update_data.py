"""
update_data.py
--------------
Fetches daily P/E, P/B, and Dividend Yield for Nifty indices from the
NSE Archives CSV (archives.nseindia.com) — publicly accessible from
any IP including GitHub Actions runners.

Writes results to MongoDB Atlas.
"""

import io
import os
import csv
import urllib.parse
import urllib.request
from datetime import date
from typing import Optional
from pymongo import MongoClient
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------------
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))

# ---------------------------------------------------------------------------
# Index map: NSE CSV "Index Name" field → MongoDB collection slug
# ---------------------------------------------------------------------------
INDEX_MAP = {
    "Nifty 50":               "nifty-50",
    "Nifty Next 50":          "nifty-next-50",
    "Nifty Midcap 150":       "nifty-midcap-150",
    "Nifty Smallcap 250":     "nifty-smallcap-250",
    "NIFTY LargeMidcap 250":  "nifty-largemidcap-250",
    "Nifty 500":              "nifty-500",
}

# ---------------------------------------------------------------------------
# MongoDB connection — FIX: use `is not None` (Database objects aren't booleans)
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
        client.admin.command("ping")          # verify connection before continuing
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


def build_nse_csv_url(for_date: date) -> str:
    """
    NSE Archives daily index CSV URL format:
    https://archives.nseindia.com/content/indices/ind_close_all_DDMMYYYY.csv
    """
    date_str = for_date.strftime("%d%m%Y")
    return f"https://archives.nseindia.com/content/indices/ind_close_all_{date_str}.csv"


def fetch_nse_csv(for_date: date) -> list[dict]:
    """Download and parse the NSE daily index CSV. Returns list of row dicts."""
    url = build_nse_csv_url(for_date)
    print(f"Fetching NSE CSV: {url}")
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        },
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        content = resp.read().decode("utf-8", errors="replace")

    reader = csv.DictReader(io.StringIO(content))
    return list(reader)


# ---------------------------------------------------------------------------
# Core logic
# ---------------------------------------------------------------------------
def update_all_indices(today: Optional[date] = None):
    if today is None:
        today = date.today()

    today_str = today.strftime("%Y-%m-%d")

    try:
        rows = fetch_nse_csv(today)
    except Exception as exc:
        print(f"Failed to fetch NSE CSV: {exc}")
        return

    # Build a lookup: stripped index name → row
    row_lookup = {r["Index Name"].strip(): r for r in rows}

    for nse_name, index_id in INDEX_MAP.items():
        row = row_lookup.get(nse_name)
        if row is None:
            print(f"\n[{nse_name}] Not found in today's CSV — skipping.")
            continue

        pe  = safe_float(row.get("P/E", ""))
        pb  = safe_float(row.get("P/B", ""))
        dy  = safe_float(row.get("Div Yield", ""))

        new_entry = {
            "date":          today_str,
            "pe":            pe,
            "pb":            pb,
            "dividendYield": dy,
        }

        print(f"\n[{nse_name}] PE={pe}, PB={pb}, DY={dy}")

        # FIX: `db is not None` — not just `db` (avoids TypeError on MongoDB objects)
        if db is not None:
            collection_name = f"history_{index_id.replace('-', '_')}"
            try:
                col = db.get_collection(collection_name)
                col.update_one(
                    {"date": today_str},
                    {"$set": new_entry},
                    upsert=True,
                )
                print(f"  → Written to MongoDB collection '{collection_name}'")
            except Exception as exc:
                print(f"  → MongoDB write failed: {exc}")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    update_all_indices()
