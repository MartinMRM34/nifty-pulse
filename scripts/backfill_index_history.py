import os
import time
import pandas as pd
from datetime import datetime, timedelta
from pymongo import MongoClient
from nsepython import index_pe_pb_div, index_history
from dotenv import load_dotenv
import argparse

# Load Environment
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))

MONGODB_URI = os.getenv("MONGODB_URI", "")
DB_NAME = "nifty-pulse"

def get_db():
    if not MONGODB_URI:
        print("Error: MONGODB_URI not found.")
        return None
    client = MongoClient(MONGODB_URI)
    return client[DB_NAME]

def safe_float(val, default=0.0):
    """Safely convert string to float, handling commas and '-'."""
    try:
        if val is None: return default
        cleaned = str(val).strip().replace(",", "")
        if cleaned in ("-", "", "nan", "N/A"):
            return default
        return float(cleaned)
    except Exception:
        return default

def normalize_columns(df):
    """Normalize dataframe columns to be consistent and snake_case where appropriate."""
    if df is None or df.empty:
        return pd.DataFrame()
    
    # Strip whitespace and convert to upper for matching
    df.columns = [str(c).upper().strip().replace(' ', '_') for c in df.columns]
    return df

def fetch_valuation(index_name, start_str, end_str):
    """Fetch PE, PB, and Dividend Yield from NSE."""
    print(f"  Fetching Valuation: {start_str} to {end_str}...")
    try:
        df = index_pe_pb_div(index_name, start_str, end_str)
        if df is None or (isinstance(df, pd.DataFrame) and df.empty):
            return pd.DataFrame()
        
        df = normalize_columns(df)
        
        results = []
        for _, row in df.iterrows():
            # Find date column
            date_val = row.get('DATE') or row.get('HISTORICALDATE') or row.get('INDEX_DATE')
            if not date_val: continue
            
            # Find columns
            pe = safe_float(row.get('PE') or row.get('P/E'))
            pb = safe_float(row.get('PB') or row.get('P/B'))
            
            # Div Yield mapping (robust)
            dy_key = next((k for k in df.columns if 'DIV' in k or 'DY' == k or 'YIELD' in k), None)
            dy = safe_float(row.get(dy_key)) if dy_key else 0.0
            
            results.append({
                "date": pd.to_datetime(date_val).strftime("%Y-%m-%d"),
                "pe": pe,
                "pb": pb,
                "dividendYield": dy
            })
        return pd.DataFrame(results)
    except Exception as e:
        print(f"    Valuation Error: {e}")
        return pd.DataFrame()

def fetch_price(index_name, start_str, end_str):
    """Fetch OHLC from NSE."""
    print(f"  Fetching Prices:    {start_str} to {end_str}...")
    try:
        df = index_history(index_name, start_str, end_str)
        if df is None or (isinstance(df, pd.DataFrame) and df.empty):
            return pd.DataFrame()
        
        df = normalize_columns(df)
        
        results = []
        for _, row in df.iterrows():
            date_val = row.get('HISTORICALDATE') or row.get('DATE') or row.get('INDEX_DATE')
            if not date_val: continue
            
            results.append({
                "date":  pd.to_datetime(date_val).strftime("%Y-%m-%d"),
                "open":  safe_float(row.get('OPEN') or row.get('OPEN_INDEX_VALUE')),
                "high":  safe_float(row.get('HIGH') or row.get('HIGH_INDEX_VALUE')),
                "low":   safe_float(row.get('LOW') or row.get('LOW_INDEX_VALUE')),
                "close": safe_float(row.get('CLOSE') or row.get('CLOSING_INDEX_VALUE'))
            })
        return pd.DataFrame(results)
    except Exception as e:
        print(f"    Price Error: {e}")
        return pd.DataFrame()

def main():
    parser = argparse.ArgumentParser(description="Backfill historical index data from NSE.")
    parser.add_argument("--indices", type=str, required=True, help="Comma-separated index names (e.g. 'NIFTY NEXT 50,NIFTY 50')")
    parser.add_argument("--years", type=int, default=20, help="Years to go back (0 for all)")
    parser.add_argument("--cooldown", type=int, default=12, help="Wait between chunks (seconds)")
    args = parser.parse_args()

    db = get_db()
    if db is None: return

    # Parse indices
    index_list = [i.strip() for i in args.indices.split(',')]
    
    for index_name in index_list:
        index_slug = index_name.lower().replace(' ', '_')
        collection_name = f"history_{index_slug}"
        collection = db[collection_name]

        print(f"\n{'='*60}")
        print(f">>> STARTING QUEUE: {index_name} -> {collection_name}")
        print(f"{'='*60}")
        
        end_dt = datetime.now()
        if args.years > 0:
            start_dt = end_dt - timedelta(days=args.years * 365)
        else:
            start_dt = datetime(1995, 1, 1)

        curr_end = end_dt
        total_processed_for_index = 0
        
        while curr_end > start_dt:
            curr_start = max(start_dt, curr_end - timedelta(days=90))
            
            s_str = curr_start.strftime("%d-%b-%Y")
            e_str = curr_end.strftime("%d-%b-%Y")
            
            # 1. Fetch Valuation
            time.sleep(1) # Tiny gap
            val_df = fetch_valuation(index_name, s_str, e_str)
            time.sleep(args.cooldown)
            
            # 2. Fetch Price
            price_df = fetch_price(index_name, s_str, e_str)
            
            if not val_df.empty and not price_df.empty:
                final_df = pd.merge(val_df, price_df, on='date', how='inner')
                if not final_df.empty:
                    count = 0
                    for _, row in final_df.iterrows():
                        entry = row.to_dict()
                        collection.update_one(
                            {"date": entry['date']},
                            {"$set": entry},
                            upsert=True
                        )
                        count += 1
                    total_processed_for_index += count
                    print(f"    √ Merged and updated {count} records for this chunk.")
                else:
                    print("    ! No matching dates found for merge in this chunk.")
            elif val_df.empty and price_df.empty:
                # If we've already found some data and now hitting empty for 1 year, we're likely done
                if total_processed_for_index > 0 and curr_end < (end_dt - timedelta(days=365)):
                   print(f"    ! End of historical data reached for {index_name}.")
                   break

            curr_end = curr_start - timedelta(days=1)
            print(f"    Cooldown {args.cooldown}s...")
            time.sleep(args.cooldown)

        print(f"\nCOMPLETED {index_name}: {total_processed_for_index} total records.")
        print(f"Cooldown 30s before next index in queue...")
        time.sleep(30) # Extra safety between indices

    print(f"\n{'#'*60}")
    print("### ALL INDICES IN QUEUE COMPLETE ###")
    print(f"{'#'*60}")

if __name__ == "__main__":
    main()
