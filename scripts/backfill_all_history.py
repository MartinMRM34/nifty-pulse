import json
import os
import time
import pandas as pd
from datetime import datetime, timedelta
from nsepython import index_pe_pb_div

# Config
INDICES = {
    "NIFTY 50": "nifty-50.json",
    "NIFTY NEXT 50": "nifty-next-50.json",
    "NIFTY MIDCAP 150": "nifty-midcap-150.json",
    "NIFTY SMALLCAP 250": "nifty-smallcap-250.json",
    "NIFTY LARGEMIDCAP 250": "nifty-largemidcap-250.json",
    "NIFTY 500": "nifty-500.json"
}

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'history')
COOLDOWN = 12  # Longer cooldown for reliability
CHUNK_DAYS = 90 # Smaller chunks (3 months) are less likely to timeout

def fetch_chunk(symbol, start_date, end_date):
    """Fetch history for a specific range."""
    print(f"Fetching {symbol} | {start_date} to {end_date}...")
    try:
        df = index_pe_pb_div(symbol, start_date, end_date)
        if df is None or (isinstance(df, pd.DataFrame) and df.empty):
            return []
        
        entries = []
        for _, row in df.iterrows():
            raw_date = row.get('Date') or row.get('DATE') or row.get('date')
            try:
                dt = pd.to_datetime(raw_date)
                date_str = dt.strftime("%Y-%m-%d")
                
                pe = row.get('P/E') or row.get('PE') or row.get('pe')
                pb = row.get('P/B') or row.get('PB') or row.get('pb')
                dy = row.get('Div Yield') or row.get('DY') or row.get('dividendYield') or row.get('DIV_YIELD')
                
                entries.append({
                    "date": date_str,
                    "pe": float(pe) if pe and str(pe).lower() != 'nan' else 0,
                    "pb": float(pb) if pb and str(pb).lower() != 'nan' else 0,
                    "dividendYield": float(dy) if dy and str(dy).lower() != 'nan' else 0
                })
            except Exception:
                pass
        return entries
    except Exception as e:
        print(f"  Error: {e}")
        return []

def main():
    if not os.path.exists(DATA_DIR):
        print(f"Error: {DATA_DIR} not found.")
        return

    end_total = datetime.now()
    start_total = end_total - timedelta(days=5 * 365)

    for symbol, file_name in INDICES.items():
        file_path = os.path.join(DATA_DIR, file_name)
        if not os.path.exists(file_path): continue

        print(f"\n>>> Processing {symbol}...")
        with open(file_path, 'r') as f:
            history = json.load(f)

        data_map = {item['date']: item for item in history}
        
        # We'll use 90-day steps to fill the 5-year gap
        current_chunk_end = end_total
        while current_chunk_end > start_total:
            current_chunk_start = max(start_total, current_chunk_end - timedelta(days=CHUNK_DAYS))
            
            s_str = current_chunk_start.strftime("%d-%b-%Y")
            e_str = current_chunk_end.strftime("%d-%b-%Y")
            
            new_entries = fetch_chunk(symbol, s_str, e_str)
            
            if new_entries:
                print(f"  √ Added {len(new_entries)} days.")
                for entry in new_entries:
                    data_map[entry['date']] = entry
            
                # Write to disk after each chunk
                sorted_history = sorted(data_map.values(), key=lambda x: x['date'])
                with open(file_path, 'w') as f:
                    json.dump(sorted_history, f, indent=2)
            
            current_chunk_end = current_chunk_start - timedelta(days=1)
            
            print(f"  Wait {COOLDOWN}s...")
            time.sleep(COOLDOWN)

    print("\nBulk Backfill Complete!")

if __name__ == "__main__":
    main()
