// Cart Recovery — WhatsApp recovery message generator

import { PAYMENT_CONFIG } from "./payment-config";

interface RecoveryItem {
  title: string;
  price: number;
  qty: number;
}

interface RecoveryCartData {
  items: RecoveryItem[];
  totalValue: number;
  userEmail?: string | null;
}

export function formatCartRecoveryMessage(data: RecoveryCartData): string {
  const itemList = data.items
    .map((item, idx) => `${idx + 1}. ${item.title} (x${item.qty}) — ₹${item.price * item.qty}`)
    .join("\n");

  return `🛒 *You left something beautiful behind!*
----------------------------------------
Hi! Your festive bag at *Ambika Traders* is waiting:

${itemList}

💰 *Cart Total:* ₹${data.totalValue.toLocaleString("en-IN")}

Hurry — our handcrafted pieces sell out fast during the festive season.
Complete your order now and make this festive season unforgettable ✨

👉 *Continue shopping:*
https://ambikatraders.com/cart`;
}

export function buildRecoveryWhatsAppUrl(data: RecoveryCartData): string {
  const msg = formatCartRecoveryMessage(data);
  const phone = String(PAYMENT_CONFIG.whatsappPhone).replace(/[^\d]/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}
