"use client";

import { useState } from "react";
import { Calendar, ArrowRight, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { IndexValuation, TacticalSignal, ValuationSnapshot } from "@/types";
import { getInvestmentStrategy } from "@/lib/signals";
import { DS } from "@/lib/design-system";
import HorizontalPulseBar from "./HorizontalPulseBar";

interface DateLookupProps {
  valuation: IndexValuation;
}

/**
 * "Time Travel" component — select a historical date to see what the
 * signal was on that day based on the data available up to that point.
 */
export default function DateLookup({ valuation }: DateLookupProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [historicalSignal, setHistoricalSignal] = useState<TacticalSignal | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<ValuationSnapshot | null>(null);
  const [isOpen, setIsOpen] = useState(true); // Default to open in this new layout

  // Available date range
  const dates = valuation.history.map((h) => h.date);
  const minDate = dates.length > 0 ? dates[0] : "";
  const maxDate = dates.length > 0 ? dates[dates.length - 1] : "";

  function handleLookup(dateOverride?: string) {
    const dateToUse = dateOverride || selectedDate;
    if (!dateToUse) return;

    // Find the snapshot for the selected date (or nearest previous)
    const targetIdx = valuation.history.findIndex((h) => h.date >= dateToUse);
    if (targetIdx < 0) return;

    const snapshot = valuation.history[targetIdx];
    setSelectedSnapshot(snapshot);

    // Build a "virtual" valuation up to that date to compute the signal
    const historyUpToDate = valuation.history.slice(0, targetIdx + 1);

    // Use history to compute stats for that point in time
    const peValues = historyUpToDate.map((h) => h.pe);
    const sorted = [...peValues].sort((a, b) => a - b);
    const below = sorted.filter((v) => v < snapshot.pe).length;
    const pePercentile = Math.round((below / sorted.length) * 100);

    const virtualValuation: IndexValuation = {
      ...valuation,
      lastUpdated: snapshot.date,
      pe: {
        ...valuation.pe,
        current: snapshot.pe,
        percentile: pePercentile,
      },
      history: historyUpToDate,
    };

    const signal = getInvestmentStrategy(virtualValuation);
    setHistoricalSignal(signal);
  }

  const currentIndex = valuation.history.findIndex((h) => h.date >= selectedDate);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < valuation.history.length - 1;

  const navigate = (direction: "prev" | "next") => {
    const nextIdx = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    const newDate = valuation.history[nextIdx].date;
    setSelectedDate(newDate);
    handleLookup(newDate);
  };

  return (
    <div className={`${DS.CARD.BASE} overflow-hidden border-blue-500/10 shadow-2xl`}>
      {/* Sleek Header Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-5 gap-4 bg-slate-500/5 dark:bg-white/5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20">
            <Calendar className={DS.ICON.SM} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className={DS.TEXT.H2}>Historical Lookup</h3>
              <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-wider border border-blue-500/20">
                {valuation.indexId.replace(/-/g, ' ')}
              </span>
            </div>
            <p className={DS.TEXT.TINY_CAPS + " opacity-40"}>
              Time Travel Engine v2.0 • <span className="text-foreground/60">Analysis Horizon: 1999–2026</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-card border border-border rounded-xl overflow-hidden group">
            <button
              onClick={() => navigate("prev")}
              disabled={!canGoPrev}
              className="p-2 hover:bg-slate-500/10 disabled:opacity-20 transition-all border-r border-border"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="relative group">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setHistoricalSignal(null);
                  setSelectedSnapshot(null);
                }}
                onClick={(e) => {
                  try {
                    (e.currentTarget as any).showPicker();
                  } catch (err) {}
                }}
                min={minDate}
                max={maxDate}
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-transparent text-foreground focus:outline-none transition-all font-bold cursor-pointer min-w-[120px]"
              />
              <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted/30 pointer-events-none" />
            </div>
            <button
              onClick={() => navigate("next")}
              disabled={!canGoNext}
              className="p-2 hover:bg-slate-500/10 disabled:opacity-20 transition-all border-l border-border"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => handleLookup()}
            disabled={!selectedDate}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 disabled:opacity-30 transition-all shadow-md active:scale-95 flex items-center gap-2 ml-1"
          >
            Go
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={`p-8 ${!historicalSignal ? 'py-20 flex flex-col items-center justify-center text-center opacity-40' : ''}`}>
        {!historicalSignal ? (
          <div className="space-y-4">
            <Activity className="w-12 h-12 text-blue-500 mx-auto animate-pulse" />
            <p className={DS.TEXT.BODY_STRONG}>Select a date to begin your retrospective analysis</p>
            <p className={DS.TEXT.TINY + " max-w-xs mx-auto"}>Compare historical market pulses, valuation percentiles, and technical indicators for any day in our database.</p>
          </div>
        ) : (
          <div className="relative group">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-6 bg-blue-500/40 rounded-full" />
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/50">
                Market Pulse on {new Date(selectedDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <HorizontalPulseBar
              signal={historicalSignal}
              value={selectedSnapshot?.close?.toLocaleString("en-IN")}
              onPrev={() => navigate("prev")}
              onNext={() => navigate("next")}
              canPrev={canGoPrev}
              canNext={canGoNext}
              statsData={{
                high: selectedSnapshot?.high?.toLocaleString("en-IN"),
                low: selectedSnapshot?.low?.toLocaleString("en-IN"),
                open: selectedSnapshot?.open?.toLocaleString("en-IN"),
                close: selectedSnapshot?.close?.toLocaleString("en-IN"),
                pe: selectedSnapshot?.pe?.toFixed(2),
                pb: selectedSnapshot?.pb?.toFixed(2),
                dy: selectedSnapshot?.dividendYield !== undefined ? `${selectedSnapshot.dividendYield.toFixed(2)}%` : "—",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
