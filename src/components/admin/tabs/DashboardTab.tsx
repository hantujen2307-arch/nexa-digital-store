'use client';

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { initialProducts, initialServices, initialCinemaPromos } from '@/data/seed-data';
import { DashboardStats } from '@/types/database';
import { useAdminPortal, AdminTab } from '@/context/AdminPortalContext';
import { 
  Package, 
  Video, 
  Ticket, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  Sparkles,
  Loader2,
  ExternalLink
} from 'lucide-react';

export default function DashboardTab() {
  const { openDashboard, setIsCreatingProduct, closeDashboard } = useAdminPortal();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: initialProducts.length,
    activeProducts: initialProducts.filter((p) => p.active).length,
    totalServices: initialServices.length,
    totalPromos: initialCinemaPromos.length,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      try {
        const [prodRes, servRes, promoRes] = await Promise.all([
          supabase.from('products').select('id, active'),
          supabase.from('services').select('id', { count: 'exact' }),
          supabase.from('cinema_promos').select('id', { count: 'exact' }),
        ]);

        const products = prodRes.data || [];
        setStats({
          totalProducts: products.length,
          activeProducts: products.filter((p) => p.active).length,
          totalServices: servRes.count || 0,
          totalPromos: promoRes.count || 0,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const handleAddNewProduct = () => {
    openDashboard('products');
    setIsCreatingProduct(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Dashboard Administrator
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Kelola katalog produk aplikasi, jasa editing, promo tiket bioskop, dan informasi WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddNewProduct}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Produk */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400">Total Produk</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/50 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-zinc-600" /> : stats.totalProducts}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Aplikasi di database</span>
        </div>

        {/* Produk Aktif */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400">Produk Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-zinc-600" /> : stats.activeProducts}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Tampil di katalog publik</span>
        </div>

        {/* Total Jasa */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400">Total Jasa</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/50 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-zinc-600" /> : stats.totalServices}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Layanan editing & desain</span>
        </div>

        {/* Total Promo Bioskop */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400">Total Promo</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/50 border border-amber-800/60 flex items-center justify-center text-amber-400">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-zinc-600" /> : stats.totalPromos}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Promo tiket bioskop</span>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => openDashboard('products')}
          className="text-left p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-900 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/40 text-cyan-400 flex items-center justify-center border border-cyan-800/50">
              <Package className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Kelola Produk & Paket</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Ubah nama, deskripsi, logo, paket durasi, serta harga aplikasi premium.
          </p>
        </button>

        <button
          type="button"
          onClick={() => openDashboard('services')}
          className="text-left p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-900 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/40 text-purple-400 flex items-center justify-center border border-purple-800/50">
              <Video className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Kelola Jasa Editing</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Tambah layanan editing video TikTok, Reels, YouTube, desain poster, dan update harga.
          </p>
        </button>

        <button
          type="button"
          onClick={() => openDashboard('promos')}
          className="text-left p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/40 text-amber-400 flex items-center justify-center border border-amber-800/50">
              <Ticket className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Kelola Promo Bioskop</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Update promo bioskop XXI, CGV, Cinépolis, tanggal periode diskon, dan poster promo.
          </p>
        </button>
      </div>

      {/* Info Callout */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
          <p className="text-xs text-zinc-400">
            Perubahan yang Anda simpan langsung tersimpan ke Supabase tanpa perlu restart server atau coding ulang.
          </p>
        </div>

        <button
          type="button"
          onClick={closeDashboard}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:text-white shrink-0 self-start sm:self-auto"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Lihat Website Toko</span>
        </button>
      </div>
    </div>
  );
}
