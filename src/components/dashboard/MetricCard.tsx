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
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</h3>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${zone.bgColor} ${zone.textColor}`}
        >
          {zone.label}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-bold text-gray-900">
          {stats.current.toFixed(2)}
        </span>
        <span className="text-sm text-gray-400">{unit}</span>
      </div>

      <div className="flex items-center gap-1 mb-4">
        <TrendIcon
          size={16}
          className={
            Math.abs(diffFromMedian) < 0.1
              ? "text-gray-400"
              : (isAboveMedian && !invertedSignal) || (!isAboveMedian && invertedSignal)
                ? "text-red-500"
                : "text-green-500"
          }
        />
        <span
          className={`text-sm font-medium ${
            Math.abs(diffFromMedian) < 0.1
              ? "text-gray-400"
              : (isAboveMedian && !invertedSignal) || (!isAboveMedian && invertedSignal)
                ? "text-red-500"
                : "text-green-500"
          }`}
        >
          {isAboveMedian ? "+" : ""}
          {diffPercent}% vs median
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Median</span>
          <span className="font-medium text-gray-700">{stats.median.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Mean</span>
          <span className="font-medium text-gray-700">{stats.mean.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Range</span>
          <span className="font-medium text-gray-700">
            {stats.min.toFixed(2)} - {stats.max.toFixed(2)}
          </span>
        </div>
        {/* Percentile bar */}
        <div className="pt-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Percentile</span>
            <span>{stats.percentile}th</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${stats.percentile}%`,
                backgroundColor: zone.color,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
