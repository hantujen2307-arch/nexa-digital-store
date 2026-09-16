-- =========================================================================
-- SUPABASE DATABASE SCHEMA FOR NEXADIGITAL TOKO DIGITAL
-- Complete Production Schema with Admin Role Authorization & RLS
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE ADMIN_USERS TABLE (For secure role-based admin authorization)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can check if their own user id is registered as an admin
DROP POLICY IF EXISTS "Authenticated users can check their own admin status" ON public.admin_users;
CREATE POLICY "Authenticated users can check their own admin status"
    ON public.admin_users FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Helper function: is_admin(user_id uuid) - Security Definer
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = user_id
  );
END;
$$;

-- 3. CREATE PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    category TEXT NOT NULL,
    badge TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. CREATE PRODUCT_PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    duration TEXT NOT NULL,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. CREATE SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon TEXT DEFAULT 'Video' NOT NULL,
    price NUMERIC,
    original_price NUMERIC,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. CREATE CINEMA_PROMOS TABLE
CREATE TABLE IF NOT EXISTS public.cinema_promos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    cinema TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    start_date DATE,
    end_date DATE,
    image_url TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. CREATE STORE_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    store_name TEXT NOT NULL DEFAULT 'ALPINO PREM',
    store_tagline TEXT DEFAULT 'Pusat Akun Premium, Jasa Editing & Promo Bioskop Terpercaya',
    whatsapp_number TEXT NOT NULL DEFAULT '6285709918896',
    whatsapp_template TEXT DEFAULT 'Halo Admin ALPINO PREM, saya ingin membeli: {item_name} ({variant_info}) dengan harga {price}. Apakah masih tersedia?',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert default store settings if not exists
INSERT INTO public.store_settings (id, store_name, store_tagline, whatsapp_number, whatsapp_template)
VALUES (
    'default',
    'ALPINO PREM',
    'Pusat Akun Premium, Jasa Editing & Promo Bioskop Terpercaya',
    '6285709918896',
    'Halo Admin ALPINO PREM, saya ingin membeli: {item_name} ({variant_info}) dengan harga {price}. Apakah masih tersedia?'
)
ON CONFLICT (id) DO NOTHING;

-- 8. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cinema_promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- 9. STRICT RLS POLICIES (Only Verified Admins Can Mutate, Public Can Only View Active)

-- Products RLS:
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
    ON public.products FOR SELECT
    TO anon, authenticated
    USING (active = true OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid())));

DROP POLICY IF EXISTS "Admin can insert products" ON public.products;
CREATE POLICY "Admin can insert products"
    ON public.products FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can update products" ON public.products;
CREATE POLICY "Admin can update products"
    ON public.products FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can delete products" ON public.products;
CREATE POLICY "Admin can delete products"
    ON public.products FOR DELETE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Product Packages RLS:
DROP POLICY IF EXISTS "Public can view active packages" ON public.product_packages;
CREATE POLICY "Public can view active packages"
    ON public.product_packages FOR SELECT
    TO anon, authenticated
    USING (active = true OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid())));

DROP POLICY IF EXISTS "Admin can insert packages" ON public.product_packages;
CREATE POLICY "Admin can insert packages"
    ON public.product_packages FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can update packages" ON public.product_packages;
CREATE POLICY "Admin can update packages"
    ON public.product_packages FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can delete packages" ON public.product_packages;
CREATE POLICY "Admin can delete packages"
    ON public.product_packages FOR DELETE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Services RLS:
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services"
    ON public.services FOR SELECT
    TO anon, authenticated
    USING (active = true OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid())));

DROP POLICY IF EXISTS "Admin can insert services" ON public.services;
CREATE POLICY "Admin can insert services"
    ON public.services FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can update services" ON public.services;
CREATE POLICY "Admin can update services"
    ON public.services FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can delete services" ON public.services;
CREATE POLICY "Admin can delete services"
    ON public.services FOR DELETE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Cinema Promos RLS:
DROP POLICY IF EXISTS "Public can view active cinema promos" ON public.cinema_promos;
CREATE POLICY "Public can view active cinema promos"
    ON public.cinema_promos FOR SELECT
    TO anon, authenticated
    USING (active = true OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid())));

DROP POLICY IF EXISTS "Admin can insert cinema promos" ON public.cinema_promos;
CREATE POLICY "Admin can insert cinema promos"
    ON public.cinema_promos FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can update cinema promos" ON public.cinema_promos;
CREATE POLICY "Admin can update cinema promos"
    ON public.cinema_promos FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can delete cinema promos" ON public.cinema_promos;
CREATE POLICY "Admin can delete cinema promos"
    ON public.cinema_promos FOR DELETE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Store Settings RLS:
DROP POLICY IF EXISTS "Public can view store settings" ON public.store_settings;
CREATE POLICY "Public can view store settings"
    ON public.store_settings FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin can manage store settings" ON public.store_settings;
CREATE POLICY "Admin can manage store settings"
    ON public.store_settings FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 10. STORAGE BUCKETS & RLS
-- Buckets required: 'product-images', 'service-images', 'cinema-images', 'store-assets'
-- Ensure public read, but only verified admin can upload/update/delete.
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id IN ('product-images', 'service-images', 'cinema-images', 'store-assets'));

DROP POLICY IF EXISTS "Admin upload storage images" ON storage.objects;
CREATE POLICY "Admin upload storage images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id IN ('product-images', 'service-images', 'cinema-images', 'store-assets')
        AND public.is_admin(auth.uid())
    );

DROP POLICY IF EXISTS "Admin update storage images" ON storage.objects;
CREATE POLICY "Admin update storage images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id IN ('product-images', 'service-images', 'cinema-images', 'store-assets')
        AND public.is_admin(auth.uid())
    )
    WITH CHECK (
        bucket_id IN ('product-images', 'service-images', 'cinema-images', 'store-assets')
        AND public.is_admin(auth.uid())
    );

DROP POLICY IF EXISTS "Admin delete storage images" ON storage.objects;
CREATE POLICY "Admin delete storage images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id IN ('product-images', 'service-images', 'cinema-images', 'store-assets')
        AND public.is_admin(auth.uid())
    );

-- =========================================================================
-- HOW TO REGISTER A NEW ADMIN USER:
-- When a new admin user is created in Supabase Dashboard (Authentication -> Users):
-- Execute the following SQL (replacing with their email and user UUID):
--
-- INSERT INTO public.admin_users (id, email, role)
-- VALUES ('<USER_UUID>', '<USER_EMAIL>', 'admin')
-- ON CONFLICT (id) DO NOTHING;
--
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
-- WHERE id = '<USER_UUID>';
-- =========================================================================
