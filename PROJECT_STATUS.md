# Adore & Aura — Project Status

_Last updated: 4 September 2026_

A living document of what is complete on the storefront and what still needs to be built to make this a real, transactional e-commerce site.

---

## Scope agreed with client

- Full storefront (frontend only, no backend for now)
- Payments simulated for now — Stripe / Razorpay to be wired later
- Palette: **Ivory Luxe** (Ivory, Parchment, Peacock Teal, Magenta-Rose, Antique Gold)
- Stack shipped: **TanStack Start + React 19 + Tailwind v4 + Zustand + Zod + Supabase**

---

## ✅ WORK DONE

### 1. Design system & branding

- [x] Ivory Luxe color tokens defined in `src/styles.css` (peacock, rose, gold, ivory, parchment, ink)
- [x] Luxury typography — Fraunces (display) + Inter (body) via `@fontsource`
- [x] Custom utilities: `.eyebrow`, `.hairline`, `.grain` texture
- [x] Cinematic hover interactions and marquee animation

### 2. Routes & pages

- [x] `/` — Cinematic homepage (hero, marquee, category grid, featured edit, brand story, testimonials, Instagram grid, journal preview)
- [x] `/shop` — Shop all with **search, sort, category filter**
- [x] `/shop/rakhi` `/shop/krishna-vastra` `/shop/jewellery` `/shop/makeup` — Category pages
- [x] `/product/:slug` — Product detail page with gift-message flow, customer reviews, analytics tracking
- [x] `/cart` — Cart management page with pincode delivery checker
- [x] `/wishlist` — Wishlist with persistent state, share link
- [x] `/checkout` — 3-step checkout (contact → shipping → payment) with dynamic pincode-based shipping, coupon codes, referral codes, gift card integration
- [x] `/track` — Public order tracking page
- [x] `/blog` — Blog listing with category filter and search
- [x] `/blog/:slug` — Blog post page with markdown rendering
- [x] `/gift-cards` — Gift card purchase page with denomination picker, balance checker
- [x] `/about` — Brand atelier story
- [x] `/contact` — Contact form with Zod validation and success state
- [x] `/shipping-returns` — Shipping timelines, packaging, returns policy
- [x] `/privacy` — Privacy policy
- [x] `/terms` — Terms of service
- [x] `/faq` — Accordion-style FAQ
- [x] `/sitemap.xml` — Dynamic SEO sitemap
- [x] Custom 404 page (from root route)

### 3. Product catalogue

- [x] 14 hand-crafted mock products across 4 categories
- [x] Rich product schema: price, compare-at, motif, description, included items, rating, reviews, stock, tags
- [x] 14 unique AI-generated product images

### 4. Cart & wishlist

- [x] Zustand cart store with `zustand/middleware` persistence
- [x] Cart drawer with add/remove/quantity, gift message support
- [x] Cart page + cart count badge in header
- [x] Wishlist store with persistence
- [x] Heart button on every product card; wishlist counter in header
- [x] Cart analytics events tracked on add/remove

### 5. Search & filtering

- [x] Global search bar in header (opens overlay input)
- [x] Type-safe URL search params on `/shop` (`?q=...&sort=...`) via `@tanstack/zod-adapter`
- [x] Sort by: Featured / Price ↑ / Price ↓ / Top rated
- [x] Empty-state UI for no matches
- [x] Low-stock badge on product cards (< 10 units)

### 6. Form validation

- [x] Checkout — email, phone, name, address, city, state, 6-digit pincode
- [x] Contact form — name, email, subject, message with inline errors
- [x] Newsletter — HTML-native email validation + thank-you toast

### 7. SEO & metadata

- [x] Unique `head()` metadata per route (title, description, og:title, og:description)
- [x] Category pages carry `og:image`
- [x] Semantic HTML, single H1 per page, alt text on all images
- [x] Dynamic XML sitemap
- [x] Twitter card, og:type set on root

### 8. Mobile & responsive

- [x] Mobile hamburger nav with search + wishlist links
- [x] Responsive grids (2-col on mobile, 3-4 on desktop)
- [x] Sticky, blur-backdrop header on scroll
- [x] Touch-friendly buttons & spacing

### 9. Legal & trust

- [x] Privacy, Terms, Shipping & Returns, FAQ pages linked from footer
- [x] Footer newsletter capture (front-end only)
- [x] Instagram social link

### 10. Supabase Backend Foundation

- [x] Dedicated project `.env` configured and Git-secured (`.gitignore`)
- [x] Supabase CLI installed, authenticated (`login`), and linked to remote project (`cwdzitffakylwwhcdvdb`)
- [x] Client initialization helper created at `src/lib/supabase.ts`
- [x] Complete SQL schema authored in `supabase/schema.sql` & `supabase/migrations/01_auth_and_roles.sql`
- [x] Completely decoupled from Lovable (removed telemetry error tracking, proprietary wrapper plugins, and platform metadata)

### 11. Authentication & Customer Portal

- [x] Supabase Auth provider and custom hook (`src/hooks/use-auth.tsx`)
- [x] Unified `/login` route with Sign In, Sign Up, and Password Reset flows
- [x] Customer account portal (`/account`) showing real past orders, profile, and role
- [x] Header integration: Account icon, admin badge indicator, and mobile nav links
- [x] Checkout integration: Auto-prefill for logged-in users and real-time order persistence to Supabase

### 12. Admin Dashboard & CMS (`/admin`)

- [x] Role-gated `/admin` layout with custom collapsible dark sidebar and top navigation
- [x] Access control guard: redirects guests to `/login?redirect=/admin` and blocks non-admin users
- [x] `/admin` Executive Overview: Real-time revenue, orders count, catalog status, low-stock warnings, and recent orders
- [x] `/admin/products` Catalog CMS: Search, category filters, Add Product modal, Edit Product modal, and Delete confirmation
- [x] `/admin/orders` Order Fulfillment Board: Status tabs, customer delivery & gift message drawer, and one-click status update controls
- [x] `/admin/customers` User Management: Customer directory with role promotion/demotion
- [x] `/admin/shipping` Shipping Rules CMS: Pincode prefix, zone, fee, free shipping min, COD, estimated days, serviceable toggle
- [x] `/admin/blog` Blog CMS: Create/edit/delete posts with category, tags, cover image, markdown content, publish toggle
- [x] `/admin/testimonials` Reviews CMS: Approve/feature toggles, customer reviews with ratings
- [x] `/admin/instagram` Instagram Feed CMS: Grid management with image URLs, post links, captions, active toggle
- [x] `/admin/cart-events` Cart Analytics: Abandoned cart dashboard with recovery WhatsApp links, recent events log
- [x] `/admin/gift-cards` Gift Cards CMS: Create gift cards, view balances, enable/disable

### 13. Direct Admin UPI Payments & WhatsApp Verification (Zero Fees)

- [x] NPCI-standard dynamic UPI QR generator & deep-link builder (`src/lib/payment-config.ts`)
- [x] Checkout Direct UPI Panel with instant QR code, Beneficiary VPA, 1-click Copy ID, and Mobile UPI app launcher
- [x] 12-digit UTR / Reference ID customer submission & input validation
- [x] 100% Free WhatsApp Alert System: Pre-formatted order summary & UTR dispatch via official `wa.me` + CallMeBot free background API (`src/lib/whatsapp.ts`)
- [x] Admin Dashboard Approval Board: Dedicated "NEEDS APPROVAL" tab, UTR inspector with 1-click copy, and one-click "Approve Payment & Confirm Order" / "Reject (Invalid UTR)" actions
- [x] Customer order status synchronization in `/account` with "Verifying Payment" and submitted UTR badge
- [x] Database migration authored at `supabase/migrations/02_upi_payments.sql` and merged into `supabase/schema.sql`

### 14. Live Catalog Engine (Backend Integration — Phase 2)

- [x] Data normalization layer (`src/lib/products.ts`): maps Supabase snake_case rows → camelCase app interfaces
- [x] Async Supabase fetchers with automatic static fallback: `fetchCategories()`, `fetchProducts(options)`, `fetchProductBySlug(slug)`
- [x] TanStack React Query hooks (`src/hooks/use-products.ts`): `useLiveCategories()`, `useLiveProducts(options)`, `useLiveProduct(slug)`
- [x] 5-minute stale time, 30-minute GC time, `placeholderData` for instant render
- [x] `useInvalidateProductCatalog()` cache invalidation helper for admin mutations
- [x] Homepage wired to live featured products and categories
- [x] Shop page wired to live products with search, sort, category filter
- [x] Category pages wired to live products by category slug
- [x] Product detail page wired to live product data + related products

### 15. Supabase Storage Image Upload Pipeline (Phase 3)

- [x] Image upload service (`src/lib/storage.ts`): file validation (JPEG/PNG/WEBP/AVIF, ≤5MB), unique timestamped filenames, upload to `product-images` bucket
- [x] `deleteProductImage(path)` for cleanup
- [x] `ImageUpload` component with drag-and-drop zone, live progress bar, image preview thumbnail
- [x] Admin Products CMS: drag-and-drop upload integrated in both Add Product and Edit Product modals
- [x] Fallback manual URL input alongside upload zone

### 16. Coupon & Promo-Code System (Phase 4)

- [x] Coupon validation service (`src/lib/coupons.ts`): validates code, active status, expiry, usage limit, min order threshold
- [x] Calculates percentage (with optional cap) or fixed-amount discounts
- [x] Checkout coupon input with Apply/Remove, green discount badge, real-time total recalculation
- [x] `applied_coupon_code` and `discount_total` stored in Supabase `orders` on placement
- [x] Admin Coupons CMS (`/admin/coupons`): table with code, discount, min order, usage, expiry, active status
- [x] Add Coupon modal: code, type, value, min order, max cap, expiry, usage limit
- [x] One-click active/inactive toggle, edit modal, delete with confirmation
- [x] Admin sidebar navigation updated with Coupons link
- [x] Database migration for `coupons` table + RLS policies + 3 seed coupons (AURA10, FESTIVE500, WELCOME100)
- [x] Storage bucket policies for `product-images` (public read, admin write)

### 17. Shipping & Logistics (Phases 1–2 of Implementation Plan)

- [x] `shipping_rules` table: 35+ rules across metro/tier1/tier2/remote zones
- [x] `src/lib/shipping.ts` rate calculator with 5-min cache
- [x] Auto-checking pincode UI in checkout (debounced, 6-digit)
- [x] Pincode check in cart summary
- [x] "Free Shipping" badge on product cards (≥₹999)
- [x] `04_shipping_and_fulfillment.sql` migration (shipping_rules + order fulfillment columns)
- [x] `src/lib/shiprocket.ts` full API client (auth, create order, label, track, cancel)
- [x] Admin "Ship Order" + "Download Label" + "Track Shipment" buttons in `/admin/orders`
- [x] `/admin/shipping` rules CMS
- [x] `/track` public tracking page with AWB + phone lookup
- [x] Tracking buttons on customer account orders

### 18. Content — Blog, Testimonials, Instagram (Phases 3–4 of Implementation Plan)

- [x] `05_content_tables.sql` migration (posts, testimonials, instagram_posts tables + seed data)
- [x] `src/lib/blog.ts` — blog post fetchers (list, by slug, by category)
- [x] `/admin/blog` — blog CMS with create/edit/delete, category, tags, publish toggle
- [x] `/blog` — blog listing page with category filter + search
- [x] `/blog/:slug` — blog post page with markdown rendering, author, date
- [x] "From the Journal" section on homepage (3 latest posts)
- [x] "Journal" link in footer
- [x] `src/lib/testimonials.ts` — testimonials fetcher
- [x] `/admin/testimonials` — reviews CMS with approve/feature toggles
- [x] Testimonials carousel on homepage (5 seed reviews)
- [x] Customer reviews section on product detail pages
- [x] `src/lib/instagram.ts` — instagram posts fetcher
- [x] `/admin/instagram` — grid CMS with image URL, post link, caption, active toggle
- [x] Instagram grid with hover overlay on homepage (6 seed posts)

### 19. Analytics (Phase 5 of Implementation Plan)

- [x] `src/lib/analytics.ts` — GA4 + Meta Pixel event tracking service
- [x] GA4 script injection via `VITE_GA4_ID` env var
- [x] Meta Pixel script injection via `VITE_META_PIXEL_ID` env var
- [x] Route-change page view tracking in `__root.tsx`
- [x] Product page: `view_item`, `add_to_cart` events
- [x] Shop page: `view_item_list`, `search` events
- [x] Cart page: `add_to_cart`, `remove_from_cart` events (quantity changes tracked)
- [x] Checkout: `begin_checkout` (on step 3), `purchase` (on order placed)
- [x] Wishlist: `share` event (copy share link)
- [x] Product cards: `select_item` on click (via `trackSelectItem`)

### 20. Abandoned Cart Recovery (Phase 6 of Implementation Plan)

- [x] `06_cart_events.sql` — `cart_events` table with session tracking + indexes
- [x] `src/lib/cart-events.ts` — Event tracker with session-stable IDs (localStorage), `markAbandonedCarts()` for 30-min timeout
- [x] `src/lib/cart-recovery.ts` — WhatsApp recovery message generator + wa.me URL builder
- [x] `src/routes/admin.cart-events.tsx` — Admin analytics dashboard (abandoned carts table, recovery WhatsApp links, recent events log, stats)
- [x] Cart store (`src/lib/cart.ts`) wired to fire add/remove events on every mutation
- [x] Checkout fires `checkout_start` and `checkout_complete` events
- [x] Admin sidebar updated with Cart Analytics link

### 21. Gift Cards (Phase 7 of Implementation Plan)

- [x] `07_gift_cards.sql` — `gift_cards` table with 3 seed test cards
- [x] `src/lib/gift-cards.ts` — Full CRUD: create, validate, redeem, fetch, disable/enable
- [x] `src/routes/gift-cards.tsx` — Public gift card page: denomination picker, recipient/sender fields, personal message, balance checker, FAQ accordion
- [x] `src/routes/admin.gift-cards.tsx` — Admin CMS: create form, stats (total/active/outstanding), table with enable/disable
- [x] Footer updated with Gift Cards link

### 22. Referrals & Wishlist Share (Phase 8 of Implementation Plan)

- [x] `08_referrals.sql` — `referrals` table with 2 seed codes
- [x] `src/lib/referrals.ts` — Code generation (adjective-NNNN format), validation (₹50 discount), redemption, admin fetch
- [x] Checkout: referral code input with apply/remove, -₹50 discount applied to total, redeemed on order placement
- [x] Account page: "Refer & Earn" card with copy-to-clipboard
- [x] Wishlist: "Copy share link" button with shareable URL (`?shared=slug1,slug2,...`)
- [x] `trackShare` and `trackReferral` analytics events wired

---

## ⏳ REMAINING WORK

### Post-purchase

- [ ] Transactional emails (order confirmation, shipped, delivered) — Resend / Loops
- [ ] SMS / WhatsApp order updates (automated, not just admin alerts)
- [ ] Invoice PDF generation and download
- [ ] Post-delivery review request email
- [ ] Inventory adjustments on order placement
- [ ] Sales analytics dashboard (revenue, top products, customers) — partially covered by admin overview
- [ ] Bulk gifting enquiries inbox

### Shipping & logistics

- [ ] International shipping calculator

### Content

- [ ] Replace AI product images with real photography
- [ ] Expand catalog to 40–60 SKUs
- [ ] Press mentions strip

### Marketing

- [ ] Newsletter integration (Mailchimp / Klaviyo)

### Legal / compliance

- [ ] GST invoice with company details
- [ ] Have legal team review Privacy & Terms
- [ ] Cookie consent banner (India DPDP + EU GDPR)
- [ ] Accessibility audit (WCAG AA)

### Ops & DevEx

- [ ] Sentry / error monitoring on production
- [ ] Cypress / Playwright end-to-end tests for checkout
- [ ] Custom domain + email setup (adoreandaura.com)
- [ ] Sitemap submission to Google Search Console
- [ ] Uptime monitoring

---

## Database Migrations

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

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_ADMIN_UPI_ID` | Admin UPI VPA for payments |
| `VITE_ADMIN_UPI_NAME` | Admin display name for UPI |
| `VITE_ADMIN_WHATSAPP_PHONE` | Admin WhatsApp number for alerts |
| `VITE_CALLMEBOT_API_KEY` | CallMeBot free WhatsApp API key |
| `VITE_SHIPROCKET_API_URL` | Shiprocket API base URL |
| `VITE_SHIPROCKET_EMAIL` | Shiprocket login email |
| `VITE_SHIPROCKET_PASSWORD` | Shiprocket login password |
| `VITE_GA4_ID` | Google Analytics 4 measurement ID |
| `VITE_META_PIXEL_ID` | Meta Pixel ID |

---

## Suggested next milestone

**Deploy & go live** — The storefront is now fully dynamic with live Supabase data, image uploads, coupon system, shipping logistics, content management, analytics, gift cards, and referral system. Run all 8 migrations in Supabase SQL Editor, create the `product-images` storage bucket, and set up the env variables above.

Next steps: 1) Seed real products via Admin CMS → 2) Wire Razorpay for automated payments → 3) Set up transactional emails → 4) Custom domain + launch.

_You have a fully functional, database-driven e-commerce platform with marketing tools. Everything above is optional depth._
