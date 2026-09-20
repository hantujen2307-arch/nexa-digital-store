'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Drink } from '@/types/database';
import { initialDrinks } from '@/data/drinks';
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
  GlassWater,
  Upload,
  Save,
  X,
  Loader2,
  CheckCircle,
  XCircle,
  Search,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  'Kopi',
  'Teh',
  'Jus',
  'Susu',
  'Boba',
  'Coklat',
  'Soda',
  'Air',
  'Lainnya',
];

export default function DrinksTab() {
  const { triggerDataRefresh } = useAdminPortal();
  const [drinks, setDrinks] = useState<Drink[]>(initialDrinks);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Kopi');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('');
  const [active, setActive] = useState(true);

  // Deletion & Toast
  const [deleteTarget, setDeleteTarget] = useState<Drink | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ─── Load from Supabase ──────────────────────────────────────────────────
  const loadDrinks = async () => {
    if (!isSupabaseConfigured()) {
      setDrinks(initialDrinks);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('drinks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Table might not exist yet — fall back to local seed data
        console.warn('Drinks table not found, using local data fallback:', error.message);
        setDrinks(initialDrinks);
      } else if (data && data.length > 0) {
        setDrinks(data as Drink[]);
      } else {
        setDrinks(initialDrinks);
      }
    } catch (err) {
      console.error('Error fetching drinks:', err);
      setDrinks(initialDrinks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrinks();
  }, []);

  // ─── Filtered list ───────────────────────────────────────────────────────
  const filteredDrinks = useMemo(() => {
    return drinks.filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? d.active
          : !d.active;
      return matchSearch && matchStatus;
    });
  }, [drinks, searchQuery, statusFilter]);

  // ─── Modal helpers ───────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setCategory('Kopi');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setImageUrl('');
    setBadge('');
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (d: Drink) => {
    setEditingId(d.id);
    setName(d.name);
    setCategory(d.category);
    setDescription(d.description);
    setPrice(d.price.toString());
    setOriginalPrice(d.originalPrice ? d.originalPrice.toString() : '');
    setImageUrl(d.imageUrl || '');
    setBadge(d.badge || '');
    setActive(d.active);
    setIsModalOpen(true);
  };

  // ─── Toggle active ───────────────────────────────────────────────────────
  const handleToggleActive = async (d: Drink) => {
    const newStatus = !d.active;
    setDrinks((prev) =>
      prev.map((item) => (item.id === d.id ? { ...item, active: newStatus } : item))
    );

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('drinks')
        .update({ active: newStatus, updated_at: new Date().toISOString() })
        .eq('id', d.id);
      if (error) {
        setToast({ id: Date.now().toString(), type: 'error', text: `Gagal ubah status: ${error.message}` });
        loadDrinks();
        return;
      }
    }

    setToast({
      id: Date.now().toString(),
      type: 'success',
      text: `Status "${d.name}" diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}.`,
    });
    triggerDataRefresh();
  };

  // ─── Delete ──────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('drinks').delete().eq('id', deleteTarget.id);
        if (error) throw error;
      }
      setDrinks((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setToast({ id: Date.now().toString(), type: 'success', text: `Minuman "${deleteTarget.name}" berhasil dihapus.` });
      triggerDataRefresh();
    } catch (err: unknown) {
      setToast({ id: Date.now().toString(), type: 'error', text: `Gagal hapus: ${(err as Error).message}` });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ─── Image Upload ────────────────────────────────────────────────────────
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const { url, error } = await uploadImage(file, 'drink-images');
    if (error) {
      setToast({ id: Date.now().toString(), type: 'error', text: `Gagal upload gambar: ${error.message}` });
    } else if (url) {
      setImageUrl(url);
      setToast({ id: Date.now().toString(), type: 'success', text: 'Gambar minuman berhasil diunggah.' });
    }
    setUploadingImage(false);
  };

  // ─── Submit (Add / Edit) ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setToast({ id: Date.now().toString(), type: 'error', text: 'Nama minuman wajib diisi.' });
      return;
    }
    setSubmitting(true);

    const priceNum = parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
    const originalPriceNum = originalPrice.trim()
      ? parseFloat(originalPrice.replace(/[^0-9.]/g, ''))
      : null;

    const payload = {
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      price: priceNum,
      originalPrice: originalPriceNum,
      imageUrl: imageUrl.trim() || null,
      badge: badge.trim() || null,
      active,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingId) {
        // ─── UPDATE ───
        if (isSupabaseConfigured()) {
          const { error } = await supabase
            .from('drinks')
            .update(payload)
            .eq('id', editingId);
          if (error) throw error;
        }
        setDrinks((prev) =>
          prev.map((d) =>
            d.id === editingId ? { ...d, ...payload, imageUrl: payload.imageUrl || '' } : d
          )
        );
        setToast({ id: Date.now().toString(), type: 'success', text: `Minuman "${payload.name}" berhasil diperbarui!` });
      } else {
        // ─── INSERT ───
        const newPayload = { ...payload, created_at: new Date().toISOString() };

        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('drinks')
            .insert(newPayload)
            .select('*')
            .single();
          if (error) throw error;
          if (data) setDrinks((prev) => [data as Drink, ...prev]);
        } else {
          const mock: Drink = {
            id: `drink-${Date.now()}`,
            ...newPayload,
            imageUrl: newPayload.imageUrl || '',
          };
          setDrinks((prev) => [mock, ...prev]);
        }
        setToast({ id: Date.now().toString(), type: 'success', text: `Minuman baru "${payload.name}" berhasil ditambahkan!` });
      }

      triggerDataRefresh();
      setIsModalOpen(false);
    } catch (err: unknown) {
      setToast({ id: Date.now().toString(), type: 'error', text: `Gagal menyimpan: ${(err as Error).message}` });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Produk Minuman"
        message={`Apakah Anda yakin ingin menghapus minuman "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Minuman"
        cancelText="Batal"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <GlassWater className="w-5 h-5 text-teal-400" />
            <span>Manajemen Produk Minuman</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Kelola daftar minuman, harga, kategori, gambar, dan status tampil di toko.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          id="btn-tambah-minuman"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-teal-400 hover:bg-teal-300 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Minuman</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, kategori, atau deskripsi minuman..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-teal-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Semua ({drinks.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'active'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Aktif ({drinks.filter((d) => d.active).length})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'inactive'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Nonaktif ({drinks.filter((d) => !d.active).length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-16 flex items-center justify-center text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin text-teal-400 mr-2" />
            <span className="text-xs">Memuat data minuman...</span>
          </div>
        ) : filteredDrinks.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 text-xs space-y-3">
            <GlassWater className="w-10 h-10 text-zinc-700 mx-auto" />
            <div>Tidak ada minuman yang sesuai pencarian.</div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-teal-400 hover:underline"
              >
                Reset pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-bold tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="px-5 py-3.5">Gambar</th>
                  <th className="px-5 py-3.5">Nama Minuman</th>
                  <th className="px-4 py-3.5">Kategori</th>
                  <th className="px-4 py-3.5">Harga</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredDrinks.map((d) => {
                  const discount =
                    d.originalPrice && d.originalPrice > d.price
                      ? Math.round(((d.originalPrice - d.price) / d.originalPrice) * 100)
                      : null;
                  return (
                    <tr key={d.id} className="hover:bg-zinc-800/30 transition-colors">
                      {/* Gambar */}
                      <td className="px-5 py-3.5">
                        <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
                          {d.imageUrl ? (
                            <img
                              src={d.imageUrl}
                              alt={d.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              🥤
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Nama */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white text-sm flex items-center gap-2 flex-wrap">
                          <span>{d.name}</span>
                          {d.badge && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {d.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 line-clamp-1 max-w-xs mt-0.5">
                          {d.description}
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                          {d.category}
                        </span>
                      </td>

                      {/* Harga */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-emerald-400 text-sm">{formatRupiah(d.price)}</div>
                        {d.originalPrice && d.originalPrice > d.price && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-zinc-500 line-through">{formatRupiah(d.originalPrice)}</span>
                            <span className="text-[10px] font-bold text-rose-400">-{discount}%</span>
                          </div>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(d)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                            d.active
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                          }`}
                        >
                          {d.active ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-zinc-500" />
                              <span>Nonaktif</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(d)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="Edit Minuman"
                          >
                            <Edit3 className="w-4 h-4 text-cyan-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(d)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                            title="Hapus Minuman"
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

      {/* ─── Modal Tambah / Edit ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150 my-8">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {editingId ? (
                  <Edit3 className="w-4 h-4 text-teal-400" />
                ) : (
                  <Plus className="w-4 h-4 text-teal-400" />
                )}
                <span>{editingId ? 'Edit Minuman' : 'Tambah Minuman Baru'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {/* Nama */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Nama Minuman <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Es Kopi Susu, Boba Taro, Jus Alpukat..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Kategori & Harga */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-teal-500"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
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
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Contoh: 15000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Harga Normal / Coret (Opsional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="Contoh: 20000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Badge (Opsional)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Contoh: Baru, Best Seller, Hot"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Kopi susu segar dengan biji pilihan, manis dan lembut..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Upload Gambar */}
              <div className="pt-2 border-t border-zinc-800">
                <label className="block text-zinc-300 font-semibold mb-1.5">
                  Gambar Produk
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-teal-400" />
                    <span>Upload Gambar</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  {uploadingImage && <Loader2 className="w-4 h-4 animate-spin text-teal-400" />}
                  {imageUrl && (
                    <div className="flex items-center gap-2">
                      <img
                        src={imageUrl}
                        alt="preview"
                        className="w-10 h-10 rounded-lg object-cover border border-zinc-700"
                      />
                      <span className="text-[10px] text-emerald-400">Gambar terpasang</span>
                    </div>
                  )}
                </div>
                {/* URL manual jika tidak upload */}
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Atau tempel URL gambar dari internet..."
                  className="w-full mt-2 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Status Aktif */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="drink-active-modal"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded bg-zinc-950 border-zinc-800 text-teal-500 focus:ring-0 w-4 h-4"
                />
                <label htmlFor="drink-active-modal" className="text-zinc-300 select-none font-medium">
                  Tampilkan minuman ini di halaman toko
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-800 transition-colors text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  id="btn-simpan-minuman"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-zinc-950 bg-teal-400 hover:bg-teal-300 transition-colors disabled:opacity-50 text-xs"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Simpan Minuman</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
