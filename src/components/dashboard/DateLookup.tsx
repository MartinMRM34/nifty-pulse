"use client";

import { useState } from "react";
import { Calendar, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { IndexValuation, TacticalSignal, ValuationSnapshot } from "@/types";
import { getInvestmentStrategy } from "@/lib/signals";
import RadialGauge from "./RadialGauge";

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
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left"
      >
        <Calendar className="w-4 h-4 text-blue-600" />
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex-1">
          Date-Wise Lookup
        </h3>
        <span className="text-xs text-blue-600 font-medium">
          {isOpen ? "Close" : "Time Travel"}
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setHistoricalSignal(null);
                setSelectedSnapshot(null);
              }}
              min={minDate}
              max={maxDate}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleLookup()}
              disabled={!selectedDate}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Look Up
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {historicalSignal && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 mb-3 text-center">
                Signal on {new Date(selectedDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              
              <div className="flex items-center justify-between gap-1 overflow-hidden">
                <button
                  onClick={() => navigate("prev")}
                  disabled={!canGoPrev}
                  className="p-1.5 border border-gray-100 dark:border-gray-800 rounded-full hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-30 transition-all group flex flex-col items-center gap-1 shrink-0"
                  title="See previous market day"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-[10px] whitespace-nowrap hidden md:block text-gray-400 group-hover:text-gray-600 px-1">Prev Day</span>
                </button>

                {/* Left side stats: High / Low */}
                <div className="flex flex-col gap-3 text-right min-w-[60px] shrink-0">
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-gray-400 uppercase tracking-tighter">Day High</p>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedSnapshot?.high?.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-gray-400 uppercase tracking-tighter">Day Low</p>
                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      {selectedSnapshot?.low?.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex justify-center">
                  <RadialGauge 
                    signal={historicalSignal} 
                    size={180} 
                  />
                </div>

                {/* Right side stats: Close / Open */}
                <div className="flex flex-col gap-3 text-left min-w-[70px] shrink-0">
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-gray-400 uppercase tracking-tighter">Index Close</p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {selectedSnapshot?.close?.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-gray-400 uppercase tracking-tighter">Day Open</p>
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400">
                      {selectedSnapshot?.open?.toLocaleString("en-IN") || "-"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("next")}
                  disabled={!canGoNext}
                  className="p-1.5 border border-gray-100 dark:border-gray-800 rounded-full hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-30 transition-all group flex flex-col items-center gap-1 shrink-0"
                  title="See next market day"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-[10px] whitespace-nowrap hidden md:block text-gray-400 group-hover:text-gray-600 px-1">Next Day</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
