"use client";

import { IndexId } from "@/types";
import { INDICES } from "@/lib/constants";
import { X, ExternalLink } from "lucide-react";

interface ConstituentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  indexId: IndexId;
}

// Mock constituents data
const mockConstituents: Record<string, { symbol: string; name: string; weight: number }[]> = {
  "nifty-50": [
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", weight: 11.5 },
    { symbol: "RELIANCE", name: "Reliance Industries Ltd.", weight: 9.8 },
    { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", weight: 7.9 },
    { symbol: "INFY", name: "Infosys Ltd.", weight: 5.8 },
    { symbol: "ITC", name: "ITC Ltd.", weight: 4.5 },
    { symbol: "TCS", name: "Tata Consultancy Services Ltd.", weight: 4.1 },
    { symbol: "LT", name: "Larsen & Toubro Ltd.", weight: 3.9 },
    { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd.", weight: 3.2 },
    { symbol: "SBIN", name: "State Bank of India", weight: 3.0 },
    { symbol: "AXISBANK", name: "Axis Bank Ltd.", weight: 2.8 },
  ],
};

export default function ConstituentsModal({ isOpen, onClose, indexId }: ConstituentsModalProps) {
  if (!isOpen) return null;

  const indexMeta = INDICES.find((i) => i.id === indexId);
  const constituents = mockConstituents[indexId] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Index Constituents</h2>
            <p className="text-sm text-gray-500">{indexMeta?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {constituents.length > 0 ? (
            <div className="space-y-1">
              <div className="flex justify-between px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <span>Company</span>
                <span>Weight (%)</span>
              </div>
              {constituents.map((c, i) => (
                <div key={c.symbol} className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400 w-4">{i + 1}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{c.symbol}</span>
                      <span className="text-xs text-gray-500 line-clamp-1">{c.name}</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{c.weight.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>Constituent data not available for this index.</p>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 text-xs text-gray-500 text-center border-t border-gray-100 flex items-center justify-center gap-1">
          Data indicative. Weights may vary. <ExternalLink className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
