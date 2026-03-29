"use client";

import { IndexValuation } from "@/types";
import { getZone } from "@/lib/constants";
import { DS } from "@/lib/design-system";

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
    <div className={`${DS.CARD.BASE} p-4 sm:${DS.CARD.P6} ${DS.CARD.INTERACTIVE} h-full`}>
      <h3 className={`${DS.TEXT.MUTED_CAPS} mb-6`}>
        Valuation Summary
      </h3>

      {/* Desktop table — hidden on mobile */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className={`text-left py-4 px-2 ${DS.TEXT.LABEL}`}>Metric</th>
              <th className={`text-right py-4 px-2 ${DS.TEXT.LABEL}`}>Current</th>
              <th className={`text-right py-4 px-2 ${DS.TEXT.LABEL}`}>Median</th>
              <th className={`text-right py-4 px-2 ${DS.TEXT.LABEL}`}>Min</th>
              <th className={`text-right py-4 px-2 ${DS.TEXT.LABEL}`}>Max</th>
              <th className={`text-right py-4 px-2 ${DS.TEXT.LABEL}`}>Pct.</th>
              <th className={`text-center py-4 px-2 ${DS.TEXT.LABEL}`}>Zone</th>
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
                  <td className={`py-4 px-2 text-right text-foreground font-black tracking-tight`}>{m.stats.percentile}th</td>
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
            <div key={m.name} className={`rounded-xl border border-border bg-background/50 p-4 ${DS.ANIM.TRANSITION}`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`${DS.TEXT.LABEL} text-foreground tracking-widest`}>{m.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${zone.bgColor} ${zone.textColor} border border-black/5 dark:border-white/5`}>
                  {zone.label}
                </span>
              </div>
              <div className={`grid grid-cols-4 gap-2 ${DS.TEXT.TINY_CAPS} text-muted font-bold`}>
                <div>
                  <div className="font-black text-foreground text-sm tracking-tight mb-0.5">{m.stats.current.toFixed(2)}</div>
                  <div className="opacity-50 font-bold uppercase tracking-widest text-[8px]">Current</div>
                </div>
                <div>
                  <div className="font-black text-muted text-sm tracking-tight mb-0.5">{m.stats.median.toFixed(2)}</div>
                  <div className="opacity-50 font-bold uppercase tracking-widest text-[8px]">Median</div>
                </div>
                <div>
                  <div className="font-black text-muted text-sm tracking-tight mb-0.5 opacity-60">{m.stats.min.toFixed(2)}</div>
                  <div className="opacity-30 font-bold uppercase tracking-widest text-[8px]">Min</div>
                </div>
                <div>
                  <div className="font-black text-muted text-sm tracking-tight mb-0.5 opacity-60">{m.stats.max.toFixed(2)}</div>
                  <div className="opacity-30 font-bold uppercase tracking-widest text-[8px]">Max</div>
                </div>
              </div>
              {/* Percentile bar */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1.5 opacity-60">
                  <span className={DS.TEXT.MUTED_CAPS_TIGHT}>Percentile</span>
                  <span className={`${DS.TEXT.BODY_STRONG} text-[11px]`}>{m.stats.percentile}th</span>
                </div>
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${DS.ANIM.TRANSITION} duration-700 ease-out`}
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
