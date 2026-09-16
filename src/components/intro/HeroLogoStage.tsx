'use client';

import React from 'react';
import { STORE_NAME, STORE_SUBTITLE, STORE_LOGO_URL } from '@/data/config';
import { Sparkles } from 'lucide-react';

export default function HeroLogoStage() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center text-center pointer-events-none select-none">
      {/* 1. Hero Product Logo (Scene 5: 3.5s - 4.2s) */}
      <div className="animate-intro-hero-logo mb-5">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 p-[2.5px] shadow-[0_0_60px_rgba(6,182,212,0.4)]">
          {/* Intense ambient bloom halo */}
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 opacity-60 blur-2xl animate-pulse" />

          {/* Inner Stage Glass Container */}
          <div className="relative w-full h-full bg-[#08080d] rounded-[22px] flex items-center justify-center overflow-hidden border border-white/20">
            {/* Top specular edge */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/70 to-transparent" />

            {STORE_LOGO_URL ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={STORE_LOGO_URL}
                alt={STORE_NAME}
                className="w-full h-full object-contain p-4"
              />
            ) : (
              <Sparkles className="w-12 h-12 sm:w-14 sm:h-14 text-cyan-400 drop-shadow-[0_0_16px_rgba(34,211,238,0.8)]" />
            )}

            {/* Specular Glint sweep */}
            <div className="absolute inset-0 pointer-events-none animate-intro-card-sheen flex items-center">
              <div className="w-10 h-[180%] -rotate-25 bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[1px]" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Brand Typography Reveal (Scene 7: 4.4s - 5.0s) */}
      <div className="relative px-6">
        <h1 className="animate-intro-brand-title text-4xl sm:text-6xl font-black uppercase tracking-tight text-white mb-2.5 drop-shadow-[0_4px_30px_rgba(255,255,255,0.25)]">
          {STORE_NAME}
        </h1>

        <p className="animate-intro-brand-subtitle text-xs sm:text-sm font-bold tracking-[0.4em] uppercase text-cyan-400 drop-shadow-[0_0_18px_rgba(6,182,212,0.6)]">
          {STORE_SUBTITLE}
        </p>
      </div>
    </div>
  );
}
