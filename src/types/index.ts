export type IndexId =
  | "nifty-50"
  | "nifty-next-50"
  | "nifty-midcap-150"
  | "nifty-smallcap-250"
  | "nifty-largemidcap-250"
  | "nifty-500";

export interface IndexMeta {
  id: IndexId;
  name: string;
  shortName: string;
  description: string;
  enabled: boolean;
}

export interface ValuationSnapshot {
  date: string; // YYYY-MM-DD
  pe: number;
  pb: number;
  dividendYield: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

export interface ValuationStats {
  current: number;
  median: number;
  mean: number;
  min: number;
  max: number;
  percentile: number; // 0-100, where current value falls in historical range
}

export interface IndexValuation {
  indexId: IndexId;
  lastUpdated: string;
  pe: ValuationStats;
  pb: ValuationStats;
  dividendYield: ValuationStats;
  history: ValuationSnapshot[];
}

export type Zone = "deeply-undervalued" | "undervalued" | "fair" | "overvalued" | "deeply-overvalued";

export interface ZoneConfig {
  zone: Zone;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  minPercentile: number;
  maxPercentile: number;
}

export interface Constituent {
  symbol: string;
  name: string;
  tradedValue: number;
  lastPrice: number;
  pChange: number;
}

// ── v2 Tactical Signal Types ──

export type Signal = "strong-buy" | "tactical-dip" | "buy" | "hold" | "overvalued";

export type RecommendedMode = "Lumpsum + SIP" | "SIP Only" | "Neutral" | "Reduce";

export interface TacticalSignal {
  signal: Signal;
  label: string;
  recommendedAction: string;
  recommendedMode: RecommendedMode;
  allocationPercentage: number;
  confidence: "High" | "Medium" | "Low";
  yieldGap: number;
  dmaDistance: number;
  pePercentile: number;
  gsecYield: number;
  isGsecFallback: boolean;
}

export interface PulseSnapshot {
  indexId: IndexId;
  date: string;
  pePercentile: number;
  pbPercentile: number;
  dyPercentile: number;
  yieldGap: number;
  dmaDistance: number;
  signal: TacticalSignal;
}

export interface ThirukkuralVerse {
  number: number;
  tamil: string;
  transliteration: string;
  english: string;
  topic: string;
  category?: "BULLISH" | "BEARISH" | "NEUTRAL" | "GENERAL";
}
