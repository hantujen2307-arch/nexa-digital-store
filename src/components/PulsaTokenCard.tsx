'use client';

import React from 'react';
import { PulsaToken } from '@/types/database';
import { formatRupiah, createWhatsAppUrl } from '@/lib/whatsapp';
import { MessageCircle, Star, Smartphone, Zap, Wifi, Gamepad2, CreditCard } from 'lucide-react';

interface PulsaTokenCardProps {
  item: PulsaToken;
}

// Styling badge berdasarkan provider
const PROVIDER_THEMES: Record<string, { bg: string; text: string; border: string }> = {
  Telkomsel: { bg: 'bg-red-950/40', text: 'text-red-400', border: 'border-red-800/40' },
  Indosat: { bg: 'bg-yellow-950/40', text: 'text-yellow-400', border: 'border-yellow-800/40' },
  XL: { bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-800/40' },
  Tri: { bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-800/40' },
  Smartfren: { bg: 'bg-pink-950/40', text: 'text-pink-400', border: 'border-pink-800/40' },
  PLN: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-800/40' },
  DANA: { bg: 'bg-sky-950/40', text: 'text-sky-400', border: 'border-sky-800/40' },
  OVO: { bg: 'bg-violet-950/40', text: 'text-violet-400', border: 'border-violet-800/40' },
  GoPay: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-800/40' },
  ShopeePay: { bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-800/40' },
  'Mobile Legends': { bg: 'bg-indigo-950/40', text: 'text-indigo-400', border: 'border-indigo-800/40' },
  'Free Fire': { bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-800/40' },
};

const DEFAULT_THEME = { bg: 'bg-cyan-950/40', text: 'text-cyan-400', border: 'border-cyan-800/40' };

export default function PulsaTokenCard({ item }: PulsaTokenCardProps) {
  const providerTheme = PROVIDER_THEMES[item.provider] || DEFAULT_THEME;

  // Icon per kategori
  const getCategoryIcon = () => {
    switch (item.category) {
      case 'Pulsa':
        return <Smartphone className="w-4 h-4 text-cyan-400" />;
      case 'Paket Data':
        return <Wifi className="w-4 h-4 text-blue-400" />;
      case 'Token PLN':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Voucher Game':
        return <Gamepad2 className="w-4 h-4 text-purple-400" />;
      case 'E-Wallet':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      default:
        return <Smartphone className="w-4 h-4 text-cyan-400" />;
    }
  };

  // Format pesan otomatis WhatsApp:
  // Halo Alpin Premium,
  //
  // Saya ingin memesan:
  //
  // Produk: Telkomsel 10K
  // Kategori: Pulsa
  // Nominal: Rp10.000
  // Harga: Rp12.000
  //
  // Terima kasih.
  const waMessage = `Halo Alpin Premium,\n\nSaya ingin memesan:\n\nProduk: ${item.name}\nKategori: ${item.category}\nNominal: ${formatRupiah(item.nominal)}\nHarga: ${formatRupiah(item.price)}\n\nTerima kasih.`;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-4 sm:p-5 transition-all duration-300 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/90">
      <div>
        {/* Gambar Produk / Visual Icon */}
        <div className="relative mb-3.5">
          <div className="w-full h-36 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/50 flex items-center justify-center">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-zinc-500">
                <span className="text-4xl">
                  {item.category === 'Pulsa'
                    ? '📱'
                    : item.category === 'Paket Data'
                    ? '📶'
                    : item.category === 'Token PLN'
                    ? '⚡'
                    : item.category === 'Voucher Game'
                    ? '🎮'
                    : '💳'}
                </span>
                <span className="text-[11px] font-semibold text-zinc-400">{item.provider}</span>
              </div>
            )}
          </div>

          {/* Unggulan Badge */}
          {item.is_featured && (
            <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              Unggulan
            </span>
          )}
        </div>

        {/* Badges: Provider & Kategori */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span
            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${providerTheme.text} ${providerTheme.bg} border ${providerTheme.border}`}
          >
            {item.provider}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-700/40">
            {getCategoryIcon()}
            <span>{item.category}</span>
          </span>
        </div>

        {/* Nama Produk */}
        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1">
          {item.name}
        </h3>

        {/* Nominal */}
        <div className="text-xs text-zinc-400 mb-1.5">
          <span>Nominal: </span>
          <span className="font-semibold text-zinc-200">{formatRupiah(item.nominal)}</span>
        </div>

        {/* Deskripsi */}
        {item.description && (
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        )}
      </div>

      {/* Harga & Tombol Pesan */}
      <div className="pt-3 border-t border-zinc-800/70 mt-auto space-y-3">
        <div>
          <span className="text-[10px] text-zinc-500 block">Harga</span>
          <span className="text-lg sm:text-xl font-black font-mono text-white">
            {formatRupiah(item.price)}
          </span>
        </div>

        {/* CTA Pesan Sekarang */}
        <a
          href={createWhatsAppUrl(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          id={`order-pulsa-${item.id}`}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-md shadow-cyan-950/40 active:scale-[0.98]"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Pesan Sekarang</span>
        </a>
      </div>
    </div>
  );
}
