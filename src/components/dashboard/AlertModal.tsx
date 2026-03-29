"use client";

import { useState } from "react";
import { IndexId } from "@/types";
import { INDICES, ZONES } from "@/lib/constants";
import { X, BellRing, CheckCircle2 } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  indexId: IndexId;
}

export default function AlertModal({ isOpen, onClose, indexId }: AlertModalProps) {
  const [email, setEmail] = useState("");
  const [targetZone, setTargetZone] = useState("undervalued");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const indexMeta = INDICES.find((i) => i.id === indexId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setEmail("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
        {submitted ? (
          <div className="p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground tracking-tight">Alert Activated</h2>
              <p className="text-muted font-medium">
                We&apos;ll notify <span className="text-foreground font-bold">{email}</span> when <span className="text-foreground font-bold">{indexMeta?.name}</span> enters the selected zone.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="mt-8 w-full py-4 bg-foreground text-background hover:opacity-90 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-6 border-b border-border bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Create Alert</h2>
                  <p className="text-[10px] text-muted font-black uppercase tracking-widest opacity-60">{indexMeta?.name}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-muted hover:text-foreground hover:bg-background rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-5 py-4 rounded-2xl border border-border bg-background text-foreground focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-muted/40 font-bold"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Target Zone</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {ZONES.slice(0, 3).map((z) => (
                    <button
                      key={z.zone}
                      type="button"
                      onClick={() => setTargetZone(z.zone)}
                      className={`px-5 py-4 rounded-2xl border transition-all flex items-center justify-between group ${
                        targetZone === z.zone
                          ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10"
                          : "border-border bg-background hover:border-blue-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${z.bgColor}`} />
                        <span className={`font-black uppercase tracking-widest text-[10px] ${targetZone === z.zone ? "text-blue-500" : "text-foreground"}`}>
                          {z.label}
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        targetZone === z.zone ? "border-blue-500 bg-blue-500" : "border-border"
                      }`}>
                        {targetZone === z.zone && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/25 transition-all active:scale-95"
              >
                Set Alert
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
