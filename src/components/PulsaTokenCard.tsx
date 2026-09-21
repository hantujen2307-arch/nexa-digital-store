'use client';

import React, { useState } from 'react';
import { PulsaTokenPublic, PulsaToken } from '@/types/database';
import { formatRupiah, createWhatsAppUrl } from '@/lib/whatsapp';
import {
  MessageCircle,
  Star,
  ShoppingBag,
  Smartphone,
  Zap,
  Wifi,
  Gamepad2,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface PulsaTokenCardProps {
  item: PulsaTokenPublic | PulsaToken;
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
  const [targetNumber, setTargetNumber] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const isOutOfStock = item.stock === 0;
  const isLowStock = item.stock > 0 && item.stock <= 5;
  const providerTheme = PROVIDER_THEMES[item.provider] || DEFAULT_THEME;

  // Konversi tipe ke label yang ramah dibaca
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pulsa':
        return 'Pulsa';
      case 'data':
        return 'Paket Data';
      case 'token_pln':
        return 'Token PLN';
      case 'voucher_game':
        return 'Voucher Game';
      case 'ewallet':
        return 'E-Wallet';
      default:
        return type;
    }
  };

  // Konfigurasi input tujuan berdasarkan tipe produk
  const getDestinationConfig = () => {
    switch (item.type) {
      case 'pulsa':
      case 'data':
        return {
          label: 'Nomor HP Tujuan',
          placeholder: '08xxxxxxxxxx',
          isDigitsOnly: true,
          validate: (val: string) => {
            if (!val.trim()) return 'Nomor HP Tujuan wajib diisi.';
            if (!/^\d+$/.test(val)) return 'Nomor HP hanya boleh berisi angka.';
            if (val.length < 10 || val.length > 14) return 'Panjang nomor HP wajar (10 - 14 digit).';
            return null;
          },
        };
      case 'token_pln':
        return {
          label: 'Nomor Meter / ID Pelanggan',
          placeholder: '11 atau 12 digit no. meter',
          isDigitsOnly: true,
          validate: (val: string) => {
            if (!val.trim()) return 'Nomor Meter / ID Pelanggan wajib diisi.';
            if (!/^\d+$/.test(val)) return 'Hanya boleh berisi angka.';
            if (val.length < 11 || val.length > 12) return 'Nomor Meter PLN biasanya 11 atau 12 digit.';
            return null;
          },
        };
      case 'ewallet':
        return {
          label: 'Nomor HP / ID Tujuan',
          placeholder: '08xxxxxxxxxx / ID Akun',
          isDigitsOnly: false,
          validate: (val: string) => {
            if (!val.trim()) return 'Nomor HP / ID Akun e-wallet wajib diisi.';
            if (val.length < 8) return 'Nomor / ID Tujuan tidak valid (terlalu pendek).';
            return null;
          },
        };
      case 'voucher_game':
        return {
          label: 'User ID / Server ID',
          placeholder: 'Contoh: 12345678 (2020)',
          isDigitsOnly: false,
          validate: (val: string) => {
            if (!val.trim()) return 'User ID / Server Game wajib diisi.';
            if (val.length < 3) return 'User ID terlalu pendek.';
            return null;
          },
        };
      default:
        return {
          label: 'Nomor / ID Tujuan',
          placeholder: 'Masukkan nomor tujuan',
          isDigitsOnly: false,
          validate: (val: string) => {
            if (!val.trim()) return 'Nomor tujuan wajib diisi.';
            return null;
          },
        };
    }
  };

  const destConfig = getDestinationConfig();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (destConfig.isDigitsOnly) {
      // Hanya menerima angka, otomatis membuang huruf & simbol
      val = val.replace(/\D/g, '');
    }
    setTargetNumber(val);
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleOrder = (e: React.MouseEvent) => {
    e.preventDefault();

    if (isOutOfStock) return;

    const error = destConfig.validate(targetNumber);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);

    // Format pesan WhatsApp otomatis sesuai spesifikasi:
    // Halo Alpin Premium,
    //
    // Saya ingin membeli:
    //
    // Produk: Telkomsel 10.000
    // Jenis: Pulsa
    // Nominal: Rp10.000
    // Harga: Rp12.000
    //
    // Nomor tujuan:
    // [PEMBELI MENGISI NOMOR]
    //
    // Terima kasih.
    const message = `Halo Alpin Premium,\n\nSaya ingin membeli:\n\nProduk: ${item.name}\nJenis: ${getTypeLabel(item.type)}\nNominal: ${formatRupiah(item.nominal)}\nHarga: ${formatRupiah(item.selling_price)}\n\nNomor tujuan:\n${targetNumber.trim()}\n\nTerima kasih.`;

    const url = createWhatsAppUrl(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Icon per jenis produk
  const getTypeIcon = () => {
    switch (item.type) {
      case 'pulsa':
        return <Smartphone className="w-3.5 h-3.5 text-cyan-400" />;
      case 'data':
        return <Wifi className="w-3.5 h-3.5 text-blue-400" />;
      case 'token_pln':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'voucher_game':
        return <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'ewallet':
        return <CreditCard className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Smartphone className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl bg-zinc-900/60 border p-4 sm:p-5 transition-all duration-300 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1 ${
        isOutOfStock
          ? 'border-zinc-800/50 opacity-75'
          : 'border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/90'
      }`}
    >
      <div>
        {/* Top Badges: Provider, Type & Featured */}
        <div className="flex items-center justify-between gap-1.5 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Provider Badge */}
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${providerTheme.text} ${providerTheme.bg} border ${providerTheme.border}`}
            >
              {item.provider}
            </span>

            {/* Type Badge */}
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-700/40">
              {getTypeIcon()}
              <span>{getTypeLabel(item.type)}</span>
            </span>
          </div>

          {/* Featured Badge */}
          {item.is_featured && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              Unggulan
            </span>
          )}
        </div>

        {/* Nama Produk */}
        <h3
          className={`text-base font-bold line-clamp-1 mb-1 transition-colors ${
            isOutOfStock ? 'text-zinc-500' : 'text-white group-hover:text-cyan-300'
          }`}
        >
          {item.name}
        </h3>

        {/* Nominal Info */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2">
          <span>Nominal:</span>
          <span className="font-semibold text-zinc-200">{formatRupiah(item.nominal)}</span>
        </div>

        {/* Deskripsi (jika ada) */}
        {item.description && (
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        )}
      </div>

      {/* Pricing, Input Nomor Tujuan, & CTA Button */}
      <div className="pt-3 border-t border-zinc-800/70 mt-auto space-y-3">
        {/* Harga Jual (Harga modal tidak pernah ditampilkan) */}
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="text-[10px] text-zinc-500 block">Harga</span>
            <span
              className={`text-lg sm:text-xl font-black font-mono ${
                isOutOfStock ? 'text-zinc-500' : 'text-white'
              }`}
            >
              {formatRupiah(item.selling_price)}
            </span>
          </div>

          {/* Stok Info */}
          <div className="text-right">
            {isOutOfStock ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-800/50">
                Stok Habis
              </span>
            ) : isLowStock ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/50">
                Stok hampir habis ({item.stock})
              </span>
            ) : (
              <span className="text-[11px] text-emerald-400 font-medium">Tersedia</span>
            )}
          </div>
        </div>

        {/* Input Nomor Tujuan (hanya tampil jika stok > 0) */}
        {!isOutOfStock ? (
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-zinc-300">
              {destConfig.label} <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={targetNumber}
                onChange={handleInputChange}
                placeholder={destConfig.placeholder}
                className={`w-full px-3 py-2 rounded-xl bg-zinc-950 border text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-all ${
                  validationError
                    ? 'border-red-500/80 focus:border-red-500'
                    : 'border-zinc-800 focus:border-cyan-500'
                }`}
              />
            </div>
            {validationError && (
              <div className="flex items-center gap-1 text-[10px] text-red-400 mt-1 animate-in fade-in duration-200">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>
        ) : null}

        {/* CTA Button */}
        {isOutOfStock ? (
          <button
            disabled
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-500 bg-zinc-800/60 border border-zinc-700/50 cursor-not-allowed"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Stok Habis</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleOrder}
            id={`order-pulsa-${item.id}`}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-md shadow-cyan-950/40 active:scale-[0.98] cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Pesan Sekarang</span>
          </button>
        )}
      </div>
    </div>
  );
}
