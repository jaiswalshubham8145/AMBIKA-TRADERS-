# Frontend Stack Document

## Ambika Traders — E-Commerce Platform

**Version:** 1.0
**Goal:** Cinematic, premium frontend (reference-level craft: shader.se / ning-h.com / mvdriest.nl) that still converts like an e-commerce site, not a portfolio.

---

## 1. Core Frontend Principles (Context → Constraint)

| Reference-site quality                                | E-commerce constraint it must respect                                                                                        |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Full-bleed cinematic hero, scroll-driven storytelling | Must resolve within 1 viewport-scroll into a clear "Shop Now" CTA — never make the user hunt for the store                   |
| Custom cursor, particle/WebGL flourishes              | Only on Home + Category landing hero zones. **Never** on PLP/PDP/Cart/Checkout — those need speed and clarity, not spectacle |
| Heavy use of motion/transition on scroll              | All motion respects `prefers-reduced-motion`; below-the-fold 3D lazy-loads and has a static image fallback                   |
| Minimal, typographic-led design                       | Product photography must still be the hero on PLP/PDP — typography frames products, doesn't compete with them                |

**Rule of thumb for this build:** _Cinematic at the doors (Home, Category entry, festive campaign pages). Fast and clear in the aisles (PLP, PDP, Cart, Checkout)._

---

## 2. Framework & Libraries

| Concern              | Choice                                                                                                                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework            | Next.js 15, App Router, React Server Components by default; Client Components only where interactivity demands it (cart, filters, gallery, forms)                                                                      |
| Styling              | Tailwind CSS v4 with a custom design-token theme (see DESIGN.md) — no off-the-shelf component kit skin showing through                                                                                                 |
| Component primitives | shadcn/ui as an unstyled base (accessibility/behavior solved), fully restyled to match brand — avoids reinventing dropdowns/dialogs/forms from scratch                                                                 |
| Scroll storytelling  | GSAP + ScrollTrigger for hero sequences (pinning, staged reveals, parallax layers)                                                                                                                                     |
| Micro-interactions   | Framer Motion for hover states, add-to-cart feedback, page transitions, cart drawer slide-in                                                                                                                           |
| 3D/WebGL             | React Three Fiber + drei, used only for: (a) homepage hero peacock/particle moment, (b) optional festive campaign pages. Always behind a lazy `dynamic` import with `ssr: false` and an `IntersectionObserver` trigger |
| Forms                | React Hook Form + Zod validation (checkout, gift message, admin product forms)                                                                                                                                         |
| State                | Zustand for cart/wishlist client state (lightweight, no Redux boilerplate needed at this scale); Server state via React Query / Next.js server actions for orders/products                                             |
| Icons                | Lucide React                                                                                                                                                                                                           |
| Image handling       | `next/image` wired to Cloudinary loader for automatic responsive/format optimization                                                                                                                                   |

---

## 3. Page-by-Page Frontend Notes

### Homepage

- Hero: full-viewport scroll-pinned sequence — peacock feather/gold particle motif unfurling, festive countdown timer overlay, single clear CTA after the first scroll beat.
- Category entry cards: cinematic hover (image parallax/tilt on desktop, tap-scale on mobile), each leading into its category's own micro-story.
- Performance budget: hero assets must not push LCP past 2.5s — use a poster-frame image, defer video/3D until interaction-ready.

### Category Landing

- Short, category-specific scroll story (e.g., Rakhi page opens on a "sibling bond" emotional beat before showing the grid) — but resolves into the product grid within 1–2 scrolls max.

### PLP (Product Listing)

- Sticky filter bar (mobile: bottom-sheet filter drawer, not full-page nav-away).
- Grid with subtle stagger-fade on load (Framer Motion), but no scroll-jacking — this page is for browsing/comparing, motion should never slow scanning.

### PDP (Product Detail)

- Image gallery: swipeable on mobile, thumbnail rail on desktop, pinch-zoom support.
- Sticky "Add to Cart" bar on mobile (appears after user scrolls past primary CTA, so it's always reachable).
- Trust badges and reviews below the fold, but image-forward, not wall-of-text.

### Cart & Checkout

- **Deliberately the least "cinematic" pages in the app.** Clean, fast, linear, minimal motion (just state-change feedback, not decorative animation). This is a conscious design decision, not an oversight — checkout abandonment is the #1 risk this entire frontend strategy must protect against.

### Admin Panel

- Plain, dense, functional UI (can reuse shadcn defaults more directly) — no need for brand cinematics here; this is a tool, not a showcase.

---

## 4. Performance Guardrails (Harness Block)

1. **No Three.js/WebGL on PLP, PDP, Cart, or Checkout** — hard rule, not a guideline.
2. Hero video/3D assets lazy-load with `next/dynamic` + viewport intersection trigger.
3. All custom fonts subset + preloaded (`next/font`) to avoid FOUT/FOIT on a brand where typography carries a lot of the "luxury" feel.
4. Animation libraries (GSAP, R3F) imported only on the routes that use them — no global bundle bloat into PDP/Checkout.
5. Every cinematic decision is evaluated against: _"Does this slow down Add to Cart → Checkout?"_ If yes, it's cut or deferred, no exceptions, regardless of how good it looks in isolation.
6. `prefers-reduced-motion` respected globally — scroll-pin sequences degrade to simple fades.

---

## 5. Accessibility Notes

- Color contrast checked against the chosen palette (see DESIGN.md) — luxury dark themes often fail AA contrast on body text; this will be explicitly tested, not assumed.
- All interactive elements keyboard-navigable (shadcn primitives provide this baseline; custom cinematic components must preserve it, not break it for the sake of style).
- Form errors (checkout, gift message) announced via ARIA live regions, not color-only indication.
