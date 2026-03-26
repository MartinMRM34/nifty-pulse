import json
import os
from datetime import datetime
from nsepython import nse_index_pe_pb

# Define the indices we want to track and their corresponding file names
indices = {
    "NIFTY 50": "nifty-50.json",
    "NIFTY NEXT 50": "nifty-next-50.json",
    "NIFTY MIDCAP 150": "nifty-midcap-150.json",
    "NIFTY SMLCAP 250": "nifty-smallcap-250.json",
    "NIFTY LARGEMIDCAP 250": "nifty-largemidcap-250.json",
    "NIFTY 500": "nifty-500.json"
}

# The path to the data directory where JSON files are stored
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'data')

def update_index_data(index_name, file_name):
    print(f"Fetching data for {index_name}...")
    try:
        data = nse_index_pe_pb(index_name)
        
        # Format today's date
        today_str = datetime.now().strftime("%Y-%m-%d")
        
        new_entry = {
            "date": today_str,
            "pe": float(data['PE']),
            "pb": float(data['PB']),
            "dividendYield": float(data['DY'])
        }
        
        file_path = os.path.join(DATA_DIR, file_name)
        
        # Read existing data
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                history = json.load(f)
        else:
            history = []
            
        # Check if we already have an entry for today
        if len(history) > 0 and history[-1]['date'] == today_str:
            print(f"Data for {today_str} already exists for {index_name}. Skipping append.")
            return

        # Append new data
        history.append(new_entry)
        
        # Write back to file
        with open(file_path, 'w') as f:
            json.dump(history, f, indent=2)
            
        print(f"Successfully added {today_str} data for {index_name}.")

    except Exception as e:
        print(f"Failed to fetch or save data for {index_name}: {e}")

if __name__ == "__main__":
    for name, filename in indices.items():
        update_index_data(name, filename)
