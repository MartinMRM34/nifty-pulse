"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { ValuationSnapshot } from "@/types";
import { useMemo, useState, useEffect } from "react";
import { DS } from "@/lib/design-system";
import { Maximize2, X } from "lucide-react";

interface ValuationChartProps {
  data: ValuationSnapshot[];
  metric: "pe" | "pb" | "dividendYield" | "close";
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
  close: "Price",
};

interface Week52Data {
  high: number;
  highDate: string;
  low: number;
  lowDate: string;
}

function compute52WeekHighLow(data: ValuationSnapshot[], metric: "pe" | "pb" | "dividendYield" | "close"): Week52Data | null {
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
    if (val !== undefined && val !== null) {
      if (val > high) { high = val; highDate = d.date; }
      if (val < low) { low = val; lowDate = d.date; }
    }
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
  
  // -- Expand & Isolation State --
  const [isExpanded, setIsExpanded] = useState(false);
  const [localTimeRange, setLocalTimeRange] = useState<"1Y" | "3Y" | "5Y" | "MAX" | "CUSTOM">(timeRange);
  const [customStartMonth, setCustomStartMonth] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [customEndMonth, setCustomEndMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Keep local mode synced if timeRange updates while collapsed
  useEffect(() => {
    if (!isExpanded && localTimeRange !== "CUSTOM") {
      setLocalTimeRange(timeRange);
    }
  }, [timeRange, isExpanded, localTimeRange]);

  // -- Filtering Engine --
  const getFilteredData = (dataArray: ValuationSnapshot[], range: "1Y" | "3Y" | "5Y" | "MAX" | "CUSTOM", startMonth: string, endMonth: string) => {
    if (!dataArray.length) return [];
    
    if (range === "CUSTOM") {
      const startMs = new Date(`${startMonth}-01T00:00:00Z`).getTime();
      const [ey, em] = endMonth.split('-');
      // Resolve the last specific day of the End Month
      const endMs = new Date(Number(ey), Number(em), 0, 23, 59, 59).getTime();
      return dataArray.filter((d) => {
        const t = new Date(d.date).getTime();
        return t >= startMs && t <= endMs;
      });
    }

    if (range === "MAX") return dataArray;

    const latestTimestamp = new Date(dataArray[dataArray.length - 1].date).getTime();
    const oneYearMs = 365.25 * 24 * 60 * 60 * 1000;
    let multiplier = 1;
    if (range === "3Y") multiplier = 3;
    if (range === "5Y") multiplier = 5;

    const cutoffVal = latestTimestamp - multiplier * oneYearMs;
    return dataArray.filter((d) => new Date(d.date).getTime() >= cutoffVal);
  };

  const filteredDataInline = useMemo(() => getFilteredData(data, timeRange, "", ""), [data, timeRange]);
  const filteredDataExpanded = useMemo(() => getFilteredData(data, localTimeRange, customStartMonth, customEndMonth), [data, localTimeRange, customStartMonth, customEndMonth]);

  // -- Data Mapping --
  const mapChartData = (fData: ValuationSnapshot[]) => fData.map((d) => ({
    date: d.date,
    value: d[metric],
    price: d.close,
    tickLabel: new Date(d.date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
    fullDate: new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
  }));

  const inlineChartData = useMemo(() => mapChartData(filteredDataInline), [filteredDataInline]);
  const expandedChartData = useMemo(() => mapChartData(filteredDataExpanded), [filteredDataExpanded]);

  const week52Metric = useMemo(() => compute52WeekHighLow(data, metric), [data, metric]);
  const week52Price = useMemo(() => compute52WeekHighLow(data, "close"), [data]);

  // -- Interactive Drag Tool --
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);

  const measurementData = useMemo(() => {
    if (!refAreaLeft || !refAreaRight) return null;
    const labels = [refAreaLeft, refAreaRight].sort();
    const start = labels[0];
    const end = labels[1];
    const startData = data.find(d => d.date === start);
    const endData = data.find(d => d.date === end);
    if (!startData?.close || !endData?.close) return null;
    const diff = endData.close - startData.close;
    const percent = (diff / startData.close) * 100;
    return { diff, percent };
  }, [refAreaLeft, refAreaRight, data]);

  // -- Abstracted Chart Render Element --
  const renderChart = (cData: any[]) => (
    <div className={`h-full w-full relative`}>
      {measurementData && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in duration-200">
          <div className={`px-4 py-2 rounded-full border shadow-2xl backdrop-blur-md flex items-center gap-2 font-black text-xs ${
            measurementData.diff >= 0 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
              : "bg-rose-500/10 border-rose-500/30 text-rose-500"
          }`}>
            <span className="opacity-80">
              {measurementData.diff >= 0 ? "↑" : "↓"}
            </span>
            <span>{Math.abs(measurementData.diff).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
            <span className="opacity-40 font-medium">( {measurementData.percent >= 0 ? "+" : ""}{measurementData.percent.toFixed(2)}% )</span>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%" className="focus:outline-none outline-none">
        <ComposedChart 
          data={cData} 
          className="focus:outline-none outline-none select-none"
          style={{ WebkitTapHighlightColor: "transparent", outline: "none" }}
          margin={{ top: 10, right: 24, left: 24, bottom: 0 }}
          onMouseDown={(e: any) => e && setRefAreaLeft(e.activeLabel)}
          onMouseMove={(e: any) => e && refAreaLeft && setRefAreaRight(e.activeLabel)}
          onMouseUp={() => { setRefAreaLeft(null); setRefAreaRight(null); }}
          onMouseLeave={() => { setRefAreaLeft(null); setRefAreaRight(null); }}
        >
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
            interval={Math.floor(cData.length / 6)}
            tickFormatter={(val) =>
              new Date(val).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
            }
          />
          {/* Left Y-Axis: Price (Index) */}
          <YAxis
            yAxisId="left"
            orientation="left"
            tick={{ fontSize: 8, fontWeight: 700, fill: "#ec4899", opacity: 0.5 }}
            className="text-pink-500/50"
            axisLine={false}
            tickLine={false}
            mirror={true}
            domain={["auto", "auto"]}
            tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
            hide={metric === 'close'}
          />
          {/* Right Y-Axis: Valuation Metric */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 9, fontWeight: 700, fill: "currentColor" }}
            className="text-muted/50"
            axisLine={false}
            tickLine={false}
            mirror={true}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-card)",
              borderRadius: "1.25rem",
              border: "1px solid var(--border)",
              padding: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              fontSize: "12px",
              fontWeight: "900",
              backdropFilter: "blur(8px)",
            }}
            cursor={{ stroke: color, strokeWidth: 2, strokeDasharray: "4 4" }}
            formatter={(value: any, name: any) => {
              const isPrice = name === "Index Price";
              return [
                isPrice 
                  ? Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 }) 
                  : Number(value).toFixed(2),
                name
              ];
            }}
            labelFormatter={(_: any, payload: any) => {
              if (payload && payload.length > 0) {
                return <span className={`${DS.TEXT.MUTED_CAPS} opacity-100`}>{payload[0].payload.fullDate}</span>;
              }
              return "";
            }}
          />
          
          {/* Background Price Area */}
          {metric !== 'close' && (
            <Area yAxisId="left" type="monotone" dataKey="price" stroke="#ec4899" strokeWidth={1} fill="#ec4899" fillOpacity={0.1} name="Index Price" animationDuration={1500} />
          )}

          {/* Foreground Metric Line or Area */}
          {metric === 'close' ? (
            <Area yAxisId="right" type="monotone" dataKey="value" stroke={color} strokeWidth={3} fill={`url(#gradient-${metric})`} name={metricLabels[metric]} animationDuration={1500} />
          ) : (
            <Line yAxisId="right" type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={false} name={metricLabels[metric]} animationDuration={1500} />
          )}

          <ReferenceLine yAxisId="right" y={median} stroke="currentColor" className="text-muted/60" strokeDasharray="6 4" strokeWidth={1} />

          {refAreaLeft && refAreaRight && (
            <ReferenceArea yAxisId="right" x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="white" fillOpacity={0.05} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <>
      {/* INLINE CARD */}
      <div className={`${DS.CARD.BASE} p-0 flex flex-col h-full focus:outline-none outline-none overflow-hidden hover:shadow-2xl transition-all duration-500`}>
        <div className="flex items-center justify-between p-6 pb-2">
          <div>
            <h3 className={DS.TEXT.MUTED_CAPS}>{title}</h3>
            <p className={`${DS.TEXT.MUTED_CAPS_TIGHT} opacity-30 mt-0.5 whitespace-nowrap`}>Rolling {timeRange} Analysis</p>
          </div>
          
          <div className="flex items-center gap-6 sm:gap-8">
            {week52Metric && (
              <>
                <div className={`flex items-center gap-2 ${DS.TEXT.TINY_CAPS} font-black hidden xl:flex`}>
                  <span className="opacity-40 whitespace-nowrap">52W L</span>
                  <div className="flex flex-col items-end leading-tight">
                    <span className="text-[10px]" style={{ color }}>{metric === 'close' ? week52Metric.low.toLocaleString("en-IN") : week52Metric.low.toFixed(2)}</span>
                    {metric !== 'close' && week52Price && (<span className="text-[10px] text-pink-500 opacity-80">{week52Price.low.toLocaleString("en-IN")}</span>)}
                  </div>
                </div>

                <div className={`flex items-center gap-2 ${DS.TEXT.TINY_CAPS} font-black hidden xl:flex`}>
                  <span className="opacity-40 whitespace-nowrap">52W H</span>
                  <div className="flex flex-col items-end leading-tight">
                    <span className="text-[10px]" style={{ color }}>{metric === 'close' ? week52Metric.high.toLocaleString("en-IN") : week52Metric.high.toFixed(2)}</span>
                    {metric !== 'close' && week52Price && (<span className="text-[10px] text-pink-500 opacity-80">{week52Price.high.toLocaleString("en-IN")}</span>)}
                  </div>
                </div>
              </>
            )}

            {/* Expand Action */}
            <button 
              onClick={() => setIsExpanded(true)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors group"
              title="Expand Chart"
            >
              <Maximize2 className="w-4 h-4 text-muted group-hover:text-blue-500 transition-colors" />
            </button>
          </div>
        </div>

        <div className={`${height}`}>
          {renderChart(inlineChartData)}
        </div>
      </div>

      {/* FULLSCREEN MODAL OVERLAY */}
      {isExpanded && (
        <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-md flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between p-4 sm:p-6 border-b border-border bg-card/50 gap-4">
            <h2 className={DS.TEXT.H1}>{title}</h2>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex bg-background border border-border rounded-xl p-1 shadow-inner">
                {(["1Y", "3Y", "5Y", "MAX", "CUSTOM"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setLocalTimeRange(r)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg ${DS.ANIM.TRANSITION} ${localTimeRange === r ? "bg-card text-blue-500 shadow-sm border border-border" : "text-muted hover:text-foreground"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {localTimeRange === "CUSTOM" && (
                <div className="flex items-center gap-1.5 animate-in fade-in zoom-in slide-in-from-right-4 duration-300">
                  <input type="month" value={customStartMonth} onChange={e => setCustomStartMonth(e.target.value)} className="w-[110px] sm:w-[130px] px-3 py-1.5 text-xs border border-border rounded-xl bg-card focus:outline-none focus:border-blue-500 font-bold" />
                  <span className="text-muted text-xs font-bold px-1">to</span>
                  <input type="month" value={customEndMonth} onChange={e => setCustomEndMonth(e.target.value)} className="w-[110px] sm:w-[130px] px-3 py-1.5 text-xs border border-border rounded-xl bg-card focus:outline-none focus:border-blue-500 font-bold" />
                </div>
              )}

              <div className="h-6 w-px bg-border mx-2 hidden sm:block" />

              <button onClick={() => setIsExpanded(false)} className="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-full transition-colors flex items-center justify-center">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Modal Chart Body */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full h-[calc(100vh-100px)]">
            <div className="w-full h-full border border-border rounded-3xl bg-card shadow-2xl p-4 sm:p-6">
               <div className="flex justify-between items-center mb-6">
                 <div>
                   <h3 className={DS.TEXT.MUTED_CAPS}>{title}</h3>
                   <p className={`${DS.TEXT.MUTED_CAPS_TIGHT} opacity-30 mt-0.5`}>
                     {localTimeRange === "CUSTOM" ? `Custom Filter: ${customStartMonth} through ${customEndMonth}` : `Rolling ${localTimeRange} Analysis`}
                   </p>
                 </div>
                 {week52Metric && (
                   <div className="flex items-center gap-8">
                      <div className={`flex items-center gap-2 ${DS.TEXT.TINY_CAPS} font-black`}>
                        <span className="opacity-40 whitespace-nowrap">52W L</span>
                        <div className="flex flex-col items-end leading-tight">
                          <span className="text-[10px]" style={{ color }}>{metric === 'close' ? week52Metric.low.toLocaleString("en-IN") : week52Metric.low.toFixed(2)}</span>
                          {metric !== 'close' && week52Price && (<span className="text-[10px] text-pink-500 opacity-80">{week52Price.low.toLocaleString("en-IN")}</span>)}
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 ${DS.TEXT.TINY_CAPS} font-black`}>
                        <span className="opacity-40 whitespace-nowrap">52W H</span>
                        <div className="flex flex-col items-end leading-tight">
                          <span className="text-[10px]" style={{ color }}>{metric === 'close' ? week52Metric.high.toLocaleString("en-IN") : week52Metric.high.toFixed(2)}</span>
                          {metric !== 'close' && week52Price && (<span className="text-[10px] text-pink-500 opacity-80">{week52Price.high.toLocaleString("en-IN")}</span>)}
                        </div>
                      </div>
                   </div>
                 )}
               </div>
               <div className="w-full h-[calc(100%-80px)]">
                 {renderChart(expandedChartData)}
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
