from nsepython import nsefetch
import json

try:
    payload = nsefetch("https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050")
    if payload and 'data' in payload:
        # First item is usually the index itself, let's look at the next 5
        for item in payload['data'][1:6]:
            print(item['symbol'], "-", item.get('totalTradedValue', 0))
except Exception as e:
    print("Fetch error:", e)
