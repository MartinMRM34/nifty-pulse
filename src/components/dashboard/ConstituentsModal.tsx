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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Index Constituents</h2>
            <p className="text-sm text-gray-500">
              {indexMeta?.name} {!isLoading && <span className="text-xs ml-1 bg-gray-100 px-2 py-0.5 rounded-full">{constituents.length} stocks</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-0 sm:p-2 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-400">Loading stocks...</p>
            </div>
          ) : constituents.length > 0 ? (
            <div className="space-y-1">
              <div className="flex justify-between px-5 sm:px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider sticky top-0 bg-white/95 backdrop-blur z-10">
                <span>Company</span>
                <div className="flex gap-6 text-right w-32 justify-end">
                  <span>LTP</span>
                  <span>Chg %</span>
                </div>
              </div>
              {constituents.map((c, i) => (
                <div key={c.symbol} className="flex items-center justify-between px-5 sm:px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3 max-w-[60%]">
                    <span className="text-sm font-bold text-gray-300 w-4">{i + 1}</span>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold text-gray-900 truncate">{c.symbol}</span>
                      <span className="text-xs text-gray-500 truncate" title={c.name}>{c.name}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-right items-center">
                    <span className="text-sm font-medium text-gray-900">₹{c.lastPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    <span className={`text-sm font-bold w-12 ${c.pChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {c.pChange >= 0 ? '+' : ''}{c.pChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <p>Constituent data currently unavailable for {indexMeta?.name}.</p>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 text-xs text-gray-500 text-center border-t border-gray-100 flex items-center justify-center gap-1">
          Live data sourced from NSE API. Constituents sorted by traded value. <ExternalLink className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
