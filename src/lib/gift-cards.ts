// Gift Card Service — validation, redemption, and admin management

import { supabase } from "./supabase";

export interface GiftCard {
  id: string;
  code: string;
  initial_value: number;
  balance: number;
  purchaser_email: string | null;
  purchaser_name: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  message: string | null;
  status: string;
  redeemed_by_order_id: string | null;
  redeemed_at: string | null;
  expires_at: string | null;
  created_at: string;
}

/** Generate a unique gift card code */
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "GIFT-";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Create a new gift card (admin or customer purchase) */
export async function createGiftCard(params: {
  value: number;
  purchaserEmail?: string;
  purchaserName?: string;
  recipientEmail?: string;
  recipientName?: string;
  message?: string;
  expiresInDays?: number;
}): Promise<GiftCard | null> {
  const code = generateCode();
  const expiresAt = params.expiresInDays
    ? new Date(Date.now() + params.expiresInDays * 86400000).toISOString()
    : null;

  const { data, error } = await supabase
    .from("gift_cards")
    .insert({
      code,
      initial_value: params.value,
      balance: params.value,
      purchaser_email: params.purchaserEmail ?? null,
      purchaser_name: params.purchaserName ?? null,
      recipient_email: params.recipientEmail ?? null,
      recipient_name: params.recipientName ?? null,
      message: params.message ?? null,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) {
    console.error("Gift card creation error:", error);
    return null;
  }
  return data as GiftCard;
}

/** Validate and look up a gift card by code */
export async function validateGiftCard(code: string): Promise<GiftCard | null> {
  const { data, error } = await supabase
    .from("gift_cards")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .single();

  if (error || !data) return null;

  // Check status
  if (data.status !== "active") return null;

  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    await supabase.from("gift_cards").update({ status: "expired" }).eq("id", data.id);
    return null;
  }

  return data as GiftCard;
}

/** Redeem gift card against an order (deduct balance) */
export async function redeemGiftCard(
  code: string,
  orderId: string,
  redeemAmount: number,
): Promise<{ success: boolean; remainingBalance: number; error?: string }> {
  const card = await validateGiftCard(code);
  if (!card) return { success: false, remainingBalance: 0, error: "Invalid or expired gift card" };

  if (card.balance < redeemAmount) {
    return {
      success: false,
      remainingBalance: card.balance,
      error: `Insufficient balance. Available: ₹${card.balance}`,
    };
  }

  const newBalance = card.balance - redeemAmount;
  const newStatus = newBalance <= 0 ? "redeemed" : "active";

  const { error } = await supabase
    .from("gift_cards")
    .update({
      balance: newBalance,
      status: newStatus,
      redeemed_by_order_id: orderId,
      redeemed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", card.id);

  if (error) return { success: false, remainingBalance: card.balance, error: error.message };
  return { success: true, remainingBalance: newBalance };
}

/** Fetch all gift cards (admin) */
export async function fetchGiftCards(): Promise<GiftCard[]> {
  const { data, error } = await supabase
    .from("gift_cards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch gift cards error:", error);
    return [];
  }
  return (data || []) as GiftCard[];
}

/** Disable a gift card (admin) */
export async function disableGiftCard(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("gift_cards")
    .update({ status: "disabled", updated_at: new Date().toISOString() })
    .eq("id", id);
  return !error;
}

/** Re-enable a gift card (admin) */
export async function enableGiftCard(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("gift_cards")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", id);
  return !error;
}
