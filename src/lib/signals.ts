import { IndexValuation, Signal, TacticalSignal, RecommendedMode } from "@/types";

/**
 * Compute Earnings Yield Gap vs 10Y G-Sec bond yield.
 * Positive gap means equities are attractive relative to bonds.
 */
export function computeYieldGap(pe: number, gsecYield: number): number {
  if (pe <= 0) return 0;
  const earningsYield = (1 / pe) * 100;
  return Math.round((earningsYield - gsecYield) * 100) / 100;
}

/**
 * Compute the 200-day simple moving average of P/E values.
 */
export function compute200DMA(peHistory: number[]): number {
  if (peHistory.length === 0) return 0;
  const window = peHistory.slice(-200);
  const sum = window.reduce((a, b) => a + b, 0);
  return Math.round((sum / window.length) * 100) / 100;
}

/**
 * Compute distance from the 200-DMA as a percentage.
 * Negative means current is below the DMA (potential dip).
 */
export function computeDMADistance(current: number, dma200: number): number {
  if (dma200 <= 0) return 0;
  return Math.round(((current - dma200) / dma200) * 100 * 100) / 100;
}

const SIGNAL_CONFIG: Record<Signal, { label: string; action: string; mode: RecommendedMode; allocation: number }> = {
  "strong-buy": {
    label: "Strong Buy",
    action: "Lumpsum + SIP",
    mode: "Lumpsum + SIP",
    allocation: 90,
  },
  "tactical-dip": {
    label: "Tactical Dip",
    action: "Lumpsum Top-up",
    mode: "Lumpsum + SIP",
    allocation: 80,
  },
  "buy": {
    label: "Buy",
    action: "Continue SIP",
    mode: "SIP Only",
    allocation: 70,
  },
  "hold": {
    label: "Hold",
    action: "Neutral / No Lumpsum",
    mode: "Neutral",
    allocation: 50,
  },
  "overvalued": {
    label: "Overvalued",
    action: "Reduce Exposure / Halt SIP",
    mode: "Reduce",
    allocation: 30,
  },
};

/**
 * Determine confidence based on how many indicators agree on the direction.
 */
function getConfidence(pePercentile: number, yieldGap: number, dmaDistance: number): "High" | "Medium" | "Low" {
  let bullishCount = 0;
  if (pePercentile < 50) bullishCount++;
  if (yieldGap > 1) bullishCount++;
  if (dmaDistance < 0) bullishCount++;

  let bearishCount = 0;
  if (pePercentile > 50) bearishCount++;
  if (yieldGap < -1) bearishCount++;
  if (dmaDistance > 10) bearishCount++;

  if (bullishCount >= 3 || bearishCount >= 3) return "High";
  if (bullishCount >= 2 || bearishCount >= 2) return "Medium";
  return "Low";
}

/**
 * Core tactical engine: produces an actionable signal from valuation data.
 *
 * Signal Matrix (from v2 spec):
 *   P/E < 20th pct           → Strong Buy  (Lumpsum + SIP)
 *   Price < 10% below 200-DMA → Tactical Dip (Lumpsum Top-up)
 *   20th < P/E < 50th pct    → Buy         (Continue SIP)
 *   50th < P/E < 80th pct    → Hold        (Neutral)
 *   P/E > 80th pct           → Overvalued  (Reduce / Halt SIP)
 */
export function getInvestmentStrategy(
  valuation: IndexValuation,
  gsecData: { yield: number; isFallback: boolean } = { yield: 7.0, isFallback: true },
): TacticalSignal {
  const pePercentile = valuation.pe.percentile;
  const currentPE = valuation.pe.current;

  // Compute 200-DMA from history
  const peHistory = valuation.history.map((h) => h.pe);
  const dma200 = compute200DMA(peHistory);
  const dmaDistance = computeDMADistance(currentPE, dma200);
  const yieldGap = computeYieldGap(currentPE, gsecData.yield);

  // Determine signal
  let signal: Signal;

  if (pePercentile < 20) {
    signal = "strong-buy";
  } else if (dmaDistance < -10) {
    // Price more than 10% below 200-DMA
    signal = "tactical-dip";
  } else if (pePercentile < 50) {
    signal = "buy";
  } else if (pePercentile < 80) {
    signal = "hold";
  } else {
    signal = "overvalued";
  }

  const config = SIGNAL_CONFIG[signal];
  const confidence = getConfidence(pePercentile, yieldGap, dmaDistance);

  // Adjust allocation based on yield gap
  let adjustedAllocation = config.allocation;
  if (yieldGap > 2) adjustedAllocation = Math.min(100, adjustedAllocation + 10);
  if (yieldGap < -1) adjustedAllocation = Math.max(0, adjustedAllocation - 10);

  return {
    signal,
    label: config.label,
    recommendedAction: config.action,
    recommendedMode: config.mode,
    allocationPercentage: adjustedAllocation,
    confidence,
    yieldGap,
    dmaDistance,
    pePercentile,
    gsecYield: gsecData.yield,
    isGsecFallback: gsecData.isFallback,
  };
}
