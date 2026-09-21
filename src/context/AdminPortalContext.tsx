'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, diagnoseAuthError, AuthDiagnostic } from '@/lib/supabase/client';

export type AdminTab = 'dashboard' | 'products' | 'services' | 'promos' | 'drinks' | 'food-drinks' | 'pulsa-token' | 'settings';

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
  verifyAdminRole: (userId: string, userEmail?: string) => Promise<{ authorized: boolean; diagnostic?: AuthDiagnostic }>;
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

  // Diagnostic helper to verify admin role against admin_users table and app_metadata
  const verifyAdminRole = useCallback(
    async (userId: string, userEmail?: string): Promise<{ authorized: boolean; diagnostic?: AuthDiagnostic }> => {
      if (!userId) {
        return {
          authorized: false,
          diagnostic: {
            type: 'UNAUTHORIZED_ADMIN',
            title: 'Sesi Tidak Valid',
            message: 'User ID tidak ditemukan pada sesi autentikasi.',
          },
        };
      }

      if (!isSupabaseConfigured()) {
        return { authorized: true }; // Local development fallback
      }

      try {
        // 1. Check admin_users table by ID
        const { data: adminRecordById, error: errorById } = await supabase
          .from('admin_users')
          .select('id, role, email')
          .eq('id', userId)
          .maybeSingle();

        if (errorById) {
          const diag = diagnoseAuthError(errorById);
          if (diag.type === 'RLS_PERMISSION' || diag.type === 'ADMIN_TABLE_ERROR' || diag.type === 'NETWORK_UNREACHABLE') {
            console.error('Diagnostic error querying admin_users by ID:', errorById);
            return { authorized: false, diagnostic: diag };
          }
        }

        if (adminRecordById?.role === 'admin') {
          return { authorized: true };
        }

        // 2. Check admin_users table by email
        if (userEmail) {
          const { data: adminRecordByEmail, error: errorByEmail } = await supabase
            .from('admin_users')
            .select('id, role, email')
            .eq('email', userEmail.toLowerCase())
            .maybeSingle();

          if (errorByEmail) {
            const diag = diagnoseAuthError(errorByEmail);
            if (diag.type === 'RLS_PERMISSION' || diag.type === 'ADMIN_TABLE_ERROR' || diag.type === 'NETWORK_UNREACHABLE') {
              console.error('Diagnostic error querying admin_users by email:', errorByEmail);
              return { authorized: false, diagnostic: diag };
            }
          }

          if (adminRecordByEmail?.role === 'admin') {
            return { authorized: true };
          }
        }

        // 3. Check Supabase app_metadata
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user?.app_metadata?.role === 'admin') {
          return { authorized: true };
        }

        return {
          authorized: false,
          diagnostic: {
            type: 'UNAUTHORIZED_ADMIN',
            title: 'Akses Ditolak',
            message: 'Akses ditolak: Akun Anda tidak terdaftar sebagai Administrator pada tabel admin_users.',
          },
        };
      } catch (err) {
        console.error('Error verifying admin role:', err);
        return {
          authorized: false,
          diagnostic: diagnoseAuthError(err),
        };
      }
    },
    []
  );

  const checkAdminRole = useCallback(
    async (userId: string, userEmail?: string): Promise<boolean> => {
      const result = await verifyAdminRole(userId, userEmail);
      return result.authorized;
    },
    [verifyAdminRole]
  );

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
        verifyAdminRole,
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
