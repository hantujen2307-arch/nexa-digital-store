'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FoodDrink } from '@/types/database';
import { initialFoodDrinks } from '@/data/food-drinks';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAdminPortal } from '@/context/AdminPortalContext';
import FoodDrinkCard from './DrinkCard';
import { Utensils, Loader2, Star } from 'lucide-react';

const ALL_CATEGORIES = ['Semua', 'Makanan', 'Minuman', 'Snack', 'Dessert', 'Lainnya'];

export default function FoodDrinksSection() {
  const { dataVersion } = useAdminPortal();
  const [items, setItems] = useState<FoodDrink[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  useEffect(() => {
    async function fetchItems() {
      if (!isSupabaseConfigured()) {
        // Fallback: hanya tampilkan yang aktif
        setItems(initialFoodDrinks.filter((d) => d.status));
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('food_drinks')
          .select('*')
          .eq('status', true)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('food_drinks: Supabase error, using fallback:', error.message);
          setItems(initialFoodDrinks.filter((d) => d.status));
        } else {
          setItems((data as FoodDrink[]) ?? []);
        }
      } catch (err) {
        console.error('Error fetching food_drinks:', err);
        setItems(initialFoodDrinks.filter((d) => d.status));
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [dataVersion]);

  // Kategori yang benar-benar ada di data
  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(items.map((d) => d.category)));
    const ordered = ALL_CATEGORIES.filter((c) => c === 'Semua' || cats.includes(c));
    const extras = cats.filter((c) => !ALL_CATEGORIES.includes(c));
    return [...ordered, ...extras];
  }, [items]);

  const filtered = useMemo(() => {
    let list = activeCategory === 'Semua' ? items : items.filter((d) => d.category === activeCategory);
    if (showFeaturedOnly) list = list.filter((d) => d.is_featured);
    return list;
  }, [items, activeCategory, showFeaturedOnly]);

  const featuredCount = items.filter((d) => d.is_featured).length;

  // Jangan render section jika tidak ada data sama sekali
  if (!loading && items.length === 0) return null;

  return (
    <section id="makanan-minuman" className="py-16 bg-zinc-950/80 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-0 w-60 h-60 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/40 border border-orange-800/40 text-xs font-medium text-orange-400 mb-2">
              <Utensils className="w-3.5 h-3.5" />
              <span>Menu Tersedia</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 justify-center sm:justify-start">
              <span>🍔 Makanan & Minuman</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              Pilih menu favorit Anda dan pesan langsung via WhatsApp.
            </p>
          </div>

          <div className="text-xs text-zinc-500 hidden sm:block">
            {!loading && (
              <>
                Menampilkan <span className="text-orange-400 font-bold">{filtered.length}</span> dari{' '}
                <span className="text-zinc-400">{items.length}</span> menu
              </>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
            <span className="ml-2 text-xs text-zinc-400">Memuat menu...</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {/* Category tabs */}
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  id={`filter-food-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    activeCategory === cat
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-sm'
                      : 'text-zinc-400 border-zinc-700/60 hover:text-white hover:border-zinc-600 bg-zinc-900/40'
                  }`}
                >
                  {cat}
                </button>
              ))}

              {/* Featured filter */}
              {featuredCount > 0 && (
                <button
                  onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ml-auto ${
                    showFeaturedOnly
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'text-zinc-400 border-zinc-700/60 hover:text-amber-300 bg-zinc-900/40'
                  }`}
                >
                  <Star className={`w-3 h-3 ${showFeaturedOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
                  Unggulan ({featuredCount})
                </button>
              )}
            </div>

            {/* Empty state */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-500">
                <span className="text-5xl">🍽️</span>
                <p className="text-sm font-medium">Tidak ada menu di kategori ini.</p>
                <button
                  onClick={() => { setActiveCategory('Semua'); setShowFeaturedOnly(false); }}
                  className="text-orange-400 text-xs hover:underline"
                >
                  Lihat semua menu
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {filtered.map((item) => (
                  <FoodDrinkCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
