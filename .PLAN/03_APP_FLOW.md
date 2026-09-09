# App Flow Document

## Ambika Traders — E-Commerce Platform

**Version:** 1.0
**Purpose:** Map every major user journey end-to-end so frontend, backend, and content needs are unambiguous before build.

---

## 1. Customer Journey Map

### 1.1 Discovery → Homepage

```
Instagram/Search/Ad
      │
      ▼
Homepage (cinematic hero, festive countdown, category entry points)
      │
      ├──► "Shop Rakhi" ──────► Rakhi Category Landing
      ├──► "Krishna Vastra" ──► Krishna Clothing Category Landing
      ├──► "Jewellery" ───────► Jewellery Category Landing
      ├──► "Makeup" ──────────► Makeup Category Landing
      └──► "Shop All" ────────► Full PLP with category filter pre-applied
```

### 1.2 Category Landing → PLP → PDP

```
Category Landing Page
  (own hero/story moment per category, but shared design system)
      │
      ▼
Product Listing Page (PLP)
  - Filters: price, material, color, occasion, set/single
  - Sort: price, newest, popularity
      │
      ▼
Product Detail Page (PDP)
  - Image gallery / zoom / video
  - Variant selection (color/size/shade)
  - "What's included" (bundle contents if applicable)
  - Trust badges, reviews
  - CTA: Add to Cart / Buy Now
  - Secondary CTA: "Gift this" (opens gift flow)
```

### 1.3 Gift Flow (Rakhi-specific but reusable)

```
PDP → "Gift this" toggle
      │
      ▼
Gift Options Panel
  - Add personalized message (text)
  - Choose gift wrap (yes/no, style if multiple)
  - Choose delivery date (date picker, festival-aware — flags if date is
    impossible given current stock/shipping cutoff)
      │
      ▼
Adds metadata to cart line item → proceeds to Cart
```

### 1.4 Cart → Checkout → Confirmation

```
Cart Page
  - Line items (with gift metadata badges if applicable)
  - Bundle/combo upsell ("Add Roli-Chawal for ₹49")
  - Coupon code entry
  - Subtotal, shipping estimate, total
      │
      ▼
Checkout
  Step 1: Contact (email/phone) — guest or logged-in
  Step 2: Shipping Address (saved addresses if logged in)
  Step 3: Delivery date confirmation (esp. for gift orders)
  Step 4: Payment Method
      ├──► COD ──────────────► Order placed (Pending, Unpaid-COD)
      └──► Razorpay ─────────► Razorpay checkout overlay
                                   │
                          ┌────────┴────────┐
                          ▼                 ▼
                     Payment Success   Payment Failed
                          │                 │
                          ▼                 ▼
                  Order Confirmed     Return to checkout,
                  (Paid)              retry payment option
      │
      ▼
Order Confirmation Page
  - Order summary, estimated delivery date
  - "Track your order" link
      │
      ▼
Email/SMS confirmation sent (WhatsApp in Phase 2)
```

### 1.5 Post-Purchase

```
Order Confirmation
      │
      ├──► Account > Order History > Order Detail (status timeline)
      ├──► Order status updates (Confirmed → Packed → Shipped → Delivered)
      │       triggered by admin action, pushed via email/SMS
      └──► Post-delivery: Review prompt (with photo upload option)
```

### 1.6 Account & Wishlist (parallel flows)

```
Header → Account icon
      │
      ├──► Not logged in ──► Login/Signup (email+OTP or email+password)
      │
      └──► Logged in ──► Account Dashboard
                              ├──► Order History
                              ├──► Saved Addresses
                              ├──► Wishlist
                              └──► Logout

Header → Wishlist icon
      │
      ▼
Wishlist Page (saved products, "move to cart" action per item)
```

### 1.7 Search Flow

```
Header Search Bar
      │
      ▼
Autosuggest dropdown (product names, categories, "did you mean")
      │
      ▼
Search Results Page (same component as PLP, query-filtered)
```

---

## 2. Admin Journey Map

### 2.1 Login & Dashboard

```
/admin/login (separate, rate-limited auth)
      │
      ▼
Admin Dashboard
  - Orders needing attention (new, COD pending confirmation)
  - Low stock alerts
  - Revenue snapshot (today/week/festive season)
```

### 2.2 Product Management

```
Admin > Products
      │
      ├──► Add Product
      │       - Category select → dynamic attribute fields appear
      │         (e.g., Rakhi shows "thread color, motif"; Makeup shows "shade, finish")
      │       - Upload images (auto-optimized on upload)
      │       - Set price, stock, variants
      │       - Publish → triggers on-demand revalidation of storefront
      │
      └──► Edit/Archive existing product
              - Same dynamic form
              - Stock update → reflected on storefront within seconds
```

### 2.3 Order Management

```
Admin > Orders
      │
      ▼
Order List (filter by status: New / Confirmed / Packed / Shipped / Delivered / Cancelled)
      │
      ▼
Order Detail
  - Customer info, shipping address, gift message (if any)
  - Mark COD as collected
  - Update status (triggers customer notification)
  - Process refund/cancellation (if Razorpay-paid, triggers refund API call)
```

### 2.4 Content/Campaign Management

```
Admin > Content
      │
      ├──► Homepage Hero/Banner editor (text, image/video, CTA link, countdown date)
      ├──► Featured Collections (pick which products show on homepage)
      └──► Festive Landing Page builder (e.g., spin up "Janmashtami 2026" page
              from a template without dev involvement)
```

### 2.5 Discounts

```
Admin > Discounts
      │
      ├──► Create coupon (% off / flat off / min order value / expiry)
      └──► Create bundle offer (select products → bundle price)
```

---

## 3. Critical Edge Cases to Design For

1. **Stock runs out mid-checkout** — cart must re-validate stock at payment step, not just at add-to-cart.
2. **Festival delivery-date promise can't be met** — PDP/checkout must show a real cutoff date ("Order by Aug 5 for guaranteed Rakhi delivery") rather than a generic estimate.
3. **COD order + customer unreachable** — order status must support "Attempted Delivery" / "RTO" (return to origin) states.
4. **Duplicate order submission** (double-click, back button after payment) — idempotency key required (per TRD-10).
5. **Payment success but webhook delayed** — order should show "Confirming Payment" state rather than falsely showing failure.
