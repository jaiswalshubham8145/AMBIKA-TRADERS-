# Design.md

## Ambika Traders — Visual & Interaction Design System

**Version:** 1.0
**Reference inspiration:** shader.se, ning-h.com, mvdriest.nl (cinematic, scroll-led, restrained-but-rich motion)
**Brand inspiration:** Premium Rakhi craftsmanship, peacock motifs, devotional warmth, festive luxury

---

## 1. Design Philosophy

> "Cinematic at the doors, fast and clear in the aisles."

The reference sites are agency portfolios — their job is to impress for 90 seconds. This site's job is to **build emotional trust fast, then get out of the way of the purchase**. So the design system borrows their _craft_ (typography confidence, motion quality, restraint, generous negative space) but not their _pace_ (a portfolio can ask for patience; a gifting purchase under festival deadline cannot).

Two design modes coexist:

1. **Story Mode** — Homepage hero, category landing heroes, festive campaign pages. Cinematic, scroll-driven, a little slow and luxurious on purpose.
2. **Shop Mode** — PLP, PDP, Cart, Checkout, Account. Clean, fast, high-clarity, motion used only for feedback (not spectacle).

Same design tokens (color, type, spacing) run through both modes — the _feeling_ is continuous, the _pace_ changes.

---

## 2. Color Palette Options

All four options are built around the brand's existing visual signature (/peacock/gold festive luxury) but differ in mood. Each gives a dark "void" base (matching your known aesthetic preference from Likhasha) with a festive accent system layered on top.

### Option A — "Peacock Royale" (closest to literal brand cues: + peacock + gold)

| Role             | Color             | Hex       |
| ---------------- | ----------------- | --------- |
| Base (void)      | Deep ink black    | `#0B0D10` |
| Surface          | Charcoal-plum     | `#161318` |
| Primary accent   | Peacock teal      | `#0E6E6B` |
| Secondary accent | Royal gold        | `#D4AF37` |
| Tertiary accent  | Deep magenta-rose | `#9C2452` |
| Text primary     | Warm ivory        | `#F5EFE3` |
| Text muted       | Soft taupe-grey   | `#A89F95` |

**Mood:** Regal, devotional, directly evokes peacock-feather work. Best if the brand wants to lean hard into the literal Krishna/peacock imagery.

---

### Option B — "Festive Ember" (warmer, more universally festive — Rakhi + Diwali-adjacent warmth)

| Role             | Color                    | Hex       |
| ---------------- | ------------------------ | --------- |
| Base (void)      | Near-black warm espresso | `#100B08` |
| Surface          | Deep maroon-brown        | `#26120F` |
| Primary accent   | Saffron-gold             | `#E8A33D` |
| Secondary accent | Deep vermillion          | `#B23A2E` |
| Tertiary accent  | Antique gold             | `#C9A24B` |
| Text primary     | Warm cream               | `#F7EEDD` |
| Text muted       | Dusty rose-grey          | `#B59C92` |

**Mood:** Warm, sweet-box-and-sindoor festive energy. Feels the most "Raksha Bandhan morning" of the four — slightly less peacock-specific, more broadly festive (helps if Krishna Clothing/Jewellery/Makeup need to feel equally at home).

---

### Option C — "Midnight Aura" (most aligned to Likhasha's gold-and-void cinematic system — strong brand consistency across your projects)

| Role             | Color             | Hex       |
| ---------------- | ----------------- | --------- |
| Base (void)      | True void black   | `#0A0A0C` |
| Surface          | Deep indigo-black | `#13121A` |
| Primary accent   | Champagne gold    | `#C9A356` |
| Secondary accent | Peacock-violet    | `#5B4B8A` |
| Tertiary accent  | Rose-blush        | `#C97B84` |
| Text primary     | Soft ivory        | `#EDE7DC` |
| Text muted       | Cool grey-mauve   | `#9A93A0` |

**Mood:** The most "cinematic agency site" of the four — closest to shader.se/ning-h.com's restraint, with gold as the singular hero accent and a cooler violet undertone instead of literal peacock-teal. Best if you want this site to visually rhyme with Likhasha's identity.

---

### Option D — "Bridal Luxe" (closest to premium jewellery-ad / wedding-market visual language)

| Role             | Color           | Hex                    |
| ---------------- | --------------- | ---------------------- |
| Base (void)      | Soft black-plum | `#0E0A0C`              |
| Surface          | Wine-plum       | `#2A1620`              |
| Primary accent   | Rose gold       | `#D9A7B9` _(see note)_ |
| Secondary accent | Deep emerald    | `#1F5C4D`              |
| Tertiary accent  | Champagne       | `#E8D8B8`              |
| Text primary     | Blush-ivory     | `#F6ECE6`              |
| Text muted       | Mauve-grey      | `#A893A0`              |

> Note: fix typo above — Primary accent **Rose gold = `#D9A7B9`** blended toward metallic via gradient overlay in actual implementation (flat hex alone reads pink; pair with a gold-rose gradient in CSS, see §4).

**Mood:** Most "premium jewellery brand" — softer, more feminine-luxury, less devotional/peacock-literal. Strong fit if jewellery/makeup categories are meant to feel equally premium and not visually subordinate to the Rakhi/Krishna theme.

---

### Selected Palette

**Option A (Peacock Royale)** has been officially selected for the Ambika Traders brand.

---

## 3. Typography

| Use                                   | Typeface direction                                                                                                      | Notes                                                                      |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Display/Hero headlines                | A refined serif or high-contrast didone (e.g., "Fraunces", "Canela"-style, or "Playfair Display" as a free alternative) | Carries the "luxury/devotional" weight — should feel engraved, not generic |
| Body/UI text                          | A clean humanist sans (e.g., "Inter", "General Sans")                                                                   | Must stay highly legible at small sizes on mobile PDP/checkout             |
| Accent/labels (occasion tags, badges) | Small-caps sans, slightly letterspaced                                                                                  | Festive "tag" feeling without competing with headline serif                |

All fonts loaded via `next/font` (self-hosted, subset, preloaded) — no FOUT on a brand where typography carries real emotional weight.

---

## 4. Motion & Material Language

- **Gold/metallic accents** should use subtle gradient + sheen treatment (not flat fills) where used as buttons/borders — reinforces "premium work, luxury packaging" cue without needing literal product photography everywhere.
- **Peacock motif** (if Option A/C chosen) can appear as a subtle SVG line-art accent in section dividers/backgrounds — never as a heavy decorative layer that competes with product photography.
- **Scroll storytelling (Home/Category hero)**: staged reveals, gentle parallax, particle/feather motifs drifting — should feel like silk moving, not a tech-demo. Easing curves should be slow-in, slow-out (no bouncy/playful easing — this is a devotional/luxury brand, not a youth-streetwear one).
- **Shop Mode motion**: restricted to opacity/scale feedback (add-to-cart confirmation, filter apply, cart drawer slide) — under 250ms, no decorative motion.

---

## 5. Imagery Direction

- Product photography: soft, warm key lighting, dark/neutral backgrounds (lets the sparkle and gold tones pop) — consistent across all 4 categories even though products differ.
- Lifestyle photography (if budget allows): real sibling/family moments for Rakhi, devotional home settings for Krishna Clothing — reinforces emotional context from PRD personas.
- Avoid stock-photo brightness/whiteness — the entire visual system is built on a dark base, so all imagery should be color-graded to sit comfortably against it (warm shadows, not harsh white backgrounds).

---

## 6. Accessibility Note (ties to TRD/Frontend Stack NFRs)

Every palette option above must be run through contrast checking before final lock — dark luxury palettes frequently fail AA on muted text colors. Body text will use the "Text primary" tone, never "Text muted," for anything below 16px to stay safely within WCAG AA.
