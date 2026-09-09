// Shiprocket API Client for Ambika Traders
// Docs: https://apidev.shiprocket.in/v1.0/docs

const SHIPROCKET_BASE =
  import.meta.env.VITE_SHIPROCKET_API_URL || "https://apidev.shiprocket.in/v1.0";
const SHIPROCKET_EMAIL = import.meta.env.VITE_SHIPROCKET_EMAIL || "";
const SHIPROCKET_PASSWORD = import.meta.env.VITE_SHIPROCKET_PASSWORD || "";

let cachedToken: string | null = null;
let tokenExpiry = 0;

export interface ShiprocketOrderPayload {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_state: string;
  billing_pincode: string;
  billing_country: string;
  billing_phone: string;
  billing_email?: string;
  shipping_customer_name: string;
  shipping_address: string;
  shipping_address_2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  shipping_country: string;
  shipping_phone: string;
  order_items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    discount: number;
    tax: number;
    hsn: number;
  }>;
  payment_method: string;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export interface ShiprocketOrderResponse {
  order_id: number;
  shipment_id: number;
  status: string;
  status_message: string;
}

export interface ShiprocketLabelResponse {
  type: string;
  data: string; // Base64 encoded label PDF
}

export interface ShiprocketTrackingResponse {
  tracking_data: {
    track_status: number;
    shipment_id: number;
    etd: string;
    scans: Array<{
      scan_type: string;
      scan_datetime: string;
      scan_record: string;
      location: string;
    }>;
  };
}

export interface ShiprocketShipmentItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount: number;
  tax: number;
  hsn: number;
}

function isConfigured(): boolean {
  return Boolean(SHIPROCKET_EMAIL && SHIPROCKET_PASSWORD);
}

export function getShiprocketConfigStatus(): { configured: boolean; message: string } {
  if (isConfigured()) {
    return { configured: true, message: "Shiprocket API is configured" };
  }
  return {
    configured: false,
    message:
      "Shiprocket API not configured. Set VITE_SHIPROCKET_EMAIL and VITE_SHIPROCKET_PASSWORD in .env",
  };
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  if (!isConfigured()) {
    throw new Error("Shiprocket API credentials not configured");
  }

  const response = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(`Shiprocket auth failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.token;
  tokenExpiry = Date.now() + 23 * 60 * 60 * 1000; // Cache for 23 hours
  return cachedToken!;
}

async function apiRequest<T>(
  endpoint: string,
  method: string = "GET",
  body?: Record<string, unknown>,
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${SHIPROCKET_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message || `Shiprocket API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

// ─── Order Creation ──────────────────────────────────────────────────────────

export async function createShiprocketOrder(orderData: {
  orderId: string;
  items: ShiprocketShipmentItem[];
  subtotal: number;
  shippingTotal: number;
  discountTotal: number;
  totalPayable: number;
  paymentMethod: string;
  shippingAddress: {
    name?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  guestPhone?: string;
  guestEmail?: string;
}): Promise<ShiprocketOrderResponse> {
  const addr = orderData.shippingAddress;
  const name = addr.name || "Customer";
  const phone = orderData.guestPhone || "";

  const payload: ShiprocketOrderPayload = {
    order_id: orderData.orderId.slice(0, 10),
    order_date: new Date().toISOString().split("T")[0],
    pickup_location: "primary",
    billing_customer_name: name,
    billing_address: addr.address1 || "",
    billing_address_2: addr.address2 || "",
    billing_city: addr.city || "",
    billing_state: addr.state || "",
    billing_pincode: addr.pincode || "",
    billing_country: "India",
    billing_phone: phone,
    billing_email: orderData.guestEmail || "",
    shipping_customer_name: name,
    shipping_address: addr.address1 || "",
    shipping_address_2: addr.address2 || "",
    shipping_city: addr.city || "",
    shipping_state: addr.state || "",
    shipping_pincode: addr.pincode || "",
    shipping_country: "India",
    shipping_phone: phone,
    order_items: orderData.items,
    payment_method: orderData.paymentMethod === "COD" ? "COD" : " prepaid",
    sub_total: orderData.subtotal,
    length: 15,
    breadth: 12,
    height: 3,
    weight: 0.3,
  };

  return apiRequest<ShiprocketOrderResponse>(
    "/orders/create/adhoc",
    "POST",
    payload as unknown as Record<string, unknown>,
  );
}

// ─── Label Generation ────────────────────────────────────────────────────────

export async function generateShippingLabel(shipmentId: number): Promise<ShiprocketLabelResponse> {
  return apiRequest<ShiprocketLabelResponse>(`/orders/print/shipment/${shipmentId}`, "GET");
}

// ─── Shipment Tracking ───────────────────────────────────────────────────────

export async function trackShipment(awbNumber: string): Promise<ShiprocketTrackingResponse> {
  return apiRequest<ShiprocketTrackingResponse>(`/courier/track/awb/${awbNumber}`, "GET");
}

// ─── Cancel Shipment ─────────────────────────────────────────────────────────

export async function cancelShipment(shipmentId: number): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/orders/cancel/shipment/${shipmentId}`, "POST");
}

// ─── Utility: Download Label as Blob ─────────────────────────────────────────

export async function downloadLabelBlob(shipmentId: number): Promise<Blob> {
  const token = await getToken();
  const response = await fetch(`${SHIPROCKET_BASE}/orders/print/shipment/${shipmentId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Failed to download shipping label");
  }

  return response.blob();
}

// ─── Utility: Trigger Label Download in Browser ──────────────────────────────

export async function triggerLabelDownload(shipmentId: number, orderId: string): Promise<void> {
  const blob = await downloadLabelBlob(shipmentId);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shipping-label-${orderId.slice(0, 8)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Fallback: Create order when Shiprocket is not configured ─────────────────

export function createFallbackOrderResponse(orderId: string): ShiprocketOrderResponse {
  return {
    order_id: 0,
    shipment_id: 0,
    status: "draft",
    status_message: "Shiprocket not configured — order saved locally only",
  };
}
