/**
 * Web Speech API wrapper for voice commands and text-to-speech.
 */

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

export function parseVoiceCommand(transcript: string): string | null {
  for (const cmd of VOICE_COMMANDS) {
    if (cmd.pattern.test(transcript)) {
      return cmd.action;
    }
  }
  return null;
}

export function speak(text: string): void {
  if (!isSpeechSynthesisSupported()) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export type SpeechRecognitionType = typeof window extends { SpeechRecognition: infer T } ? T : unknown;

export function createSpeechRecognition(
  onResult: (transcript: string) => void,
  onEnd: () => void,
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
  recognition.onerror = () => onEnd();

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
  };
}
