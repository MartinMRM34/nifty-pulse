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
import { useState, useMemo } from "react";

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

  const chartData = filteredData.map((d) => ({
    date: d.date,
    value: d[metric],
    label: new Date(d.date).toLocaleDateString("en-IN", {
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
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          {title}
        </h3>
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
            <ReferenceLine
              y={median}
              stroke="#6b7280"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: `Mdn: ${median.toFixed(2)}`,
                position: "top",
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
