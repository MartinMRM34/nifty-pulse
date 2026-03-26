"use client";

import { INDICES } from "@/lib/constants";
import { IndexId } from "@/types";

interface IndexSelectorProps {
  selected: IndexId;
  onChange: (id: IndexId) => void;
}

export default function IndexSelector({ selected, onChange }: IndexSelectorProps) {
  return (
    <>
      {/* Mobile: horizontally scrollable single row */}
      <div className="sm:hidden flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {INDICES.map((index) => (
          <button
            key={index.id}
            onClick={() => index.enabled && onChange(index.id)}
            disabled={!index.enabled}
            className={`flex-shrink-0 flex flex-col items-start px-3 py-2 rounded-xl border transition-all duration-200 ${
              selected === index.id
                ? "bg-blue-600 border-blue-600 text-white shadow-md"
                : index.enabled
                ? "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                : "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"
            }`}
          >
            <span className="text-sm font-bold whitespace-nowrap">{index.shortName}</span>
            <span className={`text-[10px] whitespace-nowrap mt-0.5 ${
              selected === index.id ? "text-blue-100" : "text-gray-400"
            }`}>
              {index.name}
            </span>
          </button>
        ))}
      </div>

      {/* Desktop: wrapping grid with tooltips */}
      <div className="hidden sm:flex flex-wrap gap-3">
        {INDICES.map((index) => (
          <button
            key={index.id}
            onClick={() => index.enabled && onChange(index.id)}
            disabled={!index.enabled}
            className={`relative group flex flex-col items-start px-4 py-2.5 rounded-xl border transition-all duration-200 min-w-[130px] ${
              selected === index.id
                ? "bg-blue-600 border-blue-600 text-white shadow-md transform scale-[1.02]"
                : index.enabled
                ? "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-sm"
                : "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center justify-between w-full gap-2">
              <span className="text-sm font-bold">{index.shortName}</span>
              {!index.enabled && (
                <span className="text-[10px] uppercase font-semibold tracking-wider opacity-60">Soon</span>
              )}
            </div>
            <span className={`text-[11px] mt-1 whitespace-nowrap ${
              selected === index.id ? "text-blue-100" : "text-gray-500"
            }`}>
              {index.name}
            </span>

            {/* Tooltip */}
            {index.enabled && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {index.description}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
              </div>
            )}
          </button>
        ))}
      </div>
    </>
  );
}
