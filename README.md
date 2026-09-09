# Ambika Traders — Festive Luxury E-Commerce

> Hand-crafted festive luxury — exquisite rakhis, sacred Krishna vastra, heirloom jewellery, and curated beauty. Made in India, gifted with intention.

![Ambika Traders]

---

## 🌟 Overview

**Ambika Traders** is a state-of-the-art e-commerce storefront crafted with modern web standards, featuring ultra-smooth momentum scrolling, a bespoke 2.5D visual elevation system, and seamless direct-to-consumer checkout mechanisms tailored for the Indian market.

### ✨ Key Features

- **Luxury Aesthetic & Typography**: Styled with high-contrast Ivory Luxe palette and refined **Bodoni Moda** display serif paired with **Inter** body typography.
- **Cinematic 2.5D Motion**:
  - Multi-plane parallax hero section.
  - Smooth momentum scrolling powered by **Lenis**.
  - 2.5D hover elevations and velocity-based text marquees.
- **Direct UPI & Cash on Delivery (COD)**:
  - Dynamic NPCI-compliant UPI QR generation and instant deep-links (GPay, PhonePe, Paytm).
  - 1-tap WhatsApp order notification system formatted with complete order details and direct verification links.
- **Full E-Commerce Journey**:
  - Interactive multi-category catalog: *Rakhis*, *Krishna Vastra*, *Jewellery*, and *Makeup*.
  - Persistent shopping cart drawer and wishlist with shareable links.
  - Dynamic gift cards with denomination selectors and balance checker.
  - Comprehensive checkout with pincode validation, coupon codes, and referral discounts.
  - Public order tracking via `/track`.
- **Integrated Admin Suite (`/admin`)**:
  - Live management of orders, products, customers, coupons, shipping rules, and testimonials.
  - Abandoned cart analytics and recovery dashboard.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [TanStack Start](https://tanstack.com/start) + [React 19](https://react.dev) |
| **Routing** | [TanStack Router](https://tanstack.com/router) (type-safe file-based routing) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) + Vanilla CSS Design Tokens |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) + [Lenis](https://lenis.darkroom.engineering/) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) with localStorage persistence |
| **Database & Auth** | [Supabase](https://supabase.com) (PostgreSQL, Row Level Security, Storage) |
| **Validation** | [Zod](https://zod.dev) |
| **Icons** | [Lucide React](https://lucide.dev) |

---

## 📁 Project Structure

```text
├── public/                # Static assets, category imagery, and hero photography
├── src/
│   ├── assets/            # Imported media assets
│   ├── components/
│   │   ├── site/          # Storefront components (Header, Footer, ProductCard, Marquee, etc.)
│   │   └── ui/            # Accessible UI primitives (Radix UI)
│   ├── hooks/             # Custom hooks (Auth, Products, Mobile detection)
│   ├── lib/               # Business logic, Supabase client, UPI, WhatsApp, Shiprocket
│   ├── routes/            # File-based TanStack Start route handlers
│   │   ├── admin.*        # Admin control panel routes
│   │   ├── shop.*         # Category and catalog routes
│   │   ├── __root.tsx     # Root layout shell with Lenis & SEO meta
│   │   └── index.tsx      # Homepage
│   ├── styles.css         # Global design tokens, curves, and Tailwind imports
│   └── server.ts          # SSR server entry handler
├── supabase/
│   └── migrations/        # SQL migration files (Auth, Orders, Coupons, etc.)
├── .env.example           # Template for environment variables
└── package.json           # Dependencies and build scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** 20.0 or higher
- **npm** or **bun**

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/jaiswalshubham8145/AMBIKA-TRADERS-.git
cd AMBIKA-TRADERS-
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```

Set the following variables in `.env`:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Direct Admin UPI Payment Settings
VITE_ADMIN_UPI_ID=archithakk19@okhdfcbank
VITE_ADMIN_UPI_NAME=Archi Thakkar

# Admin WhatsApp Phone (Country code + 10 digits without + or spaces)
VITE_ADMIN_WHATSAPP_PHONE=917862844511

# Optional Integrations
VITE_CALLMEBOT_API_KEY=
VITE_GA4_ID=
VITE_META_PIXEL_ID=
```

### 4. Database Setup
Run the SQL scripts in `supabase/migrations/` sequentially inside your **Supabase SQL Editor**:
1. `01_auth_and_roles.sql`
2. `02_upi_payments.sql`
3. `03_coupons_and_storage.sql`
4. `04_shipping_and_fulfillment.sql`
5. `05_content_tables.sql`
6. `06_cart_events.sql`
7. `07_gift_cards.sql`
8. `08_referrals.sql`

### 5. Running Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront.

---

## 📋 Available Scripts

- `npm run dev` — Launches the local development server with HMR.
- `npm run build` — Compiles production client and SSR bundles with TypeScript validation.
- `npm run preview` — Previews the production build locally.
- `npm run lint` — Runs ESLint checks across all TypeScript and React files.
- `npm run format` — Formats the codebase with Prettier.

---

## 🚢 Deployment

The project is optimized for modern edge and node platforms such as **Vercel**, **Netlify**, or **Docker/VPS**:

- **Build Command**: `npm run build`
- **Output Directory**: `dist/client`
- Ensure all environment variables from `.env.example` are configured in your host's environment settings.

---

## 📄 License

Proprietary © Ambika Traders. All rights reserved.
