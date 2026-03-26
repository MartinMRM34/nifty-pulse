import { IndexId, IndexValuation, ValuationSnapshot, ValuationStats } from "@/types";
import { nifty50History } from "./nifty-50";

const dataMap: Record<string, ValuationSnapshot[]> = {
  "nifty-50": nifty50History,
};

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

export function getIndexValuation(indexId: IndexId): IndexValuation | null {
  const history = dataMap[indexId];
  if (!history || history.length === 0) return null;

  const latest = history[history.length - 1];
  const peValues = history.map((h) => h.pe);
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

export function getAvailableIndices(): IndexId[] {
  return Object.keys(dataMap) as IndexId[];
}
