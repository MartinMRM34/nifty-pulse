"use client";

import { getTodayVerse } from "@/data/thirukkural";
import { BookOpen, Volume2, Info, X } from "lucide-react";
import { IndexId, ThirukkuralVerse } from "@/types";
import { DS } from "@/lib/design-system";
import { speak } from "@/lib/voice";
import { useState, useEffect } from "react";

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
  const [transLine1, transLine2] = (verse.transliteration || "").split("\n");
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  // Lock body scroll when modal is open to prevent jitter
  useEffect(() => {
    if (isExplanationOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isExplanationOpen]);

  // Category-based styling
  const categoryStyles = {
    BULLISH: "border-l-4 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-500/5",
    BEARISH: "border-l-4 border-rose-500 bg-rose-50/10 dark:bg-rose-500/5",
    NEUTRAL: "border-l-4 border-blue-500 bg-blue-50/10 dark:bg-blue-500/5",
    GENERAL: "border-l-4 border-amber-500 bg-amber-50/10 dark:bg-amber-500/5",
  }[verse.category || "GENERAL"];

  return (
    <>
      <div className={`${DS.CARD.BASE} ${isHero ? 'p-4 md:p-5' : DS.CARD.P5} ${DS.CARD.INTERACTIVE} ${categoryStyles} ${isHero ? 'h-full flex flex-col' : ''}`}>
        <div className={`flex items-center gap-2 ${isHero ? 'mb-3' : 'mb-4'}`}>
          <BookOpen className={`${isHero ? DS.ICON.SM : DS.ICON.SM} opacity-80 ${verse.category === 'BEARISH' ? 'text-rose-500' : verse.category === 'BULLISH' ? 'text-emerald-500' : 'text-amber-500'}`} />
          <h3 className={`${isHero ? DS.TEXT.MUTED_CAPS : DS.TEXT.MUTED_CAPS} ${verse.category === 'BEARISH' ? 'text-rose-600 dark:text-rose-400' :
            verse.category === 'BULLISH' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}>
            Market Wisdom — #{verse.number}
          </h3>
          {!isHero && <span className={`ml-auto ${DS.TEXT.MUTED_CAPS_TIGHT} opacity-60`}>{verse.topic}</span>}
        </div>

        <div className={`grid grid-cols-1 ${isHero ? '' : 'md:grid-cols-2'} gap-2 ${isHero ? 'flex-1 gap-3' : 'md:gap-8'}`}>
          {/* Tamil Section */}
          <div className="space-y-1 relative group/kural">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <p className={`${isHero ? 'text-base md:text-lg lg:text-xl' : 'text-base md:text-lg'} text-foreground font-bold leading-tight tracking-tight`}>
                  {tamilLine1}
                </p>
                <p className={`${isHero ? 'text-base md:text-lg lg:text-xl' : 'text-base md:text-lg'} text-foreground font-bold leading-tight tracking-tight`}>
                  {tamilLine2}
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); speak(verse.tamil, 'ta-IN'); }}
                  className={`p-1.5 rounded-xl border border-border/50 bg-background/50 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all focus:ring-2 active:scale-95 group/btn ${verse.category === 'BEARISH' ? 'hover:border-rose-400 text-rose-500' :
                    verse.category === 'BULLISH' ? 'hover:border-emerald-400 text-emerald-500' : 'hover:border-amber-400 text-amber-500'
                    }`}
                  title="Listen in Tamil"
                >
                  <Volume2 className={(isHero ? DS.ICON.SM : DS.ICON.SM) + " group-hover/btn:scale-110 transition-transform"} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsExplanationOpen(true); }}
                  className={`p-1.5 rounded-xl border border-border/50 bg-background/50 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all focus:ring-2 active:scale-95 group/btn ${verse.category === 'BEARISH' ? 'hover:border-rose-400 text-rose-500' :
                    verse.category === 'BULLISH' ? 'hover:border-emerald-400 text-emerald-500' : 'hover:border-amber-400 text-amber-500'
                    }`}
                  title="View Explanation"
                >
                  <Info className={(isHero ? DS.ICON.SM : DS.ICON.SM) + " group-hover/btn:scale-110 transition-transform"} />
                </button>
              </div>
            </div>
          </div>

          {/* English Section */}
          <div className={`flex items-center ${isHero ? 'pt-3 mt-1 border-t border-border/30' : 'md:border-l md:border-border md:pl-8'}`}>
            <p className={`${isHero ? 'text-[10px] md:text-[11px] lg:text-xs' : DS.TEXT.BODY} italic opacity-80 leading-relaxed font-medium`}>
              &ldquo;{verse.english}&rdquo;
            </p>
          </div>
        </div>

        {isHero && (
          <div className="mt-auto pt-2 flex justify-end">
            <span className={`${DS.TEXT.MUTED_CAPS} opacity-40`}>{verse.topic}</span>
          </div>
        )}
      </div>

      {/* Explanation Modal — Massive Layout (Rendered outside Card to avoid scale inheritance) */}
      {isExplanationOpen && (
        <div
          className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 lg:p-12 animate-in fade-in duration-300"
          onClick={() => setIsExplanationOpen(false)}
        >
          <div
            className="w-full h-full max-w-6xl bg-card rounded-[2.5rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Massive Header */}
            <div className="flex items-center justify-between p-5 md:p-8 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-4 md:gap-6">
                <div className={`flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl shrink-0 ${verse.category === 'BEARISH' ? 'bg-rose-500/20 text-rose-500' :
                  verse.category === 'BULLISH' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
                  }`}>
                  <BookOpen className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-lg md:text-xl lg:text-2xl font-black text-foreground tracking-tight leading-none">
                    Market Wisdom — #{verse.number}
                  </h2>
                  <p className="text-[10px] md:text-xs font-black text-muted uppercase tracking-[0.4em] opacity-40">
                    {verse.topic}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => speak(verse.tamil, 'ta-IN')}
                  className={`p-3 md:p-4 hover:bg-white/10 rounded-full transition-all group/speak ${
                    verse.category === 'BEARISH' ? 'text-rose-500' : 
                    verse.category === 'BULLISH' ? 'text-emerald-500' : 'text-amber-500'
                  }`}
                  title="Listen in Tamil"
                >
                  <Volume2 className="w-5 h-5 md:w-6 md:h-6 group-hover/speak:scale-110 transition-transform" />
                </button>
                <button 
                  onClick={() => setIsExplanationOpen(false)}
                  className="p-3 md:p-4 hover:bg-white/10 rounded-full transition-all group/close"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6 text-muted group-hover/close:text-foreground group-hover/close:rotate-90 transition-all duration-300" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 space-y-8">
              {/* Massive Original Verse */}
              <div className="space-y-4">
                <div className="p-6 md:p-10 rounded-[1.5rem] bg-gradient-to-br from-slate-900/50 to-slate-900/10 border border-white/5 shadow-2xl flex flex-col items-start justify-center relative overflow-hidden group/verse">
                  <div className="absolute inset-0 bg-grid-white/[0.01] -z-10" />

                  {/* The Couplet (Kural) — Strict Metrical Anatomy */}
                  <div className="space-y-6 mb-6 text-left w-full overflow-x-auto scrollbar-hide py-2">
                    {/* Line 1 (4 Words) */}
                    <div className="space-y-1.5">
                      <p className="text-lg md:text-xl lg:text-4xl text-foreground font-black leading-tight tracking-tighter whitespace-nowrap px-4 md:px-8 drop-shadow-2xl">
                        {tamilLine1}
                      </p>
                      <p className="text-[9px] md:text-[11px] text-blue-400 font-bold uppercase tracking-widest opacity-60 whitespace-nowrap px-4 md:px-8">
                        {transLine1}
                      </p>
                    </div>

                    {/* Line 2 (3 Words) */}
                    <div className="space-y-1.5">
                      <p className="text-lg md:text-xl lg:text-4xl text-foreground font-black leading-tight tracking-tighter whitespace-nowrap px-4 md:px-8 drop-shadow-2xl">
                        {tamilLine2}
                      </p>
                      <p className="text-[9px] md:text-[11px] text-blue-400 font-bold uppercase tracking-widest opacity-60 whitespace-nowrap px-4 md:px-8">
                        {transLine2}
                      </p>
                    </div>
                  </div>

                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/10 to-transparent mb-5 ml-4 md:ml-8" />
                  <p className="text-[9px] md:text-xs lg:text-sm text-left opacity-30 max-w-xl italic font-medium uppercase tracking-[0.2em] leading-relaxed px-4 md:px-8">
                    &ldquo;{verse.english}&rdquo;
                  </p>
                </div>
              </div>

              {/* Robust Interpretation Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-6">
                {/* Tamil Explanation */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-1 bg-amber-500 rounded-full" />
                    <h3 className="text-[11px] md:text-xs font-black text-amber-500 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">தெளிவுரை (Authentic Tamil)</h3>
                  </div>
                  <p className="text-base md:text-lg font-bold text-foreground leading-relaxed">
                    {verse.explanationTamil}
                  </p>
                </div>

                {/* English Explanation */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-1 bg-blue-500 rounded-full" />
                    <h3 className="text-[11px] md:text-xs font-black text-blue-500 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">Interpretation (Market Sense)</h3>
                  </div>
                  <p className="text-sm md:text-base font-medium text-muted leading-relaxed italic">
                    {verse.explanationEnglish}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-white/5 bg-slate-900/20 text-[10px] font-black text-muted opacity-30 uppercase tracking-[0.5em] text-center">
              Thirukkural — Book of Wealth (Porulpaal)
            </div>
          </div>
        </div>
      )}
    </>
  );
}
