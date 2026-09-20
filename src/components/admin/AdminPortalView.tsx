'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminPortal, AdminTab } from '@/context/AdminPortalContext';
import { STORE_NAME } from '@/data/config';
import { supabase, isSupabaseConfigured, diagnoseAuthError } from '@/lib/supabase/client';
import DashboardTab from '@/components/admin/tabs/DashboardTab';
import ProductsTab from '@/components/admin/tabs/ProductsTab';
import ServicesTab from '@/components/admin/tabs/ServicesTab';
import PromosTab from '@/components/admin/tabs/PromosTab';
import DrinksTab from '@/components/admin/tabs/DrinksTab';
import SettingsTab from '@/components/admin/tabs/SettingsTab';
import { 
  LayoutDashboard, 
  Package, 
  Video, 
  Ticket, 
  Utensils,
  Settings, 
  LogOut, 
  ArrowLeft, 
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface AdminPortalViewProps {
  initialTab?: AdminTab;
}

export default function AdminPortalView({ initialTab }: AdminPortalViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    isAdmin, 
    isCheckingAuth, 
    adminUser, 
    activeTab, 
    setActiveTab, 
    logout,
    verifyAdminRole
  } = useAdminPortal();

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sync tab from props or query parameter
  useEffect(() => {
    const tabParam = searchParams?.get('tab') as AdminTab | null;
    if (tabParam && ['dashboard', 'products', 'services', 'promos', 'drinks', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [searchParams, initialTab, setActiveTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    // 1. Diagnostic check: Supabase URL/key configuration
    if (!isSupabaseConfigured()) {
      setLoginError('Konfigurasi Supabase tidak tersedia: NEXT_PUBLIC_SUPABASE_URL atau API Key belum disetel.');
      setLoginLoading(false);
      return;
    }

    try {
      // 2. Normal Supabase Auth sign-in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const diag = diagnoseAuthError(error);
        setLoginError(diag.message);
        setLoginLoading(false);
        return;
      }

      if (data?.session && data?.user) {
        // 3. Verify admin authorization role
        const verification = await verifyAdminRole(data.user.id, data.user.email);

        if (!verification.authorized) {
          await supabase.auth.signOut();
          setLoginError(verification.diagnostic?.message || 'Akses ditolak: Akun Anda tidak terdaftar sebagai Administrator.');
          setLoginLoading(false);
          return;
        }

        setEmail('');
        setPassword('');
      }
    } catch (err: unknown) {
      const diag = diagnoseAuthError(err);
      setLoginError(diag.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // 1. Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1.5px] mb-4">
          <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Memverifikasi otentikasi administrator...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state: Dedicated Admin Login
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Back link */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors bg-zinc-900/60 border border-zinc-800 px-3.5 py-2 rounded-xl"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kembali ke Toko</span>
            </Link>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1.5px] shrink-0">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{STORE_NAME}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                    Admin
                  </span>
                </h1>
                <p className="text-xs text-zinc-400">
                  Portal Administrator untuk kelola produk, harga & konten
                </p>
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Email Admin
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@nexadigital.id"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-zinc-950 bg-gradient-to-r from-cyan-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 transition-all shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Admin...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Masuk ke Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Note */}
            <p className="mt-6 text-[11px] text-zinc-500 text-center leading-relaxed">
              Hanya administrator terdaftar yang memiliki hak akses untuk mengelola data website. Customer tidak perlu login.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated state: Dedicated Admin Dashboard Workspace
  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'products', label: 'Produk Premium', icon: Package },
    { id: 'services', label: 'Jasa Editing', icon: Video },
    { id: 'promos', label: 'Promo Bioskop', icon: Ticket },
    { id: 'drinks', label: 'Makanan & Minuman', icon: Utensils },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-zinc-900/90 border-b border-zinc-800 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand & Admin identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1.5px] shrink-0">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">{STORE_NAME}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60 uppercase">
                Admin Mode
              </span>
            </div>
            {adminUser?.email && (
              <span className="text-[10px] text-zinc-400 block truncate max-w-[200px]">
                {adminUser.email}
              </span>
            )}
          </div>
        </div>

        {/* Center Tab Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-950/70 p-1 rounded-xl border border-zinc-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-zinc-700 transition-colors"
            title="Lihat tampilan website toko customer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Lihat Website</span>
            <span className="sm:hidden">Website</span>
          </Link>

          <button
            onClick={logout}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 bg-red-950/30 hover:bg-red-900/50 border border-red-800/40 transition-colors cursor-pointer"
            title="Keluar dari sesi administrator"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around bg-zinc-900/95 border-b border-zinc-800 px-2 py-2 overflow-x-auto gap-1 shrink-0 sticky top-[57px] z-30">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-colors ${
                isActive ? 'text-cyan-400 bg-cyan-950/40' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'services' && <ServicesTab />}
          {activeTab === 'promos' && <PromosTab />}
          {activeTab === 'drinks' && <DrinksTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>
    </div>
  );
}
