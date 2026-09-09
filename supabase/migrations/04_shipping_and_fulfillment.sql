-- ==============================================================================
-- Migration 04: Shipping Rules, Fulfillment Columns & Order Tracking
-- Adds pincode-based shipping rate calculator and Shiprocket fulfillment columns.
-- ==============================================================================

-- 1. Shipping Rules Table
CREATE TABLE IF NOT EXISTS public.shipping_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pincode_prefix TEXT NOT NULL,
    zone TEXT NOT NULL DEFAULT 'standard',
    shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    free_shipping_min NUMERIC(10, 2) DEFAULT 999,
    cod_available BOOLEAN DEFAULT true,
    estimated_days_min INTEGER DEFAULT 3,
    estimated_days_max INTEGER DEFAULT 7,
    is_serviceable BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Index for fast prefix lookups
CREATE INDEX IF NOT EXISTS idx_shipping_rules_prefix ON public.shipping_rules(pincode_prefix);

-- 3. Enable RLS on shipping rules
ALTER TABLE public.shipping_rules ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Shipping Rules
-- Anyone can read shipping rules (needed for pincode checker at checkout)
CREATE POLICY "Public can view shipping rules."
    ON public.shipping_rules FOR SELECT
    USING (true);

-- Authenticated admins have full CRUD permissions on shipping rules
CREATE POLICY "Admins have full access to shipping rules."
    ON public.shipping_rules FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. Add fulfillment columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipment_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS awb_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_delivery DATE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- 6. Indexes for tracking lookups
CREATE INDEX IF NOT EXISTS idx_orders_awb ON public.orders(awb_number);
CREATE INDEX IF NOT EXISTS idx_orders_shipment ON public.orders(shipment_id);

-- 7. Seed Default Shipping Rules for Major Indian Zones
-- Metro cities
INSERT INTO public.shipping_rules (pincode_prefix, zone, shipping_fee, free_shipping_min, cod_available, estimated_days_min, estimated_days_max, is_serviceable)
VALUES
    ('110', 'metro', 0, 999, true, 2, 4, true),   -- Delhi NCR
    ('400', 'metro', 0, 999, true, 2, 4, true),   -- Mumbai
    ('560', 'metro', 0, 999, true, 2, 4, true),   -- Bangalore
    ('600', 'metro', 0, 999, true, 2, 4, true),   -- Chennai
    ('700', 'metro', 0, 999, true, 2, 4, true),   -- Kolkata
    ('500', 'metro', 0, 999, true, 2, 4, true),   -- Hyderabad
    ('380', 'metro', 0, 999, true, 2, 4, true),   -- Ahmedabad
    ('411', 'metro', 0, 999, true, 2, 4, true),   -- Pune
    ('160', 'metro', 0, 999, true, 2, 4, true),   -- Chandigarh
    ('302', 'metro', 0, 999, true, 2, 4, true)    -- Jaipur
ON CONFLICT DO NOTHING;

-- Tier 1 cities
INSERT INTO public.shipping_rules (pincode_prefix, zone, shipping_fee, free_shipping_min, cod_available, estimated_days_min, estimated_days_max, is_serviceable)
VALUES
    ('122', 'tier1', 0, 999, true, 3, 5, true),   -- Gurgaon
    ('201', 'tier1', 0, 999, true, 3, 5, true),   -- Noida / Ghaziabad
    ('421', 'tier1', 0, 999, true, 3, 5, true),   -- Thane
    ('462', 'tier1', 0, 999, true, 3, 5, true),   -- Bhopal
    ('413', 'tier1', 0, 999, true, 3, 5, true),   -- Nashik
    ('226', 'tier1', 0, 999, true, 3, 5, true),   -- Lucknow
    ('208', 'tier1', 0, 999, true, 3, 5, true),   -- Kanpur
    ('799', 'tier1', 0, 999, true, 3, 5, true),   -- Agartala (NE India hub)
    ('795', 'tier1', 0, 999, true, 3, 5, true)    -- Imphal
ON CONFLICT DO NOTHING;

-- Tier 2 / standard delivery zones
INSERT INTO public.shipping_rules (pincode_prefix, zone, shipping_fee, free_shipping_min, cod_available, estimated_days_min, estimated_days_max, is_serviceable)
VALUES
    ('248', 'tier2', 49, 1499, true, 4, 7, true),  -- Dehradun
    ('395', 'tier2', 49, 1499, true, 4, 7, true),  -- Rajkot
    ('360', 'tier2', 49, 1499, true, 4, 7, true),  -- Bhavnagar
    ('625', 'tier2', 49, 1499, true, 4, 7, true),  -- Madurai
    ('575', 'tier2', 49, 1499, true, 4, 7, true),  -- Mysore
    ('682', 'tier2', 49, 1499, true, 4, 7, true),  -- Kochi
    ('721', 'tier2', 49, 1499, true, 4, 7, true),  -- Agartala
    ('781', 'tier2', 49, 1499, true, 4, 7, true),  -- Guwahati
    ('800', 'tier2', 49, 1499, true, 4, 7, true),  -- Patna
    ('834', 'tier2', 49, 1499, true, 4, 7, true),  -- Ranchi
    ('452', 'tier2', 49, 1499, true, 4, 7, true),  -- Indore
    ('440', 'tier2', 49, 1499, true, 4, 7, true)   -- Nagpur
ON CONFLICT DO NOTHING;

-- Remote / difficult-to-serve zones
INSERT INTO public.shipping_rules (pincode_prefix, zone, shipping_fee, free_shipping_min, cod_available, estimated_days_min, estimated_days_max, is_serviceable)
VALUES
    ('737', 'remote', 99, 1999, false, 5, 10, true), -- North Sikkim
    ('794', 'remote', 99, 1999, false, 5, 10, true), -- Mizoram
    ('792', 'remote', 99, 1999, false, 5, 10, true), -- Meghalaya
    ('798', 'remote', 99, 1999, false, 5, 10, true), -- Arunachal Pradesh
    ('796', 'remote', 99, 1999, false, 5, 10, true), -- Nagaland
    ('797', 'remote', 99, 1999, false, 5, 10, true), -- Manipur (inner)
    ('851', 'remote', 99, 1999, false, 5, 10, true), -- North Bihar
    ('192', 'remote', 99, 1999, false, 7, 14, true), -- Kashmir
    ('193', 'remote', 99, 1999, false, 7, 14, true)  -- Ladakh
ON CONFLICT DO NOTHING;
