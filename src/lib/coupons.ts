import { supabase } from "@/lib/supabase";

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  valid_from: string;
  valid_until: string | null;
  usage_limit: number | null;
  times_used: number;
  is_active: boolean;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discount?: number;
  error?: string;
}

export async function validateCoupon(
  code: string,
  subtotal: number,
): Promise<CouponValidationResult> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) {
    return { valid: false, error: "Please enter a coupon code." };
  }

  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", trimmed)
    .single();

  if (error || !coupon) {
    return { valid: false, error: "Invalid coupon code." };
  }

  if (!coupon.is_active) {
    return { valid: false, error: "This coupon is no longer active." };
  }

  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    return { valid: false, error: "This coupon has expired." };
  }

  if (coupon.usage_limit !== null && coupon.times_used >= coupon.usage_limit) {
    return { valid: false, error: "This coupon has reached its usage limit." };
  }

  if (subtotal < coupon.min_order_amount) {
    return {
      valid: false,
      error: `Order total must be at least ₹${coupon.min_order_amount.toLocaleString("en-IN")} to apply ${coupon.code}.`,
    };
  }

  let discount = 0;
  if (coupon.discount_type === "percentage") {
    discount = (subtotal * coupon.discount_value) / 100;
    if (coupon.max_discount_amount !== null) {
      discount = Math.min(discount, coupon.max_discount_amount);
    }
  } else {
    discount = coupon.discount_value;
  }

  discount = Math.min(discount, subtotal);

  return { valid: true, coupon, discount: Math.round(discount * 100) / 100 };
}
