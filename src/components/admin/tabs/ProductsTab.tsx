'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductPackage } from '@/types/database';
import { initialProducts } from '@/data/seed-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
import { formatRupiah } from '@/lib/whatsapp';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Toast, { ToastMessage } from '@/components/admin/Toast';
import { useAdminPortal } from '@/context/AdminPortalContext';
import { getProductSoldCount } from '@/lib/products';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Search, 
  X, 
  Filter,
  ArrowLeft,
  Save,
  Upload,
  Coins,
  Check,
  Tag
} from 'lucide-react';

export default function ProductsTab() {
  const { 
    editingProductId, 
    setEditingProductId, 
    isCreatingProduct, 
    setIsCreatingProduct,
    triggerDataRefresh
  } = useAdminPortal();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Confirmation & Toast state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Form states for New / Edit Product
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [formDesc, setFormDesc] = useState('');
  const [formFullDesc, setFormFullDesc] = useState('');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formCategory, setFormCategory] = useState('Streaming');
  const [formDownloadUrl, setFormDownloadUrl] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formUploading, setFormUploading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Packages state for Edit mode
  const [packages, setPackages] = useState<ProductPackage[]>([]);
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [pkgDuration, setPkgDuration] = useState('');
  const [pkgPrice, setPkgPrice] = useState('');
  const [pkgOriginalPrice, setPkgOriginalPrice] = useState('');
  const [pkgActive, setPkgActive] = useState(true);
  const [savingPkg, setSavingPkg] = useState(false);
  const [pkgToDelete, setPkgToDelete] = useState<ProductPackage | null>(null);

  const loadProducts = async () => {
    if (!isSupabaseConfigured()) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, packages:product_packages(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Fallback products:', error);
        setProducts(initialProducts);
      } else if (data) {
        setProducts(data as Product[]);
      }
    } catch (err) {
      console.error(err);
      setProducts(initialProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // When editingProductId changes, load that product's details into form
  useEffect(() => {
    if (editingProductId) {
      const prod = products.find((p) => p.id === editingProductId);
      if (prod) {
        setFormName(prod.name);
        setFormSlug(prod.slug);
        setIsSlugManual(true);
        setFormDesc(prod.description);
        setFormFullDesc(prod.full_description || prod.description);
        setFormLogoUrl(prod.logo_url);
        setFormBadge(prod.badge || '');
        setFormCategory(prod.category || 'Streaming');
        setFormDownloadUrl(prod.download_url || '');
        setFormActive(prod.active);
        setPackages(prod.packages || []);
      }
    } else if (isCreatingProduct) {
      setFormName('');
      setFormSlug('');
      setIsSlugManual(false);
      setFormDesc('');
      setFormFullDesc('');
      setFormLogoUrl('');
      setFormBadge('');
      setFormCategory('Streaming');
      setFormDownloadUrl('');
      setFormActive(true);
      setPackages([]);
    }
    setFormError(null);
  }, [editingProductId, isCreatingProduct, products]);

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && p.active) ||
        (statusFilter === 'inactive' && !p.active);

      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, statusFilter]);

  // Toggle active/inactive
  const handleToggleActive = async (product: Product) => {
    const newStatus = !product.active;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, active: newStatus } : p))
    );

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('products')
        .update({ active: newStatus, updated_at: new Date().toISOString() })
        .eq('id', product.id);

      if (error) {
        setToast({
          id: String(Date.now()),
          type: 'error',
          title: 'Gagal Mengubah Status',
          text: error.message,
        });
        loadProducts();
        return;
      }
    }

    setToast({
      id: String(Date.now()),
      type: 'success',
      title: 'Status Diperbarui',
      text: `${product.name} sekarang ${newStatus ? 'Aktif di katalog' : 'Dinonaktifkan'}.`,
    });
    triggerDataRefresh();
  };

  // Delete product
  const handleConfirmDeleteProduct = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) {
        setToast({
          id: String(Date.now()),
          type: 'error',
          title: 'Gagal Menghapus',
          text: error.message,
        });
        setIsDeleting(false);
        setDeleteTarget(null);
        return;
      }
    }

    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setToast({
      id: String(Date.now()),
      type: 'success',
      title: 'Produk Dihapus',
      text: `Produk "${deleteTarget.name}" berhasil dihapus.`,
    });
    triggerDataRefresh();

    setIsDeleting(false);
    setDeleteTarget(null);
    if (editingProductId === deleteTarget.id) {
      setEditingProductId(null);
    }
  };

  // Handle Logo Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berformat gambar (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 5 MB.');
      return;
    }

    setFormUploading(true);
    const { url, error } = await uploadImage(file, 'product-images');
    if (error) {
      alert(`Gagal upload: ${error.message}`);
    } else if (url) {
      setFormLogoUrl(url);
    }
    setFormUploading(false);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Nama produk wajib diisi.');
      return;
    }
    if (!formSlug.trim()) {
      setFormError('Slug URL wajib diisi.');
      return;
    }
    if (!formDesc.trim()) {
      setFormError('Deskripsi singkat wajib diisi.');
      return;
    }

    setFormSubmitting(true);

    const payload = {
      name: formName.trim(),
      slug: formSlug.trim(),
      description: formDesc.trim(),
      full_description: formFullDesc.trim() || formDesc.trim(),
      logo_url: formLogoUrl.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      category: formCategory.trim(),
      badge: formBadge.trim() || null,
      download_url: formDownloadUrl.trim() || null,
      active: formActive,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        if (isCreatingProduct) {
          // Check slug uniqueness
          const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('slug', formSlug.trim())
            .maybeSingle();

          if (existing) {
            setFormError(`Slug "${formSlug.trim()}" sudah digunakan. Gunakan slug lain.`);
            setFormSubmitting(false);
            return;
          }

          const { data, error } = await supabase
            .from('products')
            .insert({ ...payload, created_at: new Date().toISOString() })
            .select('id')
            .single();

          if (error) throw error;

          setToast({
            id: String(Date.now()),
            type: 'success',
            title: 'Produk Berhasil Ditambahkan',
            text: 'Sekarang Anda dapat menambahkan paket durasi & harga.',
          });

          await loadProducts();
          triggerDataRefresh();
          setIsCreatingProduct(false);
          setEditingProductId(data.id);
        } else if (editingProductId) {
          const { error } = await supabase
            .from('products')
            .update(payload)
            .eq('id', editingProductId);

          if (error) throw error;

          setToast({
            id: String(Date.now()),
            type: 'success',
            title: 'Produk Diperbarui',
            text: `Perubahan pada "${formName}" berhasil disimpan ke Supabase.`,
          });

          await loadProducts();
          triggerDataRefresh();
        }
      } catch (err: unknown) {
        setFormError((err as Error).message || 'Gagal menyimpan produk.');
      } finally {
        setFormSubmitting(false);
      }
    } else {
      setToast({
        id: String(Date.now()),
        type: 'success',
        title: 'Tersimpan (Mode Lokal)',
        text: 'Perubahan produk berhasil disimpan.',
      });
      setFormSubmitting(false);
      setIsCreatingProduct(false);
      setEditingProductId(null);
    }
  };

  // Save / Add Package for editingProductId
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId) return;

    if (!pkgDuration.trim()) {
      alert('Durasi paket wajib diisi (contoh: 1 Bulan).');
      return;
    }
    const numPrice = Number(pkgPrice.replace(/[^0-9]/g, ''));
    if (!numPrice || numPrice <= 0) {
      alert('Harga paket harus lebih besar dari Rp 0.');
      return;
    }
    const numOriginalPrice = pkgOriginalPrice.trim() ? Number(pkgOriginalPrice.replace(/[^0-9]/g, '')) : null;

    setSavingPkg(true);

    if (isSupabaseConfigured()) {
      try {
        if (editingPkgId) {
          // Update package
          const { error } = await supabase
            .from('product_packages')
            .update({
              duration: pkgDuration.trim(),
              price: numPrice,
              original_price: numOriginalPrice,
              active: pkgActive,
            })
            .eq('id', editingPkgId);

          if (error) throw error;

          setToast({
            id: String(Date.now()),
            type: 'success',
            title: 'Paket Diperbarui',
            text: `Paket ${pkgDuration} diperbarui menjadi ${formatRupiah(numPrice)}.`,
          });
        } else {
          // Insert package
          const { error } = await supabase
            .from('product_packages')
            .insert({
              product_id: editingProductId,
              duration: pkgDuration.trim(),
              price: numPrice,
              original_price: numOriginalPrice,
              active: pkgActive,
              created_at: new Date().toISOString(),
            });

          if (error) throw error;

          setToast({
            id: String(Date.now()),
            type: 'success',
            title: 'Paket Ditambahkan',
            text: `Paket ${pkgDuration} (${formatRupiah(numPrice)}) berhasil dibuat.`,
          });
        }

        // Reload packages
        const { data: updatedPkgs } = await supabase
          .from('product_packages')
          .select('*')
          .eq('product_id', editingProductId)
          .order('price', { ascending: true });

        if (updatedPkgs) setPackages(updatedPkgs as ProductPackage[]);
        await loadProducts();
        triggerDataRefresh();

        // Reset package form
        setEditingPkgId(null);
        setPkgDuration('');
        setPkgPrice('');
        setPkgOriginalPrice('');
        setPkgActive(true);
      } catch (err: unknown) {
        alert(`Gagal menyimpan paket: ${(err as Error).message}`);
      } finally {
        setSavingPkg(false);
      }
    }
  };

  // Delete Package
  const handleConfirmDeletePackage = async () => {
    if (!pkgToDelete) return;

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('product_packages')
        .delete()
        .eq('id', pkgToDelete.id);

      if (error) {
        alert(`Gagal menghapus paket: ${error.message}`);
        setPkgToDelete(null);
        return;
      }
    }

    setPackages((prev) => prev.filter((p) => p.id !== pkgToDelete.id));
    setToast({
      id: String(Date.now()),
      type: 'success',
      title: 'Paket Dihapus',
      text: `Paket ${pkgToDelete.duration} berhasil dihapus.`,
    });
    setPkgToDelete(null);
    await loadProducts();
    triggerDataRefresh();
  };

  // ==========================================
  // RENDER: CREATE OR EDIT PRODUCT FORM
  // ==========================================
  if (isCreatingProduct || editingProductId) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsCreatingProduct(false);
                setEditingProductId(null);
              }}
              type="button"
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isCreatingProduct ? 'Tambah Produk Baru' : `Edit Produk: ${formName}`}
              </h2>
              <p className="text-xs text-zinc-400">
                {isCreatingProduct
                  ? 'Isi informasi aplikasi dan logo, kemudian atur paket durasi & harga.'
                  : 'Kelola informasi produk, gambar, status, serta daftar paket & harga.'}
              </p>
            </div>
          </div>

          {editingProductId && (
            <button
              type="button"
              onClick={() => {
                const p = products.find((x) => x.id === editingProductId);
                if (p) setDeleteTarget(p);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 bg-red-950/30 border border-red-800/40 hover:bg-red-900/50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Produk</span>
            </button>
          )}
        </div>

        {formError && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300">
            {formError}
          </div>
        )}

        {/* Form Details */}
        <form onSubmit={handleSaveProduct} className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
                Nama Produk <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (!isSlugManual) {
                    setFormSlug(
                      e.target.value
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '')
                    );
                  }
                }}
                placeholder="Contoh: Canva Pro"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
                Slug URL <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formSlug}
                onChange={(e) => {
                  setFormSlug(e.target.value);
                  setIsSlugManual(true);
                }}
                placeholder="canva-pro"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
                Kategori
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Streaming">Streaming Video</option>
                <option value="Musik">Musik</option>
                <option value="Produktivitas">Produktivitas</option>
                <option value="Desain">Desain</option>
                <option value="AI">Tools AI</option>
                <option value="Cloud Storage">Cloud Storage</option>
                <option value="Edukasi">Edukasi</option>
                <option value="Sosial">Sosial Media</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
                Badge (Opsional)
              </label>
              <input
                type="text"
                value={formBadge}
                onChange={(e) => setFormBadge(e.target.value)}
                placeholder="Populer, Best Seller, dll"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
              Deskripsi Singkat <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Deskripsi singkat untuk kartu katalog beranda"
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
              Deskripsi Lengkap
            </label>
            <textarea
              rows={3}
              value={formFullDesc}
              onChange={(e) => setFormFullDesc(e.target.value)}
              placeholder="Fitur lengkap, keunggulan, panduan penggunaan..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Logo Upload with Supabase Storage */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
              Logo / Gambar Aplikasi
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={formLogoUrl}
                onChange={(e) => setFormLogoUrl(e.target.value)}
                placeholder="https://... atau klik Upload"
                className="w-full flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              />
              <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 cursor-pointer border border-zinc-700 transition-colors shrink-0">
                {formUploading ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <Upload className="w-4 h-4" />}
                <span>{formUploading ? 'Mengunggah...' : 'Upload Gambar'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={formUploading}
                  className="hidden"
                />
              </label>
            </div>

            {formLogoUrl && (
              <div className="mt-2.5 flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 overflow-hidden shrink-0">
                  <img src={formLogoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] text-zinc-400 truncate flex-1">{formLogoUrl}</span>
                <button
                  type="button"
                  onClick={() => setFormLogoUrl('')}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>

          {/* Download URL / Tutorial Link */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 uppercase tracking-wider">
              Link Download / Panduan Akses (Opsional)
            </label>
            <input
              type="url"
              value={formDownloadUrl}
              onChange={(e) => setFormDownloadUrl(e.target.value)}
              placeholder="https://drive.google.com/... atau https://play.google.com/..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formActive}
                onChange={(e) => setFormActive(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-zinc-950 border-zinc-700"
              />
              <span className="text-xs font-semibold text-zinc-300">
                Aktifkan produk di katalog publik
              </span>
            </label>

            <button
              type="submit"
              disabled={formSubmitting || formUploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-all shadow-md shadow-cyan-950/40 disabled:opacity-50"
            >
              {formSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isCreatingProduct ? 'Simpan Produk' : 'Simpan Perubahan'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* PACKAGE MANAGEMENT SECTION (For Edit Mode) */}
        {editingProductId && (
          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-cyan-400" />
                  <span>Paket Durasi & Harga</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Tambahkan atau ubah varian durasi akun dan harga untuk produk ini.
                </p>
              </div>
            </div>

            {/* Add / Edit Package Form */}
            <form onSubmit={handleSavePackage} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Durasi Paket
                  </label>
                  <input
                    type="text"
                    required
                    value={pkgDuration}
                    onChange={(e) => setPkgDuration(e.target.value)}
                    placeholder="1 Bulan"
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Harga Jual (Rp)
                  </label>
                  <input
                    type="text"
                    required
                    value={pkgPrice}
                    onChange={(e) => setPkgPrice(e.target.value)}
                    placeholder="25000"
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Harga Asli Coret (Opsional)
                  </label>
                  <input
                    type="text"
                    value={pkgOriginalPrice}
                    onChange={(e) => setPkgOriginalPrice(e.target.value)}
                    placeholder="95000"
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    disabled={savingPkg}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
                  >
                    {savingPkg ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{editingPkgId ? 'Simpan' : '+ Tambah'}</span>
                      </>
                    )}
                  </button>

                  {editingPkgId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPkgId(null);
                        setPkgDuration('');
                        setPkgPrice('');
                        setPkgOriginalPrice('');
                        setPkgActive(true);
                      }}
                      className="px-3 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* Packages List */}
            <div className="space-y-2">
              {packages.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  Belum ada paket harga. Tambahkan paket pertama di atas.
                </div>
              ) : (
                packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                        <Tag className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">{pkg.duration}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-cyan-400 font-semibold">{formatRupiah(pkg.price)}</span>
                          {pkg.original_price && pkg.original_price > pkg.price && (
                            <span className="text-[11px] text-zinc-500 line-through">
                              {formatRupiah(pkg.original_price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPkgId(pkg.id);
                          setPkgDuration(pkg.duration);
                          setPkgPrice(String(pkg.price));
                          setPkgOriginalPrice(pkg.original_price ? String(pkg.original_price) : '');
                          setPkgActive(pkg.active);
                        }}
                        className="p-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Edit Paket"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setPkgToDelete(pkg)}
                        className="p-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/40 transition-colors"
                        title="Hapus Paket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Modals & Toasts */}
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Hapus Produk?"
          message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}"? Seluruh paket harga terkait juga akan terhapus.`}
          confirmText="Hapus Permanen"
          cancelText="Batal"
          isDangerous={true}
          isLoading={isDeleting}
          onConfirm={handleConfirmDeleteProduct}
          onCancel={() => setDeleteTarget(null)}
        />

        <ConfirmDialog
          isOpen={Boolean(pkgToDelete)}
          title="Hapus Paket Harga?"
          message={`Apakah Anda yakin ingin menghapus paket "${pkgToDelete?.duration}" (${pkgToDelete ? formatRupiah(pkgToDelete.price) : ''})?`}
          confirmText="Hapus Paket"
          cancelText="Batal"
          isDangerous={true}
          isLoading={false}
          onConfirm={handleConfirmDeletePackage}
          onCancel={() => setPkgToDelete(null)}
        />

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  // ==========================================
  // RENDER: PRODUCTS LIST TABLE
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Manajemen Produk Aplikasi
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Daftar aplikasi premium. Tambah produk, edit paket durasi & harga, atau aktif/nonaktifkan.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingProduct(true)}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Produk</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari produk, kategori, slug..."
            className="w-full pl-9 pr-9 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800/80'
            }`}
          >
            Semua ({products.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'active'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800/80'
            }`}
          >
            Aktif ({products.filter((p) => p.active).length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'inactive'
                ? 'bg-zinc-700/40 text-zinc-300 border border-zinc-600'
                : 'text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800/80'
            }`}
          >
            Nonaktif ({products.filter((p) => !p.active).length})
          </button>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-16 flex items-center justify-center text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mr-2" />
            <span className="text-xs">Memuat daftar produk...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-zinc-400 mb-2">
              Tidak ada produk yang sesuai dengan pencarian atau filter.
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="text-xs text-cyan-400 hover:underline"
              >
                Reset filter pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-bold tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="px-5 py-3.5">Logo & Nama</th>
                  <th className="px-4 py-3.5">Kategori</th>
                  <th className="px-4 py-3.5">Harga Mulai</th>
                  <th className="px-4 py-3.5">Paket</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredProducts.map((product) => {
                  const minPrice = product.packages && product.packages.length > 0
                    ? Math.min(...product.packages.map((p) => p.price))
                    : product.min_price;

                  return (
                    <tr key={product.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/60 overflow-hidden flex items-center justify-center shrink-0">
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
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{product.name}</span>
                            {product.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                                {product.badge}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                              Terjual {getProductSoldCount(product)}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-500 line-clamp-1 max-w-xs">
                            {product.description}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-medium border border-zinc-700/50">
                          {product.category || 'Umum'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap font-bold text-white">
                        {formatRupiah(minPrice)}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-zinc-400">
                        {product.packages?.length || 0} Paket
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(product)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                            product.active
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/40'
                              : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:bg-zinc-700'
                          }`}
                        >
                          {product.active ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Nonaktif</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProductId(product.id);
                            setIsCreatingProduct(false);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Edit & Paket</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 transition-colors"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus Produk?"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}"? Seluruh paket harga terkait juga akan terhapus.`}
        confirmText="Hapus Permanen"
        cancelText="Batal"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDeleteProduct}
        onCancel={() => setDeleteTarget(null)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
