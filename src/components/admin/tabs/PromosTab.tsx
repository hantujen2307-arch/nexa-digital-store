'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CinemaPromo } from '@/types/database';
import { initialCinemaPromos } from '@/data/seed-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
import { formatRupiah } from '@/lib/whatsapp';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Toast, { ToastMessage } from '@/components/admin/Toast';
import { getCinemaPromoSoldCount } from '@/lib/products';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Ticket, 
  Upload, 
  Save, 
  X, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Search, 
  Image as ImageIcon 
} from 'lucide-react';

const CINEMA_OPTIONS = [
  'Cinema XXI',
  'CGV Cinemas',
  'Cinépolis',
  'Flix Cinema',
  'Semua Bioskop'
];

import { useAdminPortal } from '@/context/AdminPortalContext';

export default function PromosTab() {
  const { triggerDataRefresh } = useAdminPortal();
  const [promos, setPromos] = useState<CinemaPromo[]>(initialCinemaPromos);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [cinema, setCinema] = useState('Cinema XXI');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [active, setActive] = useState(true);

  // Deletion & Toast state
  const [deleteTarget, setDeleteTarget] = useState<CinemaPromo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadPromos = async () => {
    if (!isSupabaseConfigured()) {
      setPromos(initialCinemaPromos);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cinema_promos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setPromos(initialCinemaPromos);
      } else if (data) {
        setPromos(data as CinemaPromo[]);
      }
    } catch (err) {
      console.error('Error fetching promos:', err);
      setPromos(initialCinemaPromos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const filteredPromos = useMemo(() => {
    return promos.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cinema.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && p.active) ||
        (statusFilter === 'inactive' && !p.active);

      return matchesSearch && matchesStatus;
    });
  }, [promos, searchQuery, statusFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setCinema('Cinema XXI');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setStartDate('');
    setEndDate('');
    setImageUrl('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=80');
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: CinemaPromo) => {
    setEditingId(p.id);
    setName(p.name);
    setCinema(p.cinema);
    setDescription(p.description);
    setPrice(p.price.toString());
    setOriginalPrice(p.original_price ? p.original_price.toString() : '');
    setStartDate(p.start_date || '');
    setEndDate(p.end_date || '');
    setImageUrl(p.image_url || '');
    setActive(p.active);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (p: CinemaPromo) => {
    const newStatus = !p.active;
    setPromos((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, active: newStatus } : item))
    );

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('cinema_promos')
        .update({ active: newStatus, updated_at: new Date().toISOString() })
        .eq('id', p.id);
      if (error) {
        setToast({ id: Date.now().toString(), type: 'error', text: `Gagal ubah status: ${error.message}` });
        loadPromos();
        return;
      }
    }

    setToast({
      id: Date.now().toString(),
      type: 'success',
      text: `Status promo "${p.name}" diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}.`,
    });
    triggerDataRefresh();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('cinema_promos').delete().eq('id', deleteTarget.id);
        if (error) throw error;
      }

      setPromos((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setToast({
        id: Date.now().toString(),
        type: 'success',
        text: `Promo "${deleteTarget.name}" berhasil dihapus.`,
      });
      triggerDataRefresh();
    } catch (err: unknown) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: `Gagal menghapus promo: ${(err as Error).message}`,
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast({ id: Date.now().toString(), type: 'error', text: 'File harus berformat gambar (JPG, PNG, WEBP).' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ id: Date.now().toString(), type: 'error', text: 'Ukuran poster maksimal 5 MB.' });
      return;
    }

    setUploadingImage(true);
    const { url, error } = await uploadImage(file, 'cinema-images');
    if (error) {
      setToast({ id: Date.now().toString(), type: 'error', text: `Gagal upload poster: ${error.message}` });
    } else if (url) {
      setImageUrl(url);
      setToast({ id: Date.now().toString(), type: 'success', text: 'Poster promo berhasil diunggah ke storage.' });
    }
    setUploadingImage(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setToast({ id: Date.now().toString(), type: 'error', text: 'Nama promo wajib diisi.' });
      return;
    }

    setSubmitting(true);

    const priceNum = parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
    const originalPriceNum = originalPrice.trim() ? parseFloat(originalPrice.replace(/[^0-9.]/g, '')) : null;

    const payload = {
      name: name.trim(),
      cinema: cinema.trim(),
      description: description.trim(),
      price: priceNum,
      original_price: originalPriceNum,
      start_date: startDate || null,
      end_date: endDate || null,
      image_url: imageUrl.trim() || null,
      active,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingId) {
        if (isSupabaseConfigured()) {
          const { error } = await supabase
            .from('cinema_promos')
            .update(payload)
            .eq('id', editingId);

          if (error) throw error;
        }

        setPromos((prev) =>
          prev.map((p) => (p.id === editingId ? { ...p, ...payload } : p))
        );
        setToast({ id: Date.now().toString(), type: 'success', text: `Promo "${payload.name}" berhasil diperbarui!` });
      } else {
        const newPayload = {
          ...payload,
          created_at: new Date().toISOString(),
        };

        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('cinema_promos')
            .insert(newPayload)
            .select('*')
            .single();

          if (error) throw error;

          if (data) {
            setPromos((prev) => [data as CinemaPromo, ...prev]);
          }
        } else {
          const mock: CinemaPromo = { id: `promo-${Date.now()}`, ...newPayload };
          setPromos((prev) => [mock, ...prev]);
        }
        setToast({ id: Date.now().toString(), type: 'success', text: `Promo baru "${payload.name}" berhasil ditambahkan!` });
      }

      triggerDataRefresh();
      setIsModalOpen(false);
    } catch (err: unknown) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: `Gagal menyimpan promo: ${(err as Error).message}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Promo Bioskop"
        message={`Apakah Anda yakin ingin menghapus promo "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Promo"
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
            <Ticket className="w-5 h-5 text-amber-400" />
            <span>Manajemen Promo Tiket Bioskop</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Kelola diskon tiket bioskop XXI, CGV, dan Cinépolis, tanggal periode berlaku, serta poster promo.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Promo</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari promo bioskop, cinema, deskripsi..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
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
              statusFilter === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Semua ({promos.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'active'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Aktif ({promos.filter((p) => p.active).length})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'inactive'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Nonaktif ({promos.filter((p) => !p.active).length})
          </button>
        </div>
      </div>

      {/* Promos Table Card */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-16 flex items-center justify-center text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400 mr-2" />
            <span className="text-xs">Memuat promo bioskop dari Supabase...</span>
          </div>
        ) : filteredPromos.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 text-xs space-y-2">
            <div>Tidak ada promo yang sesuai pencarian.</div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-amber-400 hover:underline inline-block"
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
                  <th className="px-5 py-3.5">Poster</th>
                  <th className="px-5 py-3.5">Nama Promo</th>
                  <th className="px-4 py-3.5">Bioskop</th>
                  <th className="px-4 py-3.5">Harga Promo</th>
                  <th className="px-4 py-3.5">Periode Berlaku</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredPromos.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="w-12 h-14 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{p.name}</span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                          Terjual {getCinemaPromoSoldCount(p)}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 line-clamp-1 max-w-xs mt-0.5">
                        {p.description}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {p.cinema}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-400 text-sm">
                      {formatRupiah(p.price)}
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-zinc-400">
                      {p.start_date || p.end_date ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          <span>
                            {p.start_date || 'Sekarang'} - {p.end_date || 'Selesai'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-500">Selama kuota tersedia</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(p)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                          p.active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                        }`}
                      >
                        {p.active ? (
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
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="Edit Promo"
                        >
                          <Edit3 className="w-4 h-4 text-cyan-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Hapus Promo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150 my-8">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {editingId ? <Edit3 className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-amber-400" />}
                <span>{editingId ? 'Edit Promo Bioskop' : 'Tambah Promo Bioskop Baru'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Nama Promo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Tiket XXI Buy 1 Get 1 Free"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Jaringan Bioskop
                  </label>
                  <select
                    value={cinema}
                    onChange={(e) => setCinema(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    {CINEMA_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Harga Promo (Rp) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Contoh: 35000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Harga Asli / Normal Coret (Opsional)
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="Contoh: 65000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Tanggal Berakhir
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Deskripsi Promo & Ketentuan
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ketentuan kuota, hari berlaku (Senin-Jumat/Weekend), dan cara redeem..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <label className="block text-zinc-300 font-semibold mb-1.5">
                  Poster Promo (Supabase Storage)
                </label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload Poster</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  {uploadingImage && <Loader2 className="w-4 h-4 animate-spin text-amber-400" />}
                  {imageUrl && (
                    <span className="text-[10px] text-emerald-400 font-mono truncate max-w-[200px]">
                      Poster terpasang
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="promo-active-modal"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded bg-zinc-950 border-zinc-800 text-amber-500 focus:ring-0 w-4 h-4"
                />
                <label htmlFor="promo-active-modal" className="text-zinc-300 select-none font-medium">
                  Aktifkan promo ini di website publik
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Simpan Promo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
