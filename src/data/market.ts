"use server";

import { unstable_cache } from "next/cache";

export interface GSecData {
  yield: number;
  isFallback: boolean;
  lastUpdated: string;
}

const FALLBACK_GSEC_YIELD = 7.0;

/**
 * Fetches the latest 10Y India Government Bond yield from Trading Economics.
 * Bond yields are relatively slow-moving, so we cache for 1 hour.
 */
async function fetchGSecYieldInternal(): Promise<GSecData> {
  const now = new Date().toISOString();
  
  try {
    // We use a specific User-Agent to ensure we are not blocked
    const response = await fetch("https://tradingeconomics.com/india/government-bond-yield", {
      cache: 'no-store', // Force fresh fetch for now to clear previous failures
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const html = await response.text();
    
    // Improved regex targeting the TEChartsMeta or TEForecast JSON structures found in script tags
    const match = html.match(/"value":\s*([0-9]\.[0-9]{2,4})/i) || 
                  html.match(/TEForecast\s*=\s*\[\s*([0-9]\.[0-9]{2,4})/i) ||
                  html.match(/"last":\s*([0-9]\.[0-9]{2,4})/i) ||
                  html.match(/India 10Y Bond Yield was ([0-9]\.[0-9]{2,3})/i);

    if (match && match[1]) {
      const val = parseFloat(match[1]);
      if (!isNaN(val) && val > 3 && val < 20) { // Sanity check for India yields
        console.log(`[MarketData] Successfully fetched live G-Sec Yield: ${val}%`);
        return {
          yield: val,
          isFallback: false,
          lastUpdated: now,
        };
      }
    }

    throw new Error("Could not parse yield from HTML response");
  } catch (error) {
    console.error("[MarketData] Error fetching G-Sec yield, using fallback 7.0%:", error);
    return {
      yield: FALLBACK_GSEC_YIELD,
      isFallback: true,
      lastUpdated: now,
    };
  }
}

/**
 * Cached version of the G-Sec fetcher.
 */
export const getGSecYield = unstable_cache(
  async () => fetchGSecYieldInternal(),
  ["gsec-yield-v2"], // Changed key to bust cache
  { revalidate: 3600, tags: ["market-data"] }
);
