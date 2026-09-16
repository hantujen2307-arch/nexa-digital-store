'use client';

import React, { useState, useEffect } from 'react';
import { CinemaPromo } from '@/types/database';
import { initialCinemaPromos } from '@/data/seed-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAdminPortal } from '@/context/AdminPortalContext';
import CinemaPromoCard from './CinemaPromoCard';
import { Ticket, Loader2 } from 'lucide-react';

export default function CinemaSection() {
  const { dataVersion } = useAdminPortal();
  const [promos, setPromos] = useState<CinemaPromo[]>(initialCinemaPromos);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPromos() {
      if (!isSupabaseConfigured()) {
        setPromos(initialCinemaPromos);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('cinema_promos')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: true });

        if (error) {
          console.warn('Gagal memuat promo dari Supabase, menggunakan data fallback:', error.message);
          setPromos(initialCinemaPromos);
        } else if (data && data.length > 0) {
          setPromos(data as CinemaPromo[]);
        } else {
          setPromos(initialCinemaPromos);
        }
      } catch (err) {
        console.error('Error fetching cinema promos:', err);
        setPromos(initialCinemaPromos);
      } finally {
        setLoading(false);
      }
    }

    fetchPromos();
  }, [dataVersion]);

  return (
    <section id="promo" className="py-16 bg-zinc-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800/40 text-xs font-medium text-amber-400 mb-2">
              <Ticket className="w-3.5 h-3.5" />
              <span>Nonton Hemat</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              🎟️ Promo Tiket Bioskop
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              Tiket bioskop XXI, CGV, dan Cinépolis dengan potongan harga promo spesial tanpa perlu antre di kasir.
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
            <span className="ml-2 text-xs text-zinc-400">Memuat promo bioskop...</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promos.map((promo) => (
            <CinemaPromoCard key={promo.id} promo={promo} />
          ))}
        </div>
      </div>
    </section>
  );
}
