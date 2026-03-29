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
} from "recharts";
import { ValuationSnapshot } from "@/types";
import { useMemo } from "react";
import { DS } from "@/lib/design-system";

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
    <div className={`${DS.CARD.BASE} ${DS.CARD.P6} ${DS.CARD.INTERACTIVE} flex flex-col h-full`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className={DS.TEXT.MUTED_CAPS}>
            {title}
          </h3>
          <p className={`${DS.TEXT.MUTED_CAPS_TIGHT} opacity-30 mt-0.5 whitespace-nowrap`}>Rolling {timeRange} Analysis</p>
        </div>
        {week52 && (
          <div className={`flex gap-4 ${DS.TEXT.TINY_CAPS} font-black`}>
            <span className="flex flex-col items-end">
              <span className="opacity-40 mb-0.5">52W High</span>
              <span className="text-rose-500">{week52.high.toFixed(2)}</span>
            </span>
            <span className="flex flex-col items-end">
              <span className="opacity-40 mb-0.5">52W Low</span>
              <span className="text-emerald-500">{week52.low.toFixed(2)}</span>
            </span>
          </div>
        )}
      </div>
      <div className={height}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -25 }}>
            <defs>
              <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="currentColor" className="text-border/40" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fontWeight: 700, fill: "currentColor" }}
              className="text-muted/50"
              axisLine={false}
              tickLine={false}
              interval={Math.floor(chartData.length / 6)}
              tickFormatter={(val) =>
                new Date(val).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
              }
            />
            <YAxis
              tick={{ fontSize: 9, fontWeight: 700, fill: "currentColor" }}
              className="text-muted/50"
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-card)",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                padding: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                fontSize: "12px",
                fontWeight: "bold",
              }}
              itemStyle={{ color: color }}
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4" }}
              formatter={(value) => [Number(value).toFixed(2), metricLabels[metric]]}
              labelFormatter={(_, payload) => {
                if (payload && payload.length > 0) {
                  return <span className={`${DS.TEXT.MUTED_CAPS} opacity-100`}>{payload[0].payload.fullDate}</span>;
                }
                return "";
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fill={`url(#gradient-${metric})`}
              name={metricLabels[metric]}
              animationDuration={1500}
            />
            {/* Median reference line */}
            <ReferenceLine
              y={median}
              stroke="currentColor"
              className="text-muted/60"
              strokeDasharray="6 4"
              strokeWidth={1}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
