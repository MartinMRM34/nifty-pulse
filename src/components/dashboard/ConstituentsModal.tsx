"use client";

import { useState, useEffect } from "react";
import { IndexId, Constituent } from "@/types";
import { INDICES } from "@/lib/constants";
import { X, ExternalLink, Loader2 } from "lucide-react";
import { getConstituents } from "@/data/constituents";
import { DS } from "@/lib/design-system";

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
    <div className={DS.MODAL.OVERLAY}>
      <div className={`${DS.MODAL.CONTENT} max-h-[85vh]`}>
        <div className={DS.MODAL.HEADER}>
          <div>
            <h2 className={DS.TEXT.H1}>Index Constituents</h2>
            <p className={DS.TEXT.MUTED_CAPS}>
              {indexMeta?.shortName} {!isLoading && <span className="ml-1 bg-background px-2 py-0.5 rounded-md border border-border">{constituents.length} stocks</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-foreground hover:bg-background rounded-full transition-all"
          >
            <X className={DS.ICON.MD} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <Loader2 className={`${DS.ICON.XXL} text-blue-500 ${DS.ANIM.SPIN}`} />
                <div className={`absolute inset-0 blur-md bg-blue-500/20 ${DS.ANIM.PULSE}`} />
              </div>
              <p className={`${DS.TEXT.MUTED_CAPS} ${DS.ANIM.PULSE}`}>Syncing market data...</p>
            </div>
          ) : constituents.length > 0 ? (
            <div className="p-2">
              <div className={`flex justify-between px-4 py-3 ${DS.TEXT.TINY_CAPS} text-muted sticky top-0 bg-card/95 backdrop-blur z-10 border-b border-border/50`}>
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
                      <span className={`${DS.TEXT.MUTED_CAPS_TIGHT} w-4 opacity-30`}>{i + 1}</span>
                      <div className="flex flex-col overflow-hidden">
                        <span className={`${DS.TEXT.BODY_STRONG} tracking-tight truncate`}>{c.symbol}</span>
                        <span className={`${DS.TEXT.MUTED_CAPS_TIGHT} truncate opacity-60`} title={c.name}>{c.name}</span>
                      </div>
                    </div>
                    <div className="flex gap-6 text-right items-center">
                      <span className={`${DS.TEXT.BODY_STRONG} tabular-nums`}>₹{c.lastPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
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
              <div className="text-4xl text-muted/30">🔍</div>
              <p className={DS.TEXT.MUTED_CAPS}>No constituent data for {indexMeta?.shortName}</p>
            </div>
          )}
        </div>

        <div className={DS.MODAL.FOOTER}>
          Live NSE Feed <div className={`${DS.DOT.XS} rounded-full bg-emerald-500 ${DS.ANIM.PULSE}`} /> Daily Updates <ExternalLink className={DS.ICON.XS + " opacity-30"} />
        </div>
      </div>
    </div>
  );
}
