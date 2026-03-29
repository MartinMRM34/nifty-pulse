"use client";

import { getTodayVerse } from "@/data/thirukkural";
import { BookOpen } from "lucide-react";
import { Signal } from "@/types";

interface ThirukkuralCardProps {
  signal?: Signal;
}

export default function ThirukkuralCard({ signal }: ThirukkuralCardProps) {
  // Map market signal to Thirukkural category
  const getCategoryFromSignal = (s?: Signal) => {
    if (!s) return undefined;
    if (s === "strong-buy" || s === "tactical-dip" || s === "buy") return "BULLISH";
    if (s === "overvalued") return "BEARISH";
    if (s === "hold") return "NEUTRAL";
    return "GENERAL";
  };

  const category = getCategoryFromSignal(signal);
  const verse = getTodayVerse(category);
  const [tamilLine1, tamilLine2] = verse.tamil.split("\n");

  // Category-based styling
  const categoryStyles = {
    BULLISH: "border-l-4 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10",
    BEARISH: "border-l-4 border-rose-500 bg-rose-50/30 dark:bg-rose-950/10",
    NEUTRAL: "border-l-4 border-blue-500 bg-blue-50/30 dark:bg-blue-950/10",
    GENERAL: "border-l-4 border-amber-500 bg-amber-50/30 dark:bg-amber-950/10",
  }[verse.category || "GENERAL"];

  return (
    <div className={`bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm transition-all duration-500 ${categoryStyles}`}>
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className={`w-4 h-4 ${verse.category === 'BEARISH' ? 'text-rose-600' : verse.category === 'BULLISH' ? 'text-emerald-600' : 'text-amber-600'}`} />
        <h3 className={`text-xs font-semibold uppercase tracking-wide ${
          verse.category === 'BEARISH' ? 'text-rose-700 dark:text-rose-400' : 
          verse.category === 'BULLISH' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
        }`}>
          Market Wisdom — Thirukkural #{verse.number}
        </h3>
        <span className="ml-auto text-[10px] text-gray-400 font-medium">{verse.topic}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Tamil — Left Column */}
        <div className="space-y-1">
          <p className="text-base md:text-lg text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
            {tamilLine1}
          </p>
          <p className="text-base md:text-lg text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
            {tamilLine2}
          </p>
        </div>

        {/* English — Right Column */}
        <div className="flex items-center md:border-l md:border-gray-200 md:dark:border-gray-800 md:pl-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
            &ldquo;{verse.english}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
