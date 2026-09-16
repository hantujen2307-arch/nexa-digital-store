'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Service } from '@/types/database';
import { initialServices } from '@/data/seed-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
import { formatRupiah } from '@/lib/whatsapp';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Toast, { ToastMessage } from '@/components/admin/Toast';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Video, 
  Upload, 
  Save, 
  X, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Search, 
  Film, 
  Camera, 
  Wand2, 
  Scissors, 
  Music, 
  Layers, 
  Palette 
} from 'lucide-react';

const AVAILABLE_ICONS = [
  { name: 'Video', icon: Video, label: 'Video' },
  { name: 'Film', icon: Film, label: 'Cinema' },
  { name: 'Camera', icon: Camera, label: 'Kamera' },
  { name: 'Scissors', icon: Scissors, label: 'Editing' },
  { name: 'Wand2', icon: Wand2, label: 'Magic/FX' },
  { name: 'Music', icon: Music, label: 'Audio' },
  { name: 'Layers', icon: Layers, label: 'Motion' },
  { name: 'Palette', icon: Palette, label: 'Design' },
];

import { useAdminPortal } from '@/context/AdminPortalContext';

export default function ServicesTab() {
  const { triggerDataRefresh } = useAdminPortal();
  const [services, setServices] = useState<Service[]>(initialServices);
  const [loading, setLoading] = useState(true);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Video');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [active, setActive] = useState(true);

  // Image upload state
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Deletion & Toast state
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadServices = async () => {
    if (!isSupabaseConfigured()) {
      setServices(initialServices);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        setServices(initialServices);
      } else if (data) {
        setServices(data as Service[]);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setServices(initialServices);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && s.active) ||
        (statusFilter === 'inactive' && !s.active);

      return matchesSearch && matchesStatus;
    });
  }, [services, searchQuery, statusFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setIsSlugManuallyEdited(false);
    setDescription('');
    setIcon('Video');
    setPrice('');
    setOriginalPrice('');
    setImageUrl('');
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (s: Service) => {
    setEditingId(s.id);
    setName(s.name);
    setSlug(s.slug);
    setIsSlugManuallyEdited(true);
    setDescription(s.description);
    setIcon(s.icon || 'Video');
    setPrice(s.price ? s.price.toString() : '');
    setOriginalPrice(s.original_price ? s.original_price.toString() : '');
    setImageUrl((s as unknown as { image_url?: string }).image_url || '');
    setActive(s.active);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManuallyEdited && !editingId) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast({ id: Date.now().toString(), type: 'error', text: 'File harus berformat gambar (PNG, JPG, WEBP).' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ id: Date.now().toString(), type: 'error', text: 'Ukuran gambar maksimal 5 MB.' });
      return;
    }

    setUploadingImage(true);
    const { url, error } = await uploadImage(file, 'service-images');
    if (error) {
      setToast({ id: Date.now().toString(), type: 'error', text: `Gagal upload gambar: ${error.message}` });
    } else if (url) {
      setImageUrl(url);
      setToast({ id: Date.now().toString(), type: 'success', text: 'Gambar contoh jasa berhasil diunggah ke storage.' });
    }
    setUploadingImage(false);
  };

  const handleToggleActive = async (s: Service) => {
    const newStatus = !s.active;
    setServices((prev) =>
      prev.map((item) => (item.id === s.id ? { ...item, active: newStatus } : item))
    );

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('services')
        .update({ active: newStatus, updated_at: new Date().toISOString() })
        .eq('id', s.id);

      if (error) {
        setToast({ id: Date.now().toString(), type: 'error', text: `Gagal ubah status: ${error.message}` });
        loadServices();
        return;
      }
    }

    setToast({
      id: Date.now().toString(),
      type: 'success',
      text: `Status jasa "${s.name}" diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}.`,
    });
    triggerDataRefresh();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('services').delete().eq('id', deleteTarget.id);
        if (error) throw error;
      }

      setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setToast({
        id: Date.now().toString(),
        type: 'success',
        text: `Jasa "${deleteTarget.name}" berhasil dihapus.`,
      });
      triggerDataRefresh();
    } catch (err: unknown) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: `Gagal menghapus jasa: ${(err as Error).message}`,
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setToast({ id: Date.now().toString(), type: 'error', text: 'Nama layanan wajib diisi.' });
      return;
    }

    setSubmitting(true);

    const priceNum = price ? parseFloat(price.replace(/[^0-9.]/g, '')) : null;
    const originalPriceNum = originalPrice.trim() ? parseFloat(originalPrice.replace(/[^0-9.]/g, '')) : null;
    const generatedSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

    const payload = {
      name: name.trim(),
      slug: generatedSlug,
      description: description.trim(),
      icon,
      price: priceNum,
      original_price: originalPriceNum,
      active,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingId) {
        if (isSupabaseConfigured()) {
          const { error } = await supabase
            .from('services')
            .update(payload)
            .eq('id', editingId);

          if (error) throw error;
        }

        setServices((prev) =>
          prev.map((s) => (s.id === editingId ? { ...s, ...payload } : s))
        );
        setToast({ id: Date.now().toString(), type: 'success', text: `Jasa "${payload.name}" berhasil diperbarui!` });
      } else {
        const newPayload = {
          ...payload,
          created_at: new Date().toISOString(),
        };

        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('services')
            .insert(newPayload)
            .select('*')
            .single();

          if (error) throw error;

          if (data) {
            setServices((prev) => [...prev, data as Service]);
          }
        } else {
          const mock: Service = { id: `serv-${Date.now()}`, ...newPayload };
          setServices((prev) => [...prev, mock]);
        }

        setToast({ id: Date.now().toString(), type: 'success', text: `Jasa baru "${payload.name}" berhasil ditambahkan!` });
      }

      triggerDataRefresh();
      setIsModalOpen(false);
    } catch (err: unknown) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: `Gagal menyimpan jasa: ${(err as Error).message}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getServiceIcon = (iconName: string) => {
    const item = AVAILABLE_ICONS.find((i) => i.name === iconName);
    const IconComp = item ? item.icon : Video;
    return <IconComp className="w-5 h-5 text-cyan-400" />;
  };

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Jasa Editing"
        message={`Apakah Anda yakin ingin menghapus jasa "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Jasa"
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
            <Video className="w-5 h-5 text-cyan-400" />
            <span>Manajemen Jasa Editing</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Kelola daftar layanan editing video, konten TikTok/Reels, desain poster, dan harga mulai.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Jasa</span>
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
            placeholder="Cari nama jasa, deskripsi, atau slug..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
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
            Semua ({services.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'active'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Aktif ({services.filter((s) => s.active).length})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'inactive'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Nonaktif ({services.filter((s) => !s.active).length})
          </button>
        </div>
      </div>

      {/* Services Table Card */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-16 flex items-center justify-center text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mr-2" />
            <span className="text-xs">Memuat daftar jasa dari Supabase...</span>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 text-xs space-y-2">
            <div>Tidak ada jasa yang sesuai kriteria pencarian.</div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-cyan-400 hover:underline inline-block"
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
                  <th className="px-5 py-3.5">Ikon / Preview</th>
                  <th className="px-5 py-3.5">Nama Layanan</th>
                  <th className="px-4 py-3.5">Harga Mulai</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredServices.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner">
                        {getServiceIcon(s.icon)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white">{s.name}</div>
                      <div className="text-[11px] text-zinc-500 line-clamp-1 max-w-sm mt-0.5">
                        {s.description}
                      </div>
                      <div className="text-[10px] text-zinc-600 font-mono mt-0.5">
                        /{s.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-400">
                      {s.price ? formatRupiah(s.price) : 'Hubungi Admin'}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(s)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                          s.active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                        }`}
                      >
                        {s.active ? (
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
                          onClick={() => openEditModal(s)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="Edit Jasa"
                        >
                          <Edit3 className="w-4 h-4 text-cyan-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(s)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Hapus Jasa"
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
                {editingId ? <Edit3 className="w-4 h-4 text-cyan-400" /> : <Plus className="w-4 h-4 text-cyan-400" />}
                <span>{editingId ? 'Edit Layanan Jasa' : 'Tambah Layanan Baru'}</span>
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
                  Nama Layanan <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: Video Editing TikTok & Reels"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Slug URL
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsSlugManuallyEdited(true);
                  }}
                  placeholder="video-editing-tiktok"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">
                  Pilih Ikon Layanan
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = icon === item.name;
                    return (
                      <button
                        type="button"
                        key={item.name}
                        onClick={() => setIcon(item.name)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <IconComp className="w-4 h-4 mb-1" />
                        <span className="text-[10px] font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Harga Mulai (Rp)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Contoh: 50000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Harga Asli Coret (Opsional)
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="Contoh: 100000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan jenis editing, format output, dan revisi..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <label className="block text-zinc-300 font-semibold mb-1.5">
                  Upload Gambar Jasa (Supabase Storage)
                </label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Upload ke Storage</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  {uploadingImage && <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />}
                  {imageUrl && (
                    <span className="text-[10px] text-emerald-400 font-mono truncate max-w-[200px]">
                      Gambar terpasang
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="service-active-modal"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded bg-zinc-950 border-zinc-800 text-cyan-500 focus:ring-0 w-4 h-4"
                />
                <label htmlFor="service-active-modal" className="text-zinc-300 select-none font-medium">
                  Aktifkan jasa ini di website publik
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Simpan Jasa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
