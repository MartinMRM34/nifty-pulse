import json
import os
import time
import pandas as pd
from datetime import datetime, timedelta
from nsepython import index_pe_pb_div

# Config
INDICES = {
    "NIFTY SMLCAP 250": "nifty-smallcap-250.json",
    "NIFTY LARGEMID250": "nifty-largemidcap-250.json",
    "NIFTY 500": "nifty-500.json"
}

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'history')
COOLDOWN = 15  # Slightly longer for recovery
CHUNK_DAYS = 60 # Even smaller chunks for the heavier indices

def fetch_chunk(symbol, start_date, end_date):
    """Fetch history for a specific range."""
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Fetching {symbol} | {start_date} to {end_date}...")
    try:
        df = index_pe_pb_div(symbol, start_date, end_date)
        if df is None or (isinstance(df, pd.DataFrame) and df.empty):
            print(f"  ? No data returned.")
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
        try:
            file_path = os.path.join(DATA_DIR, file_name)
            print(f"\n>>>> RESUMING {symbol} <<<<")
            
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    history = json.load(f)
            else:
                history = []

            data_map = {item['date']: item for item in history}
            
            current_chunk_end = end_total
            while current_chunk_end > start_total:
                current_chunk_start = max(start_total, current_chunk_end - timedelta(days=CHUNK_DAYS))
                
                s_str = current_chunk_start.strftime("%d-%b-%Y")
                e_str = current_chunk_end.strftime("%d-%b-%Y")
                
                chunk_dates = [d for d in data_map if s_str <= datetime.strptime(d, "%Y-%m-%d").strftime("%d-%b-%Y") <= e_str]
                if len(chunk_dates) > 30:
                     print(f"  Chunk {s_str} - {e_str} already has {len(chunk_dates)} days. Skipping...")
                else:
                     new_entries = fetch_chunk(symbol, s_str, e_str)
                     if new_entries:
                         print(f"  √ Added {len(new_entries)} days.")
                         for entry in new_entries:
                             data_map[entry['date']] = entry
                    
                         sorted_history = sorted(data_map.values(), key=lambda x: x['date'])
                         with open(file_path, 'w') as f:
                             json.dump(sorted_history, f, indent=2)
                     
                     print(f"  Wait {COOLDOWN}s...")
                     time.sleep(COOLDOWN)
                
                current_chunk_end = current_chunk_start - timedelta(days=1)
            print(f">>>> COMPLETED {symbol} <<<<")
        except Exception as e:
            print(f"!!!! CRITICAL ERROR processing {symbol}: {e} !!!!")
            continue

    print("\nResume Backfill Finalized!")

if __name__ == "__main__":
    main()
