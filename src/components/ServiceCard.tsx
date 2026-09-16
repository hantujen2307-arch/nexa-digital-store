'use client';

import React from 'react';
import { Service } from '@/types/database';
import { formatRupiah, getServiceOrderWhatsAppUrl } from '@/lib/whatsapp';
import { 
  Video, 
  Clapperboard, 
  LayoutGrid, 
  PlaySquare, 
  Wand2, 
  Palette, 
  Image as ImageIcon, 
  Sparkles, 
  MessageCircle 
} from 'lucide-react';

interface ServiceCardProps {
  service: Service;
}

const iconMap: Record<string, React.ElementType> = {
  Video,
  Clapperboard,
  LayoutGrid,
  PlaySquare,
  Wand2,
  Palette,
  Image: ImageIcon,
  Sparkles,
};

export default function ServiceCard({ service }: ServiceCardProps) {
  const IconComponent = iconMap[service.icon] || Video;
  const whatsappUrl = getServiceOrderWhatsAppUrl(service.name);

  const originalPrice = service.original_price || (service.price && service.price > 0 ? Math.round((service.price * 1.8) / 5000) * 5000 : null);
  const discountPercent = originalPrice && service.price && originalPrice > service.price
    ? Math.round(((originalPrice - service.price) / originalPrice) * 100)
    : null;

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 transition-all duration-300 hover:border-purple-500/50 hover:bg-zinc-900/90 hover:shadow-xl hover:shadow-purple-950/20 hover:-translate-y-1">
      <div>
        <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-800/50 p-2.5 flex items-center justify-center text-purple-400 mb-4">
          <IconComponent className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-white mb-2">
          {service.name}
        </h3>

        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          {service.description}
        </p>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-[11px] text-zinc-500 block">Mulai dari</span>
            {originalPrice && service.price && originalPrice > service.price && (
              <span className="text-xs text-zinc-500 line-through block mt-0.5 font-medium">
                {formatRupiah(originalPrice)}
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="text-base font-extrabold text-white block">
              {service.price ? formatRupiah(service.price) : 'Hubungi Admin'}
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
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 transition-all hover:border-purple-500/50"
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span>Pesan Jasa</span>
        </a>
      </div>
    </div>
  );
}
