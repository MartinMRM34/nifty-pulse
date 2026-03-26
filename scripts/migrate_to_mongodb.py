import json
import os
import re
import urllib.parse
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

# Data directory
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'data')

# MongoDB Connection with escaping for special characters in password
MONGODB_URI = os.getenv("MONGODB_URI")
if MONGODB_URI and "://" in MONGODB_URI:
    try:
        prefix, rest = MONGODB_URI.split("://", 1)
        # Handle passwords with special characters (@, :, etc)
        # The last '@' before the query parameters/host is the delimiter
        userpass, host = rest.rsplit("@", 1)
        if ":" in userpass:
            user, password = userpass.split(":", 1)
            MONGODB_URI = f"{prefix}://{user}:{urllib.parse.quote_plus(password)}@{host}"
    except Exception as e:
        print(f"Warning: URI parsing failed, using raw: {e}")

client = MongoClient(MONGODB_URI)
db = client.get_database("nifty-pulse")

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'data')

def migrate_history():
    history_dir = os.path.join(DATA_DIR, 'history')
    
    # Track indices from filenames
    for file_name in os.listdir(history_dir):
        if not file_name.endswith('.json'): continue
        
        index_id = file_name.replace('.json', '')
        # Clean collection name (e.g. history_nifty_50)
        collection_name = f"history_{index_id.replace('-', '_')}"
        collection = db.get_collection(collection_name)
        
        file_path = os.path.join(history_dir, file_name)
        
        print(f"Migrating history to {collection_name}...")
        with open(file_path, 'r') as f:
            data = json.load(f)
            
        # Bulk insert/upsert
        if data:
            # We use upsert to avoid duplicates
            for record in data:
                collection.update_one(
                    {'date': record['date']},
                    {'$set': record},
                    upsert=True
                )
    print("History migration complete.")

def migrate_constituents():
    const_dir = os.path.join(DATA_DIR, 'constituents')
    collection = db.get_collection("constituents")
    
    for file_name in os.listdir(const_dir):
        if not file_name.endswith('.json'): continue
        
        index_id = file_name.replace('-constituents.json', '')
        file_path = os.path.join(const_dir, file_name)
        
        print(f"Migrating constituents for {index_id}...")
        with open(file_path, 'r') as f:
            data = json.load(f)
            
        # Replace the entire constituent list for the index
        collection.update_one(
            {'index_id': index_id},
            {'$set': {'index_id': index_id, 'stocks': data}},
            upsert=True
        )
    print("Constituent migration complete.")

if __name__ == "__main__":
    migrate_history()
    migrate_constituents()
    print("\nAll data migrated to MongoDB Atlas!")
