"use client";

import { IndexValuation } from "@/types";
import { getZone } from "@/lib/constants";

interface StatsTableProps {
  valuation: IndexValuation;
}

export default function StatsTable({ valuation }: StatsTableProps) {
  const metrics = [
    {
      name: "P/E Ratio",
      stats: valuation.pe,
      inverted: false,
    },
    {
      name: "P/B Ratio",
      stats: valuation.pb,
      inverted: false,
    },
    {
      name: "Div. Yield",
      stats: valuation.dividendYield,
      inverted: true,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm h-full">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
        Valuation Summary
      </h3>

      {/* Desktop table — hidden on mobile */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-2 text-gray-500 font-medium">Metric</th>
              <th className="text-right py-3 px-2 text-gray-500 font-medium">Current</th>
              <th className="text-right py-3 px-2 text-gray-500 font-medium">Median</th>
              <th className="text-right py-3 px-2 text-gray-500 font-medium">Min</th>
              <th className="text-right py-3 px-2 text-gray-500 font-medium">Max</th>
              <th className="text-right py-3 px-2 text-gray-500 font-medium">Pct.</th>
              <th className="text-center py-3 px-2 text-gray-500 font-medium">Zone</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => {
              const zone = getZone(m.inverted ? 100 - m.stats.percentile : m.stats.percentile);
              return (
                <tr key={m.name} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-gray-700">{m.name}</td>
                  <td className="py-3 px-2 text-right font-semibold text-gray-900">
                    {m.stats.current.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-600">{m.stats.median.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right text-gray-600">{m.stats.min.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right text-gray-600">{m.stats.max.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right text-gray-600">{m.stats.percentile}th</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${zone.bgColor} ${zone.textColor}`}>
                      {zone.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout — visible only on small screens */}
      <div className="sm:hidden space-y-3">
        {metrics.map((m) => {
          const zone = getZone(m.inverted ? 100 - m.stats.percentile : m.stats.percentile);
          return (
            <div key={m.name} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-800">{m.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${zone.bgColor} ${zone.textColor}`}>
                  {zone.label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-xs text-gray-500">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{m.stats.current.toFixed(2)}</div>
                  <div>Current</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">{m.stats.median.toFixed(2)}</div>
                  <div>Median</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">{m.stats.min.toFixed(2)}</div>
                  <div>Min</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">{m.stats.max.toFixed(2)}</div>
                  <div>Max</div>
                </div>
              </div>
              {/* Percentile bar */}
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Percentile</span>
                  <span className="font-medium text-gray-600">{m.stats.percentile}th</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${m.stats.percentile}%`,
                      backgroundColor: zone.color ?? "#6b7280",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
