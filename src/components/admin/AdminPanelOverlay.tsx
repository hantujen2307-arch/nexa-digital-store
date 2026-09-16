'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAdminPortal, AdminTab } from '@/context/AdminPortalContext';
import { STORE_NAME } from '@/data/config';
import DashboardTab from '@/components/admin/tabs/DashboardTab';
import ProductsTab from '@/components/admin/tabs/ProductsTab';
import ServicesTab from '@/components/admin/tabs/ServicesTab';
import PromosTab from '@/components/admin/tabs/PromosTab';
import SettingsTab from '@/components/admin/tabs/SettingsTab';
import { 
  LayoutDashboard, 
  Package, 
  Video, 
  Ticket, 
  Settings, 
  LogOut, 
  ArrowLeft, 
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function AdminPanelOverlay() {
  const pathname = usePathname();
  const { 
    isAdminDashboardOpen, 
    closeDashboard, 
    activeTab, 
    setActiveTab, 
    adminUser, 
    logout 
  } = useAdminPortal();

  if (!isAdminDashboardOpen || pathname?.startsWith('/admin')) return null;

  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Produk Premium', icon: Package },
    { id: 'services', label: 'Jasa Editing', icon: Video },
    { id: 'promos', label: 'Promo Bioskop', icon: Ticket },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Navbar */}
      <header className="shrink-0 bg-zinc-900/90 border-b border-zinc-800 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand & Mode */}
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
          <button
            onClick={closeDashboard}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-zinc-700 transition-colors"
            title="Kembali melihat tampilan website toko customer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">← Kembali ke Website</span>
            <span className="sm:hidden">Website</span>
          </button>

          <button
            onClick={logout}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 bg-red-950/30 hover:bg-red-900/50 border border-red-800/40 transition-colors"
            title="Keluar dari sesi administrator"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around bg-zinc-900/95 border-b border-zinc-800 px-2 py-2 overflow-x-auto gap-1 shrink-0">
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

      {/* Main Workspace Body */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'services' && <ServicesTab />}
          {activeTab === 'promos' && <PromosTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>
    </div>
  );
}
