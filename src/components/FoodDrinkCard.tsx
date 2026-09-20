'use client';

import React from 'react';
import { FoodDrink } from '@/types/database';
import { formatRupiah } from '@/lib/whatsapp';
import { createWhatsAppUrl } from '@/lib/whatsapp';
import { MessageCircle, Star, ShoppingBag } from 'lucide-react';

interface FoodDrinkCardProps {
  item: FoodDrink;
}

// Warna per kategori
const CATEGORY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Makanan: { text: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-800/40' },
  Minuman: { text: 'text-cyan-400', bg: 'bg-cyan-950/40', border: 'border-cyan-800/40' },
  Snack:   { text: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-800/40' },
  Dessert: { text: 'text-pink-400', bg: 'bg-pink-950/40', border: 'border-pink-800/40' },
  Lainnya: { text: 'text-zinc-400', bg: 'bg-zinc-800/40', border: 'border-zinc-700/40' },
};

const DEFAULT_COLOR = { text: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-800/40' };

export default function FoodDrinkCard({ item }: FoodDrinkCardProps) {
  const isOutOfStock = item.stock === 0;

  const discount =
    item.original_price && item.original_price > item.price
      ? Math.round(((item.original_price - item.price) / item.original_price) * 100)
      : null;

  const catStyle = CATEGORY_COLORS[item.category] ?? DEFAULT_COLOR;

  const waMessage =
    `halo admin ganteng saya mau order nhi\n` +
    `Nama pesanan: ${item.name}\n` +
    `Kategori: ${item.category}\n` +
    `Harga: ${formatRupiah(item.price)}\n` +
    `order sekarang : YA\n` +
    `Payment `;

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl bg-zinc-900/60 border p-4 sm:p-5 transition-all duration-300 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1 ${
        isOutOfStock ? 'border-zinc-800/50 opacity-75' : 'border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/90'
      }`}
    >
      <div>
        {/* Gambar */}
        <div className="relative mb-3">
          <div className="w-full h-36 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/50 flex items-center justify-center">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${!isOutOfStock ? 'group-hover:scale-105' : ''}`}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-zinc-600">
                <span className="text-4xl">
                  {item.category === 'Makanan' ? '🍽️'
                    : item.category === 'Minuman' ? '🥤'
                    : item.category === 'Snack' ? '🍿'
                    : item.category === 'Dessert' ? '🍦'
                    : '🛒'}
                </span>
              </div>
            )}
          </div>

          {/* Stok Habis overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 rounded-xl bg-zinc-950/70 flex items-center justify-center">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-900/80 text-red-300 border border-red-700/60">
                Stok Habis
              </span>
            </div>
          )}

          {/* Diskon badge */}
          {discount && !isOutOfStock && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-600 text-white shadow-md">
              -{discount}%
            </span>
          )}

          {/* Unggulan badge */}
          {item.is_featured && (
            <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              Unggulan
            </span>
          )}
        </div>

        {/* Kategori Badge */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${catStyle.text} ${catStyle.bg} border ${catStyle.border}`}>
            {item.category}
          </span>
        </div>

        {/* Nama Produk */}
        <h3 className={`text-base font-bold line-clamp-1 mb-1.5 transition-colors ${isOutOfStock ? 'text-zinc-500' : 'text-white group-hover:text-orange-300'}`}>
          {item.name}
        </h3>

        {/* Deskripsi */}
        {item.description && (
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        )}
      </div>

      {/* Harga, Stok, & CTA */}
      <div className="pt-3 border-t border-zinc-800/70 mt-auto space-y-3">
        {/* Harga */}
        <div>
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-[10px] text-zinc-500">Harga</span>
            {discount && discount > 0 && !isOutOfStock && (
              <span className="text-[10px] font-bold text-rose-400 bg-rose-950/40 border border-rose-800/40 px-1.5 rounded-md">
                Hemat {discount}%
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className={`text-base sm:text-lg font-black ${isOutOfStock ? 'text-zinc-500' : 'text-white'}`}>
              {formatRupiah(item.price)}
            </span>
            {item.original_price && item.original_price > item.price && (
              <span className="text-xs text-zinc-500 line-through font-medium">
                {formatRupiah(item.original_price)}
              </span>
            )}
          </div>
        </div>

        {/* Stok */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/40">
          <span className="text-zinc-500 text-[11px]">Stok Tersedia</span>
          <span className={`font-bold text-xs ${isOutOfStock ? 'text-red-400' : item.stock <= 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isOutOfStock ? 'Habis' : `${item.stock} porsi`}
          </span>
        </div>

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
          <a
            href={createWhatsAppUrl(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            id={`order-food-${item.id}`}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 transition-all shadow-sm active:scale-[0.98]"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Pesan</span>
          </a>
        )}
      </div>
    </div>
  );
}
