"use client";

import { TacticalSignal } from "@/types";

interface RadialGaugeProps {
  signal: TacticalSignal;
  size?: number;
}

const SIGNAL_COLORS: Record<string, string> = {
  "strong-buy": "#16a34a",
  "tactical-dip": "#22c55e",
  "buy": "#4ade80",
  "hold": "#facc15",
  "overvalued": "#ef4444",
};

export default function RadialGauge({ signal, size = 280 }: RadialGaugeProps) {
  // Map percentile (0-100) to angle on the 180° arc
  // 0 = far left (strong buy), 100 = far right (overvalued)
  const percentile = signal.pePercentile;
  const clampedPct = Math.max(0, Math.min(100, percentile));
  const needleAngle = -90 + (clampedPct / 100) * 180; // -90° to +90°

  const cx = size / 2;
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

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
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

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="#1f2937"
          strokeWidth={3}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />

        {/* Center circle */}
        <circle cx={cx} cy={cy} r={8} fill="#1f2937" />
        <circle cx={cx} cy={cy} r={4} fill="white" />

        {/* Percentile label under needle hub */}
        <text
          x={cx}
          y={cy + 28}
          textAnchor="middle"
          className="text-sm font-bold"
          fill="#374151"
          fontSize={14}
        >
          {percentile}th percentile
        </text>
      </svg>

      {/* Signal label and action */}
      <div className="text-center -mt-1">
        <span
          className="inline-block px-4 py-1.5 rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: signalColor }}
        >
          {signal.label}
        </span>
        <p className="text-sm text-gray-500 mt-2 font-medium">
          {signal.recommendedAction}
        </p>
      </div>
    </div>
  );
}
