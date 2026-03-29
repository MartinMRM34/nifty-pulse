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
    <div className="bg-card rounded-2xl border border-border/50 p-4 sm:p-6 shadow-sm hover:shadow-2xl hover:scale-[1.01] hover:border-blue-500/30 transition-all duration-300 h-full group">
      <h3 className="text-[10px] font-black text-muted uppercase tracking-widest mb-6 opacity-60">
        Valuation Summary
      </h3>

      {/* Desktop table — hidden on mobile */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-2 text-muted font-black uppercase tracking-wider">Metric</th>
              <th className="text-right py-4 px-2 text-muted font-black uppercase tracking-wider">Current</th>
              <th className="text-right py-4 px-2 text-muted font-black uppercase tracking-wider">Median</th>
              <th className="text-right py-4 px-2 text-muted font-black uppercase tracking-wider">Min</th>
              <th className="text-right py-4 px-2 text-muted font-black uppercase tracking-wider">Max</th>
              <th className="text-right py-4 px-2 text-muted font-black uppercase tracking-wider">Pct.</th>
              <th className="text-center py-4 px-2 text-muted font-black uppercase tracking-wider">Zone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {metrics.map((m) => {
              const zone = getZone(m.inverted ? 100 - m.stats.percentile : m.stats.percentile);
              return (
                <tr key={m.name} className="group hover:bg-background transition-colors">
                  <td className="py-4 px-2 font-bold text-foreground">{m.name}</td>
                  <td className="py-4 px-2 text-right font-black text-foreground">
                    {m.stats.current.toFixed(2)}
                  </td>
                  <td className="py-4 px-2 text-right text-muted font-bold opacity-80">{m.stats.median.toFixed(2)}</td>
                  <td className="py-4 px-2 text-right text-muted font-bold opacity-60">{m.stats.min.toFixed(2)}</td>
                  <td className="py-4 px-2 text-right text-muted font-bold opacity-60">{m.stats.max.toFixed(2)}</td>
                  <td className="py-4 px-2 text-right text-foreground font-black tracking-tight">{m.stats.percentile}th</td>
                  <td className="py-4 px-2 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${zone.bgColor} ${zone.textColor} border border-black/5 dark:border-white/5`}>
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
      <div className="sm:hidden space-y-4">
        {metrics.map((m) => {
          const zone = getZone(m.inverted ? 100 - m.stats.percentile : m.stats.percentile);
          return (
            <div key={m.name} className="rounded-xl border border-border bg-background/50 p-4 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-foreground uppercase tracking-widest">{m.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${zone.bgColor} ${zone.textColor} border border-black/5 dark:border-white/5`}>
                  {zone.label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-[10px] text-muted font-bold uppercase tracking-tighter">
                <div>
                  <div className="font-black text-foreground text-sm tracking-tight mb-0.5">{m.stats.current.toFixed(2)}</div>
                  <div className="opacity-50">Current</div>
                </div>
                <div>
                  <div className="font-black text-muted text-sm tracking-tight mb-0.5">{m.stats.median.toFixed(2)}</div>
                  <div className="opacity-50">Median</div>
                </div>
                <div>
                  <div className="font-black text-muted text-sm tracking-tight mb-0.5 opacity-60">{m.stats.min.toFixed(2)}</div>
                  <div className="opacity-30">Min</div>
                </div>
                <div>
                  <div className="font-black text-muted text-sm tracking-tight mb-0.5 opacity-60">{m.stats.max.toFixed(2)}</div>
                  <div className="opacity-30">Max</div>
                </div>
              </div>
              {/* Percentile bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-60">
                  <span>Percentile</span>
                  <span className="text-foreground">{m.stats.percentile}th</span>
                </div>
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
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
