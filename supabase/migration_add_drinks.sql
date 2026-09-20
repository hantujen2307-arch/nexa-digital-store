-- =========================================================================
-- MIGRATION: Add drinks table for Produk Minuman feature
-- Run this in your Supabase SQL Editor
-- =========================================================================

-- 1. Create drinks table
CREATE TABLE IF NOT EXISTS public.drinks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Lainnya',
    description TEXT NOT NULL DEFAULT '',
    price INTEGER NOT NULL DEFAULT 0,
    "originalPrice" INTEGER,
    "imageUrl" TEXT,
    badge TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    sold_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.drinks ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Public can view active drinks
DROP POLICY IF EXISTS "Public can view active drinks" ON public.drinks;
CREATE POLICY "Public can view active drinks"
    ON public.drinks FOR SELECT
    TO anon, authenticated
    USING (active = true);

-- Admins can view all drinks
DROP POLICY IF EXISTS "Admins can view all drinks" ON public.drinks;
CREATE POLICY "Admins can view all drinks"
    ON public.drinks FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Admins can insert drinks
DROP POLICY IF EXISTS "Admins can insert drinks" ON public.drinks;
CREATE POLICY "Admins can insert drinks"
    ON public.drinks FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

-- Admins can update drinks
DROP POLICY IF EXISTS "Admins can update drinks" ON public.drinks;
CREATE POLICY "Admins can update drinks"
    ON public.drinks FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Admins can delete drinks
DROP POLICY IF EXISTS "Admins can delete drinks" ON public.drinks;
CREATE POLICY "Admins can delete drinks"
    ON public.drinks FOR DELETE
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- 4. Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.update_drinks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS drinks_updated_at ON public.drinks;
CREATE TRIGGER drinks_updated_at
    BEFORE UPDATE ON public.drinks
    FOR EACH ROW EXECUTE FUNCTION public.update_drinks_updated_at();

-- 5. Create storage bucket for drink images (run if not exists)
-- Note: This must be done via Supabase Dashboard > Storage > New Bucket
-- Bucket name: drink-images  |  Public: true

-- 6. (Optional) Insert sample drinks to get started
-- Remove or modify this section as needed
INSERT INTO public.drinks (name, category, description, price, "originalPrice", "imageUrl", badge, active, sold_count)
VALUES
    ('Es Teh Manis', 'Teh', 'Teh manis segar dengan es batu pilihan, minuman klasik yang selalu menyegarkan.', 5000, NULL, NULL, NULL, true, 0),
    ('Es Jeruk Peras', 'Jus', 'Perasan jeruk asli segar tanpa pengawet, kaya vitamin C.', 8000, 10000, NULL, 'Segar', true, 0)
ON CONFLICT DO NOTHING;
