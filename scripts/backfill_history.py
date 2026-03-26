import json
import os
import time
import pandas as pd
from datetime import datetime, timedelta
from nsepython import index_pe_pb_div

# Config
SYMBOL = "NIFTY 50"
FILE_NAME = "nifty-50.json"
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'history')
FILE_PATH = os.path.join(DATA_DIR, FILE_NAME)

def fetch_chunk(symbol, start_date, end_date):
    """Fetch history for a specific range."""
    print(f"Fetching {symbol} from {start_date} to {end_date}...")
    try:
        df = index_pe_pb_div(symbol, start_date, end_date)
        if df is None or (isinstance(df, pd.DataFrame) and df.empty):
            print("No data returned for this range.")
            return []
        
        # nsepython returns a DataFrame with columns like 'DATE', 'PE', 'PB', 'DIV_YIELD'
        # Or sometimes lowercase. Let's inspect/standardize.
        entries = []
        for _, row in df.iterrows():
            # Date is usually in DD-MMM-YYYY or YYYY-MM-DD
            raw_date = row.get('Date') or row.get('DATE') or row.get('date')
            try:
                # Convert to YYYY-MM-DD
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
            except Exception as e:
                print(f"Error parsing row: {e}")
        return entries
    except Exception as e:
        print(f"Error fetching chunk: {e}")
        return []

def main():
    if not os.path.exists(FILE_PATH):
        print(f"Error: {FILE_PATH} not found.")
        return

    with open(FILE_PATH, 'r') as f:
        existing_data = json.load(f)

    # Dictionary for easy merging/deduplication
    data_map = {item['date']: item for item in existing_data}
    
    current_date = datetime.now()
    # Go back 5 years year by year
    for i in range(5):
        year_end = current_date - timedelta(days=i * 365)
        year_start = year_end - timedelta(days=364)
        
        start_str = year_start.strftime("%d-%b-%Y")
        end_str = year_end.strftime("%d-%b-%Y")
        
        new_entries = fetch_chunk(SYMBOL, start_str, end_str)
        
        if new_entries:
            print(f"Adding {len(new_entries)} entries...")
            for entry in new_entries:
                data_map[entry['date']] = entry
        
        # Save after each chunk
        sorted_history = sorted(data_map.values(), key=lambda x: x['date'])
        with open(FILE_PATH, 'w') as f:
            json.dump(sorted_history, f, indent=2)
            
        print(f"Progress saved. Waiting 5 seconds to avoid IP block...")
        time.sleep(5)

    print("Backfill complete!")

if __name__ == "__main__":
    main()
