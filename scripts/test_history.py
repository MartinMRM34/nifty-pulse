from nsepython import nsefetch
import json

# The historical valuation endpoint used by NSE website
# Query: index=NIFTY%2050&from=01-01-2024&to=31-12-2024
url = "https://www.nseindia.com/api/historical/indices-valuation?index=NIFTY%2050&from=01-01-2024&to=31-12-2024"

try:
    print(f"Direct fetching: {url}")
    payload = nsefetch(url)
    print("Success!")
    if isinstance(payload, dict) and 'data' in payload:
        print("Rows fetched:", len(payload['data']))
        if len(payload['data']) > 0:
            print("First row:", payload['data'][0])
    else:
        print("Payload format unexpected:", payload)
except Exception as e:
    print("Error:", e)

