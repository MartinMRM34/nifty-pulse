"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { INDICES } from "@/lib/constants";
import { IndexId } from "@/types";

interface IndexSelectorProps {
  selected: IndexId;
  onChange: (id: IndexId) => void;
}

export default function IndexSelector({ selected, onChange }: IndexSelectorProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = INDICES.filter(
    (i) =>
      i.enabled &&
      (i.name.toLowerCase().includes(query.toLowerCase()) ||
        i.shortName.toLowerCase().includes(query.toLowerCase())),
  );

  const selectedMeta = INDICES.find((i) => i.id === selected);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(id: IndexId) {
    onChange(id);
    setQuery("");
    setIsOpen(false);
  }

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative" ref={wrapperRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedMeta ? `${selectedMeta.name} (${selectedMeta.shortName})` : "Search index..."}
            className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setIsOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && filtered.length > 0 && (
          <div className="absolute z-30 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
            {filtered.map((index) => (
              <button
                key={index.id}
                onClick={() => handleSelect(index.id)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                  selected === index.id
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                    {index.shortName}
                  </span>
                  <span className="font-medium">{index.name}</span>
                </div>
                {selected === index.id && (
                  <span className="text-xs text-blue-600 font-semibold">Active</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick-select chips */}
      <div className="flex flex-wrap gap-2">
        {INDICES.filter((i) => i.enabled).map((index) => (
          <button
            key={index.id}
            onClick={() => handleSelect(index.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selected === index.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {index.shortName}
          </button>
        ))}
      </div>
    </div>
  );
}
