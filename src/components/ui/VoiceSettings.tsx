"use client";

import { useEffect, useState, useCallback } from "react";
import { Volume2, Check, X, Settings2, Play } from "lucide-react";
import { DS } from "@/lib/design-system";
import {
  getAvailableVoices,
  getPreferredVoiceName,
  savePreferredVoiceName,
} from "@/lib/voice";

interface VoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceSettings({ isOpen, onClose }: VoiceSettingsProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  const updateVoices = useCallback(() => {
    const available = getAvailableVoices();
    // Sort to prioritize Google voices at the top
    const sorted = [...available].sort((a, b) => {
      const aG = a.name.includes("Google");
      const bG = b.name.includes("Google");
      if (aG && !bG) return -1;
      if (!aG && bG) return 1;
      return 0;
    });
    setVoices(sorted);
    setSelectedVoice(getPreferredVoiceName());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    updateVoices();
    // Voices are loaded asynchronously in many browsers
    window.speechSynthesis.onvoiceschanged = updateVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [updateVoices]);

  if (!isOpen) return null;

  const handleSelect = (voice: SpeechSynthesisVoice) => {
    savePreferredVoiceName(voice.name);
    setSelectedVoice(voice.name);
  };

  const handleTest = (e: React.MouseEvent, voice: SpeechSynthesisVoice) => {
    e.stopPropagation();
    // Use the specific voice for testing
    const utterance = new SpeechSynthesisUtterance("Testing this voice for Nifty Pulse.");
    utterance.voice = voice;
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={DS.MODAL.OVERLAY} onClick={onClose}>
      <div 
        className={DS.MODAL.CONTENT + " max-h-[80vh]"} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={DS.MODAL.HEADER}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <Settings2 className={DS.ICON.MD} />
            </div>
            <div>
              <h2 className={DS.TEXT.H2}>Voice Settings</h2>
              <p className={DS.TEXT.TINY + " opacity-50 uppercase tracking-tighter"}>
                Choose your tactical assistant
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

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {voices.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-4 bg-muted/5 rounded-full animate-pulse">
                  <Volume2 className={DS.ICON.XL + " text-muted/20"} />
                </div>
              </div>
              <p className={DS.TEXT.BODY + " text-muted italic"}>
                Loading system voices...
              </p>
            </div>
          ) : (
            voices.map((voice) => {
              const isActive = selectedVoice === voice.name;
              const isGoogle = voice.name.includes("Google");
              const isPremium = voice.name.includes("Premium") || voice.name.includes("Enhanced");
              
              return (
                <button
                  key={voice.name}
                  onClick={() => handleSelect(voice)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group ${
                    isActive 
                      ? "bg-blue-500/5 border-blue-500 text-foreground" 
                      : "bg-card border-border/50 hover:border-blue-400/50 hover:bg-blue-50/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-colors ${
                      isActive ? "bg-blue-500 text-white" : "bg-muted/5 text-muted group-hover:bg-blue-500/10 group-hover:text-blue-500"
                    }`}>
                      {isActive ? <Check className={DS.ICON.SM} /> : <Volume2 className={DS.ICON.SM} />}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className={DS.TEXT.BODY_STRONG}>{voice.name}</span>
                        {(isGoogle || isPremium) && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-tighter">
                            High Quality
                          </span>
                        )}
                      </div>
                      <p className={DS.TEXT.TINY + " opacity-40 uppercase tracking-tighter"}>
                        {voice.lang} • {voice.localService ? "Native" : "Cloud"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleTest(e, voice)}
                    className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    title="Test Voice"
                  >
                    <Play className={DS.ICON.SM + " fill-current"} />
                  </button>
                </button>
              );
            })
          )}
        </div>

        <div className={DS.MODAL.FOOTER}>
          <p>Voices loaded from system API v3.0</p>
        </div>
      </div>
    </div>
  );
}
