"use client";

import { ValuationStats } from "@/types";
import { getZone } from "@/lib/constants";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  stats: ValuationStats;
  unit?: string;
  invertedSignal?: boolean; // true for dividend yield (higher = better)
}

export default function MetricCard({ title, stats, unit = "x", invertedSignal = false }: MetricCardProps) {
  const zone = getZone(invertedSignal ? 100 - stats.percentile : stats.percentile);
  const diffFromMedian = stats.current - stats.median;
  const diffPercent = ((diffFromMedian / stats.median) * 100).toFixed(1);
  const isAboveMedian = diffFromMedian > 0;

  const TrendIcon = Math.abs(diffFromMedian) < 0.1 ? Minus : isAboveMedian ? TrendingUp : TrendingDown;

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm hover:shadow-2xl hover:scale-[1.01] hover:border-blue-500/30 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-muted uppercase tracking-wider">{title}</h3>
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${zone.bgColor} ${zone.textColor} border border-black/5 dark:border-white/5`}
        >
          {zone.label}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-black text-foreground tracking-tight">
          {stats.current.toFixed(2)}
        </span>
        <span className="text-sm font-bold text-muted opacity-50">{unit}</span>
      </div>

      <div className="flex items-center gap-1.5 mb-5">
        <div className={`p-1 rounded-md ${Math.abs(diffFromMedian) < 0.1
          ? "bg-gray-100 dark:bg-gray-800"
          : (isAboveMedian && !invertedSignal) || (!isAboveMedian && invertedSignal)
            ? "bg-rose-50 dark:bg-rose-900/20"
            : "bg-emerald-50 dark:bg-emerald-900/20"
          }`}>
          <TrendIcon
            size={14}
            strokeWidth={3}
            className={
              Math.abs(diffFromMedian) < 0.1
                ? "text-muted"
                : (isAboveMedian && !invertedSignal) || (!isAboveMedian && invertedSignal)
                  ? "text-rose-500"
                  : "text-emerald-500"
            }
          />
        </div>
        <span
          className={`text-sm font-bold ${Math.abs(diffFromMedian) < 0.1
            ? "text-muted"
            : (isAboveMedian && !invertedSignal) || (!isAboveMedian && invertedSignal)
              ? "text-rose-500"
              : "text-emerald-500"
            }`}
        >
          {isAboveMedian ? "+" : ""}
          {diffPercent}%
          <span className="ml-1 text-[10px] text-muted font-medium opacity-60 italic whitespace-nowrap">vs median</span>
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between items-center text-muted font-medium">
          <span>Median</span>
          <span className="font-bold text-foreground bg-background px-2 py-0.5 rounded border border-border">{stats.median.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-muted font-medium">
          <span>Mean</span>
          <span className="font-bold text-foreground">{stats.mean.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-muted font-medium">
          <span>Range</span>
          <span className="font-bold text-foreground">
            {stats.min.toFixed(2)} - {stats.max.toFixed(2)}
          </span>
        </div>
        {/* Percentile bar */}
        <div className="pt-3">
          <div className="flex justify-between text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
            <span>Market Percentile</span>
            <span className="text-foreground">{stats.percentile}th</span>
          </div>
          <div className="w-full bg-background rounded-full h-1.5 border border-border/50">
            <div
              className="h-1.5 rounded-full transition-all duration-700 ease-out shadow-[0_0_8px] shadow-current"
              style={{
                width: `${stats.percentile}%`,
                backgroundColor: zone.color,
                color: zone.color, // used for shadow-current
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
