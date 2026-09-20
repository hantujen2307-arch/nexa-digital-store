import { supabase, isSupabaseConfigured } from './client';

export type StorageBucket = 'product-images' | 'service-images' | 'cinema-images' | 'drink-images' | 'food-drink-images' | 'store-assets';

/**
 * Upload an image file to Supabase Storage and return its public URL
 */
export async function uploadImage(
  file: File,
  bucket: StorageBucket,
  folder?: string
): Promise<{ url: string | null; error: Error | null }> {
  try {
    if (!isSupabaseConfigured()) {
      // Fallback in case storage is not yet connected
      const previewUrl = URL.createObjectURL(file);
      return { url: previewUrl, error: null };
    }

    // 1. Sanitasi ekstensi file secara aman
    const rawExt = file.name.split('.').pop() || 'jpg';
    const cleanExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';

    // 2. Buat nama unik tanpa karakter aneh/spasi: {timestamp}-{random}.{extension}
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const fileName = `${Date.now()}-${randomSuffix}.${cleanExt}`;

    // 3. Tentukan folder path rapi (default: food-drinks/ untuk bucket food-drink-images)
    const targetFolder = folder ?? (bucket === 'food-drink-images' ? 'food-drinks' : '');
    const filePath = targetFolder ? `${targetFolder}/${fileName}` : fileName;

    // 4. Upload ke Supabase Storage dengan contentType eksplisit
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || `image/${cleanExt === 'jpg' ? 'jpeg' : cleanExt}`,
      });

    if (uploadError) {
      let friendlyMessage = uploadError.message;
      if (
        friendlyMessage?.toLowerCase().includes('row-level security') ||
        friendlyMessage?.toLowerCase().includes('violates') ||
        friendlyMessage?.toLowerCase().includes('policy')
      ) {
        friendlyMessage = `Supabase Storage RLS Policy memblokir upload ke bucket "${bucket}". Jalankan query SQL Storage RLS untuk mengizinkan bucket "${bucket}". (${uploadError.message})`;
      }
      return { url: null, error: new Error(friendlyMessage) };
    }

    // 5. Ambil public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (err: unknown) {
    return { url: null, error: err as Error };
  }
}
