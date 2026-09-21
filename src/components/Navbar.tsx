'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { STORE_NAME } from '@/data/config';
import { createWhatsAppUrl } from '@/lib/whatsapp';
import { useStoreHours } from '@/lib/storeHours';
import { Menu, X, Sparkles, MessageCircle, Clock } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isOpen, statusText, closedTitle, closedNotice } = useStoreHours();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Aplikasi', href: '/#aplikasi' },
    { label: 'Jasa', href: '/#jasa' },
    { label: 'Promo', href: '/#promo' },
    { label: 'Makanan & Minuman', href: '/#makanan-minuman' },
    { label: 'Pulsa & Token', href: '/#pulsa-token' },
    { label: 'Cara Order', href: '/#cara-order' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Store Name */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-md shadow-cyan-500/20">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                {STORE_NAME}
                <span
                  className={`inline-block w-2 h-2 rounded-full transition-colors duration-300 ${
                    isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                  }`}
                  title={isOpen ? 'Toko Buka (08.00 - 22.00 WIB)' : 'Toko Sedang Tutup (Buka 08.00 WIB)'}
                />
              </span>
              <span className="text-[10px] text-zinc-400 -mt-1 font-medium tracking-wide">
                DIGITAL STORE
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/60 border border-zinc-800/80 rounded-full px-4 py-1.5 backdrop-blur-md">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-1.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-full transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right section: Store status badge + WhatsApp button */}
          <div className="hidden md:flex items-center gap-3">
            {/* Desktop Store Status Badge */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isOpen
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-950/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-sm shadow-rose-950/20'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span>{statusText}</span>
              <span className="text-[10px] text-zinc-400 font-normal border-l border-zinc-700/60 pl-1.5">
                {isOpen ? '08.00–22.00 WIB' : 'Buka 08.00 WIB'}
              </span>
            </div>

            {/* Chat WhatsApp Button (No Customer Login) */}
            <a
              href={createWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md shadow-emerald-900/30 active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat WhatsApp</span>
            </a>
          </div>

          {/* Mobile Status Badge & Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                isOpen
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span>{statusText}</span>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-300 hover:text-white bg-zinc-900/80 border border-zinc-800 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Notice Banner Saat Toko Tutup (Hanya Tampilan Visual) */}
      {!isOpen && (
        <div className="w-full bg-gradient-to-r from-rose-950/80 via-zinc-950/95 to-rose-950/80 border-t border-rose-900/40 px-4 py-2 text-center text-xs backdrop-blur-md shadow-inner transition-all duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 text-zinc-300">
            <div className="inline-flex items-center gap-1.5 text-rose-400 font-bold uppercase tracking-wider text-[11px] sm:text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>{closedTitle}</span>
            </div>
            <span className="hidden sm:inline text-zinc-600">•</span>
            <span className="text-zinc-300 font-medium text-[11px] sm:text-xs">
              {closedNotice}
            </span>
          </div>
        </div>
      )}

      {/* Mobile Drawer / Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-zinc-950/98 border-b border-zinc-800/80 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
          {/* Status info bar in mobile menu */}
          <div
            className={`px-3.5 py-2.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
              isOpen
                ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40'
                : 'bg-rose-950/30 text-rose-300 border-rose-800/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="font-semibold">{statusText}</span>
            </div>
            <span className="text-[11px] text-zinc-400">
              {isOpen ? '08.00 – 22.00 WIB' : 'Buka 08.00 WIB'}
            </span>
          </div>

          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-base font-medium text-zinc-200 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-zinc-800/80">
            <a
              href={createWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat WhatsApp Admin</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

