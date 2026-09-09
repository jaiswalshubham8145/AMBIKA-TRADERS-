// 100% Free WhatsApp Alert Dispatcher & Direct wa.me Generator

import { PAYMENT_CONFIG } from "./payment-config";

export interface OrderAlertData {
  orderId: string;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
  total: number;
  paymentMethod: string;
  utrNumber?: string | null;
  items: Array<{ title: string; qty: number; price: number }>;
  giftMessage?: string | null;
}

/**
 * Formats a clean, high-impact WhatsApp alert message
 */
export function formatWhatsAppOrderAlert(data: OrderAlertData): string {
  const shortId = data.orderId.slice(0, 8).toUpperCase();
  const phone = data.customerPhone || "Not provided";
  const utr = data.utrNumber ? `*${data.utrNumber}*` : "N/A (Cash on Delivery)";
  const address = data.city
    ? `${data.city}, ${data.state || ""} (${data.pincode || ""})`
    : "Standard Delivery";

  const itemList = data.items
    .map((item, idx) => `${idx + 1}. ${item.title} (x${item.qty}) — ₹${item.price * item.qty}`)
    .join("\n");

  const giftNote = data.giftMessage ? `\n🎁 *Gift Note:* "${data.giftMessage}"` : "";

  return `🔔 *NEW ORDER AWAITING PAYMENT VERIFICATION*
----------------------------------------
📦 *Order ID:* #${shortId}
👤 *Customer:* ${data.customerName}
📞 *Contact:* ${phone}
📍 *Delivery:* ${address}
💰 *Total Amount:* ₹${data.total.toLocaleString("en-IN")}
💳 *Payment Mode:* ${data.paymentMethod}
🔢 *UTR / Ref ID:* ${utr}
${giftNote}
🛍️ *Items Ordered (${data.items.length}):*
${itemList}
----------------------------------------
👉 *Verify in Admin Dashboard:*
https://ambikatraders.com/admin/orders`;
}

/**
 * Builds direct 1-tap WhatsApp URL (100% Free via wa.me)
 */
export function buildWhatsAppDirectUrl(message: string): string {
  const adminPhone = String(PAYMENT_CONFIG.whatsappPhone).replace(/[^\d]/g, "");
  return `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Triggers automated background alert via CallMeBot (if API key is present)
 * Free API: https://www.callmebot.com/blog/free-api-whatsapp-messages/
 */
export async function sendCallMeBotWhatsAppAlert(
  message: string,
  phoneOverride?: string,
): Promise<boolean> {
  const phone = phoneOverride || String(PAYMENT_CONFIG.whatsappPhone).replace(/[^\d]/g, "");
  const apiKey = PAYMENT_CONFIG.callmebotKey;

  if (!apiKey || !phone) {
    return false;
  }

  try {
    const encoded = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apiKey}`;
    // Using no-cors so browser doesn't block cross-origin GET
    await fetch(url, { mode: "no-cors" });
    return true;
  } catch (err) {
    console.warn("CallMeBot alert dispatch warning:", err);
    return false;
  }
}
