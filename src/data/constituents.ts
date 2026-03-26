"use server";

import { IndexId, Constituent } from "@/types";
import { getDb } from "@/lib/mongodb";

// FALLBACK DATA (JSON)
import n50 from "./constituents/nifty-50-constituents.json";
import nNext50 from "./constituents/nifty-next-50-constituents.json";
import nMid150 from "./constituents/nifty-midcap-150-constituents.json";
import nSmall250 from "./constituents/nifty-smallcap-250-constituents.json";
import nLargeMid250 from "./constituents/nifty-largemidcap-250-constituents.json";
import n500 from "./constituents/nifty-500-constituents.json";

const localConstituentsMap: Record<string, Constituent[]> = {
  "nifty-50": n50 as Constituent[],
  "nifty-next-50": nNext50 as Constituent[],
  "nifty-midcap-150": nMid150 as Constituent[],
  "nifty-smallcap-250": nSmall250 as Constituent[],
  "nifty-largemidcap-250": nLargeMid250 as Constituent[],
  "nifty-500": n500 as Constituent[],
};

export async function getConstituents(indexId: IndexId): Promise<Constituent[]> {
  try {
    const db = await getDb();
    const record = await db.collection("constituents").findOne({ index_id: indexId });
    
    if (record && record.stocks) {
      return record.stocks;
    }
  } catch (error) {
    console.error("MongoDB constituents fetch failed:", error);
  }
  
  return localConstituentsMap[indexId] || [];
}
