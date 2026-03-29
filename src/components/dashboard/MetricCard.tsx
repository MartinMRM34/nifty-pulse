"use client";

import { ValuationStats } from "@/types";
import { getZone } from "@/lib/constants";
import { TrendingUp, TrendingDown, Minus, HelpCircle, X } from "lucide-react";
import { useState } from "react";

interface MetricCardProps {
  title: string;
  stats: ValuationStats;
  unit?: string;
  invertedSignal?: boolean; // true for dividend yield (higher = better)
}

import { DS } from "@/lib/design-system";

export default function MetricCard({ title, stats, unit = "x", invertedSignal = false }: MetricCardProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const zone = getZone(invertedSignal ? 100 - stats.percentile : stats.percentile);
  const diffFromMedian = stats.current - stats.median;
  const diffPercent = ((diffFromMedian / stats.median) * 100).toFixed(1);
  const isAboveMedian = diffFromMedian > 0;

  const TrendIcon = Math.abs(diffFromMedian) < 0.1 ? Minus : isAboveMedian ? TrendingUp : TrendingDown;

  return (
    <div className={`${DS.CARD.BASE} ${DS.CARD.P6} ${!isInfoOpen ? DS.CARD.INTERACTIVE : ""} ${isInfoOpen ? 'relative z-50' : 'relative z-10'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={DS.TEXT.LABEL}>{title}</h3>
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${zone.bgColor} ${zone.textColor} border border-black/5 dark:border-white/5`}
        >
          {zone.label}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className={DS.TEXT.VALUE}>
          {stats.current.toFixed(2)}
        </span>
        <span className={DS.TEXT.SUBVALUE}>{unit}</span>
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
        <div className="pt-3 relative">
          <div className="flex justify-between items-center text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
            <div className="flex items-center gap-1.5">
              <span>Market Percentile</span>
              <button 
                onClick={() => setIsInfoOpen(!isInfoOpen)}
                className={`p-0.5 rounded-full transition-all ${isInfoOpen ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-muted/10 hover:bg-blue-500/10 hover:text-blue-500'}`}
              >
                <HelpCircle size={10} />
              </button>
            </div>
            <span className="text-foreground">
              {stats.percentile}{
                (() => {
                  const s = ["th", "st", "nd", "rd"],
                    v = stats.percentile % 100;
                  return s[(v - 20) % 10] || s[v] || s[0];
                })()
              }
            </span>
          </div>
          
          <div className="w-full bg-background rounded-full h-1.5 border border-border/50">
            <div
              className={`h-1.5 rounded-full ${DS.ANIM.TRANSITION} duration-700 ease-out shadow-[0_0_8px] shadow-current`}
              style={{
                width: `${stats.percentile}%`,
                backgroundColor: zone.color,
                color: zone.color, // used for shadow-current
              }}
            />
          </div>

          {/* Interpretation Popover */}
          {isInfoOpen && (
            <div className={`fixed sm:absolute inset-x-4 sm:inset-auto top-1/2 sm:top-full left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0 -translate-y-1/2 sm:translate-y-0 mt-0 sm:mt-3 w-auto sm:w-full p-4 ${DS.MODAL.POPOVER}`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
                  <p className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest">Historical Ranking</p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsInfoOpen(false);
                    }} 
                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {invertedSignal 
                    ? "Ranks current Yield against history. Higher percentile means better value (Income per Rupee is at historical highs)."
                    : "Ranks current Price against history. Lower percentile means better value (Index is cheaper relative to earnings/book)."}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-[9px] font-black text-emerald-500 dark:text-emerald-400 uppercase">0-20th</p>
                    <p className="text-[8px] text-slate-500 dark:text-slate-400 leading-tight">Cheap / Rare Value</p>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/20">
                    <p className="text-[9px] font-black text-rose-500 dark:text-rose-400 uppercase">80-100th</p>
                    <p className="text-[8px] text-slate-500 dark:text-slate-400 leading-tight">Expensive / Risky</p>
                  </div>
                </div>
              </div>
              {/* Arrow */}
              <div className="hidden sm:block absolute bottom-full left-10 border-8 border-transparent border-b-white dark:border-b-slate-950" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
