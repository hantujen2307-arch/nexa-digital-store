'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PulsaToken, PulsaTokenType } from '@/types/database';
import { initialPulsaTokens } from '@/data/pulsa-tokens';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { formatRupiah } from '@/lib/whatsapp';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Toast, { ToastMessage } from '@/components/admin/Toast';
import { useAdminPortal } from '@/context/AdminPortalContext';
import {
  Plus,
  Edit3,
  Trash2,
  Smartphone,
  Save,
  X,
  Loader2,
  CheckCircle,
  XCircle,
  Search,
  Star,
  StarOff,
  ArrowUpDown,
  Zap,
  TrendingUp,
  AlertTriangle,
  Flame,
  CreditCard,
  Gamepad2,
  Wifi,
} from 'lucide-react';

// ─── Constants & Type Options ───────────────────────────────────────────────

export const PULSA_TYPE_OPTIONS: { value: PulsaTokenType; label: string; icon: React.ElementType }[] = [
  { value: 'pulsa', label: 'Pulsa', icon: Smartphone },
  { value: 'data', label: 'Paket Data', icon: Wifi },
  { value: 'token_pln', label: 'Token PLN', icon: Zap },
  { value: 'voucher_game', label: 'Voucher Game', icon: Gamepad2 },
  { value: 'ewallet', label: 'E-Wallet', icon: CreditCard },
];

export const POPULAR_PROVIDERS = [
  'Telkomsel',
  'Indosat',
  'XL',
  'Tri',
  'Smartfren',
  'PLN',
  'DANA',
  'OVO',
  'GoPay',
  'ShopeePay',
  'Mobile Legends',
  'Free Fire',
];

/** Buat slug dari nama produk */
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

type SortField = 'created_at' | 'selling_price' | 'nominal' | 'margin' | 'stock' | 'name';
type SortDir = 'asc' | 'desc';

export default function PulsaTokenTab() {
  const { triggerDataRefresh } = useAdminPortal();

  const [items, setItems] = useState<PulsaToken[]>(initialPulsaTokens);
  const [loading, setLoading] = useState(true);

  // Search, filter, sort
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [formType, setFormType] = useState<PulsaTokenType>('pulsa');
  const [formProvider, setFormProvider] = useState('Telkomsel');
  const [customProviderInput, setCustomProviderInput] = useState('');
  const [formNominal, setFormNominal] = useState('');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formSellingPrice, setFormSellingPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStock, setFormStock] = useState('999');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete & toast
  const [deleteTarget, setDeleteTarget] = useState<PulsaToken | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // ─── Load items from Supabase ─────────────────────────────────────────────

  const loadItems = async () => {
    if (!isSupabaseConfigured()) {
      setItems(initialPulsaTokens);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('pulsa_tokens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[PulsaTokenTab] Tabel pulsa_tokens belum ada atau error, menggunakan data fallback:', error.message);
        setItems(initialPulsaTokens);
      } else if (data && data.length > 0) {
        setItems(data as PulsaToken[]);
      } else {
        setItems(initialPulsaTokens);
      }
    } catch (err) {
      console.error('[PulsaTokenTab] Error fetching pulsa_tokens:', err);
      setItems(initialPulsaTokens);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // ─── Filtered & Sorted ───────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = items.filter((d) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.provider.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        d.slug.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && d.is_active) ||
        (statusFilter === 'inactive' && !d.is_active);

      const matchType = typeFilter === 'all' || d.type === typeFilter;
      const matchProvider = providerFilter === 'all' || d.provider === providerFilter;

      return matchSearch && matchStatus && matchType && matchProvider;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'selling_price') cmp = a.selling_price - b.selling_price;
      else if (sortField === 'nominal') cmp = a.nominal - b.nominal;
      else if (sortField === 'margin') {
        const marginA = a.selling_price - a.cost_price;
        const marginB = b.selling_price - b.cost_price;
        cmp = marginA - marginB;
      } else if (sortField === 'stock') cmp = a.stock - b.stock;
      else if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else cmp = new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [items, searchQuery, statusFilter, typeFilter, providerFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  // ─── Stats ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((d) => d.is_active).length;
    const inactive = items.filter((d) => !d.is_active).length;
    const outOfStock = items.filter((d) => d.is_active && d.stock === 0).length;
    const lowStock = items.filter((d) => d.is_active && d.stock > 0 && d.stock <= 5).length;
    // Total margin potensi dari seluruh produk aktif
    const totalMargin = items
      .filter((d) => d.is_active)
      .reduce((sum, d) => sum + (d.selling_price - d.cost_price), 0);

    return { total, active, inactive, outOfStock, lowStock, totalMargin };
  }, [items]);

  // ─── Unique providers ─────────────────────────────────────────────────────

  const usedProviders = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.provider) set.add(item.provider);
    });
    return Array.from(set).sort();
  }, [items]);

  // ─── Modal form helpers ───────────────────────────────────────────────────

  const resetForm = () => {
    setEditingId(null);
    setFormName('');
    setFormSlug('');
    setIsSlugManual(false);
    setFormType('pulsa');
    setFormProvider('Telkomsel');
    setCustomProviderInput('');
    setFormNominal('');
    setFormCostPrice('');
    setFormSellingPrice('');
    setFormDescription('');
    setFormStock('999');
    setFormIsActive(true);
    setFormIsFeatured(false);
    setFormError(null);
  };

  const openAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (d: PulsaToken) => {
    setEditingId(d.id);
    setFormName(d.name);
    setFormSlug(d.slug);
    setIsSlugManual(true);
    setFormType(d.type);
    if (POPULAR_PROVIDERS.includes(d.provider)) {
      setFormProvider(d.provider);
      setCustomProviderInput('');
    } else {
      setFormProvider('Lainnya');
      setCustomProviderInput(d.provider);
    }
    setFormNominal(d.nominal.toString());
    setFormCostPrice(d.cost_price.toString());
    setFormSellingPrice(d.selling_price.toString());
    setFormDescription(d.description || '');
    setFormStock(d.stock.toString());
    setFormIsActive(d.is_active);
    setFormIsFeatured(d.is_featured);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!isSlugManual) setFormSlug(toSlug(val));
  };

  const handleSlugChange = (val: string) => {
    setFormSlug(toSlug(val));
    setIsSlugManual(true);
  };

  // Kalkulasi Margin live di Form
  const currentCost = parseFloat(formCostPrice) || 0;
  const currentSelling = parseFloat(formSellingPrice) || 0;
  const currentMargin = currentSelling - currentCost;

  // ─── Toggle active ────────────────────────────────────────────────────────

  const handleToggleActive = async (d: PulsaToken) => {
    const newActive = !d.is_active;
    setItems((prev) => prev.map((x) => (x.id === d.id ? { ...x, is_active: newActive } : x)));

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('pulsa_tokens')
        .update({ is_active: newActive, updated_at: new Date().toISOString() })
        .eq('id', d.id);
      if (error) {
        console.error('[PulsaTokenTab] Gagal ubah status aktif:', error);
        setToast({ id: Date.now().toString(), type: 'error', text: `Gagal ubah status: ${error.message}` });
        loadItems();
        return;
      }
    }
    setToast({
      id: Date.now().toString(),
      type: 'success',
      text: `"${d.name}" diubah menjadi ${newActive ? 'Aktif' : 'Nonaktif'}.`,
    });
    triggerDataRefresh();
  };

  // ─── Toggle featured ──────────────────────────────────────────────────────

  const handleToggleFeatured = async (d: PulsaToken) => {
    const newFeatured = !d.is_featured;
    setItems((prev) => prev.map((x) => (x.id === d.id ? { ...x, is_featured: newFeatured } : x)));

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('pulsa_tokens')
        .update({ is_featured: newFeatured, updated_at: new Date().toISOString() })
        .eq('id', d.id);
      if (error) {
        console.error('[PulsaTokenTab] Gagal ubah featured:', error);
        setToast({ id: Date.now().toString(), type: 'error', text: `Gagal ubah status unggulan: ${error.message}` });
        loadItems();
        return;
      }
    }
    setToast({
      id: Date.now().toString(),
      type: 'success',
      text: `"${d.name}" ${newFeatured ? 'ditandai sebagai Produk Unggulan' : 'dihapus dari Produk Unggulan'}.`,
    });
    triggerDataRefresh();
  };

  // ─── Submit Form (Add / Edit) ─────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const name = formName.trim();
    const slug = (formSlug.trim() || toSlug(name)).trim();
    const finalProvider = formProvider === 'Lainnya' ? customProviderInput.trim() : formProvider;
    const nominal = parseFloat(formNominal);
    const costPrice = parseFloat(formCostPrice);
    const sellingPrice = parseFloat(formSellingPrice);
    const stock = parseInt(formStock, 10);

    if (!name) {
      setFormError('Nama produk wajib diisi.');
      return;
    }
    if (!slug) {
      setFormError('Slug produk tidak boleh kosong.');
      return;
    }
    if (!finalProvider) {
      setFormError('Provider wajib ditentukan.');
      return;
    }
    if (isNaN(nominal) || nominal < 0) {
      setFormError('Nominal harus berupa angka valid (>= 0).');
      return;
    }
    if (isNaN(costPrice) || costPrice < 0) {
      setFormError('Harga modal harus berupa angka valid (>= 0).');
      return;
    }
    if (isNaN(sellingPrice) || sellingPrice < 0) {
      setFormError('Harga jual harus berupa angka valid (>= 0).');
      return;
    }
    if (isNaN(stock) || stock < 0) {
      setFormError('Stok harus berupa bilangan bulat valid (>= 0).');
      return;
    }

    setSubmitting(true);

    const payload = {
      name,
      slug,
      type: formType,
      provider: finalProvider,
      nominal,
      cost_price: costPrice,
      selling_price: sellingPrice,
      description: formDescription.trim(),
      stock,
      is_active: formIsActive,
      is_featured: formIsFeatured,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingId) {
        // UPDATE
        if (isSupabaseConfigured()) {
          const { error } = await supabase
            .from('pulsa_tokens')
            .update(payload)
            .eq('id', editingId);

          if (error) {
            console.error('[PulsaTokenTab] Gagal update pulsa_token:', error);
            throw new Error(`Terjadi kesalahan saat menyimpan produk: ${error.message}`);
          }
        }
        setItems((prev) => prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item)));
        setToast({ id: Date.now().toString(), type: 'success', text: 'Produk berhasil disimpan.' });
      } else {
        // INSERT
        let newId = `pt-${Date.now()}`;
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('pulsa_tokens')
            .insert({ ...payload, created_at: new Date().toISOString() })
            .select('id')
            .single();

          if (error) {
            console.error('[PulsaTokenTab] Gagal insert pulsa_token:', error);
            throw new Error(`Terjadi kesalahan saat menyimpan produk: ${error.message}`);
          }
          if (data?.id) newId = data.id;
        }

        const newItem: PulsaToken = {
          ...payload,
          id: newId,
          created_at: new Date().toISOString(),
        };
        setItems((prev) => [newItem, ...prev]);
        setToast({ id: Date.now().toString(), type: 'success', text: 'Produk berhasil disimpan.' });
      }

      setIsModalOpen(false);
      resetForm();
      triggerDataRefresh();
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Terjadi kesalahan saat menyimpan produk.';
      setFormError(msg);
      setToast({ id: Date.now().toString(), type: 'error', text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('pulsa_tokens').delete().eq('id', deleteTarget.id);
        if (error) {
          console.error('[PulsaTokenTab] Gagal hapus produk:', error);
          throw new Error(error.message);
        }
      }
      setItems((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      setToast({ id: Date.now().toString(), type: 'success', text: `"${deleteTarget.name}" berhasil dihapus.` });
      setDeleteTarget(null);
      triggerDataRefresh();
    } catch (err: unknown) {
      console.error('[PulsaTokenTab] Error delete pulsa_token:', err);
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: `Gagal menghapus produk: ${(err as Error).message || 'Kesalahan sistem'}`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Hapus Produk Pulsa & Token"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText={isDeleting ? 'Menghapus...' : 'Hapus Produk'}
        isDangerous
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-cyan-400" />
            <span>Pulsa & Token</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Kelola katalog pulsa, kuota data, token listrik PLN, voucher game, e-wallet, dan pantau margin keuntungan.
          </p>
        </div>

        <button
          type="button"
          id="btn-tambah-pulsa-token"
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Produk</span>
        </button>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Produk', value: stats.total, color: 'text-white', bg: 'bg-zinc-900/60 border-zinc-800' },
          { label: 'Produk Aktif', value: stats.active, color: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-800/30' },
          { label: 'Produk Nonaktif', value: stats.inactive, color: 'text-zinc-400', bg: 'bg-zinc-900/40 border-zinc-800/40' },
          {
            label: 'Total Margin (Aktif)',
            value: formatRupiah(stats.totalMargin),
            color: 'text-cyan-400',
            bg: 'bg-cyan-950/20 border-cyan-800/30',
          },
          {
            label: 'Hampir Habis (≤ 5)',
            value: stats.lowStock,
            color: stats.lowStock > 0 ? 'text-amber-400' : 'text-zinc-500',
            bg: stats.lowStock > 0 ? 'bg-amber-950/30 border-amber-800/40' : 'bg-zinc-900/40 border-zinc-800/40',
          },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-3 ${s.bg}`}>
            <div className={`text-xl sm:text-2xl font-black ${s.color} truncate`}>{s.value}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Search & Filters ── */}
      <div className="space-y-3">
        {/* Row 1: Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama produk, provider, jenis, nominal, atau slug..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Row 2: Status & Type Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 p-1 rounded-xl">
            {(['all', 'active', 'inactive'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === f
                    ? f === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : f === 'inactive'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {f === 'all'
                  ? `Semua (${items.length})`
                  : f === 'active'
                  ? `Aktif (${stats.active})`
                  : `Nonaktif (${stats.inactive})`}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                typeFilter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'text-zinc-400 border-zinc-700/60 hover:text-white bg-zinc-900/60'
              }`}
            >
              Semua Jenis
            </button>
            {PULSA_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  typeFilter === opt.value
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'text-zinc-400 border-zinc-700/60 hover:text-white bg-zinc-900/60'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Provider filter */}
          {usedProviders.length > 0 && (
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[11px] text-zinc-500">Provider:</span>
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">Semua Provider</option>
                {usedProviders.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── Table & Cards View ── */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <span className="text-xs text-zinc-400">Memuat katalog Pulsa & Token...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Smartphone className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">Belum ada produk Pulsa & Token.</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-4">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Tidak ada produk yang cocok dengan pencarian atau filter Anda.'
                : 'Mulai dengan menambahkan produk pulsa, paket data, atau token listrik pertama Anda.'}
            </p>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Produk</span>
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950/80 text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-800 select-none">
                  <tr>
                    <th className="py-3 px-4">Produk</th>
                    <th className="py-3 px-3">Jenis & Provider</th>
                    <th
                      className="py-3 px-3 cursor-pointer hover:text-white"
                      onClick={() => toggleSort('nominal')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Nominal</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-3">Harga Modal</th>
                    <th
                      className="py-3 px-3 cursor-pointer hover:text-white"
                      onClick={() => toggleSort('selling_price')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Harga Jual</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-3 cursor-pointer hover:text-white"
                      onClick={() => toggleSort('margin')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Margin</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-3 cursor-pointer hover:text-white"
                      onClick={() => toggleSort('stock')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Stok</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Unggulan</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {filtered.map((item) => {
                    const margin = item.selling_price - item.cost_price;
                    const marginPercent = item.cost_price > 0 ? Math.round((margin / item.cost_price) * 100) : 0;
                    const isOutOfStock = item.stock === 0;
                    const isLowStock = item.stock > 0 && item.stock <= 5;

                    return (
                      <tr key={item.id} className="hover:bg-zinc-850/40 transition-colors">
                        {/* Nama Produk */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white leading-snug">{item.name}</div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{item.slug}</div>
                        </td>

                        {/* Jenis & Provider */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                              {item.provider}
                            </span>
                            <span className="text-[10px] text-zinc-400 capitalize">
                              {item.type.replace('_', ' ')}
                            </span>
                          </div>
                        </td>

                        {/* Nominal */}
                        <td className="py-3.5 px-3 text-zinc-200">
                          {formatRupiah(item.nominal)}
                        </td>

                        {/* Harga Modal */}
                        <td className="py-3.5 px-3 font-mono text-zinc-400">
                          {formatRupiah(item.cost_price)}
                        </td>

                        {/* Harga Jual */}
                        <td className="py-3.5 px-3 font-mono font-bold text-white">
                          {formatRupiah(item.selling_price)}
                        </td>

                        {/* Margin */}
                        <td className="py-3.5 px-3 font-mono">
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${
                              margin >= 0
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                                : 'bg-red-950/60 text-red-300 border border-red-800/40'
                            }`}
                          >
                            <span>{formatRupiah(margin)}</span>
                            <span className="text-[9px] opacity-80">({marginPercent}%)</span>
                          </div>
                        </td>

                        {/* Stok */}
                        <td className="py-3.5 px-3">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-800/50">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Stok habis</span>
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/50">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Sisa {item.stock} (Stok hampir habis)</span>
                            </span>
                          ) : (
                            <span className="text-zinc-300 text-xs font-mono">{item.stock}</span>
                          )}
                        </td>

                        {/* Status Switch */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(item)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                              item.is_active
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/60'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                            }`}
                            title={item.is_active ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                          >
                            {item.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{item.is_active ? 'Aktif' : 'Nonaktif'}</span>
                          </button>
                        </td>

                        {/* Featured Toggle */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(item)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              item.is_featured
                                ? 'text-amber-400 bg-amber-950/40 hover:bg-amber-900/50'
                                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800'
                            }`}
                            title={item.is_featured ? 'Hapus dari unggulan' : 'Jadikan produk unggulan'}
                          >
                            <Star className={`w-4 h-4 ${item.is_featured ? 'fill-amber-400' : ''}`} />
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="Edit produk"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer"
                              title="Hapus produk"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Card View */}
            <div className="lg:hidden divide-y divide-zinc-800/70">
              {filtered.map((item) => {
                const margin = item.selling_price - item.cost_price;
                const isOutOfStock = item.stock === 0;
                const isLowStock = item.stock > 0 && item.stock <= 5;

                return (
                  <div key={item.id} className="p-4 space-y-3">
                    {/* Header: Title & Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                            {item.provider}
                          </span>
                          <span className="text-[10px] text-zinc-400 capitalize">
                            {item.type.replace('_', ' ')}
                          </span>
                          {item.is_featured && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <Star className="w-2.5 h-2.5 fill-amber-400" />
                              Unggulan
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white">{item.name}</h4>
                        <span className="text-[10px] text-zinc-500 font-mono">{item.slug}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-800/80"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 bg-red-950/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Pricing & Margin info */}
                    <div className="grid grid-cols-3 gap-2 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/60 text-center">
                      <div>
                        <div className="text-[10px] text-zinc-500">Harga Modal</div>
                        <div className="text-xs font-mono text-zinc-300 font-semibold mt-0.5">
                          {formatRupiah(item.cost_price)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500">Harga Jual</div>
                        <div className="text-xs font-mono text-white font-bold mt-0.5">
                          {formatRupiah(item.selling_price)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-500">Keuntungan</div>
                        <div
                          className={`text-xs font-mono font-bold mt-0.5 ${
                            margin >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {formatRupiah(margin)}
                        </div>
                      </div>
                    </div>

                    {/* Stock and Status row */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        {isOutOfStock ? (
                          <span className="text-red-400 font-bold text-xs flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Stok habis</span>
                          </span>
                        ) : isLowStock ? (
                          <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Stok hampir habis ({item.stock})</span>
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-xs">Stok: {item.stock}</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.is_active
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={submitting ? undefined : () => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>{editingId ? 'Edit Produk Pulsa & Token' : 'Tambah Produk Pulsa & Token'}</span>
              </h3>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-xs text-red-300">
                {formError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Produk */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nama Produk <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: Telkomsel Pulsa 10.000 / Token PLN 50.000"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Slug URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formSlug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="telkomsel-pulsa-10000"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Jenis (Type) & Provider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Jenis Produk <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as PulsaTokenType)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {PULSA_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Provider <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formProvider}
                    onChange={(e) => setFormProvider(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {POPULAR_PROVIDERS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                    <option value="Lainnya">+ Provider Lainnya</option>
                  </select>
                </div>
              </div>

              {/* Custom Provider input if "Lainnya" */}
              {formProvider === 'Lainnya' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Nama Provider Baru <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customProviderInput}
                    onChange={(e) => setCustomProviderInput(e.target.value)}
                    placeholder="Contoh: Axis, By.U, Genshin Impact"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              {/* Nominal */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nominal Pulsa / Token / Saldo <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formNominal}
                  onChange={(e) => setFormNominal(e.target.value)}
                  placeholder="Contoh: 10000 / 50000"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Harga Modal & Harga Jual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Harga Modal (Cost Price) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(e.target.value)}
                    placeholder="10500"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Harga Jual (Selling Price) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(e.target.value)}
                    placeholder="12000"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Live Margin Calculation Preview */}
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Estimasi Keuntungan / Margin:</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    currentMargin >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {formatRupiah(currentMargin)}
                  {currentMargin < 0 && ' (Rugi)'}
                </span>
              </div>

              {/* Stok */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Stok Produk <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  placeholder="999"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Stok bersifat informasi dan kontrol admin (tidak otomatis berkurang saat klik WA).
                </span>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Deskripsi / Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Contoh: Masa aktif 30 hari, kuota 24 jam full, dll."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Switches: Aktif & Unggulan */}
              <div className="flex items-center gap-6 pt-2 border-t border-zinc-800/80">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-xs font-semibold text-zinc-300">Aktifkan Produk</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-xs font-semibold text-zinc-300">Produk Unggulan</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Produk</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
