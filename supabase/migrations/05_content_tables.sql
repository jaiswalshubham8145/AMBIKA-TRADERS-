-- ==============================================================================
-- Migration 05: Blog, Testimonials & Instagram Feed
-- Adds content system for SEO, social proof, and visual brand building.
-- ==============================================================================

-- 1. Blog Posts Table
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
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);

-- 2. Testimonials Table
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

-- 3. Instagram Posts Table
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

-- ==============================================================================
-- Enable RLS
-- ==============================================================================

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- RLS Policies
-- ==============================================================================

-- Posts: public can read published, admins have full CRUD
CREATE POLICY "Public can view published posts."
    ON public.posts FOR SELECT
    USING (is_published = true);
CREATE POLICY "Admins have full access to posts."
    ON public.posts FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Testimonials: public can read approved, admins have full CRUD
CREATE POLICY "Public can view approved testimonials."
    ON public.testimonials FOR SELECT
    USING (is_approved = true);
CREATE POLICY "Admins have full access to testimonials."
    ON public.testimonials FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Instagram Posts: public can read active, admins have full CRUD
CREATE POLICY "Public can view active instagram posts."
    ON public.instagram_posts FOR SELECT
    USING (is_active = true);
CREATE POLICY "Admins have full access to instagram posts."
    ON public.instagram_posts FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ==============================================================================
-- Seed Data: Blog Posts
-- ==============================================================================

INSERT INTO public.posts (slug, title, excerpt, content, category, tags, is_published, published_at) VALUES
(
    'art-of-rakhi-guide',
    'The Art of Rakhi: A Guide to Choosing the Perfect Rakhi',
    'Not all rakhis are created equal. Here is how to pick one that matches the bond you share.',
    'Choosing a rakhi is not just about picking something pretty — it is about finding a symbol that matches the depth of your bond.

## Thread Types
Silk threads have been the traditional choice for centuries. They sit comfortably on the wrist and carry the warmth of handcraft. For brothers who prefer understated luxury, a minimal thread rakhi speaks volumes.

## Motif Meanings
The peacock motif represents beauty, grace, and pride — perfect for the brother who carries himself with quiet confidence. The kalash symbolizes prosperity and auspiciousness, ideal for the spiritual bond. The swastik brings good fortune and protection.

## AD Work
American Diamond work adds a touch of luxury without the price tag of real stones. Each stone is hand-set, making every piece unique. The sparkle catches light beautifully during the tying ceremony.

## The Perfect Gift Set
Pair your rakhi with roli-chawal for the tilak ceremony, and a handwritten note. The keepsake box we ship each rakhi in is designed to hold the memory long after the threads are gone.',
    'festival',
    ARRAY['rakhi', 'guide', 'festival', 'gifting'],
    true,
    '2026-08-01T10:00:00Z'
),
(
    '5-ways-raksha-bandhan-special',
    '5 Ways to Make Raksha Bandhan Special This Year',
    'From personalised gifts to shared experiences, here are five ideas to celebrate the bond.',
    'Raksha Bandhan is more than a ritual — it is a celebration of a relationship that has shaped who you are. Here are five ways to make it truly special this year.

## 1. Start with a Thoughtful Rakhi
Choose a rakhi that reflects your brother personality. Not a generic one from the market, but something with intention — hand-set stones, a motif that means something, packaging that feels like a gift.

## 2. Write a Letter
In the age of messages, a handwritten letter carries weight. Write about the moments that mattered — the times they stood by you, the inside jokes, the quiet support.

## 3. Plan a Shared Experience
Cook a meal together. Watch a film you both love. Take a walk. The best gift is sometimes just undivided time.

## 4. Gift Something They Will Use
Skip the generic gifts. If they love grooming, a curated beauty set. If they love tradition, a Krishna vastra for the home mandir.

## 5. Make the Tilak Ceremony Special
Use proper roli-chawal, light a diya, and take a moment. It is a small ritual with centuries of meaning.',
    'festival',
    ARRAY['raksha-bandhan', 'ideas', 'celebration', 'festival'],
    true,
    '2026-08-05T10:00:00Z'
),
(
    'behind-the-scenes-ad-rakhis',
    'Behind the Scenes: How Our AD Rakhis Are Hand-Crafted',
    'A peek into the meticulous process behind every American Diamond rakhi we create.',
    'Every Adore & Aura rakhi goes through a journey of 47 steps before it reaches your hands. Here is a glimpse behind the curtain.

## The Workshop
Our artisans work in a small atelier in Jaipur, where AD craft has been practiced for generations. Each artisan specialises in one step — stone setting, thread binding, or packaging.

## Stone Setting
Each American Diamond is placed by hand using a precision tool. The stones are arranged in patterns that have been sketched, refined, and approved over weeks. A single peacock rakhi can take 2-3 hours to complete.

## Thread Binding
The silk thread is sourced from Varanasi. It is dyed, twisted, and bound around the central motif by hand. The tension has to be just right — too loose and it falls apart, too tight and it loses its drape.

## Quality Check
Every piece is inspected under magnification. We check for stone alignment, thread integrity, and overall finish. Only pieces that pass every check make it to packaging.

## The Keepsake Box
Our signature gold-foil box is designed to be reused. It holds the rakhi, the roli-chawal sachet, and the handwritten tag. Because memories deserve a home.',
    'craft',
    ARRAY['behind-the-scenes', 'craft', 'artisan', 'process'],
    true,
    '2026-08-10T10:00:00Z'
);

-- ==============================================================================
-- Seed Data: Testimonials
-- ==============================================================================

INSERT INTO public.testimonials (customer_name, location, rating, review_text, product_slug, is_featured, is_approved) VALUES
('Priya Sharma', 'Mumbai', 5, 'The Peacock AD Rakhi was absolutely stunning. My brother was genuinely impressed — and he is not easy to impress. The packaging made it feel like a real luxury gift.', 'peacock-ad-rakhi', true, true),
('Ananya Gupta', 'Delhi', 5, 'I ordered the Lumba Set for my bhabhi and she loved it. The craftsmanship is beautiful and the keepsake box is such a thoughtful touch. Will definitely order again next year.', 'lumba-rakhi-set', true, true),
('Rohit Verma', 'Bangalore', 4, 'Bought the Kundan Choker Set for my wife anniversary. She wears it to every function now. The quality is surprisingly good for the price.', 'kundan-choker-set', true, true),
('Meera Iyer', 'Chennai', 5, 'The Krishna Vastra was perfect for our home mandir. The silk quality is excellent and the peacock feather crown is so detailed. My son loved dressing Laddu Gopal with it.', 'krishna-vastra-orange', false, true),
('Kavita Joshi', 'Pune', 5, 'I have been ordering from Adore & Aura for two years now. The consistency in quality is what keeps me coming back. Every piece feels handcrafted with love.', 'kalash-ad-rakhi', true, true);

-- ==============================================================================
-- Seed Data: Instagram Posts
-- ==============================================================================

INSERT INTO public.instagram_posts (image_url, post_url, caption, display_order, is_active) VALUES
('/product-peacock-crimson.jpg', 'https://www.instagram.com/adoreandaura/', 'Our signature Peacock AD Rakhi — hand-set with love', 1, true),
('/product-kalash-rakhi.jpg', 'https://www.instagram.com/adoreandaura/', 'The Kalash motif — tradition meets luxury', 2, true),
('/product-lumba-set.jpg', 'https://www.instagram.com/adoreandaura/', 'Bhaiya-Bhabhi Lumba Set — because bonds come in pairs', 3, true),
('/product-kundan-necklace.jpg', 'https://www.instagram.com/adoreandaura/', 'Kundan AD Necklace — heirloom-grade craftsmanship', 4, true),
('/product-vastra-saffron.jpg', 'https://www.instagram.com/adoreandaura/', 'Saffron silk vastra for your home Krishna', 5, true),
('/product-lipset.jpg', 'https://www.instagram.com/adoreandaura/', 'The Festive Lip Edit — two satin-matte reds', 6, true);
