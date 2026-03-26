from nsepython import *
try:
    data = nse_eq("RELIANCE")
    print("RELIANCE fetched")
    index_dt = nse_get_index_list("nifty 50")
    print("NIFTY 50 LIST:", index_dt[:3])
except Exception as e:
    print(e)
