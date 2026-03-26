"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts";
import { ValuationSnapshot } from "@/types";

interface ValuationChartProps {
  data: ValuationSnapshot[];
  metric: "pe" | "pb" | "dividendYield";
  median: number;
  title: string;
  color: string;
}

const metricLabels: Record<string, string> = {
  pe: "P/E Ratio",
  pb: "P/B Ratio",
  dividendYield: "Dividend Yield (%)",
};

export default function ValuationChart({ data, metric, median, title, color }: ValuationChartProps) {
  const chartData = data.map((d) => ({
    date: d.date,
    value: d[metric],
    label: new Date(d.date).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    }),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
        {title}
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              interval={Math.floor(chartData.length / 6)}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "13px",
              }}
              formatter={(value) => [Number(value).toFixed(2), metricLabels[metric]]}
              labelFormatter={(label) => label}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${metric})`}
              name={metricLabels[metric]}
            />
            <ReferenceLine
              y={median}
              stroke="#6b7280"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: `Median: ${median.toFixed(2)}`,
                position: "right",
                fill: "#6b7280",
                fontSize: 11,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
