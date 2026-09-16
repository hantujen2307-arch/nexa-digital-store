import { supabase, isSupabaseConfigured } from './client';

export type StorageBucket = 'product-images' | 'service-images' | 'cinema-images' | 'store-assets';

/**
 * Upload an image file to Supabase Storage and return its public URL
 */
export async function uploadImage(
  file: File,
  bucket: StorageBucket
): Promise<{ url: string | null; error: Error | null }> {
  try {
    if (!isSupabaseConfigured()) {
      // Fallback in case storage is not yet connected
      const previewUrl = URL.createObjectURL(file);
      return { url: previewUrl, error: null };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { url: null, error: uploadError };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (err: unknown) {
    return { url: null, error: err as Error };
  }
}
