"use server";

import { IndexId, IndexValuation, ValuationSnapshot, ValuationStats } from "@/types";
import { getDb } from "@/lib/mongodb";

function computePercentile(sortedValues: number[], value: number): number {
  const below = sortedValues.filter((v) => v < value).length;
  return Math.round((below / sortedValues.length) * 100);
}

function computeStats(values: number[], current: number): ValuationStats {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  return {
    current: Math.round(current * 100) / 100,
    median: Math.round(median * 100) / 100,
    mean: Math.round((sum / values.length) * 100) / 100,
    min: Math.round(sorted[0] * 100) / 100,
    max: Math.round(sorted[sorted.length - 1] * 100) / 100,
    percentile: computePercentile(sorted, current),
  };
}

async function fetchIndexValuation(indexId: IndexId): Promise<IndexValuation | null> {
  let history: ValuationSnapshot[] = [];

  try {
    // Try MongoDB first
    const db = await getDb();
    const collectionName = `history_${indexId.replace(/-/g, "_")}`;
    const records = await db.collection(collectionName)
      .find({})
      .sort({ date: 1 })
      .toArray();

    if (records.length > 0) {
      history = records.map(r => ({
        date: r.date,
        pe: r.pe,
        pb: r.pb,
        dividendYield: r.dividendYield
      }));
    }
    // No local fallback — if MongoDB has no data, history stays empty
  } catch (error) {
    console.error("MongoDB fetch failed:", error);
    // No local fallback — return null below
  }

  if (history.length === 0) return null;

  const latest = history[history.length - 1];

  // For P/E, we limit history to post-Mar-2021 to avoid the Standalone vs Consolidated reporting skew.
  // NSE switched to consolidated PE on April 1, 2021.
  const modernPEHistory = history.filter(h => h.date >= "2021-04-01");
  const peValues = modernPEHistory.length > 0 ? modernPEHistory.map((h) => h.pe) : history.map((h) => h.pe);

  const pbValues = history.map((h) => h.pb);
  const dyValues = history.map((h) => h.dividendYield);

  return {
    indexId,
    lastUpdated: latest.date,
    pe: computeStats(peValues, latest.pe),
    pb: computeStats(pbValues, latest.pb),
    dividendYield: computeStats(dyValues, latest.dividendYield),
    history,
  };
}

// Cache temporarily disabled for debugging Vercel/MongoDB connection
export const getIndexValuation = (indexId: IndexId) => fetchIndexValuation(indexId);
