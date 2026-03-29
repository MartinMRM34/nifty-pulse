/**
 * Nifty Pulse Design System (DS) v3.0
 * Single Source of Truth for all UI/UX styling.
 */

export const DS = {
  // Layout & Spacing
  LAYOUT: {
    PAGE: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    MAIN: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6",
    HEADER: "sticky top-0 z-20 transition-colors bg-card border-b border-border",
    GRID_HERO: "grid grid-cols-1 lg:grid-cols-12 gap-4",
    GRID_DASHBOARD: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
    GRID_STATS: "grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch",
  },

  // Card & Surfaces
  CARD: {
    BASE: "bg-card rounded-2xl border border-border/50 transition-all duration-300 group",
    INTERACTIVE: "hover:shadow-2xl hover:scale-[1.01] hover:border-blue-500/30",
    P6: "p-6",
    P5: "p-5",
    P4: "p-4",
  },

  // Typography
  TEXT: {
    H1: "text-lg font-black text-foreground tracking-tight",
    H2: "text-base font-black text-foreground tracking-tight",
    VALUE: "text-3xl font-black text-foreground tracking-tight",
    SUBVALUE: "text-sm font-bold text-muted opacity-50",
    LABEL: "text-xs font-bold text-muted uppercase tracking-wider",
    MUTED_CAPS: "text-[10px] font-black text-muted uppercase tracking-widest opacity-60",
    MUTED_CAPS_TIGHT: "text-[9px] font-black text-muted uppercase tracking-tighter opacity-60",
    BODY: "text-sm font-medium text-muted leading-relaxed",
    BODY_STRONG: "text-sm font-bold text-foreground",
    TINY: "text-[10px] font-bold text-muted",
    TINY_CAPS: "text-[9px] font-black uppercase tracking-widest",
  },

  // Modals & Overlays
  MODAL: {
    OVERLAY: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300",
    CONTENT: "bg-card rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-border flex flex-col",
    HEADER: "flex items-center justify-between p-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10",
    FOOTER: "p-5 bg-background text-[9px] font-black text-muted/40 uppercase tracking-widest text-center border-t border-border flex items-center justify-center gap-2",
  },

  // Components (Chips, Inputs, Buttons)
  CHIP: {
    BASE: "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
    ACTIVE: "bg-blue-600 text-white shadow-md border-blue-500",
    INACTIVE: "bg-card text-muted border-border hover:border-blue-400 hover:text-foreground",
  },
  INPUT: {
    BASE: "w-full pl-11 pr-11 py-3 text-sm border border-border rounded-2xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-muted/60 font-bold",
    WRAPPER: "relative group",
  },
  BUTTON: {
    SECONDARY: "flex items-center gap-2 px-3 py-1.5 bg-card text-foreground border border-border hover:border-blue-400 hover:text-blue-500 rounded-xl text-xs font-semibold transition-all shadow-sm group",
  },

  // Animation Utilities
  ANIM: {
    TRANSITION: "transition-all duration-300 ease-in-out",
    PROGRESS: "animate-progress 1.2s ease-in-out infinite",
    SPIN: "animate-spin",
    PULSE: "animate-pulse",
  },

  // Icon Standard Sizes
  ICON: {
    XXS: "w-2.5 h-2.5",
    XS: "w-3 h-3",
    SM: "w-4 h-4",
    MD: "w-5 h-5",
    LG: "w-6 h-6",
    XL: "w-8 h-8",
    XXL: "w-10 h-10",
  },

  // Small Indicators (Dots, Status)
  DOT: {
    XS: "w-1 h-1",
    SM: "w-1.5 h-1.5",
    MD: "w-2 h-2",
    LG: "w-5 h-5",
    XL: "w-7 h-7",
  }
};
