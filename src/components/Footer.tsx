'use client';

import React from 'react';
import Link from 'next/link';
import { STORE_NAME, STORE_DESCRIPTION } from '@/data/config';
import { createWhatsAppUrl } from '@/lib/whatsapp';
import { useAdminPortal } from '@/context/AdminPortalContext';
import { Sparkles, MessageCircle, Clock, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { openLogin } = useAdminPortal();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 pt-16 pb-12 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1.5px]">
                <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                {STORE_NAME}
              </span>
            </Link>
            <p className="text-zinc-400 leading-relaxed">
              {STORE_DESCRIPTION}
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Layanan Terpercaya & Bergaransi</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Navigasi Cepat</h4>
            <ul className="space-y-2">
              <li>
                <a href="/#aplikasi" className="hover:text-cyan-400 transition-colors">
                  Aplikasi Premium
                </a>
              </li>
              <li>
                <a href="/#jasa" className="hover:text-cyan-400 transition-colors">
                  Jasa Editing & Desain
                </a>
              </li>
              <li>
                <a href="/#promo" className="hover:text-cyan-400 transition-colors">
                  Promo Tiket Bioskop
                </a>
              </li>
              <li>
                <a href="/#cara-order" className="hover:text-cyan-400 transition-colors">
                  Cara Order
                </a>
              </li>
            </ul>
          </div>

          {/* Operational Hours */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Jam Operasional</h4>
            <div className="flex items-start gap-2.5 mb-3">
              <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-zinc-200 font-medium">Setiap Hari: 08.00 - 23.00 WIB</p>
                <p className="text-zinc-500 text-[11px] mt-0.5">
                  Pemesanan via WhatsApp dapat dikirim 24 jam dan akan segera diproses saat admin aktif.
                </p>
              </div>
            </div>
          </div>

          {/* Customer Service Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Hubungi Admin</h4>
            <p className="text-zinc-400 mb-3">
              Ada pertanyaan atau butuh bantuan order? Chat admin langsung melalui WhatsApp.
            </p>
            <a
              href={createWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Admin</span>
            </a>
          </div>
        </div>

        {/* Disclaimer & Bottom bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div className="flex flex-wrap items-center gap-2 text-zinc-500">
            <span>© {new Date().getFullYear()} {STORE_NAME}. All rights reserved.</span>
            <span className="text-zinc-700">|</span>
            <a href="#aplikasi" className="hover:text-zinc-300 text-zinc-500 transition-colors">
              Tentang
            </a>
            <span className="text-zinc-700">|</span>
            <a
              href={createWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 text-zinc-500 transition-colors"
            >
              Kontak
            </a>
            <span className="text-zinc-700">|</span>
            <Link
              href="/admin"
              className="hover:text-cyan-400 text-zinc-500 transition-colors cursor-pointer"
            >
              🔐 Admin
            </Link>
          </div>

          <p className="text-center md:text-right max-w-xl text-zinc-600 text-[10px]">
            Disclaimer: Seluruh nama merek (Netflix, Spotify, Canva, XXI, CGV, dll) adalah hak cipta pemilik terkait.
          </p>
        </div>
      </div>
    </footer>
  );
}
