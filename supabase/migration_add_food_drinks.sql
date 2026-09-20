-- =========================================================================
-- MIGRATION: Add food_drinks table (Makanan & Minuman module)
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor > New query)
--
-- AMAN: Tidak mengubah atau menghapus tabel yang sudah ada.
-- =========================================================================

-- Enable UUID extension (sudah ada, tidak masalah jika dijalankan lagi)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. CREATE food_drinks TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.food_drinks (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    slug        TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category    TEXT NOT NULL DEFAULT 'Lainnya',
    price       NUMERIC NOT NULL DEFAULT 0 CHECK (price >= 0),
    original_price NUMERIC CHECK (original_price >= 0),
    image_url   TEXT,
    stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    status      BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── 2. INDEXES ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_food_drinks_category  ON public.food_drinks(category);
CREATE INDEX IF NOT EXISTS idx_food_drinks_status    ON public.food_drinks(status);
CREATE INDEX IF NOT EXISTS idx_food_drinks_slug      ON public.food_drinks(slug);
CREATE INDEX IF NOT EXISTS idx_food_drinks_featured  ON public.food_drinks(is_featured);

-- ─── 3. ROW LEVEL SECURITY ─────────────────────────────────────────────────
ALTER TABLE public.food_drinks ENABLE ROW LEVEL SECURITY;

-- Public (anon) dapat membaca produk yang aktif (status = true)
DROP POLICY IF EXISTS "Public can view active food_drinks" ON public.food_drinks;
CREATE POLICY "Public can view active food_drinks"
    ON public.food_drinks FOR SELECT
    TO anon, authenticated
    USING (status = true);

-- Admin dapat membaca SEMUA produk (aktif maupun nonaktif)
DROP POLICY IF EXISTS "Admins can view all food_drinks" ON public.food_drinks;
CREATE POLICY "Admins can view all food_drinks"
    ON public.food_drinks FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Admin dapat menambah produk baru
DROP POLICY IF EXISTS "Admins can insert food_drinks" ON public.food_drinks;
CREATE POLICY "Admins can insert food_drinks"
    ON public.food_drinks FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

-- Admin dapat mengubah produk
DROP POLICY IF EXISTS "Admins can update food_drinks" ON public.food_drinks;
CREATE POLICY "Admins can update food_drinks"
    ON public.food_drinks FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Admin dapat menghapus produk
DROP POLICY IF EXISTS "Admins can delete food_drinks" ON public.food_drinks;
CREATE POLICY "Admins can delete food_drinks"
    ON public.food_drinks FOR DELETE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- ─── 4. AUTO-UPDATE updated_at TRIGGER ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_food_drinks_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS food_drinks_updated_at ON public.food_drinks;
CREATE TRIGGER food_drinks_updated_at
    BEFORE UPDATE ON public.food_drinks
    FOR EACH ROW EXECUTE FUNCTION public.update_food_drinks_updated_at();

-- ─── 5. SUPABASE STORAGE BUCKET ─────────────────────────────────────────────
-- Buat bucket ini manual di Supabase Dashboard > Storage > New Bucket:
--   Nama bucket : food-drink-images
--   Public      : true (agar URL gambar bisa diakses publik)
--
-- Atau jalankan SQL ini jika menggunakan Supabase CLI:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('food-drink-images', 'food-drink-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- ─── 6. SAMPLE DATA (OPSIONAL) ──────────────────────────────────────────────
-- Hapus atau edit bagian ini sesuai kebutuhan.
-- Data ini hanya contoh awal, bisa dihapus setelah produk real ditambahkan via admin.
INSERT INTO public.food_drinks (name, slug, description, category, price, original_price, image_url, stock, status, is_featured)
VALUES
    ('Es Teh Manis Jumbo', 'es-teh-manis-jumbo', 'Teh manis segar ukuran jumbo dengan es batu pilihan.', 'Minuman', 5000, NULL, NULL, 100, true, true),
    ('Nasi Goreng Spesial', 'nasi-goreng-spesial', 'Nasi goreng bumbu rahasia dengan telur mata sapi, acar, dan kerupuk.', 'Makanan', 18000, 22000, NULL, 50, true, true),
    ('Keripik Singkong Pedas', 'keripik-singkong-pedas', 'Keripik singkong renyah dengan bumbu pedas manis yang bikin nagih.', 'Snack', 8000, NULL, NULL, 200, true, false),
    ('Es Krim Vanilla Cup', 'es-krim-vanilla-cup', 'Es krim vanilla lembut dalam cup, cocok sebagai penutup makan.', 'Dessert', 10000, NULL, NULL, 0, true, false)
ON CONFLICT (slug) DO NOTHING;

-- ─── SELESAI ────────────────────────────────────────────────────────────────
-- Tabel food_drinks siap digunakan.
-- Pastikan function is_admin() sudah ada dari schema.sql utama.
-- Jika belum, tambahkan terlebih dahulu dari file supabase/schema.sql.
