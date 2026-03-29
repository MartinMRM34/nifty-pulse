"use client";

import { getTodayVerse } from "@/data/thirukkural";
import { BookOpen } from "lucide-react";

export default function ThirukkuralCard() {
  const verse = getTodayVerse();
  const [tamilLine1, tamilLine2] = verse.tamil.split("\n");

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-amber-600" />
        <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
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
          <p className="text-base md:text-lg text-gray-800 dark:text-gray-100 font-medium leading-relaxed pl-4">
            {tamilLine2}
          </p>
        </div>

        {/* English — Right Column */}
        <div className="flex items-center md:border-l md:border-gray-200 md:dark:border-gray-800 md:pl-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            &ldquo;{verse.english}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
