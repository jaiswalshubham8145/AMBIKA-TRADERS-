// Analytics Event Tracking — GA4 + Meta Pixel wrapper
// Reads VITE_GA4_ID and VITE_META_PIXEL_ID from .env

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

const GA4_ID = import.meta.env.VITE_GA4_ID as string | undefined;
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// ---------------------------------------------------------------------------
// GA4
// ---------------------------------------------------------------------------

function ga4(event: string, params?: Record<string, unknown>) {
  if (!isBrowser() || !GA4_ID || typeof window.gtag !== "function") return;
  window.gtag("event", event, params);
}

// ---------------------------------------------------------------------------
// Meta Pixel
// ---------------------------------------------------------------------------

function meta(event: string, params?: Record<string, unknown>) {
  if (!isBrowser() || !PIXEL_ID || typeof window.fbq !== "function") return;
  window.fbq("track", event, params);
}

function metaCustom(event: string, params?: Record<string, unknown>) {
  if (!isBrowser() || !PIXEL_ID || typeof window.fbq !== "function") return;
  window.fbq("trackCustom", event, params);
}

// ---------------------------------------------------------------------------
// Typed storefront events
// ---------------------------------------------------------------------------

export interface ProductInfo {
  slug: string;
  title: string;
  price: number;
  category?: string;
  brand?: string;
}

export function trackPageView(path: string, title?: string) {
  ga4("page_view", { page_path: path, page_title: title });
}

export function trackViewItemList(items: ProductInfo[], listName?: string) {
  ga4("view_item_list", {
    item_list_name: listName ?? "shop",
    items: items.map((i, idx) => ({
      item_id: i.slug,
      item_name: i.title,
      price: i.price,
      item_category: i.category,
      index: idx,
    })),
  });
  metaCustom("ViewItemList", { item_list_name: listName, count: items.length });
}

export function trackSelectItem(item: ProductInfo, listName?: string) {
  ga4("select_item", {
    item_list_name: listName ?? "shop",
    items: [{ item_id: item.slug, item_name: item.title, price: item.price }],
  });
}

export function trackViewItem(item: ProductInfo) {
  ga4("view_item", {
    currency: "INR",
    value: item.price,
    items: [
      {
        item_id: item.slug,
        item_name: item.title,
        price: item.price,
        item_category: item.category,
      },
    ],
  });
  meta("ViewContent", {
    content_ids: [item.slug],
    content_type: "product",
    value: item.price,
    currency: "INR",
  });
}

export function trackAddToCart(item: ProductInfo, qty: number, value: number) {
  ga4("add_to_cart", {
    currency: "INR",
    value,
    items: [{ item_id: item.slug, item_name: item.title, price: item.price, quantity: qty }],
  });
  meta("AddToCart", {
    content_ids: [item.slug],
    content_type: "product",
    value,
    currency: "INR",
  });
}

export function trackRemoveFromCart(item: ProductInfo, qty: number, value: number) {
  ga4("remove_from_cart", {
    currency: "INR",
    value,
    items: [{ item_id: item.slug, item_name: item.title, price: item.price, quantity: qty }],
  });
}

export function trackBeginCheckout(value: number, items: ProductInfo[], couponCode?: string) {
  ga4("begin_checkout", {
    currency: "INR",
    value,
    coupon: couponCode,
    items: items.map((i) => ({ item_id: i.slug, item_name: i.title, price: i.price })),
  });
  meta("InitiateCheckout", {
    content_ids: items.map((i) => i.slug),
    content_type: "product",
    value,
    currency: "INR",
    num_items: items.length,
  });
}

export function trackPurchase(orderId: string, value: number, items: ProductInfo[]) {
  ga4("purchase", {
    transaction_id: orderId,
    currency: "INR",
    value,
    items: items.map((i) => ({ item_id: i.slug, item_name: i.title, price: i.price })),
  });
  meta("Purchase", {
    content_ids: items.map((i) => i.slug),
    content_type: "product",
    value,
    currency: "INR",
    num_items: items.length,
  });
}

export function trackSearch(query: string, resultCount?: number) {
  ga4("search", { search_term: query, result_count: resultCount });
}

export function trackShare(itemType: string, itemId: string, method: string) {
  ga4("share", { content_type: itemType, content_id: itemId, method });
}

export function trackWishlistAdd(item: ProductInfo) {
  ga4("add_to_wishlist", {
    currency: "INR",
    value: item.price,
    items: [{ item_id: item.slug, item_name: item.title, price: item.price }],
  });
}

export function trackGiftCardView(value: number) {
  ga4("view_item", {
    currency: "INR",
    value,
    items: [{ item_id: "gift-card", item_name: "Gift Card", price: value }],
  });
}

export function trackReferral(code: string) {
  ga4(" referral_used", { referral_code: code });
  metaCustom("ReferralUsed", { referral_code: code });
}
