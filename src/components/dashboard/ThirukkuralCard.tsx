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
    BULLISH: "border-l-4 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-500/5",
    BEARISH: "border-l-4 border-rose-500 bg-rose-50/10 dark:bg-rose-500/5",
    NEUTRAL: "border-l-4 border-blue-500 bg-blue-50/10 dark:bg-blue-500/5",
    GENERAL: "border-l-4 border-amber-500 bg-amber-50/10 dark:bg-amber-500/5",
  }[verse.category || "GENERAL"];

  return (
    <div className={`bg-card rounded-2xl border border-border/50 p-5 shadow-sm hover:shadow-2xl hover:scale-[1.01] hover:border-blue-500/30 transition-all duration-300 group ${categoryStyles}`}>
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className={`w-4 h-4 opacity-80 ${verse.category === 'BEARISH' ? 'text-rose-500' : verse.category === 'BULLISH' ? 'text-emerald-500' : 'text-amber-500'}`} />
        <h3 className={`text-[10px] font-black uppercase tracking-widest ${
          verse.category === 'BEARISH' ? 'text-rose-600 dark:text-rose-400' : 
          verse.category === 'BULLISH' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
        }`}>
          Market Wisdom — Thirukkural #{verse.number}
        </h3>
        <span className="ml-auto text-[10px] text-muted font-bold opacity-60 uppercase tracking-tighter">{verse.topic}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Tamil — Left Column */}
        <div className="space-y-1.5">
          <p className="text-base md:text-lg text-foreground font-bold leading-relaxed tracking-tight">
            {tamilLine1}
          </p>
          <p className="text-base md:text-lg text-foreground font-bold leading-relaxed tracking-tight">
            {tamilLine2}
          </p>
        </div>

        {/* English — Right Column */}
        <div className="flex items-center md:border-l md:border-border md:pl-8">
          <p className="text-sm text-muted font-medium leading-relaxed italic opacity-80">
            &ldquo;{verse.english}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
