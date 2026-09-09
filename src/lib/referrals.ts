// Referral Code Service

import { supabase } from "./supabase";

export interface Referral {
  id: string;
  code: string;
  referrer_email: string;
  referrer_name: string | null;
  referred_email: string | null;
  referred_name: string | null;
  order_id: string | null;
  discount_applied: number;
  status: string;
  created_at: string;
  redeemed_at: string | null;
}

function generateReferralCode(): string {
  const adjectives = ["FESTIVE", "LUXE", "GOLD", "ROYAL", "BLESSED", "SPARKLE", "RADIANT"];
  const nums = Math.floor(1000 + Math.random() * 9000);
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  return `${adj}-${nums}`;
}

/** Create a referral code for a referrer */
export async function createReferralCode(email: string, name?: string): Promise<Referral | null> {
  // Check if referrer already has a code
  const { data: existing } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_email", email)
    .limit(1)
    .single();

  if (existing) return existing as Referral;

  const code = generateReferralCode();
  const { data, error } = await supabase
    .from("referrals")
    .insert({
      code,
      referrer_email: email,
      referrer_name: name ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Create referral error:", error);
    return null;
  }
  return data as Referral;
}

/** Validate a referral code and return discount info */
export async function validateReferralCode(
  code: string,
): Promise<{ valid: boolean; discount: number; referrerName?: string; error?: string }> {
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .limit(1)
    .single();

  if (error || !data) {
    return { valid: false, discount: 0, error: "Invalid referral code" };
  }

  if (data.status === "expired") {
    return { valid: false, discount: 0, error: "This referral code has expired" };
  }

  // Fixed discount: ₹50 for referrals
  const discount = 50;

  return {
    valid: true,
    discount,
    referrerName: data.referrer_name || undefined,
  };
}

/** Mark a referral as used when an order is placed */
export async function redeemReferral(
  code: string,
  orderId: string,
  referredEmail: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("referrals")
    .update({
      referred_email: referredEmail,
      order_id: orderId,
      discount_applied: 50,
      status: "completed",
      redeemed_at: new Date().toISOString(),
    })
    .eq("code", code.toUpperCase().trim());

  return !error;
}

/** Fetch all referrals (admin) */
export async function fetchReferrals(): Promise<Referral[]> {
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data || []) as Referral[];
}

/** Get or create referral code for the current user */
export async function getOrCreateReferral(email: string, name?: string): Promise<string | null> {
  const referral = await createReferralCode(email, name);
  return referral?.code ?? null;
}
