"use client";

import { INDICES } from "@/lib/constants";
import { IndexId } from "@/types";

interface IndexSelectorProps {
  selected: IndexId;
  onChange: (id: IndexId) => void;
}

export default function IndexSelector({ selected, onChange }: IndexSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {INDICES.map((index) => (
        <button
          key={index.id}
          onClick={() => index.enabled && onChange(index.id)}
          disabled={!index.enabled}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selected === index.id
              ? "bg-blue-600 text-white shadow-md"
              : index.enabled
                ? "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                : "bg-gray-100 text-gray-400 border border-gray-100 cursor-not-allowed"
          }`}
          title={index.enabled ? index.description : `${index.name} - Coming Soon`}
        >
          {index.shortName}
          {!index.enabled && (
            <span className="ml-1 text-xs text-gray-400">soon</span>
          )}
        </button>
      ))}
    </div>
  );
}
