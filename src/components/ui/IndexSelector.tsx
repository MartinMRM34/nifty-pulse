"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { INDICES } from "@/lib/constants";
import { IndexId } from "@/types";

interface IndexSelectorProps {
  selected: IndexId;
  onChange: (id: IndexId) => void;
}

export function IndexChips({ selected, onChange }: IndexSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {INDICES.filter((i) => i.enabled).map((index) => (
        <button
          key={index.id}
          onClick={() => onChange(index.id)}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
            selected === index.id
              ? "bg-blue-600 text-white shadow-md border-blue-500"
              : "bg-card text-muted border-border hover:border-blue-400 hover:text-foreground"
          }`}
        >
          {index.shortName}
        </button>
      ))}
    </div>
  );
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
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedMeta ? `${selectedMeta.name} (${selectedMeta.shortName})` : "Search index..."}
          className="w-full pl-11 pr-11 py-3 text-sm border border-border rounded-2xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-muted/60 font-bold"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setIsOpen(false); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-30 mt-2 w-full bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[300px] overflow-y-auto">
            {filtered.map((index) => (
              <button
                key={index.id}
                onClick={() => handleSelect(index.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 text-sm transition-all ${
                  selected === index.id
                    ? "bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "text-foreground hover:bg-background"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`font-black text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border ${
                    selected === index.id ? "bg-blue-600 text-white border-blue-500" : "bg-background text-muted border-border"
                  }`}>
                    {index.shortName}
                  </span>
                  <span className="font-bold">{index.name}</span>
                </div>
                {selected === index.id && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] text-blue-500 font-black uppercase tracking-wider">Active</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
