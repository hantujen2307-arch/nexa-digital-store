'use client';

import React, { useState, useEffect } from 'react';
import CurtainIrisPanels from './intro/CurtainIrisPanels';
import DigitalWorldBackground from './intro/DigitalWorldBackground';
import FloatingProductCard from './intro/FloatingProductCard';
import HeroLogoStage from './intro/HeroLogoStage';
import CommercialLightSweep from './intro/CommercialLightSweep';
import { Film, Bot, Palette, Zap, Ticket } from 'lucide-react';

export default function IntroAnimation() {
  // Initial state: true agar langsung aktif di frame 0 tanpa jeda atau FOC
  const [isIntroVisible, setIsIntroVisible] = useState(true);

  useEffect(() => {
    // Debug log saat intro dimulai
    console.log("INTRO STARTED");

    if (typeof document !== 'undefined') {
      document.body.classList.add('intro-active');
      document.body.style.overflow = 'hidden';
    }

    // Tepat ±7.0 detik (7000ms) luxury cinematic commercial completion
    const timer = setTimeout(() => {
      console.log("INTRO FINISHED");
      setIsIntroVisible(false);

      if (typeof document !== 'undefined') {
        document.body.classList.remove('intro-active');
        document.body.style.overflow = '';
      }
    }, 7000);

    return () => {
      clearTimeout(timer);
      if (typeof document !== 'undefined') {
        document.body.classList.remove('intro-active');
        document.body.style.overflow = '';
      }
    };
  }, []);

  const handleSkip = () => {
    console.log("INTRO FINISHED (SKIPPED)");
    setIsIntroVisible(false);

    if (typeof document !== 'undefined') {
      document.body.classList.remove('intro-active');
      document.body.style.overflow = '';
    }
  };

  if (!isIntroVisible) return null;

  return (
    <div
      id="intro-tv-commercial-stage"
      className="fixed inset-0 w-full h-[100dvh] bg-[#050507] flex items-center justify-center overflow-hidden select-none perspective-stage animate-intro-commercial-overlay"
      style={{
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100dvh',
      }}
      aria-hidden="true"
    >
      {/* 1. Scene 1: Digital World Atmosphere (Grid, Rings, Depth Bloom) */}
      <DigitalWorldBackground />

      {/* 2. Opening Curtain / Iris Panels (0.0s - 2.5s initial opening, 6.3s - 7.0s slow exit) */}
      <CurtainIrisPanels />

      {/* 3. 3D Floating Stage with Specular Bloom Highlight & Camera Pullback (scale 1 -> 0.97) */}
      <div className="relative w-full h-full max-w-5xl max-h-[700px] flex items-center justify-center preserve-3d animate-intro-stage-bloom animate-intro-stage-camera">
        
        {/* ===================================================================
            SCENES 2, 3, 4: FLOATING 3D DIGITAL PRODUCT CARDS
            Desktop: 5 cards (Cards 1-5)
            Mobile: 3 cards (Cards 1-3)
            =================================================================== */}

        {/* CARD 1: Left - Streaming & Entertainment */}
        <FloatingProductCard
          icon={<Film className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />}
          category="STREAMING"
          title="Netflix & Spotify"
          badge="4K UHD"
          gradient="bg-red-500"
          animationClass="animate-intro-card-1"
        />

        {/* CARD 2: Right - AI & Intelligence */}
        <FloatingProductCard
          icon={<Bot className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />}
          category="AI TOOLS"
          title="ChatGPT Plus"
          badge="GPT-4o"
          gradient="bg-emerald-500"
          animationClass="animate-intro-card-2"
        />

        {/* CARD 3: Center-Bottom - Creative & Video */}
        <FloatingProductCard
          icon={<Palette className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />}
          category="CREATIVE"
          title="Canva Pro & Editing"
          badge="PRO PASS"
          gradient="bg-cyan-500"
          animationClass="animate-intro-card-3"
        />

        {/* CARD 4: Top-Left - Productivity & Cloud (Desktop / Tablet) */}
        <div className="hidden md:block">
          <FloatingProductCard
            icon={<Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />}
            category="PREMIUM"
            title="YouTube Premium"
            badge="NO ADS"
            gradient="bg-amber-500"
            animationClass="animate-intro-card-4"
          />
        </div>

        {/* CARD 5: Bottom-Right - Cinema & Promo (Desktop / Tablet) */}
        <div className="hidden md:block">
          <FloatingProductCard
            icon={<Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />}
            category="TIKET BIOSKOP"
            title="XXI & CGV Promo"
            badge="HEMAT"
            gradient="bg-orange-500"
            animationClass="animate-intro-card-5"
          />
        </div>

        {/* ===================================================================
            SCENES 5 & 7: HERO LOGO STAGE + BRAND NAME LOCKUP
            =================================================================== */}
        <HeroLogoStage />
      </div>

      {/* 4. Full-Viewport Glossy Commercial Light Sweep Bridge (Detik 6.3 - 6.8: LEFT -> RIGHT) */}
      <CommercialLightSweep />

      {/* Discreet Skip Button */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute bottom-6 right-6 z-50 text-[11px] font-medium text-zinc-400 hover:text-white transition-colors px-3.5 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md shadow-lg cursor-pointer"
        aria-label="Lewati intro komersial"
      >
        Lewati
      </button>
    </div>
  );
}
