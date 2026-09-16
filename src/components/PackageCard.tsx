'use client';

import React from 'react';
import { ProductPackage } from '@/types/database';
import { formatRupiah, getProductOrderWhatsAppUrl } from '@/lib/whatsapp';
import { MessageCircle, Clock, ShieldCheck } from 'lucide-react';

interface PackageCardProps {
  pkg: ProductPackage;
  productName: string;
}

export default function PackageCard({ pkg, productName }: PackageCardProps) {
  const originalPrice = pkg.original_price || (pkg.price > 0 ? Math.round((pkg.price * 1.8) / 5000) * 5000 : null);
  const discountPercent = originalPrice && originalPrice > pkg.price
    ? Math.round(((originalPrice - pkg.price) / originalPrice) * 100)
    : null;

  const whatsappUrl = getProductOrderWhatsAppUrl(
    productName,
    pkg.duration,
    pkg.price
  );

  return (
    <div className="flex flex-col justify-between p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-cyan-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-950/20">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Masa Aktif: {pkg.duration}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-800/40">
            <ShieldCheck className="w-3 h-3" />
            <span>Garansi</span>
          </span>
        </div>

        <h4 className="text-lg font-extrabold text-white mb-1">
          Paket {pkg.duration}
        </h4>
        <p className="text-xs text-zinc-400 mb-4">
          Akses penuh bergaransi selama durasi {pkg.duration}.
        </p>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-[11px] text-zinc-500 block">Harga Kami</span>
            {originalPrice && originalPrice > pkg.price && (
              <span className="text-xs text-zinc-500 line-through block mt-0.5 font-medium">
                {formatRupiah(originalPrice)}
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-white block">
              {formatRupiah(pkg.price)}
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
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-950/40 transition-all active:scale-[0.98]"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Beli Sekarang</span>
        </a>
      </div>
    </div>
  );
}
