import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Verified production Supabase project credentials for jualan-digital-store
export const PRODUCTION_SUPABASE_URL = 'https://dximinzftmsgizdfiufs.supabase.co';
export const PRODUCTION_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4aW1pbnpmdG1zZ2l6ZGZpdWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1MjQ4MDEsImV4cCI6MjEwNTEwMDgwMX0.g_3ybgihKSXQ7JVeFNCAv6EnGHe3PdRog8mAO68glZI';

/**
 * Sanitizes and validates a Supabase URL:
 * - Trims whitespace and strips surrounding quotes
 * - Automatically corrects typos (e.g. 'dximinzftmsgizdifiufs' with extra 'i')
 * - Strips trailing slashes
 * - Ensures valid https:// protocol
 * - Completely prevents dummy/fake domains like 'placeholder.supabase.co'
 */
export function sanitizeSupabaseUrl(url?: string | null): string {
  if (!url) return '';
  let clean = url.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');

  // Auto-correct common typo in host environment variables (extra 'i' between d and f)
  if (clean.includes('dximinzftmsgizdifiufs')) {
    clean = clean.replace('dximinzftmsgizdifiufs', 'dximinzftmsgizdfiufs');
  }

  // Ensure https:// protocol
  if (clean && !clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }

  // Reject placeholder or fake domains
  if (
    clean.includes('placeholder.supabase.co') ||
    clean.includes('your-supabase-url') ||
    clean === 'https://'
  ) {
    return '';
  }

  return clean;
}

/**
 * Sanitizes and validates a Supabase Key (anon key or publishable key):
 * - Trims whitespace and strips surrounding quotes
 * - Rejects placeholder/dummy keys
 */
export function sanitizeSupabaseKey(key?: string | null): string {
  if (!key) return '';
  const clean = key.trim().replace(/^["']|["']$/g, '');

  if (
    clean.includes('placeholder') ||
    clean.includes('your-anon-key') ||
    clean.includes('your-supabase-key')
  ) {
    return '';
  }

  return clean;
}

// 1. Read environment variables from process.env
const rawEnvUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const rawEnvKey = sanitizeSupabaseKey(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 2. Resolve final Supabase URL & Public Key
// Priority: Sanitized environment variable > Verified Production Configuration
// This ensures that even if environment variables are missing or misconfigured in Vercel,
// the browser NEVER attempts to contact non-existent domains like 'placeholder.supabase.co'.
const supabaseUrl = rawEnvUrl || PRODUCTION_SUPABASE_URL;
const supabaseAnonKey = rawEnvKey || PRODUCTION_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder')
  );
};

export const getSupabaseUrl = (): string => supabaseUrl;
export const getSupabaseKey = (): string => supabaseAnonKey;

// Diagnostic types & helper for structured error handling
export interface AuthDiagnostic {
  type:
    | 'INVALID_CREDENTIALS'
    | 'EMAIL_NOT_CONFIRMED'
    | 'CONFIG_MISSING'
    | 'NETWORK_UNREACHABLE'
    | 'RLS_PERMISSION'
    | 'ADMIN_TABLE_ERROR'
    | 'UNAUTHORIZED_ADMIN'
    | 'UNKNOWN';
  title: string;
  message: string;
}

export function diagnoseAuthError(error: unknown): AuthDiagnostic {
  if (!error) {
    return {
      type: 'UNKNOWN',
      title: 'Kesalahan Sistem',
      message: 'Terjadi kesalahan sistem yang tidak terduga.',
    };
  }

  const err = error as Record<string, unknown>;
  const msg = typeof err.message === 'string' ? err.message.toLowerCase() : '';
  const code = typeof err.code === 'string' ? err.code.toLowerCase() : '';
  const status = typeof err.status === 'number' ? err.status : null;

  // 1. Supabase URL/key tidak tersedia
  if (!isSupabaseConfigured()) {
    return {
      type: 'CONFIG_MISSING',
      title: 'Konfigurasi Supabase Tidak Tersedia',
      message: 'Konfigurasi Supabase tidak tersedia: NEXT_PUBLIC_SUPABASE_URL atau API Key belum disetel di environment variables.',
    };
  }

  // 2. Invalid login credentials
  if (
    code === 'invalid_credentials' ||
    code === 'invalid_grant' ||
    msg.includes('invalid login credentials') ||
    msg.includes('invalid_grant')
  ) {
    return {
      type: 'INVALID_CREDENTIALS',
      title: 'Kredensial Tidak Valid',
      message: 'Email atau password salah. Pastikan akun email dan kata sandi admin Anda sudah benar.',
    };
  }

  // 3. Email not confirmed
  if (
    code === 'email_not_confirmed' ||
    msg.includes('email not confirmed')
  ) {
    return {
      type: 'EMAIL_NOT_CONFIRMED',
      title: 'Email Belum Dikonfirmasi',
      message: 'Email belum dikonfirmasi di Supabase. Buka Supabase Auth Settings dan matikan "Confirm email" atau konfirmasi email akun Anda.',
    };
  }

  // 4. Supabase tidak dapat dihubungi (Failed to fetch / Network / DNS)
  if (
    status === 0 ||
    msg.includes('failed to fetch') ||
    msg.includes('fetch failed') ||
    msg.includes('network') ||
    msg.includes('name_not_resolved') ||
    msg.includes('enotfound') ||
    msg.includes('econnrefused') ||
    (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network')))
  ) {
    return {
      type: 'NETWORK_UNREACHABLE',
      title: 'Supabase Tidak Dapat Dihubungi',
      message: `Gagal terhubung ke database Supabase (Failed to fetch). Periksa koneksi internet Anda atau pastikan URL server (${supabaseUrl}) aktif dan dapat diakses.`,
    };
  }

  // 5. Error permission/RLS
  if (
    code === '42501' ||
    msg.includes('row-level security') ||
    msg.includes('permission denied') ||
    msg.includes('violates row-level security policy')
  ) {
    return {
      type: 'RLS_PERMISSION',
      title: 'Izin Database Ditolak (RLS)',
      message: 'Akses ke data ditolak oleh kebijakan keamanan database (Row-Level Security / RLS).',
    };
  }

  // 6. Error pada tabel admin_users
  if (
    code === '42p01' ||
    msg.includes('admin_users') ||
    msg.includes('does not exist')
  ) {
    return {
      type: 'ADMIN_TABLE_ERROR',
      title: 'Kendala Tabel admin_users',
      message: 'Tabel admin_users tidak ditemukan atau mengalami kendala skema pada database Supabase.',
    };
  }

  return {
    type: 'UNKNOWN',
    title: 'Gagal Masuk',
    message: typeof err.message === 'string' ? err.message : 'Terjadi kesalahan saat memproses autentikasi admin.',
  };
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'nexa_admin_auth_token',
  },
});


