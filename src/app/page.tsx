"use client";

import { useState } from "react";
import { Activity, BellRing, List } from "lucide-react";
import { IndexId } from "@/types";
import { getIndexValuation } from "@/data";
import { INDICES } from "@/lib/constants";
import IndexSelector from "@/components/ui/IndexSelector";
import MetricCard from "@/components/dashboard/MetricCard";
import OverallSignal from "@/components/dashboard/OverallSignal";
import StatsTable from "@/components/dashboard/StatsTable";
import ValuationChart from "@/components/charts/ValuationChart";
import ConstituentsModal from "@/components/dashboard/ConstituentsModal";
import AlertModal from "@/components/dashboard/AlertModal";

export default function Home() {
  const [selectedIndex, setSelectedIndex] = useState<IndexId>("nifty-50");
  const [isConstituentsModalOpen, setIsConstituentsModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const valuation = getIndexValuation(selectedIndex);
  const indexMeta = INDICES.find((i) => i.id === selectedIndex);

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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Nifty Pulse</h1>
            </div>
            <span className="text-xs text-gray-400">
              Market Valuation Dashboard
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
            
            <div className="flex items-center gap-3">
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ValuationChart
            data={valuation.history}
            metric="pe"
            median={valuation.pe.median}
            title="P/E Ratio - Historical Trend"
            color="#3b82f6"
          />
          <ValuationChart
            data={valuation.history}
            metric="pb"
            median={valuation.pb.median}
            title="P/B Ratio - Historical Trend"
            color="#8b5cf6"
          />
        </div>
        <ValuationChart
          data={valuation.history}
          metric="dividendYield"
          median={valuation.dividendYield.median}
          title="Dividend Yield (%) - Historical Trend"
          color="#10b981"
        />

        {/* Summary Table */}
        <StatsTable valuation={valuation} />

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
