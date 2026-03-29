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
    <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm hover:shadow-2xl hover:scale-[1.01] hover:border-blue-500/30 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-black text-muted uppercase tracking-widest opacity-60">
          Overall Market Signal
        </h3>
        <span className="text-[10px] text-muted font-bold opacity-40 italic">
          Last updated: {new Date(valuation.lastUpdated).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-xl border-4 border-white/10"
          style={{ backgroundColor: zone.color, boxShadow: `0 0 20px ${zone.color}40` }}
        >
          {overallPercentile}
        </div>
        <div className="flex-1">
          <p className={`text-xl font-black uppercase tracking-tight ${zone.textColor}`}>{zone.label}</p>
          <p className="text-sm text-muted font-medium mt-1 leading-relaxed opacity-80">{signalMessage[zone.zone]}</p>
        </div>
      </div>

      {latestSnapshot?.close && (
        <div className="mb-8 grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-background rounded-xl p-4 text-center border border-border transition-all hover:border-blue-400">
            <p className="text-[9px] text-muted font-black uppercase tracking-tighter opacity-60 mb-1">Index Price</p>
            <p className="text-base font-black text-foreground">
              {latestSnapshot.close.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-background rounded-xl p-4 text-center border border-border transition-all hover:border-emerald-400">
            <p className="text-[9px] text-muted font-black uppercase tracking-tighter opacity-60 mb-1">Day High</p>
            <p className="text-base font-black text-emerald-500">
              {latestSnapshot.high?.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-background rounded-xl p-4 text-center border border-border transition-all hover:border-rose-400">
            <p className="text-[9px] text-muted font-black uppercase tracking-tighter opacity-60 mb-1">Day Low</p>
            <p className="text-base font-black text-rose-500">
              {latestSnapshot.low?.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      )}

      {/* Zone bar */}
      <div className="mt-4 px-1">
        <div className="relative h-2">
          <div className="flex absolute inset-0 rounded-full overflow-hidden opacity-30 blur-[1px]">
            {ZONES.map((z) => (
              <div
                key={z.zone}
                className="flex-1"
                style={{ backgroundColor: z.color }}
              />
            ))}
          </div>
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
            className="absolute top-1/2 w-7 h-7 bg-white dark:bg-slate-200 border-[4px] border-slate-900 rounded-full shadow-xl transition-all duration-700 ease-out z-10"
            style={{
              left: `${Math.max(0, Math.min(100, overallPercentile))}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
        <div className="flex justify-between mt-6">
          <span className="text-[9px] font-black text-muted uppercase tracking-widest opacity-40">Undervalued</span>
          <span className="text-[9px] font-black text-muted uppercase tracking-widest opacity-40">Overvalued</span>
        </div>
      </div>
    </div>
  );
}
