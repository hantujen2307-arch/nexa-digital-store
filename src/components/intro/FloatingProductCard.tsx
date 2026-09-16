'use client';

import React from 'react';

interface FloatingProductCardProps {
  icon: React.ReactNode;
  category: string;
  title: string;
  badge: string;
  gradient: string;
  animationClass: string;
}

export default function FloatingProductCard({
  icon,
  category,
  title,
  badge,
  gradient,
  animationClass,
}: FloatingProductCardProps) {
  return (
    <div
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none preserve-3d ${animationClass}`}
    >
      {/* 3D Glassmorphism Panel */}
      <div
        className="relative w-44 sm:w-52 h-28 sm:h-32 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between overflow-hidden backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.85)] bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-950/95"
      >
        {/* Top Edge Specular Reflection (Glass highlight) */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        {/* Ambient colored rim-glow from card theme */}
        <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full opacity-35 blur-xl ${gradient}`} />

        {/* Dynamic Specular Sheen sweep across glass */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden animate-intro-card-sheen">
          <div className="w-16 h-[200%] -rotate-25 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm" />
        </div>

        {/* Top Row: Icon + Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl p-1.5 flex items-center justify-center bg-white/10 border border-white/15 shadow-inner">
            {icon}
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-zinc-200 tracking-wider">
            {badge}
          </span>
        </div>

        {/* Bottom Row: Category & Title */}
        <div className="relative z-10">
          <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-cyan-400 uppercase block mb-0.5">
            {category}
          </span>
          <h4 className="text-xs sm:text-sm font-black text-white truncate tracking-tight">
            {title}
          </h4>
        </div>
      </div>
    </div>
  );
}
