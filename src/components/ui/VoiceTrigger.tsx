"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import {
  isSpeechRecognitionSupported,
  createSpeechRecognition,
  parseVoiceCommand,
} from "@/lib/voice";
import { IndexId } from "@/types";

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
      className={`relative p-2.5 rounded-full transition-all ${
        isListening
          ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      }`}
      title={isListening ? "Stop listening" : "Voice command"}
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      {isListening && (
        <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-30" />
      )}
    </button>
  );
}
