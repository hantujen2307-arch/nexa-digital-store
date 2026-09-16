'use client';

import React, { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import PackageCard from '@/components/PackageCard';
import { Product, ProductPackage } from '@/types/database';
import { initialProducts } from '@/data/seed-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { formatRupiah, getProductOrderWhatsAppUrl } from '@/lib/whatsapp';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  Check, 
  Sparkles, 
  Loader2, 
  Tag, 
  MessageCircle,
  HelpCircle,
  Download,
  ExternalLink
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [packages, setPackages] = useState<ProductPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    async function fetchProductDetail() {
      if (!slug) return;

      // Check fallback initial data first
      const fallbackProduct = initialProducts.find((p) => p.slug === slug);

      if (!isSupabaseConfigured()) {
        if (fallbackProduct) {
          setProduct(fallbackProduct);
          setPackages(fallbackProduct.packages || []);
        } else {
          setNotFoundState(true);
        }
        setLoading(false);
        return;
      }

      try {
        // Fetch from Supabase
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*, packages:product_packages(*)')
          .eq('slug', slug)
          .eq('active', true)
          .single();

        if (prodError || !prodData) {
          if (fallbackProduct) {
            setProduct(fallbackProduct);
            setPackages(fallbackProduct.packages || []);
          } else {
            setNotFoundState(true);
          }
        } else {
          setProduct(prodData as Product);
          const activePackages = (prodData.packages as ProductPackage[])?.filter((p) => p.active) || [];
          setPackages(activePackages);
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
        if (fallbackProduct) {
          setProduct(fallbackProduct);
          setPackages(fallbackProduct.packages || []);
        } else {
          setNotFoundState(true);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProductDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="ml-3 text-sm text-zinc-400">Memuat detail produk...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFoundState || !product) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-zinc-500">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Produk Tidak Ditemukan</h1>
          <p className="text-sm text-zinc-400 max-w-md mb-6">
            Produk yang Anda cari mungkin sudah tidak aktif atau tautan telah berpindah.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-cyan-500 text-zinc-950 hover:bg-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const defaultPackage = packages.length > 0 ? packages[0] : null;
  const defaultPackageOriginalPrice = defaultPackage?.original_price || (defaultPackage && defaultPackage.price > 0 ? Math.round((defaultPackage.price * 1.8) / 5000) * 5000 : null);
  const defaultDiscountPercent = defaultPackage && defaultPackageOriginalPrice && defaultPackageOriginalPrice > defaultPackage.price
    ? Math.round(((defaultPackageOriginalPrice - defaultPackage.price) / defaultPackageOriginalPrice) * 100)
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-cyan-500 selection:text-zinc-950">
      <Navbar />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Back Link */}
          <div className="mb-6">
            <Link
              href="/#aplikasi"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Katalog Aplikasi</span>
            </Link>
          </div>

          {/* Product Overview Header */}
          <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-6 sm:p-8 mb-10 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Logo */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0 shadow-xl">
                {product.logo_url ? (
                  <img
                    src={product.logo_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Sparkles className="w-8 h-8 text-cyan-400" />
                )}
              </div>

              {/* Title, Badge & Tagline */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    {product.category}
                  </span>
                  {product.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {product.badge}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                  {product.name}
                </h1>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
                  {product.description}
                </p>
              </div>

              {/* Quick WhatsApp Action (Right Desktop) */}
              {defaultPackage && (
                <div className="hidden lg:flex flex-col items-end gap-1.5 shrink-0 border-l border-zinc-800/80 pl-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Mulai dari</span>
                    {defaultDiscountPercent && defaultDiscountPercent > 0 && (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-950/40 border border-rose-800/40 px-1.5 py-0.5 rounded">
                        Hemat {defaultDiscountPercent}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl font-black text-white">
                      {formatRupiah(defaultPackage.price)}
                    </span>
                    {defaultPackageOriginalPrice && defaultPackageOriginalPrice > defaultPackage.price && (
                      <span className="text-sm text-zinc-500 line-through font-medium">
                        {formatRupiah(defaultPackageOriginalPrice)}
                      </span>
                    )}
                  </div>
                  <a
                    href={getProductOrderWhatsAppUrl(product.name, defaultPackage.duration, defaultPackage.price)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-950/40"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Beli Sekarang</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Full Description & Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Full Description Card */}
              <div className="p-6 sm:p-7 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <span>Deskripsi Lengkap</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                  {product.full_description || product.description}
                </p>
              </div>

              {/* Product Information & Guarantees */}
              <div className="p-6 sm:p-7 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
                <h3 className="text-base font-bold text-white mb-4">
                  Informasi & Jaminan Layanan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-300">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block mb-0.5">Garansi Penggantian</span>
                      <p className="text-zinc-400 text-[11px]">
                        Jika akun mengalami kendala selama durasi aktif, admin siap replace atau bantu reset.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                    <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block mb-0.5">Pengiriman Cepat</span>
                      <p className="text-zinc-400 text-[11px]">
                        Akun dikirim via WhatsApp dalam 5-15 menit setelah pembayaran diverifikasi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download / Panduan Akses (Jika ada) */}
              {product.download_url && (
                <div className="p-6 sm:p-7 rounded-2xl bg-zinc-900/40 border border-cyan-500/30">
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Link Download & Panduan</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mb-4">
                    Unduh aplikasi atau akses panduan instalasi resmi melalui tautan di bawah:
                  </p>
                  <a
                    href={product.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/60 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka Link Download / Panduan</span>
                  </a>
                </div>
              )}
            </div>

            {/* Right Column: Package Selection & WhatsApp Purchase */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  <span>Pilihan Paket</span>
                </h3>
                <span className="text-xs text-zinc-400">
                  {packages.length} Paket Tersedia
                </span>
              </div>

              {packages.length > 0 ? (
                <div className="space-y-3">
                  {packages.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      productName={product.name}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center">
                  <p className="text-xs text-zinc-400 mb-4">
                    Belum ada paket khusus untuk produk ini. Anda dapat langsung menanyakan harga ke admin.
                  </p>
                  <a
                    href={getProductOrderWhatsAppUrl(product.name, 'Reguler', product.min_price || 0)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Tanya Admin via WA</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
