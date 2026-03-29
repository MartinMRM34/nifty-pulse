import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))
MONGODB_URI = os.getenv("MONGODB_URI", "")
client = MongoClient(MONGODB_URI)
db = client["nifty-pulse"]
collection = db["history_nifty_50"]

dates = ["2021-09-30", "2021-10-01", "2022-09-26"]

print(f"Checking records for {dates}...")
for d in dates:
    doc = collection.find_one({"date": d})
    if doc:
        print(f"Date: {d} | PE: {doc.get('pe')} | DY: {doc.get('dividendYield')} | _id: {doc.get('_id')}")
    else:
        print(f"Date: {d} | NOT FOUND")
