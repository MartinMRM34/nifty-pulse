"use client";

import { TacticalSignal } from "@/types";
import { TrendingUp, TrendingDown, Activity, Target, ChevronLeft, ChevronRight } from "lucide-react";
import { DS } from "@/lib/design-system";

interface StatsData {
  high?: string;
  low?: string;
  close?: string;
  open?: string;
  pe?: string;
  pb?: string;
  dy?: string;
}

interface HorizontalPulseBarProps {
  signal: TacticalSignal;
  value?: string;
  statsData?: StatsData;
  onPrev?: () => void;
  onNext?: () => void;
  canPrev?: boolean;
  canNext?: boolean;
}

const ZONES = [
  { label: "Strong Buy", colorClass: "bg-emerald-600", borderClass: "border-emerald-500/20", range: [0, 20] },
  { label: "Buy", colorClass: "bg-green-500", borderClass: "border-green-500/20", range: [20, 40] },
  { label: "Hold", colorClass: "bg-yellow-500", borderClass: "border-yellow-500/20", range: [40, 60] },
  { label: "Overvalued", colorClass: "bg-orange-500", borderClass: "border-orange-500/20", range: [60, 80] },
  { label: "Extreme", colorClass: "bg-red-500", borderClass: "border-red-500/20", range: [80, 100] },
];

const getRetrospectiveText = (signal: string) => {
  const labels: Record<string, string> = {
    "strong-buy": "Was a Strong Buy",
    "tactical-dip": "Was a Tactical Dip",
    "buy": "Was a Buy Signal",
    "hold": "Was a Hold Signal",
    "overvalued": "Was Overvalued",
  };
  const actions: Record<string, string> = {
    "strong-buy": "Ideal window for Aggressive Lumpsum",
    "tactical-dip": "Opportunity for Lumpsum Top-up",
    "buy": "Best to have continued SIP",
    "hold": "Should have remained Neutral",
    "overvalued": "Should have reduced Exposure",
  };
  return { label: labels[signal] || "Unknown", action: actions[signal] || "No recommendation" };
};

export default function HorizontalPulseBar({ 
  signal, 
  value, 
  statsData,
  onPrev,
  onNext,
  canPrev,
  canNext
}: HorizontalPulseBarProps) {
  const percentile = signal.pePercentile;
  const retroText = getRetrospectiveText(signal.signal);
  const activeZone = ZONES.find(z => percentile >= z.range[0] && percentile <= z.range[1]) || ZONES[2];

  return (
    <div className={`w-full ${DS.ANIM.TRANSITION} animate-in fade-in slide-in-from-bottom-2 duration-700`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Pulse Hero & Scale */}
        <div className="lg:col-span-7 space-y-8">
          <div className="flex items-end justify-between px-1">
            <div className="space-y-1">
              <p className={DS.TEXT.MUTED_CAPS}>Historical Pulse</p>
              <h2 className={DS.TEXT.VALUE + " text-4xl"}>{value || "—"}</h2>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <span
                className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-wider shadow-xl shadow-black/10 border ${activeZone.borderClass} ${activeZone.colorClass}`}
              >
                {retroText.label}
              </span>
              <p className={`${DS.TEXT.TINY_CAPS} text-muted opacity-60`}>
                {percentile}th Percentile
              </p>
            </div>
          </div>

          {/* The Horizontal Bar Scale */}
          <div className="relative pt-6 pb-2 px-1">
            {/* The Track with Segments */}
            <div className="h-3 w-full flex rounded-full overflow-hidden bg-muted/10 border border-border/10 backdrop-blur-sm shadow-inner">
              {ZONES.map((zone) => (
                <div
                  key={zone.label}
                  className={`h-full relative ${zone.colorClass} opacity-85`}
                  style={{ width: "20%" }}
                />
              ))}
            </div>


            {/* The Indicator (Needle replacement) */}
            <div
              className={`absolute top-0 h-10 w-0.5 bg-foreground ${DS.ANIM.TRANSITION} duration-1000 ease-out shadow-[0_0_20px_rgba(255,255,255,0.8)] z-10`}
              style={{ left: `${percentile}%` }}
            >
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-foreground shadow-2xl border-2 border-background" />
              <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 ${DS.DOT.MD} rounded-full bg-foreground/30 ${DS.ANIM.PULSE}`} />
            </div>

            {/* Scale Markers */}
            <div className="flex justify-between mt-4 px-1">
              <span className={DS.TEXT.MUTED_CAPS_TIGHT + " opacity-40"}>Undervalued</span>
              <span className={DS.TEXT.MUTED_CAPS_TIGHT + " opacity-40 ml-8"}>Neutral</span>
              <span className={DS.TEXT.MUTED_CAPS_TIGHT + " opacity-40"}>Expensive</span>
            </div>
          </div>

          {/* Slogan */}
          <div className="space-y-3 pt-4">
            <h4 className={`${DS.TEXT.BODY_STRONG} text-xl leading-tight text-blue-500 dark:text-blue-400`}>
              {retroText.action}
            </h4>
            <p className={`${DS.TEXT.BODY} max-w-xl opacity-60 leading-relaxed font-medium`}>
              Retrospective analysis based on {percentile}th percentile valuation and historical yield gap metrics.
            </p>

            {/* Signal Breakdown Row */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border/10 mt-6">
              <div className="flex flex-col gap-1">
                <p className={DS.TEXT.TINY_CAPS + " opacity-40"}>Yield Gap</p>
                <p className="text-sm font-black text-foreground/80">{signal.yieldGap?.toFixed(2)}%</p>
              </div>
              <div className="w-px h-8 bg-border/20 hidden sm:block" />
              <div className="flex flex-col gap-1">
                <p className={DS.TEXT.TINY_CAPS + " opacity-40"}>DMA Trend</p>
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-black ${signal.dmaDistance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {signal.dmaDistance >= 0 ? '+' : ''}{signal.dmaDistance?.toFixed(1)}%
                  </span>
                  <span className="text-[10px] font-bold opacity-30 uppercase tracking-tighter">vs 200-DMA</span>
                </div>
              </div>
              <div className="w-px h-8 bg-border/20 hidden sm:block" />
              <div className="flex flex-col gap-1">
                <p className={DS.TEXT.TINY_CAPS + " opacity-40"}>Confidence</p>
                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                  signal.confidence === "High" ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' :
                  signal.confidence === "Medium" ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10' :
                  'bg-slate-500/10 text-slate-500 border border-slate-500/10'
                }`}>
                  {signal.confidence}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Integrated Metadata Grid */}
        <div className="lg:col-span-5">
           <div className="bg-slate-500/5 dark:bg-white/5 rounded-[2rem] p-8 border border-border/50 backdrop-blur-md space-y-8">
             <div className="space-y-6">
                <p className={DS.TEXT.MUTED_CAPS_TIGHT + " opacity-40"}>Price Action (OHLC)</p>
                <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10 shadow-sm">
                      <TrendingUp className={DS.ICON.SM} />
                    </div>
                    <div>
                      <p className={DS.TEXT.TINY_CAPS + " opacity-50"}>High</p>
                      <p className={DS.TEXT.BODY_STRONG + " text-base"}>{statsData?.high || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10 shadow-sm">
                      <Activity className={DS.ICON.SM} />
                    </div>
                    <div>
                      <p className={DS.TEXT.TINY_CAPS + " opacity-50"}>Open</p>
                      <p className={DS.TEXT.BODY_STRONG + " text-base"}>{statsData?.open || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/10 shadow-sm">
                      <TrendingDown className={DS.ICON.SM} />
                    </div>
                    <div>
                      <p className={DS.TEXT.TINY_CAPS + " opacity-50"}>Low</p>
                      <p className={DS.TEXT.BODY_STRONG + " text-base"}>{statsData?.low || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/10 shadow-sm">
                      <Target className={DS.ICON.SM} />
                    </div>
                    <div>
                      <p className={DS.TEXT.TINY_CAPS + " opacity-50"}>Close</p>
                      <p className={DS.TEXT.BODY_STRONG + " text-base"}>{statsData?.close || "—"}</p>
                    </div>
                  </div>
                </div>
             </div>

             <div className="h-px bg-border/30 w-full" />

             <div className="space-y-6">
                <p className={DS.TEXT.MUTED_CAPS_TIGHT + " opacity-40"}>Fundamental Valuations</p>
                <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/10 shadow-sm">
                      <span className="text-[10px] font-black italic">PE</span>
                    </div>
                    <div>
                      <p className={DS.TEXT.TINY_CAPS + " opacity-50"}>PE Ratio</p>
                      <p className={DS.TEXT.BODY_STRONG + " text-base"}>{statsData?.pe || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500 border border-fuchsia-500/10 shadow-sm">
                      <span className="text-[10px] font-black italic">PB</span>
                    </div>
                    <div>
                      <p className={DS.TEXT.TINY_CAPS + " opacity-50"}>PB Ratio</p>
                      <p className={DS.TEXT.BODY_STRONG + " text-base"}>{statsData?.pb || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/10 shadow-sm">
                      <span className="text-[10px] font-black italic">%Y</span>
                    </div>
                    <div>
                      <p className={DS.TEXT.TINY_CAPS + " opacity-50"}>Div Yield</p>
                      <p className={DS.TEXT.BODY_STRONG + " text-base"}>{statsData?.dy || "—"}</p>
                    </div>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
