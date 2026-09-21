'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PulsaToken } from '@/types/database';
import { initialPulsaTokens } from '@/data/pulsa-tokens';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAdminPortal } from '@/context/AdminPortalContext';
import PulsaTokenCard from './PulsaTokenCard';
import { Smartphone, Zap, Loader2, Star, Wifi, Gamepad2, CreditCard } from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'Semua', label: 'Semua', icon: null },
  { id: 'Pulsa', label: 'Pulsa', icon: Smartphone },
  { id: 'Paket Data', label: 'Paket Data', icon: Wifi },
  { id: 'Token PLN', label: 'Token PLN', icon: Zap },
  { id: 'Voucher Game', label: 'Voucher Game', icon: Gamepad2 },
  { id: 'E-Wallet', label: 'E-Wallet', icon: CreditCard },
];

export default function PulsaTokenSection() {
  const { dataVersion } = useAdminPortal();
  const [items, setItems] = useState<PulsaToken[]>(initialPulsaTokens.filter((d) => d.is_active));
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [activeProvider, setActiveProvider] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  useEffect(() => {
    async function fetchPulsaTokens() {
      if (!isSupabaseConfigured()) {
        setItems(initialPulsaTokens.filter((d) => d.is_active));
        return;
      }

      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('pulsa_tokens')
          .select('*')
          .eq('is_active', true)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('[PulsaTokenSection] Memakai data cadangan:', error.message);
          setItems(initialPulsaTokens.filter((d) => d.is_active));
        } else if (data && data.length > 0) {
          setItems(data as PulsaToken[]);
        } else {
          setItems(initialPulsaTokens.filter((d) => d.is_active));
        }
      } catch (err) {
        console.error('[PulsaTokenSection] Error fetch:', err);
        setItems(initialPulsaTokens.filter((d) => d.is_active));
      } finally {
        setLoading(false);
      }
    }

    fetchPulsaTokens();
  }, [dataVersion]);

  // Provider yang tersedia berdasarkan kategori yang dipilih
  const availableProviders = useMemo(() => {
    const list = activeCategory === 'Semua' ? items : items.filter((d) => d.category === activeCategory);
    const providers = Array.from(new Set(list.map((d) => d.provider))).filter(Boolean);
    return providers.sort();
  }, [items, activeCategory]);

  // Reset filter provider jika tidak relevan dengan kategori aktif
  useEffect(() => {
    if (activeProvider !== 'all' && !availableProviders.includes(activeProvider)) {
      setActiveProvider('all');
    }
  }, [activeCategory, availableProviders, activeProvider]);

  // Filtered items
  const filtered = useMemo(() => {
    let list = items;
    if (activeCategory !== 'Semua') {
      list = list.filter((d) => d.category === activeCategory);
    }
    if (activeProvider !== 'all') {
      list = list.filter((d) => d.provider === activeProvider);
    }
    if (showFeaturedOnly) {
      list = list.filter((d) => d.is_featured);
    }
    return list;
  }, [items, activeCategory, activeProvider, showFeaturedOnly]);

  const featuredCount = items.filter((d) => d.is_featured).length;

  return (
    <section id="pulsa-token" className="py-16 bg-zinc-950/80 relative border-t border-zinc-800/40">
      {/* Ambient background light */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-cyan-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-0 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-xs font-medium text-cyan-400 mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Layanan Cepat & Praktis</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 justify-center sm:justify-start">
              <span>📱 PULSA & TOKEN</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              Pilih produk pulsa, paket data, token PLN, voucher game, atau e-wallet favorit Anda, pesan praktis langsung via WhatsApp.
            </p>
          </div>

          <div className="text-xs text-zinc-500 hidden sm:block">
            Menampilkan <span className="text-cyan-400 font-bold">{filtered.length}</span> dari{' '}
            <span className="text-zinc-400">{items.length}</span> produk
          </div>
        </div>

        {/* ── Category Filter Pills ── */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                id={`filter-pulsa-${tab.id.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setActiveCategory(tab.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                    : 'text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700 bg-zinc-900/60'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Featured Toggle */}
          {featuredCount > 0 && (
            <button
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ml-auto cursor-pointer ${
                showFeaturedOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'text-zinc-400 border-zinc-800 hover:text-white bg-zinc-900/60'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showFeaturedOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Unggulan ({featuredCount})</span>
            </button>
          )}
        </div>

        {/* ── Provider Filter Pills ── */}
        {availableProviders.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-8 pb-3 border-b border-zinc-800/40">
            <span className="text-[11px] text-zinc-500 font-medium mr-1">Provider:</span>
            <button
              onClick={() => setActiveProvider('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeProvider === 'all'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Semua
            </button>
            {availableProviders.map((prov) => (
              <button
                key={prov}
                onClick={() => setActiveProvider(prov)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeProvider === prov
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {prov}
              </button>
            ))}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            <span className="ml-2 text-xs text-zinc-400">Memuat katalog pulsa & token...</span>
          </div>
        )}

        {/* Product Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {filtered.map((item) => (
              <PulsaTokenCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 px-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
            <Smartphone className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-300">Belum ada produk Pulsa & Token.</p>
            <p className="text-xs text-zinc-500 mt-1">
              Produk untuk kategori atau provider ini akan segera hadir.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
