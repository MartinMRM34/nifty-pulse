"use client";

import { useState } from "react";
import { Calendar, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { IndexValuation, TacticalSignal, ValuationSnapshot } from "@/types";
import { getInvestmentStrategy } from "@/lib/signals";
import { DS } from "@/lib/design-system";
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
    <div className={`${DS.CARD.BASE} ${DS.CARD.P5} ${DS.CARD.INTERACTIVE}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left group"
      >
        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 transition-colors">
          <Calendar className={DS.ICON.SM} />
        </div>
        <h3 className={`${DS.TEXT.MUTED_CAPS} flex-1`}>
          Historical Lookup
        </h3>
        <span className={`${DS.TEXT.MUTED_CAPS} text-blue-500 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20`}>
          {isOpen ? "Close" : "Time Travel"}
        </span>
      </button>

      {isOpen && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-3">
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
              className="flex-1 px-4 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
            />
            <button
              onClick={() => handleLookup()}
              disabled={!selectedDate}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-blue-700 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-blue-500/20"
            >
              Go
              <ArrowRight className={DS.ICON.SM} />
            </button>
          </div>

          {historicalSignal && (
            <div className="pt-6 border-t border-border">
              <p className={`${DS.TEXT.MUTED_CAPS} mb-6 text-center opacity-60 text-muted`}>
                Market Pulse on {new Date(selectedDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("prev")}
                  disabled={!canGoPrev}
                  className="p-2 border border-border rounded-full hover:bg-background disabled:opacity-20 transition-all shrink-0"
                  title="Previous Day"
                >
                  <ChevronLeft className={DS.ICON.MD} />
                </button>

                <div className="flex-1 flex justify-center min-w-0">
                  <RadialGauge
                    signal={historicalSignal}
                    size={150}
                    statsData={{
                      high: selectedSnapshot?.high?.toLocaleString("en-IN"),
                      low: selectedSnapshot?.low?.toLocaleString("en-IN"),
                      close: selectedSnapshot?.close?.toLocaleString("en-IN"),
                      open: selectedSnapshot?.open?.toLocaleString("en-IN") || undefined,
                    }}
                  />
                </div>

                <button
                  onClick={() => navigate("next")}
                  disabled={!canGoNext}
                  className="p-2 border border-border rounded-full hover:bg-background disabled:opacity-20 transition-all shrink-0"
                  title="Next Day"
                >
                  <ChevronRight className={DS.ICON.MD} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
