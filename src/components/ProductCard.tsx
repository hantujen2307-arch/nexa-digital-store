'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/database';
import { formatRupiah, getProductOrderWhatsAppUrl } from '@/lib/whatsapp';
import { ChevronRight, MessageCircle, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Sort packages by price to find the cheapest active package
  const activePackages = product.packages && product.packages.length > 0
    ? product.packages.filter((p) => p.active !== false)
    : [];

  const sortedPackages = activePackages.length > 0
    ? [...activePackages].sort((a, b) => a.price - b.price)
    : [];

  const lowestPkg = sortedPackages[0];
  const minPackagePrice = lowestPkg ? lowestPkg.price : (product.min_price || 0);

  // Original price for crossed-out effect (harga asli dicoret)
  const minOriginalPrice = lowestPkg?.original_price || product.min_original_price || (minPackagePrice > 0 ? Math.round((minPackagePrice * 1.8) / 5000) * 5000 : null);

  const defaultPackageDuration = lowestPkg ? lowestPkg.duration : '1 Bulan';
  const defaultPrice = minPackagePrice || 0;

  const discountPercent = minOriginalPrice && minOriginalPrice > minPackagePrice
    ? Math.round(((minOriginalPrice - minPackagePrice) / minOriginalPrice) * 100)
    : null;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-4 sm:p-5 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/90 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1">
      <div>
        {/* Top: Logo & Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/60 flex items-center justify-center shrink-0">
            {product.logo_url ? (
              <img
                src={product.logo_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback if image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Sparkles className="w-5 h-5 text-cyan-400" />
            )}
          </div>

          {product.badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 truncate max-w-[120px]">
              {product.badge}
            </span>
          )}
        </div>

        {/* Category & Title */}
        <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 block mb-1">
          {product.category || 'Aplikasi'}
        </span>
        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1.5">
          {product.name}
        </h3>

        {/* Short description */}
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
          {product.description}
        </p>
      </div>

      {/* Pricing & CTA */}
      <div className="pt-3 border-t border-zinc-800/70 mt-auto">
        <div className="mb-3">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-[10px] text-zinc-500">Mulai dari</span>
            {discountPercent && discountPercent > 0 && (
              <span className="text-[10px] font-bold text-rose-400 bg-rose-950/40 border border-rose-800/40 px-1.5 py-0.2 rounded-md">
                Hemat {discountPercent}%
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-black text-white">
              {formatRupiah(minPackagePrice)}
            </span>
            {minOriginalPrice && minOriginalPrice > minPackagePrice && (
              <span className="text-xs text-zinc-500 line-through font-medium">
                {formatRupiah(minOriginalPrice)}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Detail Link */}
          <Link
            href={`/produk/${product.slug}`}
            className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-200 bg-zinc-800/90 hover:bg-zinc-700/80 border border-zinc-700/50 transition-colors"
          >
            <span>Detail</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          </Link>

          {/* Quick WA Order */}
          <a
            href={getProductOrderWhatsAppUrl(product.name, defaultPackageDuration, defaultPrice)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-sm active:scale-[0.98]"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Beli</span>
          </a>
        </div>
      </div>
    </div>
  );
}
