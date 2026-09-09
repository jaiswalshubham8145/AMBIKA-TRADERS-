// Cart Event Tracker — logs cart interactions for abandoned cart recovery
// Uses a session-stable ID persisted in localStorage

import { supabase } from "./supabase";

function getSessionId(): string {
  const KEY = "aa-cart-session";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

export type CartEventType = "add" | "remove" | "checkout_start" | "checkout_complete" | "abandoned";

interface CartEventPayload {
  eventType: CartEventType;
  productSlug?: string;
  productTitle?: string;
  productPrice?: number;
  quantity?: number;
  cartValue?: number;
  userEmail?: string;
  userPhone?: string;
}

export async function trackCartEvent(payload: CartEventPayload): Promise<void> {
  try {
    await supabase.from("cart_events").insert({
      session_id: getSessionId(),
      event_type: payload.eventType,
      product_slug: payload.productSlug ?? null,
      product_title: payload.productTitle ?? null,
      product_price: payload.productPrice ?? null,
      quantity: payload.quantity ?? 1,
      cart_value: payload.cartValue ?? null,
      user_email: payload.userEmail ?? null,
      user_phone: payload.userPhone ?? null,
    });
  } catch {
    // silent — analytics should never break UX
  }
}

/**
 * Marks abandoned carts older than 30 minutes.
 * Call this periodically or on app load (once per session).
 */
export async function markAbandonedCarts(): Promise<void> {
  try {
    // Find sessions with adds but no checkout_complete, last event > 30 min ago
    const { data: stale } = await supabase
      .from("cart_events")
      .select("session_id")
      .eq("event_type", "add")
      .lt("created_at", new Date(Date.now() - 30 * 60 * 1000).toISOString())
      .limit(50);

    if (!stale || stale.length === 0) return;

    const sessionIds = [...new Set(stale.map((r) => r.session_id))];

    for (const sid of sessionIds) {
      // Check if this session already has a checkout_complete
      const { data: completed } = await supabase
        .from("cart_events")
        .select("id")
        .eq("session_id", sid)
        .eq("event_type", "checkout_complete")
        .limit(1);

      if (completed && completed.length > 0) continue;

      // Check if already marked abandoned
      const { data: already } = await supabase
        .from("cart_events")
        .select("id")
        .eq("session_id", sid)
        .eq("event_type", "abandoned")
        .limit(1);

      if (already && already.length > 0) continue;

      // Get the latest cart value and user info
      const { data: latest } = await supabase
        .from("cart_events")
        .select("cart_value, user_email, user_phone")
        .eq("session_id", sid)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      await supabase.from("cart_events").insert({
        session_id: sid,
        event_type: "abandoned",
        cart_value: latest?.cart_value ?? 0,
        user_email: latest?.user_email ?? null,
        user_phone: latest?.user_phone ?? null,
      });
    }
  } catch {
    // silent
  }
}
