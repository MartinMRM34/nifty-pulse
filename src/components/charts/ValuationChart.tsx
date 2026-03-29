"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts";
import { ValuationSnapshot } from "@/types";
import { useMemo } from "react";

interface ValuationChartProps {
  data: ValuationSnapshot[];
  metric: "pe" | "pb" | "dividendYield";
  median: number;
  title: string;
  color: string;
  timeRange: "1Y" | "3Y" | "5Y" | "MAX";
  height?: string;
}

const metricLabels: Record<string, string> = {
  pe: "P/E Ratio",
  pb: "P/B Ratio",
  dividendYield: "Dividend Yield (%)",
};

interface Week52Data {
  high: number;
  highDate: string;
  low: number;
  lowDate: string;
}

function compute52WeekHighLow(data: ValuationSnapshot[], metric: "pe" | "pb" | "dividendYield"): Week52Data | null {
  if (data.length === 0) return null;

  const latestDate = new Date(data[data.length - 1].date);
  const oneYearAgo = new Date(latestDate);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const recentData = data.filter((d) => new Date(d.date) >= oneYearAgo);
  if (recentData.length === 0) return null;

  let high = -Infinity, low = Infinity;
  let highDate = "", lowDate = "";

  for (const d of recentData) {
    const val = d[metric];
    if (val > high) { high = val; highDate = d.date; }
    if (val < low) { low = val; lowDate = d.date; }
  }

  return { high, highDate, low, lowDate };
}

export default function ValuationChart({
  data,
  metric,
  median,
  title,
  color,
  timeRange,
  height = "h-64"
}: ValuationChartProps) {
  const filteredData = useMemo(() => {
    if (!data.length) return [];
    if (timeRange === "MAX") return data;

    const latestTimestamp = new Date(data[data.length - 1].date).getTime();
    const oneYearMs = 365.25 * 24 * 60 * 60 * 1000;

    let multiplier = 1;
    if (timeRange === "3Y") multiplier = 3;
    if (timeRange === "5Y") multiplier = 5;

    const cutoffVal = latestTimestamp - multiplier * oneYearMs;
    return data.filter((d) => new Date(d.date).getTime() >= cutoffVal);
  }, [data, timeRange]);

  const week52 = useMemo(() => compute52WeekHighLow(data, metric), [data, metric]);

  const chartData = filteredData.map((d) => ({
    date: d.date,
    value: d[metric],
    tickLabel: new Date(d.date).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    }),
    fullDate: new Date(d.date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  }));

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {title}
        </h3>
        {week52 && (
          <div className="flex gap-3 text-[10px] text-gray-400">
            <span>52W H: <span className="font-bold text-red-500">{week52.high.toFixed(2)}</span></span>
            <span>52W L: <span className="font-bold text-green-500">{week52.low.toFixed(2)}</span></span>
          </div>
        )}
      </div>
      <div className={height}>
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
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              interval={Math.floor(chartData.length / 6)}
              tickFormatter={(val) =>
                new Date(val).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
              }
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
              labelFormatter={(_, payload) => {
                if (payload && payload.length > 0) {
                  return payload[0].payload.fullDate;
                }
                return "";
              }}
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
            {/* Median reference line */}
            <ReferenceLine
              y={median}
              stroke="#6b7280"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: `Median: ${median.toFixed(2)}`,
                position: "insideBottomRight",
                fill: "#6b7280",
                fontSize: 11,
              }}
            />
            {/* 52-Week High */}
            {week52 && (
              <ReferenceLine
                y={week52.high}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: `52W High: ${week52.high.toFixed(2)}`,
                  position: "insideBottomRight",
                  fill: "#ef4444",
                  fontSize: 10,
                }}
              />
            )}
            {/* 52-Week Low */}
            {week52 && (
              <ReferenceLine
                y={week52.low}
                stroke="#16a34a"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: `52W Low: ${week52.low.toFixed(2)}`,
                  position: "insideBottomRight",
                  fill: "#16a34a",
                  fontSize: 10,
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
