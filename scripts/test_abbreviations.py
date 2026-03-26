from nsepython import index_pe_pb_div
import pandas as pd

abbreviations = [
    "NIFTY SMLCAP 250",
    "NIFTY SML 250",
    "NIFTY LRG MID 250",
    "NIFTY LRG MIDCAP 250",
    "NIFTY TOTAL MARKET",
    "NIFTY 500",
    "NIFTY SMALLCAP 250"
]

print("Testing abbreviations for history...")
for s in abbreviations:
    try:
        df = index_pe_pb_div(s, "10-Mar-2024", "20-Mar-2024")
        if df is not None and not df.empty:
            print(f"  [SUCCESS] {s}")
        else:
            print(f"  [FAILED] {s}")
    except:
        print(f"  [ERROR] {s}")
