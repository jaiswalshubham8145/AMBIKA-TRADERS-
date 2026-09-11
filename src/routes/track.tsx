import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { inr } from "@/lib/products";
import {
  Search,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  MapPin,
  Phone,
  Loader2,
  ExternalLink,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Order — Ambika Traders" },
      { name: "description", content: "Track your Ambika Traders order status and delivery." },
    ],
  }),
  component: TrackOrderPage,
});

interface OrderItem {
  title: string;
  unit_price: number;
  quantity: number;
  image_url?: string;
}

interface OrderRecord {
  id: string;
  created_at: string;
  status: string;
  total: number;
  payment_method: string;
  payment_status: string;
  shipping_address: {
    name?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  order_items?: OrderItem[];
  shipment_id?: string | null;
  awb_number?: string | null;
  courier_name?: string | null;
  estimated_delivery?: string | null;
}

const STATUS_STEPS = [
  { key: "PENDING", label: "Order Placed", icon: Clock },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { key: "PACKED", label: "Packed", icon: Package },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
];

const STATUS_ORDER: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PACKED: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: -1,
  RTO: -1,
};

function TrackOrderPage() {
  const [query, setQuery] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("order") || "";
    }
    return "";
  });
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .or(`id.eq.${trimmed},awb_number.eq.${trimmed}`)
        .limit(1)
        .single();

      if (error || !data) {
        setOrder(null);
      } else {
        setOrder(data as OrderRecord);
      }
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? (STATUS_ORDER[order.status] ?? -1) : -1;
  const isCancelled = order?.status === "CANCELLED" || order?.status === "RTO";

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 lg:py-20">
      <header className="text-center mb-10">
        <p className="eyebrow">Order Tracking</p>
        <h1 className="mt-3 font-display text-4xl lg:text-5xl">Track Your Order</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Enter your Order ID or AWB tracking number to see delivery status
        </p>
      </header>

      {/* Search */}
      <div className="flex gap-3 max-w-lg mx-auto mb-12">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Order ID or Tracking Number"
            className="w-full pl-10 pr-4 py-3 bg-ivory border border-border rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-peacock"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-peacock text-ivory rounded-full text-sm font-semibold hover:bg-peacock-deep transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Track
        </button>
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-peacock mx-auto" />
          <p className="mt-3 text-sm text-muted-foreground">Looking up your order...</p>
        </div>
      )}

      {!loading && searched && !order && (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="font-display text-xl">Order not found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            No order matches "{query}". Please check your Order ID or Tracking Number.
          </p>
        </div>
      )}

      {!loading && order && (
        <div className="space-y-8">
          {/* Order Header */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl">Order #{order.id.slice(0, 8)}</h2>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      order.status === "DELIVERED"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : order.status === "SHIPPED"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : order.status === "CONFIRMED"
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : isCancelled
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-neutral-100 text-neutral-800 border-neutral-200"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Placed on{" "}
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block">Total Paid</span>
                <span className="font-display text-xl font-bold text-foreground">
                  {inr(order.total)}
                </span>
              </div>
            </div>

            {/* Status Timeline */}
            {!isCancelled && (
              <div className="flex items-center justify-between gap-1 mb-6 px-2">
                {STATUS_STEPS.map((step, i) => {
                  const isActive = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center">
                      <div className="flex items-center w-full">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? "bg-peacock text-ivory"
                              : "bg-parchment text-muted-foreground border border-border"
                          } ${isCurrent ? "ring-2 ring-peacock/30" : ""}`}
                        >
                          <StepIcon className="h-4 w-4" />
                        </div>
                        {i < STATUS_STEPS.length - 1 && (
                          <div
                            className={`flex-1 h-0.5 mx-1 ${
                              i < currentStepIndex ? "bg-peacock" : "bg-border"
                            }`}
                          />
                        )}
                      </div>
                      <span
                        className={`text-[10px] mt-1.5 text-center ${
                          isActive ? "text-peacock font-semibold" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {isCancelled && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium text-center">
                This order has been {order.status.toLowerCase()}.
              </div>
            )}

            {/* Shipping Info */}
            {order.awb_number && (
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
                  <Truck className="w-4 h-4" />
                  Shipping Details
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-blue-600 block mb-0.5">Tracking Number</span>
                    <span className="font-mono font-bold text-blue-900">{order.awb_number}</span>
                  </div>
                  {order.courier_name && (
                    <div>
                      <span className="text-[10px] text-blue-600 block mb-0.5">Courier</span>
                      <span className="font-semibold text-blue-900">{order.courier_name}</span>
                    </div>
                  )}
                  {order.estimated_delivery && (
                    <div>
                      <span className="text-[10px] text-blue-600 block mb-0.5">
                        Estimated Delivery
                      </span>
                      <span className="font-semibold text-blue-900">
                        {new Date(order.estimated_delivery).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <a
                    href={`https://www.shiprocket.in/shipment-tracking/?awb=${order.awb_number}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Track on Carrier Site
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Address */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5 mb-3">
              <MapPin className="w-3.5 h-3.5" />
              Delivery Address
            </h3>
            <div className="text-sm text-foreground">
              <span className="font-semibold block">
                {order.shipping_address?.name || "Recipient"}
              </span>
              <span className="text-muted-foreground">
                {order.shipping_address?.city}, {order.shipping_address?.state} -{" "}
                {order.shipping_address?.pincode}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5 mb-4">
              <Package className="w-3.5 h-3.5" />
              Order Items
            </h3>
            <div className="space-y-3">
              {order.order_items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    {item.image_url && (
                      <img src={item.image_url} alt="" className="h-10 w-10 object-cover rounded" />
                    )}
                    <div>
                      <span className="font-medium">{item.title}</span>
                      <span className="text-muted-foreground ml-2">× {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-semibold">{inr(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex justify-between text-sm font-bold">
              <span>Total</span>
              <span>{inr(order.total)}</span>
            </div>
          </div>

          {/* A Note from the Maker */}
          <div className="p-4 sm:p-5 bg-parchment/40 border border-gold/40 rounded-2xl text-left shadow-sm relative overflow-hidden backdrop-blur-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-peacock text-ivory flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-gold/40 font-display">
                SJ
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-peacock font-semibold">
                    A Note From The Maker
                  </span>
                  <span className="text-[10px] text-muted-foreground italic">Shubham Jaiswal</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed italic">
                  &ldquo;Every parcel leaving our atelier carries a touch of digital and artisanal
                  devotion.&rdquo;
                </p>
                <Link
                  to="/maker"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-peacock hover:underline pt-0.5"
                >
                  <span>Read the Maker&apos;s Testament</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Need Help */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-3">Need help with your order?</p>
            <a
              href={`https://wa.me/919876543210?text=${encodeURIComponent(
                `Hi, I need help with my order #${order.id.slice(0, 8)}`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
