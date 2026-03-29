"use client";

import { HelpCircle, Terminal, X, ChevronRight } from "lucide-react";
import { DS } from "@/lib/design-system";

interface VoiceCommandGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMAND_GROUPS = [
  {
    title: "Change Index",
    icon: <Terminal className={DS.ICON.SM} />,
    commands: [
      "Check Nifty 50",
      "Show Midcap",
      "Check Smallcap",
      "Show Next 50",
      "Show Nifty 500"
    ]
  },
  {
    title: "Market Status",
    icon: <Terminal className={DS.ICON.SM} />,
    commands: [
      "What is the signal?",
      "Signal today",
      "Current signal"
    ]
  },
  {
    title: "Daily Wisdom",
    icon: <Terminal className={DS.ICON.SM} />,
    commands: [
      "Today's wisdom",
      "What's the wisdom?"
    ]
  }
];

export default function VoiceCommandGuide({ isOpen, onClose }: VoiceCommandGuideProps) {
  if (!isOpen) return null;

  return (
    <div className={DS.MODAL.OVERLAY} onClick={onClose}>
      <div 
        className={DS.MODAL.CONTENT + " max-w-sm"} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={DS.MODAL.HEADER}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <HelpCircle className={DS.ICON.MD} />
            </div>
            <div>
              <h2 className={DS.TEXT.H2}>Voice Commands</h2>
              <p className={DS.TEXT.TINY + " opacity-50 uppercase tracking-tighter"}>
                Try saying these phrases
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted/10 rounded-full transition-colors"
          >
            <X className={DS.ICON.SM + " text-muted"} />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {COMMAND_GROUPS.map((group) => (
            <div key={group.title} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                <span className="text-blue-500">{group.icon}</span>
                <h4 className={DS.TEXT.MUTED_CAPS}>{group.title}</h4>
              </div>
              <ul className="space-y-2">
                {group.commands.map((cmd) => (
                  <li 
                    key={cmd}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/5 border border-border/30 text-sm font-bold text-foreground group hover:border-blue-500/30 transition-all cursor-default"
                  >
                    <ChevronRight className={DS.ICON.XS + " text-blue-500 opacity-20 group-hover:opacity-100 transition-opacity"} />
                    {cmd}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={DS.MODAL.FOOTER}>
          <p>Tap the mic and speak clearly in English</p>
        </div>
      </div>
    </div>
  );
}
