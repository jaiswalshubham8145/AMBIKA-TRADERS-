// Direct Admin UPI Payment Configuration & NPCI URI Builder

export const PAYMENT_CONFIG = {
  upiId: String(import.meta.env.VITE_ADMIN_UPI_ID || "ambikatraders@upi"),
  upiName: String(import.meta.env.VITE_ADMIN_UPI_NAME || "Ambika Traders"),
  whatsappPhone: String(import.meta.env.VITE_ADMIN_WHATSAPP_PHONE || "919876543210"),
  callmebotKey: String(import.meta.env.VITE_CALLMEBOT_API_KEY || ""),
};

/**
 * Builds standard NPCI-compliant UPI payment URI
 * Example: upi://pay?pa=shop@upi&pn=Ambika%20Traders&am=1499.00&cu=INR&tn=AmbikaTradersOrder
 */
export function buildUpiUri(amount: number, orderRef?: string): string {
  const pa = PAYMENT_CONFIG.upiId;
  const pn = encodeURIComponent(PAYMENT_CONFIG.upiName);
  const am = amount.toFixed(2);
  const tn = encodeURIComponent(orderRef ? `Order ${orderRef}` : "Ambika Traders Festive Order");
  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
}
