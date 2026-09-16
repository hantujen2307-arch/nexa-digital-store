'use client';

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
import { getStoreSettings, updateStoreSettings } from '@/lib/storeSettings';
import Toast, { ToastMessage } from '@/components/admin/Toast';
import { 
  Save, 
  Upload, 
  Trash2, 
  Loader2, 
  Sparkles, 
  Store, 
  Phone
} from 'lucide-react';

import { useAdminPortal } from '@/context/AdminPortalContext';

export default function SettingsTab() {
  const { triggerDataRefresh } = useAdminPortal();
  const [storeName, setStoreName] = useState('');
  const [storeSubtitle, setStoreSubtitle] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getStoreSettings();
        setStoreName(settings.store_name || '');
        setStoreSubtitle(settings.store_subtitle || '');
        setStoreDescription(settings.store_description || '');
        setWhatsappNumber(settings.whatsapp_number || '');
        setLogoUrl(settings.logo_url || '');
      } catch (err) {
        console.error('Failed to load store settings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast({ id: Date.now().toString(), type: 'error', text: 'File harus berformat gambar (PNG, JPG, WEBP, SVG).' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ id: Date.now().toString(), type: 'error', text: 'Ukuran logo maksimal 5 MB.' });
      return;
    }

    setUploadingLogo(true);
    const { url, error } = await uploadImage(file, 'store-assets');

    if (error) {
      setToast({ id: Date.now().toString(), type: 'error', text: `Gagal upload logo: ${error.message}` });
    } else if (url) {
      setLogoUrl(url);
      setToast({ id: Date.now().toString(), type: 'success', text: 'Logo toko berhasil diunggah ke storage.' });
    }
    setUploadingLogo(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeName.trim()) {
      setToast({ id: Date.now().toString(), type: 'error', text: 'Nama toko wajib diisi.' });
      return;
    }

    let cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    if (!cleanPhone || cleanPhone.length < 9) {
      setToast({ id: Date.now().toString(), type: 'error', text: 'Nomor WhatsApp tidak valid. Masukkan format 628xxxxxxxxxx atau 08xxxxxxxxxx.' });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        store_name: storeName.trim(),
        store_subtitle: storeSubtitle.trim(),
        store_description: storeDescription.trim(),
        whatsapp_number: cleanPhone,
        logo_url: logoUrl.trim(),
      };

      await updateStoreSettings(payload);
      triggerDataRefresh();

      setToast({
        id: Date.now().toString(),
        type: 'success',
        text: 'Pengaturan toko & WhatsApp berhasil diperbarui!',
      });
    } catch (err: unknown) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: `Gagal menyimpan pengaturan: ${(err as Error).message}`,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-3" />
        <span className="text-xs">Memuat pengaturan toko dari Supabase...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Store className="w-5 h-5 text-cyan-400" />
          <span>Pengaturan Website & WhatsApp</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Ubah nama toko, logo, tagline, serta nomor WhatsApp tujuan order pelanggan tanpa mengubah source code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {/* Card 1: Informasi Toko */}
        <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Identitas Brand
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Nama Toko <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="ALPINO PREM"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                value={storeSubtitle}
                onChange={(e) => setStoreSubtitle(e.target.value)}
                placeholder="Pusat Akun Premium, Jasa Editing & Promo Bioskop Terpercaya"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Deskripsi Singkat Toko
            </label>
            <textarea
              rows={3}
              value={storeDescription}
              onChange={(e) => setStoreDescription(e.target.value)}
              placeholder="Deskripsi singkat yang tampil di footer dan meta website..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Logo Toko */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1.5">
              Logo Toko (Supabase Storage)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://... atau klik Upload Logo"
                className="w-full flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              />
              <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 cursor-pointer shrink-0">
                {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <Upload className="w-4 h-4 text-cyan-400" />}
                <span>{uploadingLogo ? 'Mengunggah...' : 'Upload Logo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="hidden"
                />
              </label>
            </div>

            {logoUrl && (
              <div className="mt-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 overflow-hidden shrink-0">
                    <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] text-zinc-400 truncate max-w-xs">{logoUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: WhatsApp Settings */}
        <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Phone className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Nomor WhatsApp Pemesanan
            </h2>
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Nomor WhatsApp Admin <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="6285709918896"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Bisa memasukkan format <strong>6285709918896</strong> atau <strong>085709918896</strong> (akan otomatis dikonversi ke format internasional).
              Seluruh tombol &quot;Beli Sekarang&quot; di website publik akan otomatis mengarahkan ke nomor ini.
            </span>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || uploadingLogo}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-zinc-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 shadow-lg shadow-cyan-950/40 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Pengaturan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Toko</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
