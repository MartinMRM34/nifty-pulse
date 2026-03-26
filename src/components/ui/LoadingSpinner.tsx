"use client";

import React from "react";
import { Activity } from "lucide-react";

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
}

export default function LoadingSpinner({
  fullScreen = false,
  message = "Syncing with market data...",
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center gap-6 p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
      <div className="relative flex items-center justify-center h-20 w-20">
        {/* Ripple effect rings */}
        <div className="absolute inset-0 bg-blue-400 rounded-full animate-pulse-ripple" />
        <div className="absolute inset-0 bg-blue-400 rounded-full animate-pulse-ripple [animation-delay:0.5s]" />
        <div className="absolute inset-0 bg-blue-400 rounded-full animate-pulse-ripple [animation-delay:1s]" />
        
        {/* Central icon */}
        <div className="relative z-10 flex items-center justify-center h-14 w-14 bg-white rounded-full shadow-lg border border-blue-50">
          <Activity className="h-8 w-8 text-blue-600 animate-pulse" />
        </div>
      </div>
      
      <div className="space-y-2 text-center">
        <p className="text-gray-900 font-extrabold text-xl tracking-tight">Nifty Pulse</p>
        <p className="text-gray-500 text-sm font-medium animate-pulse">{message}</p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-50/50 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {content}
    </div>
  );
}
