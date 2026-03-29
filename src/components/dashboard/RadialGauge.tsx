"use client";

import { TacticalSignal } from "@/types";

interface StatsData {
  high?: string;
  low?: string;
  close?: string;
  open?: string;
}

interface RadialGaugeProps {
  signal: TacticalSignal;
  size?: number;
  value?: string;
  statsData?: StatsData;
  isHistorical?: boolean;
}

const SIGNAL_COLORS: Record<string, string> = {
  "strong-buy": "#16a34a",
  "tactical-dip": "#22c55e",
  "buy": "#4ade80",
  "hold": "#facc15",
  "overvalued": "#ef4444",
};

// Past-tense transformations for Time Travel
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

export default function RadialGauge({ signal, size = 280, value, statsData }: RadialGaugeProps) {
  const percentile = signal.pePercentile;
  const clampedPct = Math.max(0, Math.min(100, percentile));
  const needleAngle = -90 + (clampedPct / 100) * 180;

  // When stats are embedded, add horizontal padding so text fits beside the arc ends
  const SIDE_W = statsData ? size * 0.44 : 0;
  const totalW = size + 2 * SIDE_W;

  const cx = SIDE_W + size / 2;
  const cy = size * 0.6;
  const radius = size * 0.38;
  const strokeWidth = size * 0.07;

  // Arc segments for the gauge background (5 zones)
  const zones = [
    { start: 0, end: 20, color: "#16a34a" },
    { start: 20, end: 40, color: "#4ade80" },
    { start: 40, end: 60, color: "#facc15" },
    { start: 60, end: 80, color: "#fb923c" },
    { start: 80, end: 100, color: "#ef4444" },
  ];

  function arcPath(startPct: number, endPct: number): string {
    const startAngle = Math.PI + (startPct / 100) * Math.PI;
    const endAngle = Math.PI + (endPct / 100) * Math.PI;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = endPct - startPct > 50 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  // Needle
  const needleLength = radius - strokeWidth;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleX = cx + needleLength * Math.cos(needleRad - Math.PI / 2);
  const needleY = cy + needleLength * Math.sin(needleRad - Math.PI / 2);

  const signalColor = SIGNAL_COLORS[signal.signal] || "#6b7280";

  // Stats text positioning — aligned to the arc endpoints
  const leftArcX = cx - radius;
  const rightArcX = cx + radius;
  const GAP = 12;
  const labelFs = Math.max(7, size * 0.055);
  const valueFs = Math.max(8, size * 0.068);

  // Y positions spaced to stay within SVG height (size * 0.7)
  const yH_label = cy - 24;
  const yH_value = cy - 11;
  const yL_label = cy + 2;
  const yL_value = cy + 15;

  return (
    <div className="flex flex-col items-center">
      <svg width={totalW} height={size * 0.7} viewBox={`0 0 ${totalW} ${size * 0.7}`}>
        {/* Zone arcs */}
        {zones.map((z) => (
          <path
            key={z.start}
            d={arcPath(z.start, z.end)}
            fill="none"
            stroke={z.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            opacity={0.85}
          />
        ))}

        {/* Central Value (Price) */}
        {value && (
          <text
            x={cx}
            y={cy - (size * 0.05)}
            textAnchor="middle"
            className="font-black fill-foreground transition-colors"
            style={{ fontSize: `${size * 0.095}px`, letterSpacing: "-0.02em" }}
          >
            {value}
          </text>
        )}

        {/* Embedded Stats — left side: High / Low */}
        {statsData && (
          <>
            {/* HIGH */}
            <text x={leftArcX - GAP} y={yH_label} textAnchor="end"
              style={{ fontSize: `${labelFs}px`, fontWeight: 800, letterSpacing: '0.05em', opacity: 0.55 }}
              className="fill-current text-slate-500 dark:text-slate-400 uppercase">
              High
            </text>
            <text x={leftArcX - GAP} y={yH_value} textAnchor="end"
              style={{ fontSize: `${valueFs}px`, fontWeight: 800 }}
              className="fill-emerald-500">
              {statsData.high || '—'}
            </text>
            {/* LOW */}
            <text x={leftArcX - GAP} y={yL_label} textAnchor="end"
              style={{ fontSize: `${labelFs}px`, fontWeight: 800, letterSpacing: '0.05em', opacity: 0.55 }}
              className="fill-current text-slate-500 dark:text-slate-400 uppercase">
              Low
            </text>
            <text x={leftArcX - GAP} y={yL_value} textAnchor="end"
              style={{ fontSize: `${valueFs}px`, fontWeight: 800 }}
              className="fill-rose-500">
              {statsData.low || '—'}
            </text>

            {/* CLOSE */}
            <text x={rightArcX + GAP} y={yH_label} textAnchor="start"
              style={{ fontSize: `${labelFs}px`, fontWeight: 800, letterSpacing: '0.05em', opacity: 0.55 }}
              className="fill-current text-slate-500 dark:text-slate-400 uppercase">
              Close
            </text>
            <text x={rightArcX + GAP} y={yH_value} textAnchor="start"
              style={{ fontSize: `${valueFs}px`, fontWeight: 800 }}
              className="fill-current text-slate-700 dark:text-slate-200">
              {statsData.close || '—'}
            </text>
            {/* OPEN */}
            <text x={rightArcX + GAP} y={yL_label} textAnchor="start"
              style={{ fontSize: `${labelFs}px`, fontWeight: 800, letterSpacing: '0.05em', opacity: 0.55 }}
              className="fill-current text-slate-500 dark:text-slate-400 uppercase">
              Open
            </text>
            <text x={rightArcX + GAP} y={yL_value} textAnchor="start"
              style={{ fontSize: `${valueFs}px`, fontWeight: 800, opacity: 0.7 }}
              className="fill-current text-slate-500 dark:text-slate-400">
              {statsData.open || '—'}
            </text>
          </>
        )}

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="currentColor"
          strokeWidth={size * 0.015}
          strokeLinecap="round"
          className="text-slate-800 dark:text-slate-400 transition-all duration-1000 ease-out"
        />

        {/* Center circle */}
        <circle cx={cx} cy={cy} r={size * 0.035} fill="currentColor" className="text-slate-800 dark:text-slate-400" />
        <circle cx={cx} cy={cy} r={size * 0.015} fill="white" className="dark:fill-slate-100" />

      </svg>

      {/* Signal label and action */}
      <div className="text-center -mt-2">
        <span
          className="inline-block px-5 py-2 rounded-full text-[11px] font-black text-white uppercase tracking-wider shadow-md shadow-black/10 border border-white/10"
          style={{ backgroundColor: signalColor }}
        >
          {signal.label}
        </span>
        <p className="text-sm text-foreground mt-3 font-bold px-4 max-w-[240px]">
          {signal.recommendedAction}
        </p>
        <p className="text-[10px] text-muted mt-1 font-medium opacity-60">
          {percentile}{
            (() => {
              const s = ["th", "st", "nd", "rd"],
                v = percentile % 100;
              return s[(v - 20) % 10] || s[v] || s[0];
            })()
          } percentile
        </p>
      </div>
    </div>

  );
}
