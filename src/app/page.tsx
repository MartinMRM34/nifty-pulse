"use client";

import { useState, useEffect } from "react";
import { Activity, BellRing, List } from "lucide-react";
import { IndexId, IndexValuation } from "@/types";
import { getIndexValuation } from "@/data";
import { INDICES } from "@/lib/constants";
import IndexSelector from "@/components/ui/IndexSelector";
import MetricCard from "@/components/dashboard/MetricCard";
import OverallSignal from "@/components/dashboard/OverallSignal";
import StatsTable from "@/components/dashboard/StatsTable";
import ConstituentsModal from "@/components/dashboard/ConstituentsModal";
import AlertModal from "@/components/dashboard/AlertModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import dynamic from "next/dynamic";

const ValuationChart = dynamic(() => import("@/components/charts/ValuationChart"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-xl border border-gray-200" />
});

export default function Home() {
  const [selectedIndex, setSelectedIndex] = useState<IndexId>("nifty-50");
  const [timeRange, setTimeRange] = useState<"1Y" | "3Y" | "5Y" | "MAX">("5Y");
  const [valuation, setValuation] = useState<IndexValuation | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const [isConstituentsModalOpen, setIsConstituentsModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const indexMeta = INDICES.find((i) => i.id === selectedIndex);

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
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsInitialLoading(false);
        setIsFetching(false);
      }
    }
    loadData();
  }, [selectedIndex]);

  if (isInitialLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!valuation || !indexMeta) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No data available for this index yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Nifty Pulse</h1>
            </div>
            <span className="hidden sm:block text-xs text-gray-400">
              Market Valuation Dashboard
            </span>
          </div>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 transition-opacity duration-300 ${isFetching ? 'opacity-60 cursor-wait' : 'opacity-100'}`}>
        {/* Loading Overlay (Optional) */}
        {isFetching && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-[1px] pointer-events-none">
            <div className="bg-white/80 p-4 rounded-2xl shadow-lg border border-blue-100 flex items-center gap-3">
              <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
              <span className="text-sm font-bold text-gray-700">Updating...</span>
            </div>
          </div>
        )}
        {/* Index Selector and Actions */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                {indexMeta.name}
              </h2>
              <p className="text-sm font-normal text-gray-500">
                {indexMeta.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsConstituentsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-700 rounded-xl text-sm font-semibold transition-all shadow-sm"
              >
                <List className="w-4 h-4" />
                Constituents
              </button>
              <button
                onClick={() => setIsAlertModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-700 rounded-xl text-sm font-semibold transition-all shadow-sm"
              >
                <BellRing className="w-4 h-4" />
                Set Alert
              </button>
            </div>
          </div>
          <IndexSelector selected={selectedIndex} onChange={setSelectedIndex} />
        </div>

        {/* Overall Signal */}
        <OverallSignal valuation={valuation} />

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
        <div className="pt-4 flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Historical Trends
          </h2>
          <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
            {(["1Y", "3Y", "5Y", "MAX"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${timeRange === range
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:bg-gray-200"
                  }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Major Charts (Full Width) */}
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

        {/* Bottom Section: Dividend Yield and Summary Table */}
        {/* EXPERIMENT HERE: Change the lg:col-span values (total must be 12) to adjust widths */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-5">
            <ValuationChart
              data={valuation.history}
              metric="dividendYield"
              median={valuation.dividendYield.median}
              title="Div. Yield"
              color="#10b981"
              timeRange={timeRange}
              height="h-52" /* Adjust this height to match the table */
            />
          </div>
          <div className="lg:col-span-7">
            <StatsTable valuation={valuation} />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
          <p>
            Nifty Pulse is for informational purposes only. Not financial advice.
            Data may be delayed or approximate.
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
