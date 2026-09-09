-- ==============================================================================
-- Adore & Aura — Supabase Schema & Initial Seed
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category_slug TEXT NOT NULL REFERENCES public.categories(slug) ON UPDATE CASCADE ON DELETE RESTRICT,
    price NUMERIC(10, 2) NOT NULL,
    compare_at NUMERIC(10, 2),
    image_url TEXT NOT NULL,
    motif TEXT,
    description TEXT,
    included TEXT[] DEFAULT '{}',
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    stock INTEGER DEFAULT 50,
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Customer Profiles Table (links to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    guest_email TEXT,
    guest_phone TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, PACKED, SHIPPED, DELIVERED, CANCELLED, RTO
    payment_method TEXT NOT NULL,          -- UPI, COD, CARD
    payment_status TEXT NOT NULL DEFAULT 'UNPAID', -- UNPAID, VERIFICATION_PENDING, PAID, FAILED, REFUNDED
    transaction_id TEXT,                   -- 12-digit UPI UTR / Bank Reference Number
    payment_screenshot_url TEXT,
    subtotal NUMERIC(10, 2) NOT NULL,
    shipping_total NUMERIC(10, 2) DEFAULT 0,
    discount_total NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    shipping_address JSONB NOT NULL,
    gift_detail JSONB,
    shipment_id TEXT,
    awb_number TEXT,
    courier_name TEXT,
    estimated_delivery DATE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_transaction_id ON public.orders(transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_awb ON public.orders(awb_number);
CREATE INDEX IF NOT EXISTS idx_orders_shipment ON public.orders(shipment_id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS applied_coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS referral_discount NUMERIC(10, 2) DEFAULT 0;

-- 5b. Shipping Rules Table
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

CREATE INDEX IF NOT EXISTS idx_shipping_rules_prefix ON public.shipping_rules(pincode_prefix);

-- 5c. Blog Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    author_name TEXT DEFAULT 'Adore & Aura',
    category TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON public.posts(is_published, published_at DESC);

-- 5d. Testimonials Table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    location TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    product_slug TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON public.testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON public.testimonials(is_featured);

-- 5e. Instagram Posts Table
CREATE TABLE IF NOT EXISTS public.instagram_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    post_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_instagram_active ON public.instagram_posts(is_active, display_order);

-- 5f. Cart Events Table
CREATE TABLE IF NOT EXISTS public.cart_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('add', 'remove', 'checkout_start', 'checkout_complete', 'abandoned')),
    product_slug TEXT,
    product_title TEXT,
    product_price NUMERIC(10, 2),
    quantity INTEGER DEFAULT 1,
    cart_value NUMERIC(10, 2),
    user_email TEXT,
    user_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_events_session ON public.cart_events(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_type ON public.cart_events(event_type);
CREATE INDEX IF NOT EXISTS idx_cart_events_created ON public.cart_events(created_at);

-- 5g. Gift Cards Table
CREATE TABLE IF NOT EXISTS public.gift_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    initial_value NUMERIC(10, 2) NOT NULL CHECK (initial_value > 0),
    balance NUMERIC(10, 2) NOT NULL CHECK (balance >= 0),
    purchaser_email TEXT,
    purchaser_name TEXT,
    recipient_email TEXT,
    recipient_name TEXT,
    message TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'disabled')),
    redeemed_by_order_id UUID REFERENCES public.orders(id),
    redeemed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON public.gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON public.gift_cards(status);

-- 5h. Referrals Table
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    referrer_email TEXT NOT NULL,
    referrer_name TEXT,
    referred_email TEXT,
    referred_name TEXT,
    order_id UUID REFERENCES public.orders(id),
    discount_applied NUMERIC(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    redeemed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_email);

-- 6. Coupons Table
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

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active);

-- 7. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_slug TEXT NOT NULL,
    title TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- Functions & Triggers
-- ==============================================================================

-- Check if authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Trigger to create profile when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Categories: Anyone can read, admins have full access
CREATE POLICY "Public categories are viewable by everyone." 
    ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins have full access to categories."
    ON public.categories FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Products: Anyone can read published products, admins have full access
CREATE POLICY "Public products are viewable by everyone." 
    ON public.products FOR SELECT USING (is_published = true);
CREATE POLICY "Admins have full access to products."
    ON public.products FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Profiles: Users can view and update their own profile, admins have full access
CREATE POLICY "Users can view own profile." 
    ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile." 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles."
    ON public.profiles FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Orders: Allow creation (guest or authenticated) and viewing of own orders, admins have full access
CREATE POLICY "Anyone can create an order." 
    ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own orders." 
    ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins have full access to orders."
    ON public.orders FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Order Items: Allow creation on checkout and view if associated with order, admins have full access
CREATE POLICY "Anyone can insert order items." 
    ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their order items." 
    ON public.order_items FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE public.orders.id = public.order_items.order_id 
            AND (public.orders.user_id = auth.uid() OR public.orders.user_id IS NULL)
        )
    );
CREATE POLICY "Admins have full access to order items."
    ON public.order_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Coupons: Anyone can view active, non-expired coupons; admins have full access
CREATE POLICY "Public can view active coupons."
    ON public.coupons FOR SELECT
    USING (
        is_active = true
        AND (valid_until IS NULL OR valid_until > now())
    );
CREATE POLICY "Admins have full access to coupons."
    ON public.coupons FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Shipping Rules: Anyone can read, admins have full CRUD
CREATE POLICY "Public can view shipping rules."
    ON public.shipping_rules FOR SELECT USING (true);
CREATE POLICY "Admins have full access to shipping rules."
    ON public.shipping_rules FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Posts: Public can read published, admins have full CRUD
CREATE POLICY "Public can view published posts."
    ON public.posts FOR SELECT USING (is_published = true);
CREATE POLICY "Admins have full access to posts."
    ON public.posts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Testimonials: Public can read approved, admins have full CRUD
CREATE POLICY "Public can view approved testimonials."
    ON public.testimonials FOR SELECT USING (is_approved = true);
CREATE POLICY "Admins have full access to testimonials."
    ON public.testimonials FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Instagram Posts: Public can read active, admins have full CRUD
CREATE POLICY "Public can view active instagram posts."
    ON public.instagram_posts FOR SELECT USING (is_active = true);
CREATE POLICY "Admins have full access to instagram posts."
    ON public.instagram_posts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Cart Events: Anyone can insert, admins can read
CREATE POLICY "Anyone can insert cart events."
    ON public.cart_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view cart events."
    ON public.cart_events FOR SELECT USING (public.is_admin());

-- Gift Cards: Public can view active, admins have full access
CREATE POLICY "Public can view active gift cards."
    ON public.gift_cards FOR SELECT USING (status = 'active');
CREATE POLICY "Admins have full access to gift cards."
    ON public.gift_cards FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Referrals: Anyone can insert, admins can read all
CREATE POLICY "Anyone can insert referrals."
    ON public.referrals FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view active referrals."
    ON public.referrals FOR SELECT USING (status = 'pending');
CREATE POLICY "Admins have full access to referrals."
    ON public.referrals FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ==============================================================================
-- SEED DATA: Categories & Products
-- ==============================================================================

INSERT INTO public.categories (slug, name, tagline, description, image_url) VALUES
('rakhi', 'Rakhi', 'The bond that shines forever', 'Hand-set American Diamond rakhis, finished with peacock motifs, silken threads and luxury packaging.', '/cat-rakhi.jpg'),
('krishna-vastra', 'Krishna Vastra', 'Dressing the divine', 'Hand-stitched vastra, mukut and shringar for your home Krishna — devotional craftsmanship for Janmashtami and everyday seva.', '/cat-krishna.jpg'),
('jewellery', 'Jewellery', 'Heirloom-grade AD craftsmanship', 'Kundan, polki and AD necklaces, earrings and bangles — designed to be worn, gifted and remembered.', '/cat-jewellery.jpg'),
('makeup', 'Makeup & Beauty', 'Festive-ready, every day', 'A small, curated edit of bindi, kajal, lips and gifting boxes — designed for the rituals of getting ready.', '/cat-makeup.jpg')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (slug, title, category_slug, price, compare_at, image_url, motif, description, included, rating, reviews_count, featured, stock, tags) VALUES
('peacock-ad-rakhi', 'Peacock AD Rakhi', 'rakhi', 499, 699, '/product-peacock-crimson.jpg', 'Peacock', 'A signature peacock medallion set with hand-placed American Diamonds on a deep crimson silk thread. Arrives in our signature gold-foil keepsake box with roli-chawal.', ARRAY['Premium gift box', 'Roli-Chawal sachet', 'Hand-written tag'], 4.9, 124, true, 42, ARRAY['bestseller', 'peacock', 'crimson']),
('kalash-ad-rakhi', 'Kalash AD Rakhi', 'rakhi', 449, NULL, '/product-kalash-rakhi.jpg', 'Kalash', 'A devotional kalash motif set in antique-finish AD work on warm cream thread.', ARRAY['Premium gift box', 'Roli-Chawal sachet'], 4.8, 86, true, 30, ARRAY['devotional', 'gold']),
('lumba-rakhi-set', 'Bhaiya–Bhabhi Lumba Set', 'rakhi', 899, 1199, '/product-lumba-set.jpg', 'Floral', 'A matching set for brother and sister-in-law — a peacock rakhi paired with a hanging lumba in ruby tones.', ARRAY['Set of 2', 'Premium gift box', 'Roli-Chawal sachet'], 4.9, 53, true, 18, ARRAY['set', 'bhabhi', 'ruby']),
('minimal-thread-rakhi', 'Minimal Thread Rakhi', 'rakhi', 299, NULL, '/product-minimal-rakhi.jpg', 'Minimal', 'A pared-back single-stone rakhi for the brother who prefers quiet luxury.', ARRAY[]::text[], 4.7, 41, false, 60, ARRAY['minimal', 'everyday']),
('swastik-ad-rakhi', 'Swastik AD Rakhi', 'rakhi', 399, NULL, '/product-swastik-rakhi.jpg', 'Swastik', 'Auspicious swastik motif in antique gold with AD work on maroon silk thread.', ARRAY['Premium gift box', 'Roli-Chawal sachet'], 4.8, 62, false, 24, ARRAY['devotional', 'swastik']),
('krishna-vastra-orange', 'Saffron Silk Vastra — Krishna', 'krishna-vastra', 1299, NULL, '/product-vastra-saffron.jpg', NULL, 'Saffron silk vastra with hand-zari border, mukut and peacock-feather crown for laddu Gopal.', ARRAY['Vastra', 'Mukut', 'Peacock crown'], 4.9, 38, true, 14, ARRAY['saffron', 'laddu-gopal']),
('krishna-vastra-royal', 'Royal Blue Vastra Set', 'krishna-vastra', 1499, NULL, '/product-vastra-blue.jpg', NULL, 'Deep peacock blue vastra with gold zari, paired with mukut and matching pagdi.', ARRAY[]::text[], 4.8, 22, false, 11, ARRAY['blue', 'zari']),
('ad-kundan-necklace', 'Kundan AD Necklace', 'jewellery', 3499, 4499, '/product-kundan-necklace.jpg', NULL, 'Statement kundan and AD necklace with matching jhumka earrings.', ARRAY['Necklace', 'Earrings'], 4.8, 64, true, 8, ARRAY['bridal', 'kundan']),
('peacock-jhumka', 'Peacock Jhumka Earrings', 'jewellery', 1299, NULL, '/product-jhumka.jpg', 'Peacock', 'Peacock-motif jhumkas in antique gold finish with emerald-tone stones.', ARRAY[]::text[], 4.7, 47, false, 22, ARRAY['peacock', 'earrings']),
('kundan-choker-set', 'Kundan Choker Bridal Set', 'jewellery', 4999, 6499, '/product-choker-set.jpg', NULL, 'AD kundan choker set with matching earrings and maang tikka — the bridal statement piece.', ARRAY['Choker', 'Earrings', 'Maang tikka'], 4.9, 31, true, 6, ARRAY['bridal', 'choker']),
('rose-gold-bangles', 'Rose Gold AD Bangles', 'jewellery', 1799, NULL, '/product-bangles.jpg', NULL, 'A delicate pair of rose-gold AD bangles — everyday festive.', ARRAY['Set of 2'], 4.6, 27, false, 20, ARRAY['bangles', 'rose-gold']),
('festive-lip-set', 'Festive Lip Edit', 'makeup', 899, NULL, '/product-lipset.jpg', NULL, 'Two satin-matte festive reds in a keepsake gold box.', ARRAY['2 lipsticks', 'Gold box'], 4.6, 29, true, 34, ARRAY['gifting', 'lipstick']),
('bindi-edit-box', 'Heritage Bindi Edit', 'makeup', 349, NULL, '/product-bindi-box.jpg', NULL, 'A curated box of 12 bindi designs, from minimal dots to ornate kundan stickers.', ARRAY[]::text[], 4.5, 18, false, 50, ARRAY['bindi', 'gifting']),
('kajal-mirror-set', 'Heirloom Kajal & Mirror', 'makeup', 649, NULL, '/product-kajal.jpg', NULL, 'A gold-cased kajal paired with an heirloom hand mirror — a ritual, not a routine.', ARRAY['Kajal pot', 'Hand mirror'], 4.7, 15, false, 16, ARRAY['kajal', 'ritual'])
ON CONFLICT (slug) DO NOTHING;

-- ==============================================================================
-- SEED DATA: Launch Coupons
-- ==============================================================================

INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, valid_until, is_active)
VALUES
    ('AURA10', 'percentage', 10.00, 0, NULL, NULL, true),
    ('FESTIVE500', 'fixed', 500.00, 2499, NULL, NULL, true),
    ('WELCOME100', 'fixed', 100.00, 799, NULL, NULL, true)
ON CONFLICT (code) DO NOTHING;
