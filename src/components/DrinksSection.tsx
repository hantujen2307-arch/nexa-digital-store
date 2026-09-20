'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Drink } from '@/types/database';
import { initialDrinks } from '@/data/drinks';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAdminPortal } from '@/context/AdminPortalContext';
import DrinkCard from './DrinkCard';
import { GlassWater, Loader2 } from 'lucide-react';

export default function DrinksSection() {
  const { dataVersion } = useAdminPortal();
  const [drinks, setDrinks] = useState<Drink[]>(initialDrinks);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Semua');

  useEffect(() => {
    async function fetchDrinks() {
      if (!isSupabaseConfigured()) {
        setDrinks(initialDrinks);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('drinks')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: true });

        if (error) {
          console.warn('Gagal memuat minuman dari Supabase, menggunakan data fallback:', error.message);
          setDrinks(initialDrinks.filter((d) => d.active));
        } else if (data && data.length > 0) {
          setDrinks(data as Drink[]);
        } else {
          setDrinks(initialDrinks.filter((d) => d.active));
        }
      } catch (err) {
        console.error('Error fetch drinks:', err);
        setDrinks(initialDrinks.filter((d) => d.active));
      } finally {
        setLoading(false);
      }
    }

    fetchDrinks();
  }, [dataVersion]);

  // Unique categories for filter tabs
  const categories = useMemo(() => {
    const cats = Array.from(new Set(drinks.map((d) => d.category)));
    return ['Semua', ...cats];
  }, [drinks]);

  const filteredDrinks =
    activeCategory === 'Semua'
      ? drinks
      : drinks.filter((d) => d.category === activeCategory);

  // Don't render section if no drinks at all
  if (!loading && drinks.length === 0) return null;

  return (
    <section id="minuman" className="py-16 bg-zinc-950/80 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-0 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-52 h-52 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/40 border border-teal-800/40 text-xs font-medium text-teal-400 mb-2">
              <GlassWater className="w-3.5 h-3.5" />
              <span>Menu Minuman</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 justify-center sm:justify-start">
              <span>🥤 Produk Minuman</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              Pilih minuman favorit Anda dan pesan langsung via WhatsApp.
            </p>
          </div>

          <div className="text-xs text-zinc-500 hidden sm:block">
            Menampilkan{' '}
            <span className="text-teal-400 font-bold">{filteredDrinks.length}</span>{' '}
            minuman
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
            <span className="ml-2 text-xs text-zinc-400">Memuat menu minuman...</span>
          </div>
        )}

        {/* Category Filter Tabs */}
        {!loading && categories.length > 2 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`filter-drink-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  activeCategory === cat
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-sm'
                    : 'text-zinc-400 border-zinc-700/60 hover:text-white hover:border-zinc-600 bg-zinc-900/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {!loading && filteredDrinks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-500">
            <span className="text-4xl">🥤</span>
            <p className="text-sm">Belum ada minuman di kategori ini.</p>
          </div>
        )}

        {!loading && filteredDrinks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {filteredDrinks.map((drink) => (
              <DrinkCard key={drink.id} drink={drink} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
