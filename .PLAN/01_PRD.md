# Product Requirements Document (PRD)

## Ambika Traders — Premium Festive E-Commerce Platform

**Version:** 1.0
**Owner:** Shubham (Solo Founder-Engineer)
**Status:** Draft for client sign-off
**Methodology:** Context Engineering + Harness Engineering hybrid (see framework notes at end of doc)

---

## 1. Context Block (Why this exists)

### 1.1 Business Context

The client sells premium, handcrafted festive products — beginning with ** (American Diamond) Rakhis** for Raksha Bandhan, expanding into **Krishna Bhagwan vastra/clothing & idol attire**, **jewellery**, and **makeup/beauty**. The brand identity (from existing Instagram presence) leans into:

- Premium craftsmanship, peacock motifs, luxury packaging
- Emotional, devotional, festive tone ("Celebrate the bond that shines forever")
- A gifting-first purchase context — buyers are emotionally invested, time-pressured (festival deadlines), and willing to pay a premium for presentation and sentiment.

### 1.2 Market Context

- **Primary season:** Raksha Bandhan (peak), with secondary spikes around Janmashtami (Krishna clothing), Diwali, and wedding season (jewellery).
- **Buyer profile:** Mostly women 20–45, buying gifts for siblings/family, browsing on mobile via Instagram referral traffic, decision time is short, trust signals (reviews, packaging visuals, delivery guarantees) matter heavily.
- **Geography:** India-first. NRI gifting (buy in US/UK/Gulf, ship to India, or ship abroad) is a known secondary segment for Rakhi — flagged as Phase 2.

### 1.3 Competitive/Reference Context

Visual direction benchmarked against **shader.se, ning-h.com, mvdriest.nl** — all cinematic, scroll-driven, motion-rich portfolio/agency sites. The translation challenge for this PRD: **bring that cinematic craft to a converting e-commerce store**, not a portfolio. That means motion and 3D must never block or slow down the "Add to Cart → Checkout" path.

### 1.4 User Personas

| Persona                 | Goal                                                     | Pressure                             | Device                        |
| ----------------------- | -------------------------------------------------------- | ------------------------------------ | ----------------------------- |
| **The Devoted Sister**  | Find a rakhi that feels "special enough" for her brother | Festival deadline, emotional stakes  | Mobile, Instagram referral    |
| **The Devotee Shopper** | Dress her home Krishna idol beautifully for Janmashtami  | Seasonal urgency, repeat buyer       | Mobile                        |
| **The Gift Browser**    | Buying jewellery/makeup as a gift or for herself         | Price-sensitive, comparison shopping | Mobile + Desktop              |
| **NRI Buyer (Phase 2)** | Send a rakhi to India without logistics hassle           | Trust in delivery, currency clarity  | Desktop/Mobile, international |

---

## 2. Product Goals

### 2.1 Primary Goals (Phase 1 Launch)

1. Launch a fully functional, mobile-first e-commerce store covering **4 categories**: Rakhi, Krishna Clothing, Jewellery, Makeup.
2. Deliver a **cinematic, premium frontend** that visually differentiates from generic Shopify-template competitors, without sacrificing conversion speed.
3. Support **COD + online prepaid (UPI/cards via Razorpay)** — critical for Indian festive gifting market trust.
4. Be **ready to scale traffic 10–20x during the 2 weeks before Raksha Bandhan** without breaking.
5. Give the client (non-technical) a simple way to manage products, orders, and festive banners/collections without calling the developer every time.

### 2.2 Secondary Goals (Phase 2+)

- International shipping + multi-currency for NRI segment.
- Loyalty/referral system for repeat festive buyers.
- WhatsApp order notifications (very high-trust channel in this market).
- User-generated content / reviews-with-photos for social proof.

### 2.3 Non-Goals (explicitly out of scope for v1)

- Multi-vendor marketplace functionality.
- Subscription/recurring orders.
- In-house ERP/inventory-for-manufacturing (this is retail-front only; manual stock entry is fine for v1).
- Native mobile apps (responsive web is sufficient for v1).

---

## 3. Functional Requirements

### 3.1 Storefront (Customer-facing)

- **FR-1**: Cinematic homepage with hero storytelling section (scroll-driven, peacock/gold motif), featured collections, festive countdown banner (e.g., "X days to Raksha Bandhan").
- **FR-2**: Category landing pages (Rakhi / Krishna Clothing / Jewellery / Makeup) each with their own visual identity within one cohesive design system.
- **FR-3**: Product Listing Page (PLP) with filters (price, material, color, occasion, "set" vs "single") and sort (price, newest, popularity).
- **FR-4**: Product Detail Page (PDP) with multi-image gallery, zoom, video support, "what's included" (e.g., rakhi + roli-chawal + sweet box bundles are common), size/variant selection, stock status, and trust badges (handcrafted, secure packaging, easy returns).
- **FR-5**: Cart with bundle/combo logic (e.g., "Buy 2 Rakhis + get Roli-Chawal free" — common festive promo pattern).
- **FR-6**: Checkout — guest checkout allowed, address book, COD + Razorpay (UPI/Cards/Netbanking/Wallets), order summary with festive delivery-date estimate.
- **FR-7**: "Gift this" flow — add a personalized message card, choose gift-wrap, schedule delivery date (important for Rakhi where exact-day delivery matters).
- **FR-8**: Order tracking page + email/SMS/WhatsApp status updates.
- **FR-9**: Wishlist (especially relevant for jewellery/makeup browsing behavior).
- **FR-10**: Reviews & ratings with photo upload.
- **FR-11**: Search with autosuggest across all 4 categories.
- **FR-12**: Festive landing pages / campaign pages the client can spin up seasonally (Raksha Bandhan page now, Janmashtami page later) without a full redesign.

### 3.2 Admin / Client-facing (Back office)

- **FR-13**: Product CRUD (create/edit/archive products, variants, stock, pricing, images) — must be usable by a non-technical person.
- **FR-14**: Order management (view, update status, mark COD collected, refunds/cancellations).
- **FR-15**: Banner/collection/homepage content management (so client can change the festive hero, countdown date, featured collection without code).
- **FR-16**: Discount/coupon management (festive sales, bundle discounts).
- **FR-17**: Basic analytics dashboard (orders, revenue, top products, low stock alerts).

### 3.3 Cross-cutting

- **FR-18**: Multi-category navigation that doesn't feel "marketplace-y" — each category should feel like a curated sub-brand under one identity.
- **FR-19**: SEO-friendly URLs, metadata, and structured data (Product schema) per product/category — critical since festive search traffic ("buy rakhi online", "rakhi for brother") is a real acquisition channel.
- **FR-20**: Fast performance on mobile 4G — Indian festive traffic is overwhelmingly mobile, often on average network conditions.

---

## 4. Non-Functional Requirements (Harness Block — guardrails the build must respect)

| Category            | Requirement                                                                                                        | Validation Gate                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| **Performance**     | LCP < 2.5s on mobile 4G for PDP/PLP/Home                                                                           | Lighthouse mobile score ≥ 85 before launch                                       |
| **Scalability**     | Must handle festive traffic spikes (10–20x baseline for ~14 days/year)                                             | Load test at 5x expected peak before Raksha Bandhan                              |
| **Reliability**     | Checkout & payment flow uptime during festive window is non-negotiable                                             | Payment webhook retry + idempotency logic mandatory                              |
| **Security**        | PCI-DSS-aligned via Razorpay (no card data touches our servers), auth hashing, rate-limited admin login            | No raw card data ever stored                                                     |
| **Accessibility**   | WCAG AA minimum on color contrast and form labels (gifting audience includes older relatives buying for festivals) | Manual + automated a11y audit                                                    |
| **SEO**             | Server-rendered product pages, sitemap, structured data                                                            | Validate via Google Rich Results Test                                            |
| **Maintainability** | Solo dev must be able to extend categories without re-architecting                                                 | Generic `Category > Product > Variant` schema, not hardcoded per-category models |
| **Content ops**     | Client must self-serve banners, products, festive campaigns                                                        | Admin panel usability test with actual client before launch                      |

---

## 5. Success Metrics

- **Conversion rate** on mobile ≥ industry D2C benchmark (~1.5–2.5%) within first festive season.
- **Cart abandonment** reduced via guest checkout + COD availability (target < 70%, India D2C average is high).
- **Page speed**: PDP loads interactive in under 3s on 4G.
- **Zero checkout-blocking incidents** during the 14-day Raksha Bandhan peak window.
- **Client self-serve rate**: client able to update homepage banner/festive countdown without developer help, 100% of the time post-handoff.

---

## 6. Assumptions & Open Questions for Client

1. Confirm final brand name (using "Ambika Traders" as placeholder).
2. Confirm payment gateway preference (Razorpay assumed — most COD+UPI friendly for this market).
3. Confirm whether client will personally fulfill/ship orders or use a 3PL (affects order-status granularity needed).
4. Confirm if international/NRI shipping is a launch requirement or strictly Phase 2 (currently scoped as Phase 2).
5. Confirm approximate initial catalog size per category (affects whether PLP needs heavy filtering infra now or later).

---

## Appendix: Context + Harness Engineering Note

This document set follows a hybrid approach:

- **Context Engineering** sections (1, and embedded throughout) establish _why_ — business reality, user psychology, market timing — so that every downstream technical decision (TRD, Tech Stack, Design) is traceable back to a real constraint, not an arbitrary preference.
- **Harness Engineering** sections (4, and validation gates throughout the doc set) establish _guardrails_ — measurable gates a solo developer can self-check against before shipping, replacing the role a larger QA/PM team would normally play.
