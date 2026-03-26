import json
import os
import time
import pandas as pd
from datetime import datetime
from nsepython import index_pe_pb_div

# Config
SYMBOL = "NIFTY 50"
FILE_NAME = "nifty-50.json"
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'history')
FILE_PATH = os.path.join(DATA_DIR, FILE_NAME)

def fetch_chunk(symbol, start_date, end_date):
    print(f"Fetching {symbol} from {start_date} to {end_date}...")
    try:
        df = index_pe_pb_div(symbol, start_date, end_date)
        if df is None or (isinstance(df, pd.DataFrame) and df.empty):
            return []
        entries = []
        for _, row in df.iterrows():
            raw_date = row.get('Date') or row.get('DATE') or row.get('date')
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
        return entries
    except Exception as e:
        print(f"Error: {e}")
        return []

def main():
    with open(FILE_PATH, 'r') as f:
        data = json.load(f)
    data_map = {item['date']: item for item in data}
    
    # Retry the 2021-2022 range in smaller chunks
    ranges = [
        ("01-Jan-2021", "30-Jun-2021"),
        ("01-Jul-2021", "31-Dec-2021"),
        ("01-Jan-2022", "31-Mar-2022")
    ]
    
    for start, end in ranges:
        new_entries = fetch_chunk(SYMBOL, start, end)
        if new_entries:
            print(f"Added {len(new_entries)} entries.")
            for e in new_entries: data_map[e['date']] = e
        time.sleep(10)
    
    sorted_history = sorted(data_map.values(), key=lambda x: x['date'])
    with open(FILE_PATH, 'w') as f:
        json.dump(sorted_history, f, indent=2)
    print("Done.")

if __name__ == "__main__": main()
