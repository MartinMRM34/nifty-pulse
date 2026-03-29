"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import {
  isSpeechRecognitionSupported,
  createSpeechRecognition,
  parseVoiceCommand,
} from "@/lib/voice";
import { IndexId } from "@/types";
import { DS } from "@/lib/design-system";

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

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = createSpeechRecognition(
      handleResult,
      () => setIsListening(false),
    );
    if (rec) {
      recognitionRef.current = rec;
      rec.start();
      setIsListening(true);
    }
  }, [isListening, handleResult]);

  if (!supported) return null;

  return (
    <button
      onClick={toggleListening}
      className={`relative p-2.5 rounded-full border ${DS.ANIM.TRANSITION} shadow-sm group ${
        isListening
          ? "bg-rose-500 text-white border-rose-400 scale-110 shadow-lg shadow-rose-500/20"
          : "bg-background text-muted border-border hover:border-blue-400 hover:text-foreground"
      }`}
      title={isListening ? "Stop listening" : "Voice command"}
    >
      {isListening ? (
        <div className="relative z-10">
          <MicOff className={DS.ICON.SM} />
        </div>
      ) : (
        <Mic className={DS.ICON.SM} />
      )}
      {isListening && (
        <div className="absolute inset-0 rounded-full animate-ping bg-rose-500 opacity-40 scale-125" />
      )}
    </button>
  );
}
