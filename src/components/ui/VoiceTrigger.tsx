"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Mic, MicOff, Settings2, HelpCircle } from "lucide-react";
import {
  isSpeechRecognitionSupported,
  createSpeechRecognition,
  parseVoiceCommand,
  speak,
} from "@/lib/voice";
import { IndexId } from "@/types";
import { DS } from "@/lib/design-system";
import VoiceSettings from "./VoiceSettings";
import VoiceCommandGuide from "./VoiceCommandGuide";

interface VoiceTriggerProps {
  onIndexChange: (id: IndexId) => void;
  onReadThirukkural: () => void;
  onReadSignal: () => void;
}

export default function VoiceTrigger({
  onIndexChange,
  onReadThirukkural,
  onReadSignal,
}: VoiceTriggerProps) {
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  const handleResult = useCallback(
    (transcript: string) => {
      const action = parseVoiceCommand(transcript);
      if (!action) return;

      if (action.startsWith("switch:")) {
        const indexId = action.replace("switch:", "") as IndexId;
        onIndexChange(indexId);
      } else if (action === "read:thirukkural") {
        onReadThirukkural();
      } else if (action === "read:signal") {
        onReadSignal();
      }
    },
    [onIndexChange, onReadThirukkural, onReadSignal],
  );

  const handleError = useCallback((error: string) => {
    setErrorStatus(error);
    if (error === "not-allowed") {
      speak("Microphone permission was denied. Please allow access in your browser settings.");
    }
    // Clear error after 3 seconds
    setTimeout(() => {
      setErrorStatus(null);
    }, 3000);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    setErrorStatus(null);
    const rec = createSpeechRecognition(
      handleResult,
      () => setIsListening(false),
      handleError,
    );
    if (rec) {
      recognitionRef.current = rec;
      rec.start();
      setIsListening(true);
    }
  }, [isListening, handleResult, handleError]);

  if (!supported) return null;

  return (
    <div className="flex items-center">
      <div className={`flex items-center gap-1 p-1 bg-background border border-border shadow-sm rounded-full transition-all hover:border-blue-500/30 ${isListening ? 'pr-3' : 'pr-1.5'}`}>
        <button
          onClick={toggleListening}
          className={`relative p-2 rounded-full ${DS.ANIM.TRANSITION} group ${
            isListening
              ? "bg-rose-500 text-white border-rose-400 scale-105 shadow-lg shadow-rose-500/20"
              : errorStatus
              ? "bg-rose-50 text-rose-500 animate-shake"
              : "text-muted hover:text-blue-500 hover:bg-muted/5"
          }`}
          title={isListening ? "Stop listening" : errorStatus ? `Error: ${errorStatus}` : "Voice command"}
        >
          {isListening ? (
            <div className="relative z-10">
              <MicOff className={DS.ICON.SM} />
            </div>
          ) : (
            <Mic className={DS.ICON.SM + (errorStatus ? " text-rose-500" : "")} />
          )}
          {isListening && (
            <div className="absolute inset-0 rounded-full animate-ping bg-rose-500 opacity-40 scale-125" />
          )}
        </button>

        {!isListening && (
          <>
            <div className="w-[1px] h-4 bg-border/40 mx-0.5" />
            <button
              onClick={() => setShowGuide(true)}
              className={`p-2 rounded-full text-muted hover:text-blue-500 hover:bg-muted/10 transition-all group`}
              title="Command Guide"
            >
              <HelpCircle className={DS.ICON.SM + " opacity-60 group-hover:opacity-100"} />
            </button>
            <div className="w-[1px] h-4 bg-border/40 mx-0.5" />
            <button
              onClick={() => setShowSettings(true)}
              className={`p-2 rounded-full text-muted hover:text-blue-500 hover:bg-muted/10 transition-all group`}
              title="Voice Settings"
            >
              <Settings2 className={DS.ICON.SM + " opacity-60 group-hover:opacity-100"} />
            </button>
          </>
        )}
      </div>

      <VoiceSettings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      <VoiceCommandGuide
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />
    </div>
  );
}
