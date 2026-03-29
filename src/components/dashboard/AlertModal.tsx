"use client";

import { useState } from "react";
import { IndexId } from "@/types";
import { INDICES, ZONES } from "@/lib/constants";
import { X, BellRing, CheckCircle2 } from "lucide-react";
import { DS } from "@/lib/design-system";

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
    <div className={DS.MODAL.OVERLAY}>
      <div className={DS.MODAL.CONTENT}>
        {submitted ? (
          <div className="p-10 text-center space-y-6">
            <div className={`w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-500/10`}>
              <CheckCircle2 className={DS.ICON.LG} />
            </div>
            <div className="space-y-2">
              <h2 className={DS.TEXT.H1}>Alert Activated</h2>
              <p className={DS.TEXT.BODY}>
                We&apos;ll notify <span className={DS.TEXT.BODY_STRONG}>{email}</span> when <span className={DS.TEXT.BODY_STRONG}>{indexMeta?.name}</span> enters the selected zone.
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
            <div className={DS.MODAL.HEADER}>
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
                  <BellRing className={DS.ICON.MD} />
                </div>
                <div>
                  <h2 className={DS.TEXT.H1 + " uppercase"}>Create Alert</h2>
                  <p className={DS.TEXT.MUTED_CAPS}>{indexMeta?.name}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-muted hover:text-foreground hover:bg-background rounded-full transition-all"
              >
                <X className={DS.ICON.MD} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="space-y-3">
                <label className={DS.TEXT.MUTED_CAPS + " ml-1"}>Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={DS.INPUT.BASE + " px-5 py-4"}
                />
              </div>

              <div className="space-y-4">
                <label className={DS.TEXT.MUTED_CAPS + " ml-1"}>Target Zone</label>
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
                        <div className={`${DS.DOT.MD} rounded-full ${z.bgColor}`} />
                        <span className={`font-black uppercase tracking-widest text-[10px] ${targetZone === z.zone ? "text-blue-500" : "text-foreground"}`}>
                          {z.label}
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        targetZone === z.zone ? "border-blue-500 bg-blue-500" : "border-border"
                      }`}>
                        {targetZone === z.zone && <div className={`${DS.DOT.SM} bg-white rounded-full`} />}
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
