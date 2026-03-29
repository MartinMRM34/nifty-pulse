"use client";

import { useState, useEffect } from "react";
import { IndexId, Constituent } from "@/types";
import { INDICES } from "@/lib/constants";
import { X, ExternalLink, Loader2 } from "lucide-react";
import { getConstituents } from "@/data/constituents";

interface ConstituentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  indexId: IndexId;
}

export default function ConstituentsModal({ isOpen, onClose, indexId }: ConstituentsModalProps) {
  const [constituents, setConstituents] = useState<Constituent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      async function loadConstituents() {
        setIsLoading(true);
        try {
          const data = await getConstituents(indexId);
          setConstituents(data || []);
        } catch (err) {
          console.error("Failed to load constituents:", err);
        } finally {
          setIsLoading(false);
        }
      }
      loadConstituents();
    }
  }, [isOpen, indexId]);

  if (!isOpen) return null;

  const indexMeta = INDICES.find((i) => i.id === indexId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-border flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Index Constituents</h2>
            <p className="text-[10px] text-muted font-black uppercase tracking-widest opacity-60">
              {indexMeta?.shortName} {!isLoading && <span className="ml-1 bg-background px-2 py-0.5 rounded-md border border-border">{constituents.length} stocks</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-foreground hover:bg-background rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <div className="absolute inset-0 blur-md bg-blue-500/20 animate-pulse" />
              </div>
              <p className="text-[10px] font-black text-muted uppercase tracking-widest animate-pulse">Syncing market data...</p>
            </div>
          ) : constituents.length > 0 ? (
            <div className="p-2">
              <div className="flex justify-between px-4 py-3 text-[9px] font-black text-muted uppercase tracking-widest sticky top-0 bg-card/95 backdrop-blur z-10 border-b border-border/50">
                <span>Company</span>
                <div className="flex gap-8 text-right w-32 justify-end">
                  <span>LTP</span>
                  <span>Chg %</span>
                </div>
              </div>
              <div className="divide-y divide-border/30">
                {constituents.map((c, i) => (
                  <div key={c.symbol} className="flex items-center justify-between px-4 py-4 rounded-xl hover:bg-background transition-all group">
                    <div className="flex items-center gap-4 max-w-[60%]">
                      <span className="text-[10px] font-black text-muted/30 w-4 tracking-tighter">{i + 1}</span>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-black text-foreground tracking-tight truncate">{c.symbol}</span>
                        <span className="text-[10px] text-muted font-bold truncate opacity-60" title={c.name}>{c.name}</span>
                      </div>
                    </div>
                    <div className="flex gap-6 text-right items-center">
                      <span className="text-sm font-black text-foreground tabular-nums">₹{c.lastPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      <span className={`text-[11px] font-black w-14 py-1 rounded-md text-center tabular-nums ${c.pChange >= 0 ? 'text-emerald-500 bg-emerald-500/5' : 'text-rose-500 bg-rose-500/5'}`}>
                        {c.pChange >= 0 ? '+' : ''}{c.pChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <div className="text-4xl">🔍</div>
              <p className="text-[10px] font-black text-muted uppercase tracking-widest">No constituent data for {indexMeta?.shortName}</p>
            </div>
          )}
        </div>

        <div className="p-5 bg-background text-[9px] font-black text-muted/40 uppercase tracking-widest text-center border-t border-border flex items-center justify-center gap-2">
          Live NSE Feed <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Daily Updates <ExternalLink className="w-3 h-3 opacity-30" />
        </div>
      </div>
    </div>
  );
}
