import json
import os
import urllib.parse
from datetime import datetime
from nsepython import index_info, nsefetch

# Define the indices we want to track and their corresponding file names
indices = {
    "NIFTY 50": "nifty-50.json",
    "NIFTY NEXT 50": "nifty-next-50.json",
    "NIFTY MIDCAP 150": "nifty-midcap-150.json",
    "NIFTY SMALLCAP 250": "nifty-smallcap-250.json",
    "NIFTY LARGEMIDCAP 250": "nifty-largemidcap-250.json",
    "NIFTY 500": "nifty-500.json"
}

# The path to the data directory where JSON files are stored
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'data')

def update_index_data(index_name, file_name):
    print(f"\nFetching data for {index_name}...")
    try:
        # 1. Fetch valuation metrics (PE, PB, DY)
        info = index_info(index_name)
        today_str = datetime.now().strftime("%Y-%m-%d")
        
        new_entry = {
            "date": today_str,
            "pe": float(info['pe']),
            "pb": float(info['pb']),
            "dividendYield": float(info['dy'])
        }
        
        file_path = os.path.join(DATA_DIR, 'history', file_name)
        
        # Read existing data
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                history = json.load(f)
        else:
            history = []
            
        # Append new data if not already present for today
        if not (len(history) > 0 and history[-1]['date'] == today_str):
            history.append(new_entry)
            with open(file_path, 'w') as f:
                json.dump(history, f, indent=2)
            print(f"[{index_name}] Successfully added valuation data for {today_str}.")
        else:
            print(f"[{index_name}] Valuation data for {today_str} already exists. Skipped.")
            
        # 2. Fetch Index Constituents
        # The NSE API returns the index components sorted by index weight (approx free-float market cap)
        # The URL must be properly encoded (e.g. NIFTY%2050)
        encoded_index = urllib.parse.quote(index_name)
        url = f"https://www.nseindia.com/api/equity-stockIndices?index={encoded_index}"
        
        payload = nsefetch(url)
        if payload and 'data' in payload:
            raw_constituents = payload['data']
            # First item [0] is usually the index itself. We filter out the index object.
            stocks_only = [item for item in raw_constituents if item.get('priority', 1) == 0]
            
            # If filtering by priority didn't work, just slice from 1 onwards (index is usually 0)
            if not stocks_only:
                stocks_only = raw_constituents[1:]
                
            top_10 = stocks_only[:10]
            
            structured_constituents = []
            for s in top_10:
                structured_constituents.append({
                    "symbol": s.get('symbol', ''),
                    "name": s.get('meta', {}).get('companyName', s.get('symbol', '')),
                    "tradedValue": s.get('totalTradedValue', 0),
                    "lastPrice": s.get('lastPrice', 0),
                    "pChange": s.get('pChange', 0)
                })
                
            # Write constituents to JSON
            const_file_name = file_name.replace('.json', '-constituents.json')
            const_file_path = os.path.join(DATA_DIR, 'constituents', const_file_name)
            
            with open(const_file_path, 'w') as f:
                json.dump(structured_constituents, f, indent=2)
                
            print(f"[{index_name}] Successfully saved top 10 constituents.")
        else:
            print(f"[{index_name}] Failed to fetch constituents data payload.")

    except Exception as e:
        print(f"Failed to fetch or save data for {index_name}: {e}")

if __name__ == "__main__":
    for name, filename in indices.items():
        update_index_data(name, filename)
