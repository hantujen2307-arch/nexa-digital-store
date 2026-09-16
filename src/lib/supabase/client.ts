import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default project configuration fallback to prevent DNS errors (net::ERR_NAME_NOT_RESOLVED)
const DEFAULT_SUPABASE_URL = 'https://dximinzftmsgizdfiufs.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4aW1pbnpmdG1zZ2l6ZGZpdWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1MjQ4MDEsImV4cCI6MjEwNTEwMDgwMX0.g_3ybgihKSXQ7JVeFNCAv6EnGHe3PdRog8mAO68glZI';

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const rawKey = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''
).trim();

// Use environment variables if properly configured, otherwise use default project credentials
const supabaseUrl =
  rawUrl && rawUrl.startsWith('https://') && !rawUrl.includes('placeholder') && !rawUrl.includes('your-supabase-url')
    ? rawUrl
    : DEFAULT_SUPABASE_URL;

const supabaseAnonKey =
  rawKey && !rawKey.includes('placeholder') && !rawKey.includes('your-anon-key')
    ? rawKey
    : DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder')
  );
};

export const getSupabaseUrl = (): string => supabaseUrl;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'nexa_admin_auth_token',
  },
});

