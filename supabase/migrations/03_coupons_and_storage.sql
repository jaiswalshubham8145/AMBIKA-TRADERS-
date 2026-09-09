-- ==============================================================================
-- Migration 03: Coupons, Promo Codes & Storage Bucket Permissions
-- Adds coupon/discount system and configures Supabase Storage for product images.
-- ==============================================================================

-- 1. Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_amount NUMERIC(10, 2) DEFAULT 0,
    max_discount_amount NUMERIC(10, 2),
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    valid_until TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER,
    times_used INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add applied_coupon_code to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS applied_coupon_code TEXT;

-- 3. Index for fast coupon lookups by code
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active);

-- 4. Enable RLS on coupons table
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Coupons
-- Anyone can view active, non-expired coupons (for validation at checkout)
CREATE POLICY "Public can view active coupons."
    ON public.coupons FOR SELECT
    USING (
        is_active = true
        AND (valid_until IS NULL OR valid_until > now())
    );

-- Authenticated admins have full CRUD permissions on coupons
CREATE POLICY "Admins have full access to coupons."
    ON public.coupons FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6. Seed Launch Coupons
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, valid_until, is_active)
VALUES
    ('AURA10', 'percentage', 10.00, 0, NULL, NULL, true),
    ('FESTIVE500', 'fixed', 500.00, 2499, NULL, NULL, true),
    ('WELCOME100', 'fixed', 100.00, 799, NULL, NULL, true)
ON CONFLICT (code) DO NOTHING;

-- 7. Storage bucket policy for product-images (Supabase Storage)
-- Note: The bucket itself must be created via Supabase Dashboard or CLI:
--   supabase storage create-bucket product-images --public
-- The following policies assume a public bucket named "product-images".

-- Allow anyone to read product images (public bucket)
CREATE POLICY "Public read access for product images."
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

-- Allow authenticated admins to upload product images
CREATE POLICY "Admins can upload product images."
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'product-images'
        AND public.is_admin()
    );

-- Allow authenticated admins to update product images
CREATE POLICY "Admins can update product images."
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'product-images'
        AND public.is_admin()
    );

-- Allow authenticated admins to delete product images
CREATE POLICY "Admins can delete product images."
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'product-images'
        AND public.is_admin()
    );
