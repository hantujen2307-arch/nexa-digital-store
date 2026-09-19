'use client';

import React from 'react';
import { CinemaPromo } from '@/types/database';
import { formatRupiah, getCinemaOrderWhatsAppUrl } from '@/lib/whatsapp';
import { Calendar, Ticket, MessageCircle } from 'lucide-react';
import { getCinemaPromoSoldCount } from '@/lib/products';

interface CinemaPromoCardProps {
  promo: CinemaPromo;
}

export default function CinemaPromoCard({ promo }: CinemaPromoCardProps) {
  const whatsappUrl = getCinemaOrderWhatsAppUrl(
    promo.name,
    promo.cinema,
    promo.price
  );

  const soldCount = getCinemaPromoSoldCount(promo);

  const originalPrice = promo.original_price || (promo.price > 0 ? Math.round((promo.price * 1.6) / 5000) * 5000 : null);
  const discountPercent = originalPrice && originalPrice > promo.price
    ? Math.round(((originalPrice - promo.price) / originalPrice) * 100)
    : null;

  return (
    <div className="group flex flex-col rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden transition-all duration-300 hover:border-amber-500/50 hover:bg-zinc-900/90 hover:shadow-xl hover:shadow-amber-950/20 hover:-translate-y-1">
      {/* Banner / Poster Promo */}
      <div className="relative w-full h-44 bg-zinc-950 overflow-hidden border-b border-zinc-800">
        {promo.image_url ? (
          <img
            src={promo.image_url}
            alt={promo.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
            <Ticket className="w-10 h-10" />
          </div>
        )}

        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/90 text-zinc-950 shadow-md">
          {promo.cinema}
        </div>

        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-950/80 backdrop-blur-md text-emerald-400 border border-zinc-700">
          Promo Aktif
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Cinema Tag & Sold Count */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
              {promo.cinema}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/50 shadow-sm shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Terjual {soldCount}</span>
            </span>
          </div>

          <h3 className="text-base font-bold text-white mb-2 line-clamp-1">
            {promo.name}
          </h3>

          <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2">
            {promo.description}
          </p>

          {/* Periode Promo */}
          {(promo.start_date || promo.end_date) && (
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-4 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/60">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Periode: {promo.start_date || 'Sekarang'} s/d {promo.end_date || 'Selesai'}
              </span>
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-zinc-800">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[11px] text-zinc-500 block">Harga Promo</span>
              {originalPrice && originalPrice > promo.price && (
                <span className="text-xs text-zinc-500 line-through block mt-0.5 font-medium">
                  {formatRupiah(originalPrice)}
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-base font-black text-amber-400 block">
                {formatRupiah(promo.price)}
              </span>
              {discountPercent && discountPercent > 0 && (
                <span className="text-[10px] font-bold text-rose-400">
                  Hemat {discountPercent}%
                </span>
              )}
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-md shadow-amber-950/40 transition-all active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Pesan Tiket Promo</span>
          </a>
        </div>
      </div>
    </div>
  );
}
