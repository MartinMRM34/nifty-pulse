"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, BellRing, List, Sun, Moon, SunMoon } from "lucide-react";
import { IndexId, IndexValuation, TacticalSignal } from "@/types";
import { getIndexValuation } from "@/data";
import { INDICES } from "@/lib/constants";
import { getInvestmentStrategy } from "@/lib/signals";
import { getTodayVerse } from "@/data/thirukkural";
import { speak } from "@/lib/voice";
import { IndexChips } from "@/components/ui/IndexSelector";
import { DS } from "@/lib/design-system";
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
  const [timeRange, setTimeRange] = useState<"1Y" | "3Y" | "5Y" | "MAX">("3Y");
  const [valuation, setValuation] = useState<IndexValuation | null>(null);
  const [signal, setSignal] = useState<TacticalSignal | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "auto">("auto");
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">("light");

  const [isConstituentsModalOpen, setIsConstituentsModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const indexMeta = INDICES.find((i) => i.id === selectedIndex);

  // Dark mode logic
  const isNightTime = useCallback(() => {
    const hour = new Date().getHours();
    const minutes = new Date().getMinutes();
    const currentTime = hour + minutes / 60;
    // Night is 6:30 PM to 6:30 AM local time
    return currentTime >= 18.5 || currentTime < 6.5;
  }, []);

  const updateEffectiveTheme = useCallback(() => {
    const stored = localStorage.getItem("niftypulse-theme-mode") as any;
    const mode = stored || "auto";
    setThemeMode(mode);

    let effective: "light" | "dark" = "light";
    if (mode === "auto") {
      effective = isNightTime() ? "dark" : "light";
    } else {
      effective = mode;
    }

    setEffectiveTheme(effective);
    document.documentElement.classList.toggle("dark", effective === "dark");
  }, [isNightTime]);

  useEffect(() => {
    updateEffectiveTheme();

    // Re-check every minute for auto-switching
    const timer = setInterval(updateEffectiveTheme, 60000);
    return () => clearInterval(timer);
  }, [updateEffectiveTheme]);

  function cycleThemeMode() {
    const modes: ("light" | "dark" | "auto")[] = ["auto", "light", "dark"];
    const nextIdx = (modes.indexOf(themeMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];

    setThemeMode(nextMode);
    localStorage.setItem("niftypulse-theme-mode", nextMode);

    let effective: "light" | "dark" = "light";
    if (nextMode === "auto") {
      effective = isNightTime() ? "dark" : "light";
    } else {
      effective = nextMode;
    }
    setEffectiveTheme(effective);
    document.documentElement.classList.toggle("dark", effective === "dark");
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
    <div className={`min-h-screen bg-[var(--background)] ${DS.ANIM.TRANSITION}`}>
      {/* Header */}
      <header className={DS.LAYOUT.HEADER}>
        <div className={DS.LAYOUT.PAGE}>
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Activity className={`${DS.ICON.MD} text-emerald-500`} />
              <h1 className={DS.TEXT.H1}>Nifty Pulse</h1>
              <span className={`hidden sm:block ${DS.TEXT.MUTED_CAPS} opacity-40`}>
                v3.0 SSOT
              </span>
            </div>
            <div className="flex items-center gap-3">
              <VoiceTrigger
                onIndexChange={setSelectedIndex}
                onReadThirukkural={handleReadThirukkural}
                onReadSignal={handleReadSignal}
              />
              <div className="flex items-center bg-background border border-border rounded-full p-1 shadow-sm">
                <button
                  onClick={cycleThemeMode}
                  className={`p-1.5 rounded-full ${DS.ANIM.TRANSITION} group relative ${
                    themeMode === "auto" ? "text-blue-500" : "text-muted hover:text-foreground"
                  }`}
                  title={`Mode: ${themeMode.toUpperCase()} (Click to cycle)`}
                >
                  <div className="relative">
                    {themeMode === "auto" ? (
                      <SunMoon className={DS.ICON.SM} />
                    ) : themeMode === "dark" ? (
                      <Moon className={DS.ICON.SM} />
                    ) : (
                      <Sun className={DS.ICON.SM} />
                    )}
                    {themeMode === "auto" && (
                      <div className="absolute -top-1.5 -right-1.5 flex h-3 w-3 items-center justify-center">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-20`}></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600 text-[6px] font-black text-white items-center justify-center border border-white/20">A</span>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className={`${DS.LAYOUT.MAIN} ${isFetching ? 'opacity-60 cursor-wait' : 'opacity-100'}`}>
        {/* Loading Overlay */}
        {isFetching && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/30 backdrop-blur-[1px] pointer-events-none">
            <div className={`${DS.CARD.BASE} p-4 flex items-center gap-3 shadow-lg border-blue-100 dark:border-border`}>
              <Activity className={`${DS.ICON.MD} text-emerald-500 ${DS.ANIM.PULSE}`} />
              <span className={`${DS.TEXT.BODY_STRONG}`}>Updating...</span>
            </div>
          </div>
        )}

        {/* Top Section: Header + Selector + Actions */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
              <div>
                <h2 className={DS.TEXT.H1 + " whitespace-nowrap"}>
                  {indexMeta.name}
                </h2>
                <p className={`hidden sm:block ${DS.TEXT.MUTED_CAPS_TIGHT} max-w-[200px] truncate`}>
                  {indexMeta.description}
                </p>
              </div>
              <div className="h-6 w-[1px] bg-border hidden md:block" />
              <div className="flex-1">
                <IndexChips selected={selectedIndex} onChange={setSelectedIndex} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsConstituentsModalOpen(true)}
                className={DS.BUTTON.SECONDARY}
              >
                <List className={`${DS.ICON.SM} text-muted group-hover:text-blue-500`} />
                Constituents
              </button>
              <button
                onClick={() => setIsAlertModalOpen(true)}
                className={DS.BUTTON.SECONDARY}
              >
                <BellRing className={`${DS.ICON.SM} text-muted group-hover:text-blue-500`} />
                Set Alert
              </button>
            </div>
          </div>
        </div>

        {/* Hero: Radial Gauge + Recommendation Card */}
        <div className={DS.LAYOUT.GRID_HERO}>
          {/* Radial Gauge */}
          <div className={`${DS.CARD.BASE} ${DS.CARD.P6} ${DS.CARD.INTERACTIVE} flex flex-col items-center justify-center lg:col-span-5`}>
            <div className="w-full flex items-center justify-between mb-2">
              <h3 className={DS.TEXT.LABEL}>
                Tactical Pulse
              </h3>
              <span className={DS.TEXT.MUTED_CAPS_TIGHT}>
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

            <p className={`mt-3 ${DS.TEXT.TINY} italic text-center opacity-60`}>
              Based on P/E percentile, 200-DMA distance, and yield gap analysis
            </p>
          </div>

          {/* Recommendation + Stats */}
          <div className="lg:col-span-7 space-y-4">
            {/* SIP / Lumpsum Recommendation Card */}
            <div className={`${DS.CARD.BASE} ${DS.CARD.P5} ${DS.CARD.INTERACTIVE}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={DS.TEXT.LABEL}>
                  Investment Recommendation
                </h3>
                <span className={DS.TEXT.MUTED_CAPS_TIGHT}>
                  Last updated: {new Date(valuation.lastUpdated).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className={`${DS.TEXT.MUTED_CAPS_TIGHT} mb-1 opacity-70`}>Mode</p>
                  <p className={DS.TEXT.BODY_STRONG}>{signal.recommendedMode}</p>
                </div>
                <div>
                  <p className={`${DS.TEXT.MUTED_CAPS_TIGHT} mb-1 opacity-70`}>Allocation</p>
                  <p className={DS.TEXT.BODY_STRONG}>{signal.allocationPercentage}%</p>
                </div>
                <div>
                  <p className={`${DS.TEXT.MUTED_CAPS_TIGHT} mb-1 opacity-70`}>Yield Gap</p>
                  <p className={`${DS.TEXT.BODY_STRONG} ${signal.yieldGap > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {signal.yieldGap > 0 ? "+" : ""}{signal.yieldGap}%
                  </p>
                </div>
                <div>
                  <p className={`${DS.TEXT.MUTED_CAPS_TIGHT} mb-1 opacity-70`}>Confidence</p>
                  <p className={`${DS.TEXT.BODY_STRONG} ${signal.confidence === "High" ? "text-emerald-500" :
                    signal.confidence === "Medium" ? "text-amber-500" : "text-rose-500"
                    }`}>
                    {signal.confidence}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <p className={`${DS.TEXT.BODY} text-muted`}>
                  200-DMA Distance: <span className={DS.TEXT.BODY_STRONG}>{signal.dmaDistance}%</span>
                  {signal.dmaDistance < -10 && (
                    <span className="ml-2 text-emerald-500 font-bold">Tactical Dip Zone</span>
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
        <div className={DS.LAYOUT.GRID_DASHBOARD}>
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
        <div className="pt-4 flex items-center justify-between border-b border-border pb-2 mb-2">
          <h2 className={`${DS.TEXT.H1} flex items-center gap-2`}>
            Historical Trends
          </h2>
          <div className="flex bg-background border border-border rounded-xl p-1 shadow-inner">
            {(["1Y", "3Y", "5Y", "MAX"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg ${DS.ANIM.TRANSITION} ${timeRange === range
                  ? "bg-card text-blue-500 shadow-sm border border-border"
                  : "text-muted hover:text-foreground"
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
        <div className={DS.LAYOUT.GRID_STATS}>
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
        <footer className="text-center py-8 border-t border-border opacity-50">
          <p className={`${DS.TEXT.MUTED_CAPS_TIGHT}`}>
            Nifty Pulse v3.0 SSOT — Tactical Investment Command Center. For informational purposes only. Not financial advice.
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
