'use client';

import React from 'react';

export default function CommercialLightSweep() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-45 flex items-center justify-center select-none animate-intro-big-sweep">
      {/* 1. Broad soft ambient glow sweep across the viewport */}
      <div className="w-[55vw] sm:w-[42vw] h-[260%] -rotate-20 bg-gradient-to-r from-transparent via-cyan-400/15 via-white/35 via-sky-300/15 to-transparent blur-2xl" />
      {/* 2. Concentrated crystalline glossy specular beam */}
      <div className="absolute w-28 sm:w-44 h-[260%] -rotate-20 bg-gradient-to-r from-transparent via-white/85 via-cyan-200/90 to-transparent blur-md" />
      {/* 3. Intense laser slit at the core */}
      <div className="absolute w-1.5 sm:w-2 h-[260%] -rotate-20 bg-white shadow-[0_0_35px_rgba(56,189,248,0.9)]" />
      {/* 4. Subtle horizontal anamorphic lens glare line */}
      <div className="absolute w-full h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300/50 via-white to-transparent blur-[1px]" />
    </div>
  );
}

