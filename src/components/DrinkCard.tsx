'use client';

import React from 'react';
import { Drink } from '@/types/database';
import { formatRupiah } from '@/lib/whatsapp';
import { createWhatsAppUrl } from '@/lib/whatsapp';
import { MessageCircle, Sparkles, Tag } from 'lucide-react';

interface DrinkCardProps {
  drink: Drink;
}

export default function DrinkCard({ drink }: DrinkCardProps) {
  const discountPercent =
    drink.originalPrice && drink.originalPrice > drink.price
      ? Math.round(((drink.originalPrice - drink.price) / drink.originalPrice) * 100)
      : null;

  const waMessage = `halo admin ganteng saya mau order nhi\nNama pesanan: ${drink.name}\npaket  : Minuman\norder sekarang : YA\nPayment `;

  // Category color mapping
  const categoryColors: Record<string, string> = {
    Kopi: 'text-amber-400',
    Teh: 'text-emerald-400',
    Jus: 'text-orange-400',
    Susu: 'text-sky-400',
    Boba: 'text-purple-400',
    Coklat: 'text-yellow-600',
    Soda: 'text-cyan-400',
    Air: 'text-blue-400',
  };
  const catColor = categoryColors[drink.category] || 'text-cyan-400';

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-4 sm:p-5 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/90 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1">
      <div>
        {/* Logo / Image */}
        <div className="relative mb-3">
          <div className="w-full h-32 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/50 flex items-center justify-center">
            {drink.imageUrl ? (
              <img
                src={drink.imageUrl}
                alt={drink.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-600">
                <span className="text-4xl">🥤</span>
              </div>
            )}
          </div>

          {/* Discount Badge */}
          {discountPercent && discountPercent > 0 && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-600 text-white shadow-md">
              -{discountPercent}%
            </span>
          )}

          {/* Custom Badge */}
          {drink.badge && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {drink.badge}
            </span>
          )}
        </div>

        {/* Category & Sold Count */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span className={`text-[10px] uppercase font-bold tracking-wider ${catColor}`}>
            {drink.category}
          </span>
          {drink.sold_count !== undefined && drink.sold_count !== null && drink.sold_count > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/50 shadow-sm shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Terjual {drink.sold_count}</span>
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1.5">
          {drink.name}
        </h3>

        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
          {drink.description}
        </p>
      </div>

      {/* Pricing & CTA */}
      <div className="pt-3 border-t border-zinc-800/70 mt-auto">
        <div className="mb-3">
          <span className="text-[10px] text-zinc-500 block mb-0.5">Harga</span>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-black text-white">
              {formatRupiah(drink.price)}
            </span>
            {drink.originalPrice && drink.originalPrice > drink.price && (
              <span className="text-xs text-zinc-500 line-through font-medium">
                {formatRupiah(drink.originalPrice)}
              </span>
            )}
          </div>
        </div>

        <a
          href={createWhatsAppUrl(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          id={`order-drink-${drink.id}`}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-sm active:scale-[0.98]"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Pesan via WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
