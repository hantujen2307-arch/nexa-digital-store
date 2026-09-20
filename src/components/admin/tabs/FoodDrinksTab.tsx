'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FoodDrink } from '@/types/database';
import { initialFoodDrinks } from '@/data/food-drinks';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
import { formatRupiah } from '@/lib/whatsapp';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Toast, { ToastMessage } from '@/components/admin/Toast';
import { useAdminPortal } from '@/context/AdminPortalContext';
import {
  Plus,
  Edit3,
  Trash2,
  Utensils,
  Upload,
  Save,
  X,
  Loader2,
  CheckCircle,
  XCircle,
  Search,
  Star,
  StarOff,
  ArrowUpDown,
  Image as ImageIcon,
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = ['Makanan', 'Minuman', 'Snack', 'Dessert', 'Lainnya'];

/** Buat slug dari nama produk */
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

type SortField = 'created_at' | 'price' | 'stock' | 'name';
type SortDir = 'asc' | 'desc';

// ─── Component ───────────────────────────────────────────────────────────────

export default function FoodDrinksTab() {
  const { triggerDataRefresh } = useAdminPortal();

  const [items, setItems] = useState<FoodDrink[]>(initialFoodDrinks);
  const [loading, setLoading] = useState(true);

  // Search, filter, sort
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [formCategory, setFormCategory] = useState('Makanan');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formStatus, setFormStatus] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete & toast
  const [deleteTarget, setDeleteTarget] = useState<FoodDrink | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // ─── Load ─────────────────────────────────────────────────────────────────

  const loadItems = async () => {
    if (!isSupabaseConfigured()) {
      setItems(initialFoodDrinks);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('food_drinks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('food_drinks table not found, using seed data fallback:', error.message);
        setItems(initialFoodDrinks);
      } else {
        setItems((data as FoodDrink[]) ?? initialFoodDrinks);
      }
    } catch (err) {
      console.error('Error fetching food_drinks:', err);
      setItems(initialFoodDrinks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadItems(); }, []);

  // ─── Filtered & Sorted ───────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = items.filter((d) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.slug.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && d.status) ||
        (statusFilter === 'inactive' && !d.status);
      const matchCat = categoryFilter === 'all' || d.category === categoryFilter;
      return matchSearch && matchStatus && matchCat;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'price') cmp = a.price - b.price;
      else if (sortField === 'stock') cmp = a.stock - b.stock;
      else if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else cmp = new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [items, searchQuery, statusFilter, categoryFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  // ─── Stats ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter((d) => d.status).length,
    inactive: items.filter((d) => !d.status).length,
    outOfStock: items.filter((d) => d.status && d.stock === 0).length,
    featured: items.filter((d) => d.is_featured).length,
  }), [items]);

  // ─── Unique categories ────────────────────────────────────────────────────

  const usedCategories = useMemo(() => {
    const cats = Array.from(new Set(items.map((d) => d.category)));
    return cats;
  }, [items]);

  // ─── Modal helpers ────────────────────────────────────────────────────────

  const resetForm = () => {
    setEditingId(null);
    setFormName(''); setFormSlug(''); setIsSlugManual(false);
    setFormCategory('Makanan'); setFormDescription('');
    setFormPrice(''); setFormOriginalPrice(''); setFormStock('');
    setFormImageUrl(''); setFormStatus(true); setFormIsFeatured(false);
    setFormError(null);
  };

  const openAdd = () => { resetForm(); setIsModalOpen(true); };

  const openEdit = (d: FoodDrink) => {
    setEditingId(d.id);
    setFormName(d.name); setFormSlug(d.slug); setIsSlugManual(true);
    setFormCategory(d.category); setFormDescription(d.description);
    setFormPrice(d.price.toString());
    setFormOriginalPrice(d.original_price ? d.original_price.toString() : '');
    setFormStock(d.stock.toString());
    setFormImageUrl(d.image_url ?? '');
    setFormStatus(d.status); setFormIsFeatured(d.is_featured);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Auto slug from name
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!isSlugManual) setFormSlug(toSlug(val));
  };

  const handleSlugChange = (val: string) => {
    setFormSlug(toSlug(val));
    setIsSlugManual(true);
  };

  // ─── Image upload ─────────────────────────────────────────────────────────

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast({ id: Date.now().toString(), type: 'error', text: 'File harus berformat gambar (JPG, PNG, WEBP).' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ id: Date.now().toString(), type: 'error', text: 'Ukuran gambar maksimal 5 MB.' });
      return;
    }
    setUploadingImage(true);
    const { url, error } = await uploadImage(file, 'food-drink-images');
    if (error) {
      setToast({ id: Date.now().toString(), type: 'error', text: `Gagal upload: ${error.message}` });
    } else if (url) {
      setFormImageUrl(url);
      setToast({ id: Date.now().toString(), type: 'success', text: 'Gambar berhasil diunggah.' });
    }
    setUploadingImage(false);
  };

  // ─── Toggle active ────────────────────────────────────────────────────────

  const handleToggleStatus = async (d: FoodDrink) => {
    const newStatus = !d.status;
    setItems((prev) => prev.map((x) => x.id === d.id ? { ...x, status: newStatus } : x));

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('food_drinks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', d.id);
      if (error) {
        setToast({ id: Date.now().toString(), type: 'error', text: `Gagal ubah status: ${error.message}` });
        loadItems(); return;
      }
    }
    setToast({
      id: Date.now().toString(), type: 'success',
      text: `"${d.name}" diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}.`,
    });
    triggerDataRefresh();
  };

  // ─── Toggle featured ──────────────────────────────────────────────────────

  const handleToggleFeatured = async (d: FoodDrink) => {
    const newFeatured = !d.is_featured;
    setItems((prev) => prev.map((x) => x.id === d.id ? { ...x, is_featured: newFeatured } : x));

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('food_drinks')
        .update({ is_featured: newFeatured, updated_at: new Date().toISOString() })
        .eq('id', d.id);
      if (error) {
        setToast({ id: Date.now().toString(), type: 'error', text: `Gagal: ${error.message}` });
        loadItems(); return;
      }
    }
    setToast({
      id: Date.now().toString(), type: 'success',
      text: `"${d.name}" ${newFeatured ? 'ditandai unggulan' : 'dihapus dari unggulan'}.`,
    });
  };

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('food_drinks').delete().eq('id', deleteTarget.id);
        if (error) throw error;
      }
      setItems((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setToast({ id: Date.now().toString(), type: 'success', text: `"${deleteTarget.name}" berhasil dihapus.` });
      triggerDataRefresh();
    } catch (err: unknown) {
      setToast({ id: Date.now().toString(), type: 'error', text: `Gagal hapus: ${(err as Error).message}` });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ─── Submit (Add / Edit) ──────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validasi
    if (!formName.trim()) { setFormError('Nama produk wajib diisi.'); return; }
    if (!formSlug.trim()) { setFormError('Slug wajib diisi.'); return; }
    if (!formCategory) { setFormError('Kategori wajib dipilih.'); return; }
    const priceNum = parseFloat(formPrice.replace(/[^0-9.]/g, ''));
    if (isNaN(priceNum) || priceNum < 0) { setFormError('Harga harus angka ≥ 0.'); return; }
    const stockNum = parseInt(formStock.replace(/[^0-9]/g, ''), 10);
    if (isNaN(stockNum) || stockNum < 0) { setFormError('Stok harus angka ≥ 0.'); return; }

    setSubmitting(true);
    const originalPriceNum = formOriginalPrice.trim()
      ? parseFloat(formOriginalPrice.replace(/[^0-9.]/g, ''))
      : null;

    const payload = {
      name: formName.trim(),
      slug: formSlug.trim(),
      description: formDescription.trim(),
      category: formCategory,
      price: priceNum,
      original_price: originalPriceNum,
      image_url: formImageUrl.trim() || null,
      stock: stockNum,
      status: formStatus,
      is_featured: formIsFeatured,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingId) {
        // UPDATE
        if (isSupabaseConfigured()) {
          const { error } = await supabase.from('food_drinks').update(payload).eq('id', editingId);
          if (error) throw error;
        }
        setItems((prev) => prev.map((d) => d.id === editingId ? { ...d, ...payload } : d));
        setToast({ id: Date.now().toString(), type: 'success', text: `"${payload.name}" berhasil diperbarui!` });
      } else {
        // INSERT
        const newPayload = { ...payload, created_at: new Date().toISOString() };
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('food_drinks').insert(newPayload).select('*').single();
          if (error) throw error;
          if (data) setItems((prev) => [data as FoodDrink, ...prev]);
        } else {
          const mock: FoodDrink = { id: `fd-${Date.now()}`, ...newPayload };
          setItems((prev) => [mock, ...prev]);
        }
        setToast({ id: Date.now().toString(), type: 'success', text: `"${payload.name}" berhasil ditambahkan!` });
      }
      triggerDataRefresh();
      setIsModalOpen(false);
      resetForm();
    } catch (err: unknown) {
      const msg = (err as Error).message;
      if (msg?.includes('duplicate') || msg?.includes('unique')) {
        setFormError(`Slug "${payload.slug}" sudah digunakan. Coba slug lain.`);
      } else {
        setFormError(`Gagal menyimpan: ${msg}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      type="button"
      onClick={() => toggleSort(field)}
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
        sortField === field ? 'text-teal-400' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {label}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Produk Makanan & Minuman"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Produk"
        cancelText="Batal"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-400" />
            <span>Manajemen Makanan & Minuman</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Kelola daftar makanan dan minuman yang tersedia di toko.
          </p>
        </div>
        <button
          type="button"
          id="btn-tambah-food-drink"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-orange-400 hover:bg-orange-300 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Makanan / Minuman</span>
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Produk', value: stats.total, color: 'text-white', bg: 'bg-zinc-900/60 border-zinc-800' },
          { label: 'Aktif', value: stats.active, color: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-800/30' },
          { label: 'Nonaktif', value: stats.inactive, color: 'text-red-400', bg: 'bg-red-950/20 border-red-800/30' },
          { label: 'Stok Habis', value: stats.outOfStock, color: 'text-amber-400', bg: 'bg-amber-950/20 border-amber-800/30' },
          { label: 'Unggulan', value: stats.featured, color: 'text-orange-400', bg: 'bg-orange-950/20 border-orange-800/30' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-3 ${s.bg}`}>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Search & Filter ── */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, kategori, deskripsi, atau slug..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Row 2: Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 p-1 rounded-xl">
            {(['all', 'active', 'inactive'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === f
                    ? f === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : f === 'inactive' ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {f === 'all' ? `Semua (${items.length})` : f === 'active' ? `Aktif (${stats.active})` : `Nonaktif (${stats.inactive})`}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                categoryFilter === 'all'
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                  : 'text-zinc-400 border-zinc-700 hover:text-white bg-zinc-900'
              }`}
            >
              Semua Kategori
            </button>
            {usedCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  categoryFilter === cat
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                    : 'text-zinc-400 border-zinc-700 hover:text-white bg-zinc-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
            <span className="text-xs">Memuat data produk...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Utensils className="w-10 h-10 text-zinc-700 mx-auto" />
            <p className="text-xs text-zinc-400">Tidak ada produk yang sesuai filter.</p>
            {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); setCategoryFilter('all'); }}
                className="text-orange-400 text-xs hover:underline"
              >
                Reset semua filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-bold tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3.5 w-16">Gambar</th>
                  <th className="px-4 py-3.5">
                    <SortButton field="name" label="Nama" />
                  </th>
                  <th className="px-4 py-3.5">Kategori</th>
                  <th className="px-4 py-3.5">
                    <SortButton field="price" label="Harga" />
                  </th>
                  <th className="px-4 py-3.5">
                    <SortButton field="stock" label="Stok" />
                  </th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Unggulan</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.map((d) => {
                  const isOutOfStock = d.stock === 0;
                  const discount = d.original_price && d.original_price > d.price
                    ? Math.round(((d.original_price - d.price) / d.original_price) * 100)
                    : null;
                  return (
                    <tr key={d.id} className="hover:bg-zinc-800/30 transition-colors">
                      {/* Gambar */}
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                          {d.image_url ? (
                            <img src={d.image_url} alt={d.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">🍽️</span>
                          )}
                        </div>
                      </td>

                      {/* Nama */}
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-white text-sm truncate">{d.name}</span>
                          {d.is_featured && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                              ⭐ Unggulan
                            </span>
                          )}
                          {isOutOfStock && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                              Habis
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">/{d.slug}</div>
                        <div className="text-[10px] text-zinc-600 line-clamp-1 mt-0.5">{d.description}</div>
                      </td>

                      {/* Kategori */}
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                          {d.category}
                        </span>
                      </td>

                      {/* Harga */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-emerald-400">{formatRupiah(d.price)}</div>
                        {d.original_price && d.original_price > d.price && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-zinc-500 line-through">{formatRupiah(d.original_price)}</span>
                            <span className="text-[10px] font-bold text-rose-400">-{discount}%</span>
                          </div>
                        )}
                      </td>

                      {/* Stok */}
                      <td className="px-4 py-3">
                        <span className={`font-bold text-sm ${isOutOfStock ? 'text-red-400' : 'text-white'}`}>
                          {d.stock}
                        </span>
                        {isOutOfStock && <div className="text-[9px] text-red-500 mt-0.5">Habis</div>}
                      </td>

                      {/* Status toggle */}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(d)}
                          title={d.status ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                            d.status
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                          }`}
                        >
                          {d.status
                            ? <><CheckCircle className="w-3 h-3" /> Aktif</>
                            : <><XCircle className="w-3 h-3" /> Nonaktif</>
                          }
                        </button>
                      </td>

                      {/* Featured toggle */}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(d)}
                          title={d.is_featured ? 'Hapus dari unggulan' : 'Jadikan unggulan'}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                            d.is_featured
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                          }`}
                        >
                          {d.is_featured
                            ? <><Star className="w-3 h-3" /> Unggulan</>
                            : <><StarOff className="w-3 h-3" /> Biasa</>
                          }
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(d)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="Edit Produk"
                          >
                            <Edit3 className="w-4 h-4 text-cyan-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(d)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal Form Tambah / Edit ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150 my-6">

            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {editingId
                  ? <Edit3 className="w-4 h-4 text-orange-400" />
                  : <Plus className="w-4 h-4 text-orange-400" />
                }
                <span>{editingId ? 'Edit Produk' : 'Tambah Makanan / Minuman'}</span>
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">

              {/* Error banner */}
              {formError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs">
                  {formError}
                </div>
              )}

              {/* Nama & Slug */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Nama Produk <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Contoh: Es Teh Jumbo, Nasi Goreng Spesial..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Slug (URL) <span className="text-red-400">*</span>
                    <span className="ml-2 text-zinc-500 font-normal">(otomatis dari nama)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-[11px] font-mono select-none">/</span>
                    <input
                      type="text"
                      required
                      value={formSlug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="es-teh-jumbo"
                      className="w-full pl-6 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Kategori + Harga + Stok */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Kategori <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-orange-500"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Harga (Rp) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="5000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Stok <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="100"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Harga normal/coret */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Harga Normal / Coret (Opsional)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formOriginalPrice}
                  onChange={(e) => setFormOriginalPrice(e.target.value)}
                  placeholder="Kosongkan jika tidak ada diskon"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Deskripsi singkat produk..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              {/* Gambar */}
              <div className="pt-2 border-t border-zinc-800">
                <label className="block text-zinc-300 font-semibold mb-1.5">Gambar Produk</label>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-orange-400" />
                    <span>Upload Gambar</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                  </label>
                  {uploadingImage && <Loader2 className="w-4 h-4 animate-spin text-orange-400" />}
                  {formImageUrl && (
                    <div className="flex items-center gap-2">
                      <img src={formImageUrl} alt="preview" className="w-10 h-10 rounded-lg object-cover border border-zinc-700" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <span className="text-[10px] text-emerald-400">Gambar terpasang</span>
                      <button type="button" onClick={() => setFormImageUrl('')} className="text-zinc-500 hover:text-red-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="Atau tempel URL gambar dari internet..."
                  className="w-full mt-2 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Toggle status + featured */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-zinc-800">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="food-status-modal"
                    checked={formStatus}
                    onChange={(e) => setFormStatus(e.target.checked)}
                    className="rounded bg-zinc-950 border-zinc-700 text-orange-500 focus:ring-0 w-4 h-4"
                  />
                  <span className="text-zinc-300 font-medium text-xs">Tampilkan di toko (Aktif)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="food-featured-modal"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="rounded bg-zinc-950 border-zinc-700 text-amber-500 focus:ring-0 w-4 h-4"
                  />
                  <span className="text-zinc-300 font-medium text-xs">⭐ Tandai sebagai Produk Unggulan</span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  id="btn-simpan-food-drink"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-zinc-950 bg-orange-400 hover:bg-orange-300 transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingId ? 'Simpan Perubahan' : 'Tambah Produk'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
