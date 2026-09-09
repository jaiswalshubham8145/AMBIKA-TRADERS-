import { supabase } from "@/lib/supabase";

export interface ShippingRule {
  id: string;
  pincode_prefix: string;
  zone: string;
  shipping_fee: number;
  free_shipping_min: number;
  cod_available: boolean;
  estimated_days_min: number;
  estimated_days_max: number;
  is_serviceable: boolean;
}

export interface ShippingResult {
  fee: number;
  estimatedDays: { min: number; max: number };
  codAvailable: boolean;
  isServiceable: boolean;
  freeShipping: boolean;
  freeShippingMin: number;
  remainingForFreeShipping: number;
  zone: string;
}

const DEFAULT_RULE: ShippingRule = {
  id: "",
  pincode_prefix: "",
  zone: "standard",
  shipping_fee: 99,
  free_shipping_min: 999,
  cod_available: true,
  estimated_days_min: 5,
  estimated_days_max: 7,
  is_serviceable: true,
};

function extractPincodePrefix(pincode: string): string {
  const cleaned = pincode.trim().replace(/\D/g, "");
  if (cleaned.length < 3) return "";
  return cleaned.substring(0, 3);
}

let cachedRules: ShippingRule[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function loadShippingRules(): Promise<ShippingRule[]> {
  const now = Date.now();
  if (cachedRules && now - cacheTimestamp < CACHE_TTL) {
    return cachedRules;
  }

  const { data, error } = await supabase
    .from("shipping_rules")
    .select(
      "id, pincode_prefix, zone, shipping_fee, free_shipping_min, cod_available, estimated_days_min, estimated_days_max, is_serviceable",
    )
    .order("pincode_prefix");

  if (error || !data || data.length === 0) {
    return cachedRules || [];
  }

  cachedRules = data as ShippingRule[];
  cacheTimestamp = now;
  return cachedRules;
}

export async function fetchShippingRule(pincode: string): Promise<ShippingRule | null> {
  const prefix = extractPincodePrefix(pincode);
  if (prefix.length < 3) return null;

  const rules = await loadShippingRules();
  return rules.find((r) => r.pincode_prefix === prefix) || null;
}

export async function calculateShipping(
  pincode: string,
  subtotal: number,
): Promise<ShippingResult> {
  const rule = await fetchShippingRule(pincode);

  if (!rule) {
    // No matching rule found — apply defaults
    const isFree = subtotal >= DEFAULT_RULE.free_shipping_min;
    const fee = isFree ? 0 : DEFAULT_RULE.shipping_fee;
    return {
      fee,
      estimatedDays: { min: DEFAULT_RULE.estimated_days_min, max: DEFAULT_RULE.estimated_days_max },
      codAvailable: DEFAULT_RULE.cod_available,
      isServiceable: DEFAULT_RULE.is_serviceable,
      freeShipping: isFree,
      freeShippingMin: DEFAULT_RULE.free_shipping_min,
      remainingForFreeShipping: isFree ? 0 : DEFAULT_RULE.free_shipping_min - subtotal,
      zone: DEFAULT_RULE.zone,
    };
  }

  const isFree = subtotal >= rule.free_shipping_min;
  const fee = isFree ? 0 : rule.shipping_fee;
  return {
    fee,
    estimatedDays: { min: rule.estimated_days_min, max: rule.estimated_days_max },
    codAvailable: rule.cod_available,
    isServiceable: rule.is_serviceable,
    freeShipping: isFree,
    freeShippingMin: rule.free_shipping_min,
    remainingForFreeShipping: isFree ? 0 : rule.free_shipping_min - subtotal,
    zone: rule.zone,
  };
}

export function getPincodeError(pincode: string): string | null {
  const cleaned = pincode.trim().replace(/\D/g, "");
  if (cleaned.length === 0) return null;
  if (!/^\d+$/.test(cleaned)) return "Pincode must be numeric";
  if (cleaned.length !== 6) return "Enter a valid 6-digit pincode";
  return null;
}
