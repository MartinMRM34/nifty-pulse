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
      description: "Price-to-Earnings: measures how much investors pay per rupee of earnings",
    },
    {
      name: "P/B Ratio",
      stats: valuation.pb,
      inverted: false,
      description: "Price-to-Book: compares market price to book value of assets",
    },
    {
      name: "Dividend Yield",
      stats: valuation.dividendYield,
      inverted: true,
      description: "Annual dividends as percentage of market price",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm h-full">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
        Valuation Summary
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-2 text-gray-500 font-medium">Metric</th>
              <th className="text-right py-3 px-2 text-gray-500 font-medium">Current</th>
              <th className="text-right py-3 px-2 text-gray-500 font-medium">Median</th>
              <th className="text-right py-3 px-2 text-gray-500 font-medium">Min</th>
              <th className="text-right py-3 px-2 text-gray-500 font-medium">Max</th>
              <th className="text-right py-3 px-2 text-gray-500 font-medium">Percentile</th>
              <th className="text-center py-3 px-2 text-gray-500 font-medium">Zone</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => {
              const zone = getZone(m.inverted ? 100 - m.stats.percentile : m.stats.percentile);
              return (
                <tr key={m.name} className="border-b border-gray-50 hover:bg-gray-50" title={m.description}>
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
    </div>
  );
}
