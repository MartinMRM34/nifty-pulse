from nsepython import *

try:
    print("Testing index_pe_pb_div...")
    pe_pb = index_pe_pb_div("NIFTY 50")
    print(type(pe_pb))
    if isinstance(pe_pb, dict): print(list(pe_pb.keys()))
except Exception as e:
    print("pe_pb error:", e)

try:
    print("\nTesting index_info...")
    info = index_info("NIFTY 50")
    print(type(info))
    if isinstance(info, dict): 
        print(list(info.keys()))
        if 'data' in info:
            print("Items in data:", len(info['data']))
            if len(info['data']) > 0:
                print("First item keys:", list(info['data'][0].keys()))
except Exception as e:
    print("info error:", e)

try:
    print("\nTesting nse_get_index_quote...")
    quote = nse_get_index_quote("nifty 50")
    print(type(quote))
    if isinstance(quote, dict): print(list(quote.keys()))
except Exception as e:
    print("quote error:", e)
