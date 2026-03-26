from nsepython import index_pe_pb_div
import pandas as pd
import sys

symbol = sys.argv[1] if len(sys.argv) > 1 else "NIFTY 50"
print(f"Testing {symbol}...")
df = index_pe_pb_div(symbol, "01-Jan-2024", "01-Feb-2024")
print(f"Result type: {type(df)}")
if df is not None:
    print(df.head())
else:
    print("Result is None")
