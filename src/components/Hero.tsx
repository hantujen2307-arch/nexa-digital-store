import React from 'react';
import { Sparkles, MessageCircle, ArrowRight, ShieldCheck, Zap, Star } from 'lucide-react';
import { createWhatsAppUrl } from '@/lib/whatsapp';

export default function Hero() {
  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] md:w-[750px] md:h-[450px] bg-gradient-to-tr from-cyan-600/15 via-indigo-600/15 to-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-medium text-zinc-300 mb-6 shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Katalog Resmi & Bergaransi</span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400 font-semibold">Proses Cepat 5-15 Menit</span>
          </div>

          {/* Headline requested: APLIKASI PREMIUM & DIGITAL SERVICE */}
          <h1 className="hero-title-entrance text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase leading-[1.15] mb-5">
            APLIKASI PREMIUM &{' '}
            <span className="brand-gradient-text block sm:inline">
              DIGITAL SERVICE
            </span>
          </h1>

          {/* Subtitle requested */}
          <p className="hero-subtitle-entrance text-sm sm:text-base md:text-lg text-zinc-400 leading-relaxed mb-8 max-w-2xl mx-auto">
            Temukan aplikasi premium, jasa editing, dan berbagai promo digital dengan proses pemesanan yang mudah.
          </p>

          {/* Buttons requested: "Lihat Produk" and "Chat WhatsApp" */}
          <div className="hero-cta-entrance flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <a
              href="#aplikasi"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-zinc-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <span>Lihat Produk</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href={createWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-zinc-200 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Chat WhatsApp</span>
            </a>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto pt-6 border-t border-zinc-800/60">
            <div className="flex items-center justify-center gap-2 text-zinc-300 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Bergaransi</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-zinc-300 text-xs font-medium">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Proses Cepat</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-zinc-300 text-xs font-medium">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <span>Rating 4.9/5.0</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
