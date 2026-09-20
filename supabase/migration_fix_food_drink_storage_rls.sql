-- =========================================================================
-- MIGRATION: Fix Supabase Storage RLS Policies for food-drink-images
--
-- MASALAH:
-- Saat menambahkan bucket 'food-drink-images', policy RLS pada storage.objects
-- sebelumnya hanya mengizinkan:
-- ('product-images', 'service-images', 'cinema-images', 'store-assets')
-- sehingga upload gambar makanan & minuman diblokir dengan error:
-- "new row violates row-level security policy" (HTTP 403)
--
-- SOLUSI:
-- Jalankan query SQL ini di Supabase Dashboard > SQL Editor > New query
-- untuk mengizinkan bucket 'food-drink-images' dan 'drink-images'.
--
-- AMAN:
-- Tidak mengubah atau menghapus data makanan & minuman yang sudah ada.
-- Bucket tetap PUBLIC.
-- =========================================================================

-- 1. Pastikan bucket food-drink-images dan drink-images terdaftar dan PUBLIC
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('food-drink-images', 'food-drink-images', true),
    ('drink-images', 'drink-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Policy: Public Access (SELECT)
-- Siapa saja dapat melihat/mengakses gambar produk secara publik
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id IN (
        'product-images', 
        'service-images', 
        'cinema-images', 
        'store-assets', 
        'food-drink-images', 
        'drink-images'
    ));

-- 3. Policy: Admin Upload (INSERT)
-- Hanya admin yang terotentikasi yang dapat mengunggah gambar ke storage
DROP POLICY IF EXISTS "Admin upload storage images" ON storage.objects;
CREATE POLICY "Admin upload storage images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id IN (
            'product-images', 
            'service-images', 
            'cinema-images', 
            'store-assets', 
            'food-drink-images', 
            'drink-images'
        )
        AND public.is_admin(auth.uid())
    );

-- 4. Policy: Admin Update (UPDATE)
-- Hanya admin yang terotentikasi yang dapat memperbarui metadata gambar
DROP POLICY IF EXISTS "Admin update storage images" ON storage.objects;
CREATE POLICY "Admin update storage images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id IN (
            'product-images', 
            'service-images', 
            'cinema-images', 
            'store-assets', 
            'food-drink-images', 
            'drink-images'
        )
        AND public.is_admin(auth.uid())
    )
    WITH CHECK (
        bucket_id IN (
            'product-images', 
            'service-images', 
            'cinema-images', 
            'store-assets', 
            'food-drink-images', 
            'drink-images'
        )
        AND public.is_admin(auth.uid())
    );

-- 5. Policy: Admin Delete (DELETE)
-- Hanya admin yang terotentikasi yang dapat menghapus gambar dari storage
DROP POLICY IF EXISTS "Admin delete storage images" ON storage.objects;
CREATE POLICY "Admin delete storage images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id IN (
            'product-images', 
            'service-images', 
            'cinema-images', 
            'store-assets', 
            'food-drink-images', 
            'drink-images'
        )
        AND public.is_admin(auth.uid())
    );

-- =========================================================================
-- SELESAI
-- Setelah query ini dijalankan, admin dapat mengupload gambar makanan & minuman
-- tanpa terhalang error row-level security policy.
-- =========================================================================
