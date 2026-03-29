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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-transparent dark:border-gray-800">
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Alert Created!</h2>
            <p className="text-gray-500 dark:text-gray-400">
              We&apos;ll notify <strong>{email}</strong> when {indexMeta?.name} enters the selected zone.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 w-full py-3 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-xl font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Alert</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{indexMeta?.name}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notify me when index is</label>
                <div className="grid grid-cols-1 gap-2">
                  {ZONES.slice(0, 3).map((z) => (
                    <button
                      key={z.zone}
                      type="button"
                      onClick={() => setTargetZone(z.zone)}
                      className={`px-4 py-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        targetZone === z.zone
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                      }`}
                    >
                      <span className={`font-semibold ${z.textColor}`}>{z.label}</span>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        targetZone === z.zone ? "border-blue-500" : "border-gray-300 dark:border-gray-600"
                      }`}>
                        {targetZone === z.zone && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
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
