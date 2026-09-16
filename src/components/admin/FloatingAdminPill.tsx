'use client';

import React from 'react';
import { useAdminPortal } from '@/context/AdminPortalContext';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function FloatingAdminPill() {
  const { isAdmin, isAdminDashboardOpen, openDashboard } = useAdminPortal();

  // Only show when admin is logged in AND the dashboard overlay is closed
  if (!isAdmin || isAdminDashboardOpen) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <button
        onClick={() => openDashboard('dashboard')}
        type="button"
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-zinc-900/90 border border-cyan-500/40 text-cyan-300 hover:text-white hover:border-cyan-400 hover:bg-zinc-850 shadow-xl backdrop-blur-md transition-all text-xs font-semibold group cursor-pointer"
        title="Klik untuk membuka kembali Admin Panel Dashboard"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        <span>Mode Admin: Buka Panel</span>
        <ArrowUpRight className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
}
