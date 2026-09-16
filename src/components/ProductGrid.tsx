'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types/database';
import { initialProducts } from '@/data/seed-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAdminPortal } from '@/context/AdminPortalContext';
import ProductCard from './ProductCard';
import { Sparkles, Loader2 } from 'lucide-react';

export default function ProductGrid() {
  const { dataVersion } = useAdminPortal();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      if (!isSupabaseConfigured()) {
        setProducts(initialProducts);
        setLoading(false);
        return;
      }

      try {
        // Fetch active products with their active packages
        const { data, error } = await supabase
          .from('products')
          .select('*, packages:product_packages(*)')
          .eq('active', true)
          .order('created_at', { ascending: true });

        if (error) {
          console.warn('Gagal memuat produk dari Supabase, menggunakan data fallback:', error.message);
          setProducts(initialProducts);
        } else if (data && data.length > 0) {
          setProducts(data as Product[]);
        } else {
          setProducts(initialProducts);
        }
      } catch (err) {
        console.error('Error fetch products:', err);
        setProducts(initialProducts);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [dataVersion]);

  return (
    <section id="aplikasi" className="py-16 bg-zinc-950/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-xs font-medium text-cyan-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Katalog Lengkap</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 justify-center sm:justify-start">
              <span>🔥 Aplikasi Premium</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              Pilih aplikasi favorit Anda dengan berbagai pilihan durasi dan harga terjangkau.
            </p>
          </div>

          <div className="text-xs text-zinc-500 hidden sm:block">
            Menampilkan <span className="text-cyan-400 font-bold">{products.length}</span> produk
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            <span className="ml-2 text-xs text-zinc-400">Memuat katalog aplikasi...</span>
          </div>
        )}

        {/* Responsive Grid: Desktop 4 col, Tablet 3 col, Mobile 2 col */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
