'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-300">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md max-w-sm ${
          isSuccess
            ? 'bg-zinc-950/95 border-emerald-500/50 text-emerald-300'
            : isError
            ? 'bg-zinc-950/95 border-red-500/50 text-red-300'
            : 'bg-zinc-950/95 border-cyan-500/50 text-cyan-300'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {isError && <AlertCircle className="w-5 h-5 text-red-400" />}
        </div>

        <div className="flex-1 text-xs">
          {toast.title && <h5 className="font-bold text-white mb-0.5">{toast.title}</h5>}
          <p className="text-zinc-300 leading-relaxed">{toast.text}</p>
        </div>

        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
