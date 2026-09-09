# Adore & Aura — Project Info

_Last updated: 4 September 2026_

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | TanStack Start + React 19 + Tailwind v4 |
| State | Zustand (cart, wishlist) with persistence |
| Validation | Zod |
| Backend | Supabase (Auth, Database, Storage) |
| Payments | Direct UPI (NPCI QR + deep link) |
| Shipping | Shiprocket API |
| Analytics | GA4 + Meta Pixel |
| Hosting | Vercel / Netlify / any static host |

---

## Environment Variables

### Required

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJhbGci...` |
| `VITE_ADMIN_UPI_ID` | Admin UPI VPA for payments | `name@bank` |
| `VITE_ADMIN_UPI_NAME` | Admin display name for UPI | `Adore & Aura` |
| `VITE_ADMIN_WHATSAPP_PHONE` | Admin WhatsApp (country code + number) | `919876543210` |

### Optional

| Variable | Purpose |
|----------|---------|
| `VITE_CALLMEBOT_API_KEY` | CallMeBot free WhatsApp API key |
| `VITE_SHIPROCKET_API_URL` | Shiprocket API base URL |
| `VITE_SHIPROCKET_EMAIL` | Shiprocket login email |
| `VITE_SHIPROCKET_PASSWORD` | Shiprocket login password |
| `VITE_GA4_ID` | Google Analytics 4 measurement ID |
| `VITE_META_PIXEL_ID` | Meta Pixel ID |

---

## Database Migrations

Run these in order in Supabase SQL Editor:

| # | File | Purpose |
|---|------|---------|
| 01 | `01_auth_and_roles.sql` | Auth, profiles, roles, trigger |
| 02 | `02_upi_payments.sql` | UPI payments, transaction IDs |
| 03 | `03_coupons_and_storage.sql` | Coupons table, storage policies |
| 04 | `04_shipping_and_fulfillment.sql` | Shipping rules, order fulfillment columns |
| 05 | `05_content_tables.sql` | Blog posts, testimonials, Instagram |
| 06 | `06_cart_events.sql` | Cart analytics, abandoned cart tracking |
| 07 | `07_gift_cards.sql` | Gift card system |
| 08 | `08_referrals.sql` | Referral code system |

### Additional Setup

- Create `product-images` storage bucket in Supabase Dashboard → Storage
- Set admin role: `UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';`

---

## Security Audit

### What's Secured

| Layer | Status | Detail |
|-------|--------|--------|
| **RLS** | All 13 tables | Every table has Row Level Security enabled with appropriate policies |
| **Anon key only** | No service role key exposed | Only `VITE_SUPABASE_ANON_KEY` in frontend — designed to be public |
| **Admin guard (frontend)** | `/admin` layout | Redirects guests to login, blocks non-admin users with "Access Restricted" screen |
| **Admin guard (backend)** | RLS `is_admin()` function | Admin policies use `public.is_admin()` which queries `profiles.role` — cannot be bypassed from the client |
| **`.gitignore`** | Excludes secrets | `.env` and `.env.*` are excluded from git |
| **No hardcoded secrets** | Clean | UPI ID, WhatsApp phone are business-facing, not sensitive |

### How Security Works

**RLS (Row Level Security):**
- Every table has `ENABLE ROW LEVEL SECURITY`
- Public tables (categories, products, posts, testimonials, instagram_posts) allow `SELECT` for everyone
- Admin-only operations use `USING (public.is_admin())` which checks `profiles.role = 'admin'`
- Order creation is `INSERT WITH CHECK (true)` — anyone can place an order
- Order viewing is restricted to the order owner via `auth.uid() = user_id`
- Cart events and referrals allow anonymous inserts (analytics only)

**Admin Role:**
- Only way to grant admin: run SQL in Supabase SQL Editor
- No UI escalation path
- Frontend checks `profile.role === 'admin'` from Supabase auth session

**Anon Key:**
- The `VITE_SUPABASE_ANON_KEY` is visible in browser dev tools — this is normal for Supabase
- Security comes from RLS policies, not hiding the key
- The anon key cannot bypass RLS policies

### ⚠️ Before Going Live

**Move Shiprocket credentials to server-side:**
- `VITE_SHIPROCKET_EMAIL` and `VITE_SHIPROCKET_PASSWORD` are `VITE_` prefixed
- They get bundled into client JS and are visible in dev tools
- For production, move these to a Supabase Edge Function or your own API proxy
- Everything else is secure as-is

### Known Limitations (Low Risk)

| Item | Risk | Mitigation |
|------|------|------------|
| Shiprocket creds in client bundle | Medium | Move to Edge Function |
| No rate limiting on cart events | Low | Just analytics noise |
| No rate limiting on referrals | Low | Max 1 referral per email enforced in code |

---

## Deployment Checklist

1. Run all 8 migrations in Supabase SQL Editor
2. Create `product-images` storage bucket
3. Set env vars on hosting platform
4. (Optional) Move Shiprocket to server-side
5. `npm run build` → deploy `dist/`

### Build Commands

```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint
npm run format     # Prettier
npx tsc --noEmit   # Type check
```

---

## Project Structure

```
src/
├── components/
│   ├── site/          # Header, footer, cart-drawer, product-card
│   └── ui/            # Radix-based UI primitives
├── hooks/
│   ├── use-auth.tsx   # Supabase auth + role provider
│   └── use-products.ts # React Query hooks for catalog
├── lib/
│   ├── analytics.ts   # GA4 + Meta Pixel event tracking
│   ├── blog.ts        # Blog post fetchers
│   ├── cart.ts        # Zustand cart store
│   ├── cart-events.ts # Cart analytics tracker
│   ├── cart-recovery.ts # WhatsApp recovery messages
│   ├── coupons.ts     # Coupon validation
│   ├── gift-cards.ts  # Gift card CRUD
│   ├── instagram.ts   # Instagram posts fetcher
│   ├── payment-config.ts # UPI config + URI builder
│   ├── products.ts    # Data normalization + fetchers
│   ├── referrals.ts   # Referral code system
│   ├── shipping.ts    # Pincode rate calculator
│   ├── shiprocket.ts  # Shiprocket API client
│   ├── storage.ts     # Supabase image upload
│   ├── supabase.ts    # Supabase client init
│   ├── testimonials.ts # Testimonials fetcher
│   ├── whatsapp.ts    # WhatsApp alert system
│   └── wishlist.ts    # Zustand wishlist store
├── routes/
│   ├── __root.tsx     # Root layout + analytics scripts
│   ├── index.tsx      # Homepage
│   ├── shop.tsx       # Shop layout
│   ├── shop.index.tsx # Shop all
│   ├── shop.$category.tsx # Category pages
│   ├── product.$slug.tsx  # Product detail
│   ├── cart.tsx       # Cart page
│   ├── checkout.tsx   # 3-step checkout
│   ├── wishlist.tsx   # Wishlist page
│   ├── track.tsx      # Order tracking
│   ├── blog.index.tsx # Blog listing
│   ├── blog.$slug.tsx # Blog post
│   ├── gift-cards.tsx # Gift card page
│   ├── login.tsx      # Auth page
│   ├── account.tsx    # Customer account
│   ├── admin.tsx      # Admin layout + sidebar
│   ├── admin.index.tsx # Admin overview
│   ├── admin.products.tsx  # Products CMS
│   ├── admin.orders.tsx    # Orders board
│   ├── admin.shipping.tsx  # Shipping rules
│   ├── admin.coupons.tsx   # Coupons CMS
│   ├── admin.blog.tsx      # Blog CMS
│   ├── admin.testimonials.tsx # Reviews CMS
│   ├── admin.instagram.tsx # Instagram CMS
│   ├── admin.cart-events.tsx # Cart analytics
│   ├── admin.gift-cards.tsx # Gift cards CMS
│   └── admin.customers.tsx  # User management
└── styles.css         # Tailwind + design tokens

supabase/
├── schema.sql         # Full database schema
└── migrations/
    ├── 01_auth_and_roles.sql
    ├── 02_upi_payments.sql
    ├── 03_coupons_and_storage.sql
    ├── 04_shipping_and_fulfillment.sql
    ├── 05_content_tables.sql
    ├── 06_cart_events.sql
    ├── 07_gift_cards.sql
    └── 08_referrals.sql
```

---

## Supabase Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `categories` | Product categories | Public read, admin write |
| `products` | Product catalog | Public read published, admin full |
| `profiles` | User profiles + roles | Own read/update, admin full |
| `orders` | Customer orders | Owner read, anyone insert, admin full |
| `order_items` | Line items per order | Owner read, anyone insert, admin full |
| `coupons` | Discount codes | Public read active, admin full |
| `shipping_rules` | Pincode shipping rates | Public read, admin full |
| `posts` | Blog/journal articles | Public read published, admin full |
| `testimonials` | Customer reviews | Public read approved, admin full |
| `instagram_posts` | Instagram feed | Public read active, admin full |
| `cart_events` | Cart analytics | Anyone insert, admin read |
| `gift_cards` | Digital gift cards | Public read active, admin full |
| `referrals` | Referral codes | Anyone insert, public read pending, admin full |

---

## Key Features

### Storefront
- Live catalog from Supabase with React Query caching
- Dynamic pincode-based shipping rates (35+ rules across zones)
- 3-step checkout with Zod validation
- Direct UPI payments with QR code + deep link
- COD support (+₹49 handling)
- Coupon codes with percentage/fixed discounts
- Gift cards with balance checking
- Referral codes (₹50 off)
- WhatsApp order alerts (CallMeBot + wa.me)
- Blog/journal with category filter
- Testimonials carousel
- Instagram grid
- Wishlist with share links
- Product search, sort, category filter
- Free shipping badge (≥₹999)

### Admin
- Role-gated dashboard
- Products CMS with image upload
- Orders fulfillment board with Shiprocket integration
- Shipping rules management
- Coupons management
- Blog CMS
- Reviews management
- Instagram feed management
- Cart analytics with abandoned cart recovery
- Gift card management
- Customer management with role promotion

### Analytics
- GA4 + Meta Pixel event tracking
- Product views, add to cart, checkout, purchase events
- Search tracking
- Cart event logging
- Abandoned cart detection (30-min timeout)
- WhatsApp recovery messages
