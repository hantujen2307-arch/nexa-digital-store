-- =========================================================================
-- MIGRATION: Add pulsa_tokens table (Pulsa & Token module)
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor > New query)
--
-- AMAN: Tidak mengubah atau menghapus tabel yang sudah ada.
-- =========================================================================

-- Enable UUID extension (sudah ada, aman jika dijalankan lagi)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. CREATE pulsa_tokens TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pulsa_tokens (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT NOT NULL,
    slug          TEXT UNIQUE NOT NULL,
    type          TEXT NOT NULL, -- 'pulsa' | 'data' | 'token_pln' | 'voucher_game' | 'ewallet'
    provider      TEXT NOT NULL, -- 'Telkomsel', 'Indosat', 'XL', 'Tri', 'Smartfren', 'PLN', 'DANA', 'OVO', 'GoPay', dll
    nominal       NUMERIC NOT NULL DEFAULT 0 CHECK (nominal >= 0),
    cost_price    NUMERIC NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
    selling_price NUMERIC NOT NULL DEFAULT 0 CHECK (selling_price >= 0),
    description   TEXT DEFAULT '',
    stock         INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    is_active     BOOLEAN NOT NULL DEFAULT true,
    is_featured   BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── 2. INDEXES ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pulsa_tokens_type      ON public.pulsa_tokens(type);
CREATE INDEX IF NOT EXISTS idx_pulsa_tokens_provider  ON public.pulsa_tokens(provider);
CREATE INDEX IF NOT EXISTS idx_pulsa_tokens_is_active ON public.pulsa_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_pulsa_tokens_slug      ON public.pulsa_tokens(slug);
CREATE INDEX IF NOT EXISTS idx_pulsa_tokens_featured  ON public.pulsa_tokens(is_featured);

-- ─── 3. ROW LEVEL SECURITY (RLS) ───────────────────────────────────────────
ALTER TABLE public.pulsa_tokens ENABLE ROW LEVEL SECURITY;

-- Public (anon & authenticated) hanya dapat membaca produk yang aktif (is_active = true)
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

-- ─── 5. SAMPLE DATA (OPSIONAL / STARTER) ────────────────────────────────────
-- Data sampel awal untuk mempermudah pengecekan dan operasional pertama.
INSERT INTO public.pulsa_tokens (name, slug, type, provider, nominal, cost_price, selling_price, description, stock, is_active, is_featured)
VALUES
    ('Telkomsel Pulsa 10.000', 'telkomsel-pulsa-10000', 'pulsa', 'Telkomsel', 10000, 10500, 12000, 'Pulsa reguler Telkomsel menambah masa aktif kartu.', 999, true, true),
    ('Telkomsel Pulsa 25.000', 'telkomsel-pulsa-25000', 'pulsa', 'Telkomsel', 25000, 25200, 27000, 'Pulsa reguler Telkomsel masa aktif 30 hari.', 999, true, false),
    ('Indosat Pulsa 15.000', 'indosat-pulsa-15000', 'pulsa', 'Indosat', 15000, 15300, 17000, 'Pulsa reguler IM3 Indosat Ooredoo.', 500, true, false),
    ('XL Pulsa 25.000', 'xl-pulsa-25000', 'pulsa', 'XL', 25000, 25100, 27000, 'Pulsa reguler XL Axiata.', 500, true, false),
    ('Telkomsel Data 3GB 30 Hari', 'telkomsel-data-3gb-30-hari', 'data', 'Telkomsel', 35000, 31000, 35000, 'Paket internet kuota 3GB 24 jam semua jaringan selama 30 hari.', 300, true, true),
    ('Indosat Freedom Internet 10GB', 'indosat-freedom-internet-10gb', 'data', 'Indosat', 45000, 39500, 45000, 'Kuota utama 10GB full 24 jam berlaku 30 hari.', 250, true, false),
    ('Token PLN 20.000', 'token-pln-20000', 'token_pln', 'PLN', 20000, 20300, 22500, 'Strum PLN prabayar nominal 20.000 (Kwh sesuai tarif daya).', 999, true, true),
    ('Token PLN 50.000', 'token-pln-50000', 'token_pln', 'PLN', 50000, 50300, 52500, 'Strum PLN prabayar nominal 50.000 (Kwh sesuai tarif daya).', 999, true, true),
    ('Token PLN 100.000', 'token-pln-100000', 'token_pln', 'PLN', 100000, 100300, 102500, 'Strum PLN prabayar nominal 100.000.', 999, true, false),
    ('DANA Top Up 50.000', 'dana-top-up-50000', 'ewallet', 'DANA', 50000, 50500, 52500, 'Saldo DANA langsung masuk ke nomor HP tujuan.', 999, true, true),
    ('GoPay Top Up 50.000', 'gopay-top-up-50000', 'ewallet', 'GoPay', 50000, 50500, 52500, 'Saldo GoPay customer.', 999, true, false),
    ('ShopeePay Top Up 25.000', 'shopeepay-top-up-25000', 'ewallet', 'ShopeePay', 25000, 25500, 27500, 'Saldo ShopeePay.', 999, true, false),
    ('MLBB 86 Diamonds', 'mlbb-86-diamonds', 'voucher_game', 'Mobile Legends', 86, 18500, 21000, '86 Diamonds Mobile Legends: Bang Bang. Masukkan User ID & Zone ID.', 100, true, true),
    ('Free Fire 140 Diamonds', 'free-fire-140-diamonds', 'voucher_game', 'Free Fire', 140, 18200, 21000, '140 Diamonds Free Fire. Masukkan Player ID.', 4, true, false)
ON CONFLICT (slug) DO NOTHING;

-- ─── SELESAI ────────────────────────────────────────────────────────────────
-- Tabel pulsa_tokens siap digunakan.
