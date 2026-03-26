import { IndexMeta, ZoneConfig } from "@/types";

export const INDICES: IndexMeta[] = [
  {
    id: "nifty-50",
    name: "Nifty 50",
    shortName: "N50",
    description: "Top 50 companies by market capitalization on NSE",
    enabled: true,
  },
  {
    id: "nifty-next-50",
    name: "Nifty Next 50",
    shortName: "NN50",
    description: "Companies ranked 51-100 by market capitalization",
    enabled: true,
  },
  {
    id: "nifty-midcap-150",
    name: "Nifty Midcap 150",
    shortName: "MC150",
    description: "150 midcap companies on NSE",
    enabled: true,
  },
  {
    id: "nifty-smallcap-250",
    name: "Nifty Smallcap 250",
    shortName: "SC250",
    description: "250 smallcap companies on NSE",
    enabled: true,
  },
  {
    id: "nifty-largemidcap-250",
    name: "Nifty LargeMidcap 250",
    shortName: "LM250",
    description: "250 large and midcap companies on NSE",
    enabled: true,
  },
  {
    id: "nifty-500",
    name: "Nifty 500",
    shortName: "N500",
    description: "Top 500 companies by market capitalization on NSE",
    enabled: true,
  },
];

export const ZONES: ZoneConfig[] = [
  {
    zone: "deeply-undervalued",
    label: "Deeply Undervalued",
    color: "#16a34a",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    minPercentile: 0,
    maxPercentile: 20,
  },
  {
    zone: "undervalued",
    label: "Undervalued",
    color: "#4ade80",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-800",
    minPercentile: 20,
    maxPercentile: 40,
  },
  {
    zone: "fair",
    label: "Fair Value",
    color: "#facc15",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    minPercentile: 40,
    maxPercentile: 60,
  },
  {
    zone: "overvalued",
    label: "Overvalued",
    color: "#fb923c",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
    minPercentile: 60,
    maxPercentile: 80,
  },
  {
    zone: "deeply-overvalued",
    label: "Deeply Overvalued",
    color: "#ef4444",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    minPercentile: 80,
    maxPercentile: 100,
  },
];

export function getZone(percentile: number): ZoneConfig {
  return (
    ZONES.find((z) => percentile >= z.minPercentile && percentile < z.maxPercentile) ??
    ZONES[ZONES.length - 1]
  );
}
