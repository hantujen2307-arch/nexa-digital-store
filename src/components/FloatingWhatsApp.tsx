'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { createWhatsAppUrl } from '@/lib/whatsapp';

export default function FloatingWhatsApp() {
  const whatsappUrl = createWhatsAppUrl();

  return (
    <div className="fixed bottom-6 right-6 z-40 group">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hubungi Admin WhatsApp"
        className="relative flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-950/60 border border-emerald-400/30 transition-all duration-300 transform hover:scale-105 active:scale-95"
      >
        {/* Pulse ring */}
        <span className="absolute -inset-0.5 rounded-full bg-emerald-500/40 animate-ping pointer-events-none" />

        <MessageCircle className="w-5 h-5 relative z-10 shrink-0 fill-current" />
        
        <span className="text-xs font-bold tracking-wide relative z-10 hidden sm:inline-block">
          Chat WhatsApp
        </span>
      </a>
    </div>
  );
}
