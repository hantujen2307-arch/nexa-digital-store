import { supabase, isSupabaseConfigured } from './supabase/client';
import { StoreSettings } from '@/types/database';
import { STORE_NAME, STORE_SUBTITLE, STORE_DESCRIPTION, WHATSAPP_NUMBER, STORE_LOGO_URL } from '@/data/config';

export const defaultStoreSettings: StoreSettings = {
  id: 'default',
  store_name: STORE_NAME,
  store_subtitle: STORE_SUBTITLE,
  store_description: STORE_DESCRIPTION,
  whatsapp_number: WHATSAPP_NUMBER,
  logo_url: STORE_LOGO_URL,
};

let cachedSettings: StoreSettings | null = null;

/**
 * Fetch store settings from Supabase table `store_settings`
 * Fallback to default configuration if not configured or query fails.
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  if (cachedSettings) {
    return cachedSettings;
  }

  if (!isSupabaseConfigured()) {
    return defaultStoreSettings;
  }

  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data) {
      return defaultStoreSettings;
    }

    cachedSettings = data as StoreSettings;
    return cachedSettings;
  } catch (err) {
    console.error('Error fetching store settings:', err);
    return defaultStoreSettings;
  }
}

/**
 * Update store settings in Supabase table `store_settings`
 */
export async function updateStoreSettings(
  settings: Partial<Omit<StoreSettings, 'id' | 'updated_at'>>
): Promise<{ success: boolean; data?: StoreSettings; error?: Error }> {
  if (!isSupabaseConfigured()) {
    cachedSettings = { ...defaultStoreSettings, ...settings };
    return { success: true, data: cachedSettings };
  }

  try {
    const payload = {
      ...settings,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('store_settings')
      .upsert({ id: 'default', ...payload })
      .select()
      .single();

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    cachedSettings = data as StoreSettings;
    return { success: true, data: cachedSettings };
  } catch (err: unknown) {
    return { success: false, error: err as Error };
  }
}

/**
 * Returns current cached WhatsApp number or default from config
 */
export function getActiveWhatsAppNumber(): string {
  if (cachedSettings && cachedSettings.whatsapp_number) {
    return cachedSettings.whatsapp_number;
  }
  return WHATSAPP_NUMBER;
}

/**
 * Manually update in-memory cached settings
 */
export function setCachedStoreSettings(settings: StoreSettings) {
  cachedSettings = settings;
}
