"use client";

import { IndexValuation, Zone } from "@/types";
import { getZone, ZONES } from "@/lib/constants";

interface OverallSignalProps {
  valuation: IndexValuation;
}

function getOverallPercentile(valuation: IndexValuation): number {
  // For dividend yield, invert: lower percentile = higher yield = undervalued
  const dyInverted = 100 - valuation.dividendYield.percentile;
  // Weighted average: P/E has most weight, then P/B, then DY
  return Math.round(
    valuation.pe.percentile * 0.4 +
    valuation.pb.percentile * 0.3 +
    dyInverted * 0.3
  );
}

export default function OverallSignal({ valuation }: OverallSignalProps) {
  const overallPercentile = getOverallPercentile(valuation);
  const zone = getZone(overallPercentile);
  const latestSnapshot = valuation.history[valuation.history.length - 1];

  const signalMessage: Record<Zone, string> = {
    "deeply-undervalued": "Strong value opportunity. Historically rare valuation levels.",
    "undervalued": "Below historical norms. Favorable for long-term investors.",
    "fair": "Trading near historical averages. Neutral signal.",
    "overvalued": "Above historical norms. Exercise caution with fresh allocations.",
    "deeply-overvalued": "Significantly above historical averages. High valuations.",
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Overall Market Signal
        </h3>
        <span className="text-xs text-gray-400">
          Last updated: {new Date(valuation.lastUpdated).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: zone.color }}
        >
          {overallPercentile}
        </div>
        <div>
          <p className={`text-lg font-semibold ${zone.textColor}`}>{zone.label}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{signalMessage[zone.zone]}</p>
        </div>
      </div>

      {latestSnapshot?.close && (
        <div className="mb-6 grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center border border-gray-100 dark:border-gray-800">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Index Price</p>
            <p className="text-base font-bold text-gray-900 dark:text-gray-100">
              {latestSnapshot.close.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center border border-gray-100 dark:border-gray-800">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Day High</p>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {latestSnapshot.high?.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center border border-gray-100 dark:border-gray-800">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Day Low</p>
            <p className="text-base font-bold text-rose-600 dark:text-rose-400">
              {latestSnapshot.low?.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      )}

      {/* Zone bar */}
      <div className="mt-4">
        <div className="relative h-3">
          <div className="flex absolute inset-0 rounded-full overflow-hidden">
            {ZONES.map((z) => (
              <div
                key={z.zone}
                className="flex-1"
                style={{ backgroundColor: z.color }}
              />
            ))}
          </div>
          {/* Indicator Dot */}
          <div
            className="absolute top-1/2 w-6 h-6 bg-white dark:bg-gray-200 border-[3px] border-gray-800 rounded-full shadow-md transition-all duration-300 z-10"
            style={{
              left: `${Math.max(0, Math.min(100, overallPercentile))}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
        <div className="flex justify-between mt-3">
          <span className="text-[10px] text-gray-400">Undervalued</span>
          <span className="text-[10px] text-gray-400">Overvalued</span>
        </div>
      </div>
      <p className="mt-4 text-[10px] text-gray-400 italic">
        * Valuation percentiles for P/E are calculated based on post-April 2021 consolidated reporting standards.
      </p>
    </div>
  );
}
