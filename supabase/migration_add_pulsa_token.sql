-- =========================================================================
-- MIGRATION: Add pulsa_tokens table (Pulsa & Token module)
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor > New query)
--
-- AMAN: Tidak mengubah atau menghapus tabel yang sudah ada.
-- Sederhana & konsisten dengan tabel food_drinks.
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. CREATE pulsa_tokens TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pulsa_tokens (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT NOT NULL,
    slug          TEXT UNIQUE NOT NULL,
    category      TEXT NOT NULL DEFAULT 'Pulsa', -- 'Pulsa' | 'Paket Data' | 'Token PLN' | 'Voucher Game' | 'E-Wallet'
    provider      TEXT NOT NULL,                 -- 'Telkomsel', 'Indosat', 'XL', 'Tri', 'PLN', 'DANA', dll.
    nominal       NUMERIC NOT NULL DEFAULT 0 CHECK (nominal >= 0),
    price         NUMERIC NOT NULL DEFAULT 0 CHECK (price >= 0),
    description   TEXT DEFAULT '',
    image_url     TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    is_featured   BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── 2. INDEXES ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pulsa_tokens_category  ON public.pulsa_tokens(category);
CREATE INDEX IF NOT EXISTS idx_pulsa_tokens_provider  ON public.pulsa_tokens(provider);
CREATE INDEX IF NOT EXISTS idx_pulsa_tokens_is_active ON public.pulsa_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_pulsa_tokens_slug      ON public.pulsa_tokens(slug);
CREATE INDEX IF NOT EXISTS idx_pulsa_tokens_featured  ON public.pulsa_tokens(is_featured);

-- ─── 3. ROW LEVEL SECURITY (RLS) ───────────────────────────────────────────
ALTER TABLE public.pulsa_tokens ENABLE ROW LEVEL SECURITY;

-- Public (anon & authenticated) dapat membaca produk yang aktif (is_active = true)
DROP POLICY IF EXISTS "Public can view active pulsa_tokens" ON public.pulsa_tokens;
CREATE POLICY "Public can view active pulsa_tokens"
    ON public.pulsa_tokens FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- Admin dapat membaca SEMUA data (aktif maupun nonaktif)
DROP POLICY IF EXISTS "Admins can view all pulsa_tokens" ON public.pulsa_tokens;
CREATE POLICY "Admins can view all pulsa_tokens"
    ON public.pulsa_tokens FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Admin dapat menambah produk baru
DROP POLICY IF EXISTS "Admins can insert pulsa_tokens" ON public.pulsa_tokens;
CREATE POLICY "Admins can insert pulsa_tokens"
    ON public.pulsa_tokens FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

-- Admin dapat mengubah data produk
DROP POLICY IF EXISTS "Admins can update pulsa_tokens" ON public.pulsa_tokens;
CREATE POLICY "Admins can update pulsa_tokens"
    ON public.pulsa_tokens FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Admin dapat menghapus produk
DROP POLICY IF EXISTS "Admins can delete pulsa_tokens" ON public.pulsa_tokens;
CREATE POLICY "Admins can delete pulsa_tokens"
    ON public.pulsa_tokens FOR DELETE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- ─── 4. AUTO-UPDATE updated_at TRIGGER ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_pulsa_tokens_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pulsa_tokens_updated_at ON public.pulsa_tokens;
CREATE TRIGGER pulsa_tokens_updated_at
    BEFORE UPDATE ON public.pulsa_tokens
    FOR EACH ROW EXECUTE FUNCTION public.update_pulsa_tokens_updated_at();

-- ─── 5. SAMPLE DATA (KATALOG AWAL) ─────────────────────────────────────────
INSERT INTO public.pulsa_tokens (name, slug, category, provider, nominal, price, description, image_url, is_active, is_featured)
VALUES
    ('Telkomsel 10K', 'telkomsel-10k', 'Pulsa', 'Telkomsel', 10000, 12000, 'Pulsa reguler Telkomsel nominal 10 ribu.', NULL, true, true),
    ('Telkomsel 25K', 'telkomsel-25k', 'Pulsa', 'Telkomsel', 25000, 27000, 'Pulsa reguler Telkomsel nominal 25 ribu.', NULL, true, false),
    ('Indosat 15K', 'indosat-15k', 'Pulsa', 'Indosat', 15000, 17000, 'Pulsa reguler Indosat Ooredoo nominal 15 ribu.', NULL, true, false),
    ('XL 25K', 'xl-25k', 'Pulsa', 'XL', 25000, 27000, 'Pulsa reguler XL Axiata nominal 25 ribu.', NULL, true, false),
    ('Telkomsel Data 3GB 30 Hari', 'telkomsel-data-3gb-30-hari', 'Paket Data', 'Telkomsel', 35000, 35000, 'Paket internet kuota 3GB 24 jam selama 30 hari.', NULL, true, true),
    ('Indosat Freedom 10GB', 'indosat-freedom-10gb', 'Paket Data', 'Indosat', 45000, 45000, 'Kuota utama 10GB full 24 jam berlaku 30 hari.', NULL, true, false),
    ('Token PLN 20K', 'token-pln-20k', 'Token PLN', 'PLN', 20000, 22500, 'Strum listrik PLN prabayar nominal 20.000.', NULL, true, true),
    ('Token PLN 50K', 'token-pln-50k', 'Token PLN', 'PLN', 50000, 52500, 'Strum listrik PLN prabayar nominal 50.000.', NULL, true, true),
    ('Token PLN 100K', 'token-pln-100k', 'Token PLN', 'PLN', 100000, 102500, 'Strum listrik PLN prabayar nominal 100.000.', NULL, true, false),
    ('DANA 50K', 'dana-50k', 'E-Wallet', 'DANA', 50000, 52500, 'Top up saldo akun DANA nominal 50 ribu.', NULL, true, true),
    ('GoPay 50K', 'gopay-50k', 'E-Wallet', 'GoPay', 50000, 52500, 'Top up saldo akun GoPay nominal 50 ribu.', NULL, true, false),
    ('ShopeePay 25K', 'shopeepay-25k', 'E-Wallet', 'ShopeePay', 25000, 27500, 'Top up saldo akun ShopeePay nominal 25 ribu.', NULL, true, false),
    ('MLBB 86 Diamonds', 'mlbb-86-diamonds', 'Voucher Game', 'Mobile Legends', 86, 21000, '86 Diamonds Mobile Legends: Bang Bang.', NULL, true, true),
    ('Free Fire 140 Diamonds', 'free-fire-140-diamonds', 'Voucher Game', 'Free Fire', 140, 21000, '140 Diamonds Free Fire.', NULL, true, false)
ON CONFLICT (slug) DO NOTHING;
