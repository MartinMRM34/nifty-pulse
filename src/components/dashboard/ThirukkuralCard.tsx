"use client";

import { getTodayVerse } from "@/data/thirukkural";
import { BookOpen } from "lucide-react";

export default function ThirukkuralCard() {
  const verse = getTodayVerse();

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-amber-600" />
        <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
          Market Wisdom — Thirukkural #{verse.number}
        </h3>
      </div>
      <p className="text-base text-gray-800 dark:text-gray-200 font-medium leading-relaxed mb-2">
        &ldquo;{verse.english}&rdquo;
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-1">
        {verse.transliteration}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
        {verse.topic} — {verse.tamil}
      </p>
    </div>
  );
}
