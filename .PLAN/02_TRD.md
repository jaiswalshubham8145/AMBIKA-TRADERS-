# Technical Requirements Document (TRD)

## Ambika Traders — E-Commerce Platform

**Version:** 1.0
**Derived from:** PRD v1.0
**Builder:** Solo dev (Shubham)

---

## 1. Context Recap (Technical Framing)

This is a **boutique, high-AOV, festival-seasonal D2C store** — not a high-SKU marketplace. The technical architecture should optimize for:

- **SEO + fast first paint** (Next.js SSR/SSG) over heavy client-side SPA logic.
- **Solo maintainability** — fewer moving parts, managed services over self-hosted infra wherever reasonable.
- **Burst scalability** — traffic is spiky (festival-driven), not steady — favor serverless/auto-scaling over fixed servers.
- **Content agility** — client edits banners/products without deploys.

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│   Next.js App (SSR/SSG pages) + React Client Components  │
└───────────────────────┬───────────────────────────────────┘
                         │ HTTPS
┌───────────────────────▼───────────────────────────────────┐
│                Next.js App (Vercel/Node)                  │
│  - App Router (pages, layouts, server components)         │
│  - API Routes / Server Actions (cart, checkout, webhooks) │
│  - Image optimization (next/image + CDN)                  │
└───────┬───────────────────────┬───────────────┬───────────┘
        │                       │               │
        ▼                       ▼               ▼
┌───────────────┐     ┌──────────────────┐  ┌─────────────────┐
│  Firebase      │     │ Razorpay (Pay)   │  │ Cloud Storage    │
│  (Firestore)   │     │ Webhooks         │  │ (product images, │
│  Orders/Users/ │     │                  │  │ via Cloudinary   │
│  Products/etc. │     │                  │  │ or Firebase)     │
└───────────────┘     └──────────────────┘  └─────────────────┘
        │
        ▼
┌───────────────────────┐     ┌────────────────────────┐
│ Admin Dashboard         │    │ Notifications           │
│ (same Next.js app,      │    │ - Email: Resend/SES     │
│ role-gated routes)      │    │ - WhatsApp: Gupshup/    │
│                         │    │   Interakt API (Ph.2)   │
└───────────────────────┘     └────────────────────────┘
```

---

## 3. Core Technical Requirements

### 3.1 Rendering Strategy

- **TRD-1**: Homepage, category pages → **SSG with periodic revalidation** (`revalidate: 60–300s`) — fast, cacheable, but updates when client changes content.
- **TRD-2**: PDP (Product Detail Pages) → **SSG at build + on-demand revalidation** on product update (via webhook from admin save action) — guarantees SEO content is always server-rendered, never client-fetched-only.
- **TRD-3**: Cart/Checkout → Client components with server actions for mutations (cart state can be client-heavy; checkout submission must be server-validated).
- **TRD-4**: Admin panel → Client-rendered behind auth, no SEO concern, can prioritize DX/speed of build over render strategy purity.

### 3.2 Data Model Requirements (high-level — full schema in BACKEND_SCHEMA.md)

- **TRD-5**: Generic `Category → Product → Variant` model. No category-specific tables. A "Rakhi" and a "Lipstick" are both `Product` rows with category-appropriate `attributes` (JSON) for category-specific fields (e.g., rakhi: thread color, peacock motif size; makeup: shade, finish).
- **TRD-6**: Bundle/combo support — a `Bundle` entity that references multiple `Product`/`Variant` rows for festive combo offers.
- **TRD-7**: Order entity must capture gift-flow metadata (gift message, delivery date requested, gift wrap flag) since this is core to the Rakhi use case.

### 3.3 Payments

- **TRD-8**: Razorpay integration — Orders API + Webhooks (payment.captured, payment.failed, refund.processed). Webhook signature verification mandatory.
- **TRD-9**: COD orders skip payment capture but still go through the same `Order` state machine (Pending → Confirmed → Packed → Shipped → Delivered / Cancelled / Returned).
- **TRD-10**: Idempotency keys on order creation to prevent duplicate orders from double-clicks/retries during high-traffic festive windows.

### 3.4 Search & Filtering

- **TRD-11**: V1 — Firestore queries for basic exact-match filtering. Since Firestore does not support native full-text search, we will implement client-side filtering for small collections or basic keyword arrays in documents. Avoid Algolia/Typesense complexity until catalog size actually demands it.
- **TRD-12**: Filters (price/material/color/occasion) implemented via composite indexes in Firestore for v1.

### 3.5 Media

- **TRD-13**: All product images served via CDN-backed image service (Cloudinary recommended) with automatic responsive resizing/format (WebP/AVIF) — critical given mobile 4G performance NFR from PRD.
- **TRD-14**: Hero/cinematic scroll assets (video, particle backgrounds) must be lazy-loaded below the fold and degrade gracefully (static fallback) on low-end devices/slow connections — motion must never block FR-6 (checkout).

### 3.6 Admin/CMS

- **TRD-15**: Lightweight in-house admin (built into the same Next.js app, role-gated) rather than a separate headless CMS — keeps solo-dev surface area smaller. Revisit only if content-editing complexity grows materially.
- **TRD-16**: Admin actions that affect SEO-critical pages (product price/stock/images) must trigger on-demand ISR revalidation so storefront reflects changes within seconds, not next deploy.

### 3.7 Notifications

- **TRD-17**: Transactional email (order confirmation, shipping update) via Resend or AWS SES — v1 requirement.
- **TRD-18**: WhatsApp order updates — Phase 2, via Interakt/Gupshup (high trust signal in this market but adds integration complexity not required for launch).

### 3.8 Hosting/Infra

- **TRD-19**: Vercel for Next.js hosting — auto-scaling handles festive traffic spikes without manual ops.
- **TRD-20**: Firebase (Firestore/Auth) — serverless NoSQL datastore that auto-scales seamlessly with Vercel's serverless functions without the connection-pooling headaches of relational databases.

---

## 4. Validation Gates (Harness Block)

| Gate                | Requirement                                                                           |
| ------------------- | ------------------------------------------------------------------------------------- |
| Load testing        | Simulate 5x projected peak concurrent users 2 weeks before Raksha Bandhan launch      |
| Payment reliability | Test Razorpay webhook retry/idempotency under simulated duplicate-webhook conditions  |
| SEO validation      | All PDP/PLP pages pass Google Rich Results Test for Product schema                    |
| Performance budget  | Lighthouse mobile ≥ 85 on Home, PLP, PDP before each major release                    |
| Rollback plan       | Vercel preview deployments + instant rollback capability confirmed before peak season |
| Data integrity      | Order state machine transitions tested for all paths (incl. COD cancellation, refund) |

---

## 5. Out-of-Scope (Explicit Technical Non-Goals v1)

- Microservices split — single Next.js monolith is correct at this scale.
- Custom search engine — Basic Firestore queries are sufficient initially (see TRD-11).
- Native apps / PWA push notifications — Phase 2+ at earliest.
- Multi-warehouse inventory logic — single stock pool per variant is sufficient for v1.
