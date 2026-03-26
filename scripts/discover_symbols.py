from nsepython import index_pe_pb_div
import pandas as pd

test_symbols = [
    "NIFTY SMALLCAP 250",
    "Nifty Smallcap 250",
    "NIFTY_SMALLCAP_250",
    "NIFTY SMALLCAP250",
    "NIFTY 500",
    "Nifty 500",
    "NIFTY LARGEMIDCAP 250",
    "Nifty LargeMidcap 250"
]

print("Testing different symbols for the last 30 days...")
end_date = "20-Mar-2024"
start_date = "01-Mar-2024"

for s in test_symbols:
    try:
        df = index_pe_pb_div(s, start_date, end_date)
        if df is not None and not df.empty:
            print(f"  [SUCCESS] {s} returns {len(df)} rows.")
        else:
            print(f"  [FAILED] {s} returns empty/None.")
    except Exception as e:
        print(f"  [ERROR] {s}: {e}")
