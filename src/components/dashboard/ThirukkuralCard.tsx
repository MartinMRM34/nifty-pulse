"use client";

import { getTodayVerse } from "@/data/thirukkural";
import { BookOpen, Volume2 } from "lucide-react";
import { IndexId } from "@/types";
import { DS } from "@/lib/design-system";
import { speak } from "@/lib/voice";

interface ThirukkuralCardProps {
  signal?: string;
  isHero?: boolean;
}

export default function ThirukkuralCard({ signal, isHero }: ThirukkuralCardProps) {
  // Map market signal to Thirukkural category
  const getCategoryFromSignal = (s?: string) => {
    if (!s) return undefined;
    if (s === "strong-buy" || s === "tactical-dip" || s === "buy") return "BULLISH";
    if (s === "overvalued") return "BEARISH";
    if (s === "hold") return "NEUTRAL";
    return "GENERAL";
  };

  const category = getCategoryFromSignal(signal);
  const verse = getTodayVerse(category as any);
  const [tamilLine1, tamilLine2] = verse.tamil.split("\n");

  // Category-based styling
  const categoryStyles = {
    BULLISH: "border-l-4 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-500/5",
    BEARISH: "border-l-4 border-rose-500 bg-rose-50/10 dark:bg-rose-500/5",
    NEUTRAL: "border-l-4 border-blue-500 bg-blue-50/10 dark:bg-blue-500/5",
    GENERAL: "border-l-4 border-amber-500 bg-amber-50/10 dark:bg-amber-500/5",
  }[verse.category || "GENERAL"];

  return (
    <div className={`${DS.CARD.BASE} ${isHero ? 'p-4' : DS.CARD.P5} ${DS.CARD.INTERACTIVE} ${categoryStyles} ${isHero ? 'h-full flex flex-col' : ''}`}>
      <div className={`flex items-center gap-2 ${isHero ? 'mb-2' : 'mb-4'}`}>
        <BookOpen className={`${isHero ? DS.ICON.XS : DS.ICON.SM} opacity-80 ${verse.category === 'BEARISH' ? 'text-rose-500' : verse.category === 'BULLISH' ? 'text-emerald-500' : 'text-amber-500'}`} />
        <h3 className={`${isHero ? DS.TEXT.MUTED_CAPS_TIGHT : DS.TEXT.MUTED_CAPS} ${
          verse.category === 'BEARISH' ? 'text-rose-600 dark:text-rose-400' : 
          verse.category === 'BULLISH' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
        }`}>
          Market Wisdom — #{verse.number}
        </h3>
        {!isHero && <span className={`ml-auto ${DS.TEXT.MUTED_CAPS_TIGHT} opacity-60`}>{verse.topic}</span>}
      </div>

      <div className={`grid grid-cols-1 ${isHero ? '' : 'md:grid-cols-2'} gap-4 ${isHero ? 'flex-1' : 'md:gap-8'}`}>
        {/* Tamil Section */}
        <div className="space-y-1.5 relative group/kural">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className={`${isHero ? 'text-sm' : 'text-base md:text-lg'} text-foreground font-bold leading-tight tracking-tight`}>
                {tamilLine1}
              </p>
              <p className={`${isHero ? 'text-sm' : 'text-base md:text-lg'} text-foreground font-bold leading-tight tracking-tight`}>
                {tamilLine2}
              </p>
            </div>
            <button
              onClick={() => speak(verse.tamil, 'ta-IN')}
              className={`p-2 rounded-xl border border-border/50 bg-background/50 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all focus:ring-2 active:scale-95 group/btn shrink-0 ${
                verse.category === 'BEARISH' ? 'hover:border-rose-400 text-rose-500' : 
                verse.category === 'BULLISH' ? 'hover:border-emerald-400 text-emerald-500' : 'hover:border-amber-400 text-amber-500'
              }`}
              title="Listen in Tamil"
            >
              <Volume2 className={(isHero ? DS.ICON.XS : DS.ICON.SM) + " group-hover/btn:scale-110 transition-transform"} />
            </button>
          </div>
        </div>

        {/* English Section */}
        <div className={`flex items-center ${isHero ? 'pt-2 mt-2 border-t border-border/30' : 'md:border-l md:border-border md:pl-8'}`}>
          <p className={`${isHero ? DS.TEXT.TINY : DS.TEXT.BODY} italic opacity-80 leading-relaxed`}>
            &ldquo;{verse.english}&rdquo;
          </p>
        </div>
      </div>
      
      {isHero && (
        <div className="mt-auto pt-2 flex justify-end">
           <span className={`${DS.TEXT.MUTED_CAPS_TIGHT} opacity-40`}>{verse.topic}</span>
        </div>
      )}
    </div>
  );
}
