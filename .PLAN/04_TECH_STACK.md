# Tech Stack Document

## Ambika Traders — E-Commerce Platform

**Version:** 1.0
**Principle guiding every choice below:** solo-dev maintainability + managed services over self-ops + burst-traffic resilience (see TRD context).

---

## 1. Stack at a Glance

| Layer                | Choice                                       | Why                                                                                                                                     |
| -------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Framework            | **Next.js 15 (App Router)**                  | SSR/SSG for SEO, server actions reduce API boilerplate, single deployable for storefront + admin                                        |
| Language             | **TypeScript**                               | Catches schema/contract mismatches solo — no second dev to catch your own bugs in review                                                |
| Styling              | **Tailwind CSS v4**                          | Fast iteration, pairs well with custom design tokens for the festive/luxury theme                                                       |
| Animation            | **Framer Motion** + **GSAP (ScrollTrigger)** | Framer for component-level micro-interactions; GSAP for the cinematic scroll storytelling (hero sections) seen in reference sites       |
| 3D/WebGL (selective) | **Three.js via React Three Fiber**           | Used sparingly — hero peacock/particle moments, not throughout the store (perf budget guardrail)                                        |
| Database & Backend   | **Firebase (Firestore + Auth + Storage)**    | Requested by client. NoSQL document store, built-in auth, scalable serverless backend.                                                  |
| SDK                  | **Firebase Admin & Client SDKs**             | Used in Server Actions and client components to interact with Firebase services.                                                        |
| Auth                 | **Firebase Auth**                            | Email/Password or OTP login pattern common/trusted in Indian e-comm; avoid building auth from scratch                                   |
| Payments             | **Razorpay**                                 | UPI + Cards + Netbanking + COD support, India-market standard, webhook-based order confirmation                                         |
| Media/CDN            | **Cloudinary**                               | Auto image optimization (WebP/AVIF, responsive), critical for mobile 4G performance NFR                                                 |
| Email                | **Resend**                                   | Simple DX for transactional order emails                                                                                                |
| WhatsApp (Phase 2)   | **Interakt** or **Gupshup**                  | High-trust order updates channel for this market                                                                                        |
| Hosting              | **Vercel**                                   | Auto-scaling for festive traffic spikes, zero infra ops, instant rollback                                                               |
| Analytics            | **Vercel Analytics** + **Plausible/GA4**     | Lightweight, privacy-respecting, sufficient for boutique-scale traffic                                                                  |
| Error monitoring     | **Sentry**                                   | Solo dev needs automated error visibility, not manual log-checking during peak season                                                   |
| Search               | **Firestore Queries / Algolia**              | Initially rely on basic Firestore querying; if full-text search is strictly needed, integrate Algolia since Firestore lacks native FTS. |

---

## 2. Why NOT certain "obvious" choices

| Considered                    | Rejected because                                                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| WordPress/WooCommerce         | Cinematic, motion-rich frontend (PRD goal) fights against WP's template model; theming friction not worth it                                                 |
| Shopify (hosted)              | Less control over the bespoke scroll/3D storytelling experience; also recurring cost overhead vs. owned stack for a solo dev who codes                       |
| PostgreSQL / Relational DBs   | Client specifically requested Firebase. We will manage relational constraints (orders ↔ products) via NoSQL denormalization and subcollections in Firestore. |
| Elasticsearch/Algolia         | Overkill for a boutique catalog (hundreds, not 100k+ SKUs) — adds infra solo dev must maintain for no real benefit yet                                       |
| Microservices                 | One person, one codebase, one deploy — a Next.js monolith is the correct scale-matched choice                                                                |
| Self-hosted servers (EC2/VPS) | Manual scaling during a 2-week, 10–20x traffic spike is exactly the failure mode managed/serverless hosting (Vercel) exists to prevent                       |

---

## 3. Environment & Tooling

- **Package manager**: pnpm (faster installs, disk-efficient — matters less here than consistency, but it's the modern default)
- **Linting/formatting**: ESLint + Prettier, pre-commit hook via Husky
- **CI/CD**: Vercel's native Git integration (push to deploy + preview URLs per PR/branch) — no separate CI pipeline needed at this scale
- **Environment management**: Vercel environment variables (separate Dev/Preview/Production secrets for Razorpay keys, DB URLs)
- **Testing**: Vitest (unit) + Playwright (critical-path e2e: cart → checkout → payment, since this is the one flow that cannot break during festive season)

---

## 4. Scaling Path (so this stack doesn't need a rewrite later)

1. **Catalog grows beyond ~5,000 SKUs or search becomes a UX bottleneck** → introduce Algolia/Meilisearch, keep everything else unchanged.
2. **Read/Write limits hit on Firestore** → Optimize data model with data bundling or implement a caching layer (e.g. Redis) for high-traffic read paths (like Homepage collections).
3. **NRI/international expansion (Phase 2)** → add multi-currency + Stripe (for international cards) alongside Razorpay, gated by user geolocation.
4. **WhatsApp/marketing automation matures** → introduce a proper CRM/automation layer (e.g., Interakt's broader suite) without touching the storefront core.
