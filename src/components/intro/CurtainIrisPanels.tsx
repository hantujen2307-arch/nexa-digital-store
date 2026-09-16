'use client';

import React from 'react';

export default function CurtainIrisPanels() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-35">
      {/* LEFT CURVED PANEL: Covers left half + convex rounded curve past center */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 -left-[30vw] sm:-left-[20vw] w-[85vw] sm:w-[75vw] h-[150vh] rounded-[100%] bg-gradient-to-r from-[#030305] via-[#050508] to-[#08080f] border-r border-cyan-400/25 shadow-[20px_0_80px_rgba(0,0,0,0.95)] animate-intro-curtain-left"
        style={{
          boxShadow: '25px 0 90px rgba(6, 182, 212, 0.25), 50px 0 120px rgba(0, 0, 0, 0.95)',
        }}
      >
        {/* Subtle rim sheen on the curved edge */}
        <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-300/50 to-transparent blur-[1px]" />
      </div>

      {/* RIGHT CURVED PANEL: Covers right half + convex rounded curve past center */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 -right-[30vw] sm:-right-[20vw] w-[85vw] sm:w-[75vw] h-[150vh] rounded-[100%] bg-gradient-to-l from-[#030305] via-[#050508] to-[#08080f] border-l border-cyan-400/25 shadow-[-20px_0_80px_rgba(0,0,0,0.95)] animate-intro-curtain-right"
        style={{
          boxShadow: '-25px 0 90px rgba(6, 182, 212, 0.25), -50px 0 120px rgba(0, 0, 0, 0.95)',
        }}
      >
        {/* Subtle rim sheen on the curved edge */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-indigo-300/50 to-transparent blur-[1px]" />
      </div>

      {/* CENTER SEAM GLOW (0.0s - 1.5s Pulsing Slit, then flares & opens at 1.5s - 2.3s) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-[65vh] animate-intro-curtain-seam flex items-center justify-center pointer-events-none">
        {/* Bright core slit */}
        <div className="w-[2px] h-full bg-gradient-to-b from-transparent via-white via-cyan-300 to-transparent shadow-[0_0_25px_rgba(56,189,248,0.9)]" />
        {/* Cyan bloom aura */}
        <div className="absolute w-12 h-3/4 bg-cyan-400/40 rounded-full blur-xl" />
      </div>
    </div>
  );
}
