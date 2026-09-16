'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export type AdminTab = 'dashboard' | 'products' | 'services' | 'promos' | 'settings';

interface AdminPortalContextType {
  isAdminModalOpen: boolean;
  isAdminDashboardOpen: boolean;
  activeTab: AdminTab;
  adminUser: User | null;
  isAdmin: boolean;
  isCheckingAuth: boolean;
  editingProductId: string | null;
  isCreatingProduct: boolean;
  dataVersion: number;
  triggerDataRefresh: () => void;
  openLogin: () => void;
  openDashboard: (tab?: AdminTab) => void;
  closeLogin: () => void;
  closeDashboard: () => void;
  closeAll: () => void;
  setActiveTab: (tab: AdminTab) => void;
  setEditingProductId: (id: string | null) => void;
  setIsCreatingProduct: (val: boolean) => void;
  logout: () => Promise<void>;
  checkAdminRole: (userId: string, userEmail?: string) => Promise<boolean>;
}

const AdminPortalContext = createContext<AdminPortalContextType | undefined>(undefined);

export function AdminPortalProvider({ children }: { children: ReactNode }) {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Sub-navigation for products
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  const triggerDataRefresh = useCallback(() => {
    setDataVersion((v) => v + 1);
  }, []);

  // Helper to verify admin role against admin_users table, app_metadata, or authenticated session
  const checkAdminRole = useCallback(async (userId: string, userEmail?: string): Promise<boolean> => {
    if (!userId) return false;
    if (!isSupabaseConfigured()) return true; // Local development bypass
    try {
      // 1. Check admin_users table by id
      const { data: adminRecordById } = await supabase
        .from('admin_users')
        .select('id, role, email')
        .eq('id', userId)
        .maybeSingle();

      if (adminRecordById?.role === 'admin') {
        return true;
      }

      // 2. Check admin_users table by email
      if (userEmail) {
        const { data: adminRecordByEmail } = await supabase
          .from('admin_users')
          .select('id, role, email')
          .eq('email', userEmail.toLowerCase())
          .maybeSingle();

        if (adminRecordByEmail?.role === 'admin') {
          return true;
        }
      }

      // 3. Any user created in Supabase Authentication -> Users is an authorized admin
      // Attempt to sync/insert into admin_users table for persistent role tracking
      try {
        await supabase
          .from('admin_users')
          .upsert(
            {
              id: userId,
              email: (userEmail || '').toLowerCase(),
              role: 'admin',
            },
            { onConflict: 'id' }
          );
      } catch {
        // Ignore if RLS restricts client insert
      }

      return true;
    } catch (err) {
      console.error('Error checking admin role:', err);
      return true; // If user is authenticated in Supabase Auth, permit access
    }
  }, []);

  // Initial session & listener setup
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsCheckingAuth(false);
      return;
    }

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const hasAdminTableRole = await checkAdminRole(session.user.id, session.user.email);
          const hasAppMetaRole = session.user.app_metadata?.role === 'admin';
          if (hasAdminTableRole || hasAppMetaRole) {
            setAdminUser(session.user);
            setIsAdmin(true);
          } else {
            setAdminUser(null);
            setIsAdmin(false);
          }
        } else {
          setAdminUser(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Init auth error:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setAdminUser(null);
        setIsAdmin(false);
        setIsAdminDashboardOpen(false);
      } else if (session?.user) {
        const hasAdminTableRole = await checkAdminRole(session.user.id, session.user.email);
        const hasAppMetaRole = session.user.app_metadata?.role === 'admin';
        if (hasAdminTableRole || hasAppMetaRole) {
          setAdminUser(session.user);
          setIsAdmin(true);
        } else {
          setAdminUser(null);
          setIsAdmin(false);
          setIsAdminDashboardOpen(false);
        }
      }
    });

    // Check for query param ?admin=open or ?admin=login in URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'open' || urlParams.get('admin') === 'true') {
        // Remove query param cleanly without reloading
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        // Will open after auth check
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
              setIsAdminDashboardOpen(true);
            } else {
              setIsAdminModalOpen(true);
            }
          });
        }, 100);
      }
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkAdminRole]);

  const openLogin = useCallback(() => {
    if (isAdmin) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminModalOpen(true);
    }
  }, [isAdmin]);

  const openDashboard = useCallback((tab: AdminTab = 'dashboard') => {
    setActiveTab(tab);
    setEditingProductId(null);
    setIsCreatingProduct(false);
    setIsAdminDashboardOpen(true);
    setIsAdminModalOpen(false);
  }, []);

  const closeLogin = useCallback(() => {
    setIsAdminModalOpen(false);
  }, []);

  const closeDashboard = useCallback(() => {
    setIsAdminDashboardOpen(false);
    setEditingProductId(null);
    setIsCreatingProduct(false);
    triggerDataRefresh();
  }, [triggerDataRefresh]);

  const closeAll = useCallback(() => {
    setIsAdminModalOpen(false);
    setIsAdminDashboardOpen(false);
    setEditingProductId(null);
    setIsCreatingProduct(false);
    triggerDataRefresh();
  }, [triggerDataRefresh]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setAdminUser(null);
    setIsAdmin(false);
    setIsAdminDashboardOpen(false);
    setIsAdminModalOpen(false);
    setEditingProductId(null);
    setIsCreatingProduct(false);
    triggerDataRefresh();
  }, [triggerDataRefresh]);

  return (
    <AdminPortalContext.Provider
      value={{
        isAdminModalOpen,
        isAdminDashboardOpen,
        activeTab,
        adminUser,
        isAdmin,
        isCheckingAuth,
        editingProductId,
        isCreatingProduct,
        dataVersion,
        triggerDataRefresh,
        openLogin,
        openDashboard,
        closeLogin,
        closeDashboard,
        closeAll,
        setActiveTab,
        setEditingProductId,
        setIsCreatingProduct,
        logout,
        checkAdminRole,
      }}
    >
      {children}
    </AdminPortalContext.Provider>
  );
}

export function useAdminPortal() {
  const context = useContext(AdminPortalContext);
  if (!context) {
    throw new Error('useAdminPortal must be used within an AdminPortalProvider');
  }
  return context;
}
