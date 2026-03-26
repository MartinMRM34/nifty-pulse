import { IndexId, IndexValuation, ValuationSnapshot, ValuationStats } from "@/types";
import nifty50Data from "./nifty-50.json";
import niftyNext50Data from "./nifty-next-50.json";
import niftyMidcap150Data from "./nifty-midcap-150.json";
import niftySmallcap250Data from "./nifty-smallcap-250.json";
import niftyLargemidcap250Data from "./nifty-largemidcap-250.json";
import nifty500Data from "./nifty-500.json";

const dataMap: Record<string, ValuationSnapshot[]> = {
  "nifty-50": nifty50Data as ValuationSnapshot[],
  "nifty-next-50": niftyNext50Data as ValuationSnapshot[],
  "nifty-midcap-150": niftyMidcap150Data as ValuationSnapshot[],
  "nifty-smallcap-250": niftySmallcap250Data as ValuationSnapshot[],
  "nifty-largemidcap-250": niftyLargemidcap250Data as ValuationSnapshot[],
  "nifty-500": nifty500Data as ValuationSnapshot[],
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
