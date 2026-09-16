'use client';

import React from 'react';

export default function DigitalWorldBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* 1. Perspective Cyber Grid Floor (Scene 1: 0.0s - 0.8s depth entrance) */}
      <div 
        className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] opacity-25 animate-intro-cyber-grid"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(56, 189, 248, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />

      {/* 2. Deep Ambient Bloom Core */}
      <div className="absolute top-1/2 left-1/2 w-[550px] h-[550px] sm:w-[800px] sm:h-[800px] rounded-full bg-gradient-to-tr from-cyan-600/30 via-indigo-600/25 to-purple-800/20 blur-[150px] animate-intro-ambient-bloom" />

      {/* 3. Glowing Digital Concentric Ring */}
      <div className="absolute top-1/2 left-1/2 w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] rounded-full border border-cyan-400/25 border-dashed animate-intro-digital-ring shadow-[0_0_50px_rgba(6,182,212,0.25)]">
        {/* Inner concentric ring */}
        <div className="absolute inset-6 rounded-full border border-indigo-400/20" />
        <div className="absolute inset-14 rounded-full border border-purple-400/15 border-dotted" />
      </div>

      {/* 4. Very Subtle Floating Specular Dust (Commercial Lighting) */}
      <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-cyan-300/60 blur-[1px] animate-pulse" />
      <div className="absolute top-3/4 left-1/3 w-1 h-1 rounded-full bg-indigo-300/50 blur-[0.5px]" />
      <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-cyan-400/50 blur-[1.5px] animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-1 h-1 rounded-full bg-purple-300/60 blur-[0.5px]" />
    </div>
  );
}
