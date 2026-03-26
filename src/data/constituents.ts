import nifty50Constituents from "./constituents/nifty-50-constituents.json";
import niftyNext50Constituents from "./constituents/nifty-next-50-constituents.json";
import niftyMidcap150Constituents from "./constituents/nifty-midcap-150-constituents.json";
import niftySmallcap250Constituents from "./constituents/nifty-smallcap-250-constituents.json";
import niftyLargemidcap250Constituents from "./constituents/nifty-largemidcap-250-constituents.json";
import nifty500Constituents from "./constituents/nifty-500-constituents.json";

export interface Constituent {
  symbol: string;
  name: string;
  tradedValue: number;
  lastPrice: number;
  pChange: number;
}

export const constituentsMap: Record<string, Constituent[]> = {
  "nifty-50": nifty50Constituents as Constituent[],
  "nifty-next-50": niftyNext50Constituents as Constituent[],
  "nifty-midcap-150": niftyMidcap150Constituents as Constituent[],
  "nifty-smallcap-250": niftySmallcap250Constituents as Constituent[],
  "nifty-largemidcap-250": niftyLargemidcap250Constituents as Constituent[],
  "nifty-500": nifty500Constituents as Constituent[],
};
