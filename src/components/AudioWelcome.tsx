'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Volume2, VolumeX } from 'lucide-react';

const WELCOME_TEXT = 'Selamat datang di website Alpin Premium, selamat berbelanja.';
const SESSION_KEY = 'alpinWelcomePlayed';
const TARGET_MUSIC_VOLUME = 0.2;
const FADE_IN_DURATION_MS = 2000;
const FADE_IN_INTERVAL_MS = 50;

export default function AudioWelcome() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  // UI state
  const [isMounted, setIsMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [needsActivation, setNeedsActivation] = useState(false);
  const [hasVoicePlayed, setHasVoicePlayed] = useState(false);

  // Audio & Speech refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const hasAttemptedAudioRef = useRef(false);

  // Helper: Find best Indonesian voice or default fallback
  const getIndonesianVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Prioritas 1: Voice ID-id eksplisit
    const idVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().replace('_', '-') === 'id-id' ||
        v.lang.toLowerCase().startsWith('id') ||
        v.name.toLowerCase().includes('indonesia') ||
        v.name.toLowerCase().includes('indonesian')
    );

    return idVoice || voices[0] || null;
  }, []);

  // Helper: Smooth background music fade-in
  const fadeInMusic = useCallback(() => {
    if (!audioRef.current) return;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    const audio = audioRef.current;
    audio.volume = 0;
    audio.muted = false;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsMuted(false);
          setNeedsActivation(false);

          const totalSteps = FADE_IN_DURATION_MS / FADE_IN_INTERVAL_MS;
          const stepVolume = TARGET_MUSIC_VOLUME / totalSteps;

          fadeIntervalRef.current = setInterval(() => {
            if (!audioRef.current) {
              if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
              return;
            }
            if (audioRef.current.volume + stepVolume < TARGET_MUSIC_VOLUME) {
              audioRef.current.volume += stepVolume;
            } else {
              audioRef.current.volume = TARGET_MUSIC_VOLUME;
              if (fadeIntervalRef.current) {
                clearInterval(fadeIntervalRef.current);
                fadeIntervalRef.current = null;
              }
            }
          }, FADE_IN_INTERVAL_MS);
        })
        .catch((err) => {
          console.warn('[AudioWelcome] Background music play blocked or unavailable:', err?.message || err);
          // Autoplay blocked by browser policy
          if (err?.name === 'NotAllowedError') {
            setNeedsActivation(true);
          }
        });
    }
  }, []);

  // Helper: Execute voice greeting
  const playVoiceWelcome = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Pastikan speech synthesis didukung
    if (!('speechSynthesis' in window)) {
      console.warn('[AudioWelcome] Speech synthesis not supported by this browser.');
      try {
        sessionStorage.setItem(SESSION_KEY, 'true');
      } catch {}
      setHasVoicePlayed(true);
      fadeInMusic();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Bersihkan queue sebelumnya

      const utterance = new SpeechSynthesisUtterance(WELCOME_TEXT);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95; // Kecepatan ramah, natural & jelas
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voice = getIndonesianVoice();
      if (voice) {
        utterance.voice = voice;
      }

      speechUtteranceRef.current = utterance;

      let hasEnded = false;
      const onVoiceFinished = () => {
        if (hasEnded) return;
        hasEnded = true;
        try {
          sessionStorage.setItem(SESSION_KEY, 'true');
        } catch {}
        setHasVoicePlayed(true);
        // Setelah voice selesai, fade-in background music
        fadeInMusic();
      };

      utterance.onend = onVoiceFinished;
      utterance.onerror = (e) => {
        console.warn('[AudioWelcome] Speech synthesis error:', e);
        onVoiceFinished();
      };

      // Fallback timer: jaga-jaga jika event onend browser stall/hang (isu umum Chromium)
      setTimeout(() => {
        if (!hasEnded) {
          onVoiceFinished();
        }
      }, 5500);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[AudioWelcome] Failed to speak welcome utterance:', err);
      try {
        sessionStorage.setItem(SESSION_KEY, 'true');
      } catch {}
      setHasVoicePlayed(true);
      fadeInMusic();
    }
  }, [fadeInMusic, getIndonesianVoice]);

  // Main trigger: Opening complete sequence
  const handleOpeningFinished = useCallback(() => {
    if (hasAttemptedAudioRef.current) return;
    hasAttemptedAudioRef.current = true;

    let alreadyPlayed = false;
    try {
      alreadyPlayed = sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch {}

    if (alreadyPlayed) {
      setHasVoicePlayed(true);
      // Jika sudah pernah diputar di sesi ini, langsung jalankan background music
      fadeInMusic();
    } else {
      // Putar voice welcome pertama kali di sesi ini
      playVoiceWelcome();
    }
  }, [fadeInMusic, playVoiceWelcome]);

  // Handle user manual activation (e.g. if browser blocked initial autoplay)
  const handleManualActivate = useCallback(() => {
    setNeedsActivation(false);
    let alreadyPlayed = false;
    try {
      alreadyPlayed = sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch {}

    if (!alreadyPlayed) {
      playVoiceWelcome();
    } else {
      fadeInMusic();
    }
  }, [fadeInMusic, playVoiceWelcome]);

  // Handle Mute / Unmute toggle (does NOT re-trigger voice welcome)
  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;

    if (isMuted) {
      audioRef.current.muted = false;
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
      setIsMuted(false);
      setIsPlaying(true);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
      // Hentikan voice jika masih bersuara
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isMuted]);

  // Mount effect: Inisialisasi Audio element dan listen event opening
  useEffect(() => {
    setIsMounted(true);

    if (isAdmin) return;

    // Cek status session storage
    try {
      if (sessionStorage.getItem(SESSION_KEY) === 'true') {
        setHasVoicePlayed(true);
      }
    } catch {}

    // Inisialisasi single HTMLAudioElement untuk background music
    const audio = new Audio('/audio/alpin-background.mp3');
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;

    // Graceful error handling jika file alpin-background.mp3 belum ada
    audio.addEventListener('error', () => {
      // File belum ada di public/audio/, jangan crash dan jangan tampilkan error merah
      console.info('[AudioWelcome] File /audio/alpin-background.mp3 belum diunggah atau tidak ditemukan.');
    });

    audioRef.current = audio;

    // Pre-load voices untuk Chromium
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    // Listener custom event dari IntroAnimation
    const onIntroCompleted = () => {
      handleOpeningFinished();
    };

    window.addEventListener('alpin:intro-completed', onIntroCompleted);

    // Fallback: Jika halaman tidak memiliki intro stage (misalnya direct route /produk/xyz)
    const introStage = document.getElementById('intro-tv-commercial-stage');
    if (!introStage) {
      // Tidak ada intro stage di halaman ini, jalankan audio setelah mount singkat
      const fallbackTimer = setTimeout(() => {
        handleOpeningFinished();
      }, 800);

      return () => {
        clearTimeout(fallbackTimer);
        window.removeEventListener('alpin:intro-completed', onIntroCompleted);
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }

    return () => {
      window.removeEventListener('alpin:intro-completed', onIntroCompleted);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [handleOpeningFinished, isAdmin]);

  // Jangan render di SSR atau pada halaman admin
  if (!isMounted || isAdmin) return null;

  return (
    <div
      className="fixed bottom-20 sm:bottom-22 right-6 z-40 flex items-center select-none"
      aria-live="polite"
    >
      {needsActivation ? (
        // State 1: Autoplay diblokir browser -> Tampilkan tombol kecil elegan "🔊 Aktifkan Suara"
        <button
          type="button"
          onClick={handleManualActivate}
          className="group relative flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-zinc-900/90 hover:bg-zinc-850 text-zinc-200 hover:text-white border border-cyan-500/40 hover:border-cyan-400 shadow-xl shadow-black/40 backdrop-blur-md transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          title="Klik untuk mengaktifkan sambutan suara & musik background"
          aria-label="Aktifkan Suara Sambutan dan Musik Website"
        >
          {/* Subtle pulse ring */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>

          <Volume2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />

          <span className="text-[11px] sm:text-xs font-semibold tracking-wide pr-1">
            Aktifkan Suara
          </span>
        </button>
      ) : (
        // State 2: Audio aktif -> Tampilkan minimal speaker toggle (🔊 / 🔇)
        <button
          type="button"
          onClick={toggleMute}
          className={`group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-300 backdrop-blur-md shadow-lg transform hover:scale-105 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
            isMuted
              ? 'bg-zinc-900/80 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-750'
              : 'bg-zinc-900/90 hover:bg-zinc-850 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 shadow-cyan-950/20'
          }`}
          title={isMuted ? 'Nyalakan suara musik' : 'Bisukan suara musik'}
          aria-label={isMuted ? 'Nyalakan suara' : 'Matikan suara'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-zinc-400 group-hover:text-zinc-200 transition-colors shrink-0" />
          ) : (
            <>
              {isPlaying && (
                <span className="absolute -inset-0.5 rounded-full bg-cyan-500/20 animate-pulse pointer-events-none" />
              )}
              <Volume2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
