-- Migration: Add download_url to products and enhance is_admin authorization
-- Safe & idempotent: Does not remove or alter existing data

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS download_url TEXT;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = user_id AND role = 'admin'
  ) OR (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );
END;
$$;
