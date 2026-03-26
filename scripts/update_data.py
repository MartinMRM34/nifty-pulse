import json
import os
import urllib.parse
from datetime import datetime
from nsepython import index_info, nsefetch
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

# Define the indices we want to track and their corresponding file names
indices = {
    "NIFTY 50": "nifty-50.json",
    "NIFTY NEXT 50": "nifty-next-50.json",
    "NIFTY MIDCAP 150": "nifty-midcap-150.json",
    "NIFTY SMALLCAP 250": "nifty-smallcap-250.json",
    "NIFTY LARGEMIDCAP 250": "nifty-largemidcap-250.json",
    "NIFTY 500": "nifty-500.json"
}

# MongoDB Connection
MONGODB_URI = os.getenv("MONGODB_URI")
db = None
if MONGODB_URI and "<db_password>" not in MONGODB_URI:
    try:
        # Escape password if it contains special characters (@, :, etc)
        if "://" in MONGODB_URI:
            prefix, rest = MONGODB_URI.split("://", 1)
            userpass, host = rest.rsplit("@", 1)
            if ":" in userpass:
                user, password = userpass.split(":", 1)
                MONGODB_URI = f"{prefix}://{user}:{urllib.parse.quote_plus(password)}@{host}"
            
        client = MongoClient(MONGODB_URI)
        db = client.get_database("nifty-pulse")
        print("Connected to MongoDB Atlas.")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")

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
        
        index_id = file_name.replace('.json', '')
        collection_name = f"history_{index_id.replace('-', '_')}"
        
        # Update MongoDB History
        if db:
            try:
                collection = db.get_collection(collection_name)
                collection.update_one(
                    {'date': today_str},
                    {'$set': new_entry},
                    upsert=True
                )
                print(f"[{index_name}] MongoDB valuation updated in {collection_name}.")
            except Exception as e:
                print(f"[{index_name}] Failed to update MongoDB valuation: {e}")
            
        # 2. Fetch Index Constituents
        encoded_index = urllib.parse.quote(index_name)
        url = f"https://www.nseindia.com/api/equity-stockIndices?index={encoded_index}"
        
        payload = nsefetch(url)
        if payload and 'data' in payload:
            raw_constituents = payload['data']
            stocks_only = [item for item in raw_constituents if item.get('priority', 1) == 0]
            if not stocks_only:
                stocks_only = raw_constituents[1:]
                
            structured_constituents = []
            for s in stocks_only:
                structured_constituents.append({
                    "symbol": s.get('symbol', ''),
                    "name": s.get('meta', {}).get('companyName', s.get('symbol', '')),
                    "tradedValue": s.get('totalTradedValue', 0),
                    "lastPrice": s.get('lastPrice', 0),
                    "pChange": s.get('pChange', 0)
                })
                
            # Update MongoDB Constituents
            if db:
                try:
                    collection = db.get_collection("constituents")
                    collection.update_one(
                        {'index_id': index_id},
                        {'$set': {'index_id': index_id, 'stocks': structured_constituents}},
                        upsert=True
                    )
                    print(f"[{index_name}] MongoDB constituents updated.")
                except Exception as e:
                    print(f"[{index_name}] Failed to update MongoDB constituents: {e}")

        else:
            print(f"[{index_name}] Failed to fetch constituents data payload.")

    except Exception as e:
        print(f"Failed to fetch or save data for {index_name}: {e}")

if __name__ == "__main__":
    for name, filename in indices.items():
        update_index_data(name, filename)
