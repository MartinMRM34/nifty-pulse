from nsepython import *
try:
    data = nse_index()
    print("nse_index:", type(data))
except Exception as e:
    print(e)
    
try:
    payload = nsefetch("https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050")
    if payload and 'data' in payload:
        print("Fetched Nifty 50 from NSE API! Items:", len(payload['data']))
        print("First item keys:", list(payload['data'][0].keys()))
except Exception as e:
    print("Fetch error:", e)
