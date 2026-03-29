"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, BellRing, List, Sun, Moon } from "lucide-react";
import { IndexId, IndexValuation, TacticalSignal } from "@/types";
import { getIndexValuation } from "@/data";
import { INDICES } from "@/lib/constants";
import { getInvestmentStrategy } from "@/lib/signals";
import { getTodayVerse } from "@/data/thirukkural";
import { speak } from "@/lib/voice";
import { IndexChips } from "@/components/ui/IndexSelector";
import IndexSelector from "@/components/ui/IndexSelector";
import MetricCard from "@/components/dashboard/MetricCard";
import RadialGauge from "@/components/dashboard/RadialGauge";
import StatsTable from "@/components/dashboard/StatsTable";
import ConstituentsModal from "@/components/dashboard/ConstituentsModal";
import AlertModal from "@/components/dashboard/AlertModal";
import ThirukkuralCard from "@/components/dashboard/ThirukkuralCard";
import DateLookup from "@/components/dashboard/DateLookup";
import VoiceTrigger from "@/components/ui/VoiceTrigger";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import dynamic from "next/dynamic";

const ValuationChart = dynamic(() => import("@/components/charts/ValuationChart"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 dark:bg-gray-900 animate-pulse rounded-xl border border-gray-200 dark:border-gray-800" />
});

export default function Home() {
  const [selectedIndex, setSelectedIndex] = useState<IndexId>("nifty-50");
  const [timeRange, setTimeRange] = useState<"1Y" | "3Y" | "5Y" | "MAX">("5Y");
  const [valuation, setValuation] = useState<IndexValuation | null>(null);
  const [signal, setSignal] = useState<TacticalSignal | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const [isConstituentsModalOpen, setIsConstituentsModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const indexMeta = INDICES.find((i) => i.id === selectedIndex);

  // Dark mode toggle
  useEffect(() => {
    const stored = localStorage.getItem("niftypulse-theme");
    if (stored === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  function toggleDarkMode() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("niftypulse-theme", next ? "dark" : "light");
  }

  // Data loading
  useEffect(() => {
    async function loadData() {
      if (valuation) {
        setIsFetching(true);
      } else {
        setIsInitialLoading(true);
      }

      try {
        const data = await getIndexValuation(selectedIndex);
        setValuation(data);
        if (data) {
          setSignal(getInvestmentStrategy(data));
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsInitialLoading(false);
        setIsFetching(false);
      }
    }
    loadData();
  }, [selectedIndex]);

  // Voice callbacks
  const handleReadThirukkural = useCallback(() => {
    // Map signal to voice context
    const getVoiceContext = () => {
      if (!signal) return "Market wisdom for today. ";
      if (signal.signal === "strong-buy" || signal.signal === "tactical-dip" || signal.signal === "buy") {
        return "Given today's opportunistic signal, Valluvar advises. ";
      }
      if (signal.signal === "overvalued") {
        return "Given today's overvalued signal, Valluvar advises caution. He says. ";
      }
      if (signal.signal === "hold") {
        return "Regarding today's neutral signal, Valluvar advises. ";
      }
      return "Market wisdom for today. ";
    };

    const category = signal ? (
      (signal.signal === "strong-buy" || signal.signal === "tactical-dip" || signal.signal === "buy") ? "BULLISH" :
        (signal.signal === "overvalued") ? "BEARISH" :
          (signal.signal === "hold") ? "NEUTRAL" : "GENERAL"
    ) : undefined;

    const verse = getTodayVerse(category as any);
    speak(`${getVoiceContext()} ${verse.english}`);
  }, [signal]);

  const handleReadSignal = useCallback(() => {
    if (signal && indexMeta) {
      speak(
        `${indexMeta.name} signal is ${signal.label}. Recommended action: ${signal.recommendedAction}. Confidence is ${signal.confidence}.`
      );
    }
  }, [signal, indexMeta]);

  if (isInitialLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!valuation || !indexMeta || !signal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No data available for this index yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-emerald-500" />
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Nifty Pulse</h1>
              <span className="hidden sm:block text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                v2.0
              </span>
            </div>
            <div className="flex items-center gap-2">
              <VoiceTrigger
                onIndexChange={setSelectedIndex}
                onReadThirukkural={handleReadThirukkural}
                onReadSignal={handleReadSignal}
              />
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 transition-opacity duration-300 ${isFetching ? 'opacity-60 cursor-wait' : 'opacity-100'}`}>
        {/* Loading Overlay */}
        {isFetching && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 dark:bg-black/30 backdrop-blur-[1px] pointer-events-none">
            <div className="bg-white/80 dark:bg-gray-900/80 p-4 rounded-2xl shadow-lg border border-blue-100 dark:border-gray-700 flex items-center gap-3">
              <Activity className="h-5 w-5 text-emerald-500 animate-pulse" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Updating...</span>
            </div>
          </div>
        )}

        {/* Top Section: Header + Selector + Actions */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">
                  {indexMeta.name}
                </h2>
                <p className="hidden sm:block text-[10px] font-normal text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                  {indexMeta.description}
                </p>
              </div>
              <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-800 hidden md:block" />
              <div className="flex-1">
                <IndexChips selected={selectedIndex} onChange={setSelectedIndex} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsConstituentsModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:text-blue-700 dark:hover:text-blue-400 rounded-xl text-xs font-semibold transition-all shadow-sm"
              >
                <List className="w-4 h-4" />
                Constituents
              </button>
              <button
                onClick={() => setIsAlertModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:text-blue-700 dark:hover:text-blue-400 rounded-xl text-xs font-semibold transition-all shadow-sm"
              >
                <BellRing className="w-4 h-4" />
                Set Alert
              </button>
            </div>
          </div>
          {/* <IndexSelector selected={selectedIndex} onChange={setSelectedIndex} /> */}
        </div>

        {/* Hero: Radial Gauge + Recommendation Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Radial Gauge */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Tactical Pulse
              </h3>
              <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                {new Date(valuation.lastUpdated).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            
            <RadialGauge 
              signal={signal} 
              size={260} 
              value={valuation.history[valuation.history.length - 1].close?.toLocaleString("en-IN")} 
            />

            <p className="mt-3 text-[10px] text-gray-400 italic text-center">
              Based on P/E percentile, 200-DMA distance, and yield gap analysis
            </p>
          </div>

          {/* Recommendation + Stats */}
          <div className="lg:col-span-7 space-y-4">
            {/* SIP / Lumpsum Recommendation Card */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Investment Recommendation
                </h3>
                <span className="text-xs text-gray-400">
                  Last updated: {new Date(valuation.lastUpdated).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Mode</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{signal.recommendedMode}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Allocation</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{signal.allocationPercentage}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Yield Gap</p>
                  <p className={`text-sm font-bold ${signal.yieldGap > 0 ? "text-green-600" : "text-red-500"}`}>
                    {signal.yieldGap > 0 ? "+" : ""}{signal.yieldGap}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Confidence</p>
                  <p className={`text-sm font-bold ${signal.confidence === "High" ? "text-green-600" :
                    signal.confidence === "Medium" ? "text-yellow-600" : "text-red-500"
                    }`}>
                    {signal.confidence}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  200-DMA Distance: <span className="font-bold text-gray-700 dark:text-gray-300">{signal.dmaDistance}%</span>
                  {signal.dmaDistance < -10 && (
                    <span className="ml-2 text-green-600 font-semibold">Tactical Dip Zone</span>
                  )}
                </p>
              </div>
            </div>

            {/* Date Lookup */}
            <DateLookup valuation={valuation} />
          </div>
        </div>

        {/* Thirukkural — Market Wisdom */}
        <ThirukkuralCard signal={signal.signal} />

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard title="P/E Ratio" stats={valuation.pe} unit="x" />
          <MetricCard title="P/B Ratio" stats={valuation.pb} unit="x" />
          <MetricCard
            title="Dividend Yield"
            stats={valuation.dividendYield}
            unit="%"
            invertedSignal
          />
        </div>

        {/* Charts Section Header */}
        <div className="pt-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2 mb-2">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            Historical Trends
          </h2>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 shadow-inner">
            {(["1Y", "3Y", "5Y", "MAX"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${timeRange === range
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Major Charts */}
        <div className="space-y-4">
          <ValuationChart
            data={valuation.history}
            metric="pe"
            median={valuation.pe.median}
            title="P/E Ratio - Historical Trend"
            color="#3b82f6"
            timeRange={timeRange}
          />
          <ValuationChart
            data={valuation.history}
            metric="pb"
            median={valuation.pb.median}
            title="P/B Ratio - Historical Trend"
            color="#8b5cf6"
            timeRange={timeRange}
          />
        </div>

        {/* Bottom: DY Chart + Summary Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-5">
            <ValuationChart
              data={valuation.history}
              metric="dividendYield"
              median={valuation.dividendYield.median}
              title="Div. Yield"
              color="#10b981"
              timeRange={timeRange}
              height="h-52"
            />
          </div>
          <div className="lg:col-span-7">
            <StatsTable valuation={valuation} />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100 dark:border-gray-800">
          <p>
            Nifty Pulse v2.0 — Tactical Investment Command Center. For informational purposes only. Not financial advice.
          </p>
        </footer>

        {/* Modals */}
        <ConstituentsModal
          isOpen={isConstituentsModalOpen}
          onClose={() => setIsConstituentsModalOpen(false)}
          indexId={selectedIndex}
        />
        <AlertModal
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          indexId={selectedIndex}
        />
      </main>
    </div>
  );
}
