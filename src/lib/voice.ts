/**
 * Web Speech API wrapper for voice commands and text-to-speech.
 */

const VOICE_PREF_KEY = "nifty-pulse-voice-preference";

export interface VoiceCommand {
  pattern: RegExp;
  action: string; // identifier for the command
}

export const VOICE_COMMANDS: VoiceCommand[] = [
  { pattern: /check\s*(nifty\s*50|nifty fifty)/i, action: "switch:nifty-50" },
  { pattern: /check\s*(next\s*50|nifty next)/i, action: "switch:nifty-next-50" },
  { pattern: /check\s*(mid\s*cap|midcap)/i, action: "switch:nifty-midcap-150" },
  { pattern: /check\s*(small\s*cap|smallcap)/i, action: "switch:nifty-smallcap-250" },
  { pattern: /check\s*(large\s*mid|largemid)/i, action: "switch:nifty-largemidcap-250" },
  { pattern: /check\s*(nifty\s*500|five hundred)/i, action: "switch:nifty-500" },
  { pattern: /show\s*(nifty\s*50|nifty fifty)/i, action: "switch:nifty-50" },
  { pattern: /show\s*(next\s*50)/i, action: "switch:nifty-next-50" },
  { pattern: /show\s*(mid\s*cap|midcap)/i, action: "switch:nifty-midcap-150" },
  { pattern: /show\s*(small\s*cap|smallcap)/i, action: "switch:nifty-smallcap-250" },
  { pattern: /show\s*(large\s*mid|largemid)/i, action: "switch:nifty-largemidcap-250" },
  { pattern: /show\s*(nifty\s*500|five hundred)/i, action: "switch:nifty-500" },
  { pattern: /what.*wisdom|today.*wisdom|wisdom.*today/i, action: "read:thirukkural" },
  { pattern: /what.*signal|signal.*today|current.*signal/i, action: "read:signal" },
];

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "speechSynthesis" in window;
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined") return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
}

export function getPreferredVoiceName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(VOICE_PREF_KEY);
}

export function savePreferredVoiceName(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VOICE_PREF_KEY, name);
}

export function parseVoiceCommand(transcript: string): string | null {
  for (const cmd of VOICE_COMMANDS) {
    if (cmd.pattern.test(transcript)) {
      return cmd.action;
    }
  }
  return null;
}

export function speak(text: string, lang?: string): void {
  if (!isSpeechSynthesisSupported()) return;
  const utterance = new SpeechSynthesisUtterance(text);
  
  const voices = window.speechSynthesis.getVoices();
  
  if (lang) {
    // Search for explicit language match
    const langVoice = voices.find((v) => v.lang.startsWith(lang));
    if (langVoice) {
      utterance.voice = langVoice;
      utterance.lang = lang;
    }
  } else {
    // English preference logic
    const prefName = getPreferredVoiceName();
    if (prefName) {
      const preferred = voices.find((v) => v.name === prefName);
      if (preferred) utterance.voice = preferred;
    } else {
      // Smart default: prioritize Google High quality English voices
      const googleVoice = voices.find(
        (v) => v.name.includes("Google") && v.lang.startsWith("en")
      ) || voices.find(
        (v) => (v.name.includes("Premium") || v.name.includes("Enhanced")) && v.lang.startsWith("en")
      ) || voices.find((v) => v.lang.startsWith("en"));
      
      if (googleVoice) utterance.voice = googleVoice;
    }
  }

  utterance.rate = 0.75;
  utterance.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export type SpeechRecognitionType = typeof window extends { SpeechRecognition: infer T } ? T : unknown;

export function createSpeechRecognition(
  onResult: (transcript: string) => void,
  onEnd: () => void,
  onError?: (error: string) => void,
): { start: () => void; stop: () => void } | null {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognitionClass =
    (window as unknown as Record<string, unknown>).SpeechRecognition ??
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

  if (!SpeechRecognitionClass) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognition = new (SpeechRecognitionClass as any)();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-IN";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onend = () => onEnd();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onerror = (event: any) => {
    if (onError) onError(event.error);
    onEnd();
  };

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
  };
}
