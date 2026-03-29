"use client";

import { TacticalSignal } from "@/types";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";
import { DS } from "@/lib/design-system";

interface StatsData {
  high?: string;
  low?: string;
  close?: string;
  open?: string;
}

interface HorizontalPulseBarProps {
  signal: TacticalSignal;
  value?: string;
  statsData?: StatsData;
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

export default function HorizontalPulseBar({ signal, value, statsData }: HorizontalPulseBarProps) {
  const percentile = signal.pePercentile;
  const retroText = getRetrospectiveText(signal.signal);
  const activeZone = ZONES.find(z => percentile >= z.range[0] && percentile <= z.range[1]) || ZONES[2];

  return (
    <div className={`w-full ${DS.ANIM.TRANSITION} animate-in fade-in slide-in-from-bottom-2 duration-700`}>
      {/* Header: Price and Retrospective Label */}
      <div className="flex items-end justify-between px-1 mb-6">
        <div className="space-y-1">
          <p className={DS.TEXT.MUTED_CAPS}>Historical Pulse</p>
          <h2 className={DS.TEXT.VALUE}>{value || "—"}</h2>
        </div>
        <div className="text-right">
          <span 
            className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-wider shadow-lg shadow-black/10 border ${activeZone.borderClass} ${activeZone.colorClass}`}
          >
            {retroText.label}
          </span>
          <p className={`${DS.TEXT.TINY_CAPS} mt-2 text-muted opacity-60`}>
            {percentile}th Percentile
          </p>
        </div>
      </div>

      {/* The Horizontal Bar Scale */}
      <div className="relative pt-6 pb-2 mb-8">
        {/* The Track with Segments */}
        <div className="h-2.5 w-full flex rounded-full overflow-hidden bg-muted/10 border border-border/10 backdrop-blur-sm">
          {ZONES.map((zone) => (
            <div 
              key={zone.label} 
              className={`h-full relative ${zone.colorClass} opacity-85 shadow-inner`}
              style={{ width: "20%" }}
            />
          ))}
        </div>

        {/* The Indicator (Needle replacement) */}
        <div 
          className={`absolute top-0 h-10 w-0.5 bg-foreground ${DS.ANIM.TRANSITION} duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)] z-10`}
          style={{ left: `${percentile}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-foreground shadow-xl" />
          <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 ${DS.DOT.SM} rounded-full bg-foreground/50 ${DS.ANIM.PULSE}`} />
        </div>
        
        {/* Scale Markers */}
        <div className="flex justify-between mt-3 px-0.5">
          <span className={DS.TEXT.MUTED_CAPS_TIGHT}>Undervalued</span>
          <span className={DS.TEXT.MUTED_CAPS_TIGHT}>Neutral</span>
          <span className={DS.TEXT.MUTED_CAPS_TIGHT}>Expensive</span>
        </div>
      </div>

      {/* Slogan & Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/30">
        <div className="space-y-2">
          <h4 className={`${DS.TEXT.BODY_STRONG} leading-tight`}>
            {retroText.action}
          </h4>
          <p className={`${DS.TEXT.BODY} opacity-70`}>
            Retrospective analysis based on {percentile}th percentile valuation and historical yield gap metrics.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10`}>
              <TrendingUp className={DS.ICON.SM} />
            </div>
            <div>
              <p className={DS.TEXT.MUTED_CAPS_TIGHT}>High</p>
              <p className={DS.TEXT.BODY_STRONG}>{statsData?.high || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/10`}>
              <TrendingDown className={DS.ICON.SM} />
            </div>
            <div>
              <p className={DS.TEXT.MUTED_CAPS_TIGHT}>Low</p>
              <p className={DS.TEXT.BODY_STRONG}>{statsData?.low || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10`}>
              <Activity className={DS.ICON.SM} />
            </div>
            <div>
              <p className={DS.TEXT.MUTED_CAPS_TIGHT}>Open</p>
              <p className={DS.TEXT.BODY_STRONG}>{statsData?.open || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/10`}>
              <Target className={DS.ICON.SM} />
            </div>
            <div>
              <p className={DS.TEXT.MUTED_CAPS_TIGHT}>Close</p>
              <p className={DS.TEXT.BODY_STRONG}>{statsData?.close || "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
