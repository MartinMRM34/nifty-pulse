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
    <div className="flex flex-col items-center gap-6 p-10 bg-card/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-border transition-all">
      <div className="relative flex items-center justify-center h-24 w-24">
        {/* Ripple effect rings */}
        <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse-ripple shadow-[0_0_40px_rgba(59,130,246,0.3)]" />
        <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse-ripple [animation-delay:0.5s]" />
        
        {/* Central icon */}
        <div className="relative z-10 flex items-center justify-center h-16 w-16 bg-card rounded-full shadow-xl border border-border">
          <Activity className="h-8 w-8 text-blue-500 animate-pulse" />
        </div>
      </div>

      <div className="space-y-2 text-center">
        <p className="text-foreground font-black text-2xl tracking-tighter">Nifty Pulse</p>
        <p className="text-muted text-sm font-bold uppercase tracking-widest animate-pulse opacity-60 italic">{message}</p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20">
      {content}
    </div>
  );
}
