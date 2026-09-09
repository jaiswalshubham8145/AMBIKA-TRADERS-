import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { inr } from "@/lib/products";
import { toast } from "sonner";
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  Eye,
  MapPin,
  Gift,
  Phone,
  Mail,
  X,
  CreditCard,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Download,
  Loader2,
  Package,
} from "lucide-react";
import {
  createShiprocketOrder,
  generateShippingLabel,
  triggerLabelDownload,
  trackShipment,
  getShiprocketConfigStatus,
} from "@/lib/shiprocket";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [{ title: "Orders Fulfillment — Ambika Traders Admin" }],
  }),
  component: AdminOrdersPage,
});

interface OrderItem {
  id: string;
  product_slug: string;
  title: string;
  unit_price: number;
  quantity: number;
  image_url?: string;
}

interface OrderRecord {
  id: string;
  created_at: string;
  user_id?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  status: string;
  payment_method: string;
  payment_status: string;
  transaction_id?: string | null;
  payment_screenshot_url?: string | null;
  subtotal: number;
  shipping_total: number;
  total: number;
  shipping_address: {
    name?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  gift_detail?: {
    message?: string;
    recipientName?: string;
    giftWrap?: boolean;
  } | null;
  order_items?: OrderItem[];
  shipment_id?: string | null;
  awb_number?: string | null;
  courier_name?: string | null;
  estimated_delivery?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
}

const STATUS_TABS = [
  "ALL",
  "NEEDS APPROVAL",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [copiedUtrId, setCopiedUtrId] = useState<string | null>(null);
  const [shippingLoading, setShippingLoading] = useState<string | null>(null);
  const [labelLoading, setLabelLoading] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<{
    track_status?: number;
    shipment_id?: number;
    etd?: string;
    scans?: Array<{
      scan_type?: string;
      scan_datetime?: string;
      scan_record?: string;
      location?: string;
    }>;
  } | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const shiprocketStatus = getShiprocketConfigStatus();

  const copyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtrId(utr);
    toast.success("UTR copied to clipboard!");
    setTimeout(() => setCopiedUtrId(null), 2000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading orders:", error);
        toast.error("Failed to load orders from database.");
      } else {
        setOrders((data as OrderRecord[]) || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) {
        toast.error(`Status update failed: ${error.message}`);
      } else {
        toast.success(`Order status updated to ${newStatus}`);
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleApproveUpiPayment = async (orderId: string) => {
    try {
      setIsUpdatingStatus(true);
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "PAID",
          status: "CONFIRMED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) {
        toast.error(`Approval failed: ${error.message}`);
      } else {
        toast.success("Payment verified! Order confirmed.");
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            payment_status: "PAID",
            status: "CONFIRMED",
          });
        }
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error approving payment.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRejectUpiPayment = async (orderId: string) => {
    try {
      setIsUpdatingStatus(true);
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "FAILED",
          status: "CANCELLED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) {
        toast.error(`Rejection failed: ${error.message}`);
      } else {
        toast.error("Payment rejected. Order marked as cancelled.");
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            payment_status: "FAILED",
            status: "CANCELLED",
          });
        }
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error rejecting payment.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ─── Shipping Actions ────────────────────────────────────────────────────────

  const handleShipOrder = async (order: OrderRecord) => {
    if (!shiprocketStatus.configured) {
      toast.error("Shiprocket API not configured. Add credentials to .env");
      return;
    }

    try {
      setShippingLoading(order.id);

      const items = (order.order_items || []).map((item) => ({
        name: item.title,
        sku: item.product_slug,
        units: item.quantity,
        selling_price: item.unit_price,
        discount: 0,
        tax: 0,
        hsn: 7117,
      }));

      const result = await createShiprocketOrder({
        orderId: order.id,
        items,
        subtotal: order.subtotal,
        shippingTotal: order.shipping_total,
        discountTotal: 0,
        totalPayable: order.total,
        paymentMethod: order.payment_method,
        shippingAddress: order.shipping_address,
        guestPhone: order.guest_phone || undefined,
        guestEmail: order.guest_email || undefined,
      });

      const { error } = await supabase
        .from("orders")
        .update({
          shipment_id: String(result.shipment_id),
          status: "SHIPPED",
          shipped_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (error) {
        toast.error(`Failed to update order: ${error.message}`);
      } else {
        toast.success(`Order shipped! Shipment ID: ${result.shipment_id}`);
        fetchOrders();
      }
    } catch (err) {
      console.error("Ship order error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to create shipment");
    } finally {
      setShippingLoading(null);
    }
  };

  const handleGenerateLabel = async (order: OrderRecord) => {
    if (!order.shipment_id) return;

    try {
      setLabelLoading(order.id);
      await triggerLabelDownload(Number(order.shipment_id), order.id);
      toast.success("Shipping label downloaded!");
    } catch (err) {
      console.error("Label error:", err);
      toast.error("Failed to download shipping label");
    } finally {
      setLabelLoading(null);
    }
  };

  const handleTrackShipment = async (order: OrderRecord) => {
    if (!order.awb_number) return;

    try {
      setTrackingLoading(true);
      const result = await trackShipment(order.awb_number);
      setTrackingData(result.tracking_data);
    } catch (err) {
      console.error("Tracking error:", err);
      toast.error("Failed to fetch tracking info");
    } finally {
      setTrackingLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesTab =
      activeTab === "ALL"
        ? true
        : activeTab === "NEEDS APPROVAL"
          ? order.payment_status === "VERIFICATION_PENDING"
          : order.status === activeTab;

    const query = searchQuery.toLowerCase();
    const customerName = order.shipping_address?.name?.toLowerCase() || "";
    const customerEmail = order.guest_email?.toLowerCase() || "";
    const city = order.shipping_address?.city?.toLowerCase() || "";
    const orderId = order.id.toLowerCase();
    const utr = order.transaction_id?.toLowerCase() || "";

    const matchesSearch =
      orderId.includes(query) ||
      customerName.includes(query) ||
      customerEmail.includes(query) ||
      city.includes(query) ||
      utr.includes(query);

    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PACKED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "CONFIRMED":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "PENDING":
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-bold flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-neutral-800" />
            Order Fulfillment Board
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Track customer orders, manage fulfillment stages, and review gift messages
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 bg-white border border-neutral-200 text-xs font-medium rounded-lg text-neutral-700 hover:bg-neutral-50 shadow-sm"
        >
          Refresh Orders
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-neutral-100 pb-3">
          {STATUS_TABS.map((tab) => {
            const count =
              tab === "ALL"
                ? orders.length
                : tab === "NEEDS APPROVAL"
                  ? orders.filter((o) => o.payment_status === "VERIFICATION_PENDING").length
                  : orders.filter((o) => o.status === tab).length;

            const isApprovalTab = tab === "NEEDS APPROVAL";

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === tab
                    ? isApprovalTab
                      ? "bg-amber-600 text-white"
                      : "bg-neutral-900 text-white"
                    : isApprovalTab && count > 0
                      ? "text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                      : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === tab
                      ? "bg-black/25 text-white"
                      : isApprovalTab && count > 0
                        ? "bg-amber-200 text-amber-900 font-bold animate-pulse"
                        : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, customer, email, city..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-neutral-400 animate-pulse">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500">
            No orders found matching the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-neutral-900 block">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-neutral-900 block">
                        {order.shipping_address?.name || "Guest Customer"}
                      </span>
                      <span className="text-[11px] text-neutral-500 block truncate max-w-[180px]">
                        {order.guest_email || order.shipping_address?.city || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-neutral-700">
                        {order.order_items ? order.order_items.length : 0} items
                      </span>
                      {order.gift_detail?.giftWrap && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 mt-0.5 font-medium">
                          <Gift className="w-3 h-3" /> Gift Wrapped
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-900">{inr(order.total)}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium uppercase text-[11px] text-neutral-700 block">
                        {order.payment_method}
                      </span>
                      {order.transaction_id && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] font-mono bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
                            UTR: {order.transaction_id}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyUtr(order.transaction_id!);
                            }}
                            title="Copy UTR"
                            className="p-0.5 hover:bg-neutral-200/60 rounded text-neutral-500"
                          >
                            {copiedUtrId === order.transaction_id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                      <span
                        className={`inline-block text-[10px] font-semibold uppercase mt-0.5 ${
                          order.payment_status === "PAID"
                            ? "text-emerald-700 font-bold"
                            : order.payment_status === "VERIFICATION_PENDING"
                              ? "text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 font-bold animate-pulse"
                              : "text-amber-600"
                        }`}
                      >
                        {order.payment_status === "VERIFICATION_PENDING"
                          ? "Pending Approval"
                          : order.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        disabled={isUpdatingStatus}
                        className={`text-[11px] font-semibold rounded-md border px-2 py-1 outline-none ${getStatusBadge(
                          order.status,
                        )}`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PACKED">PACKED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                      {order.awb_number && (
                        <div className="mt-1 text-[10px] font-mono text-blue-600 flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          {order.awb_number}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        {/* Ship Order Button */}
                        {order.status === "CONFIRMED" && !order.shipment_id && (
                          <button
                            onClick={() => handleShipOrder(order)}
                            disabled={shippingLoading === order.id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors disabled:opacity-50"
                            title="Create shipment on Shiprocket"
                          >
                            {shippingLoading === order.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Truck className="w-3 h-3" />
                            )}
                            Ship
                          </button>
                        )}
                        {/* Generate Label Button */}
                        {order.shipment_id && (
                          <button
                            onClick={() => handleGenerateLabel(order)}
                            disabled={labelLoading === order.id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200 rounded font-medium transition-colors disabled:opacity-50"
                            title="Download shipping label"
                          >
                            {labelLoading === order.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Download className="w-3 h-3" />
                            )}
                            Label
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg font-bold text-neutral-900">
                    Order #{selectedOrder.id.slice(0, 8)}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusBadge(
                      selectedOrder.status,
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString("en-IN")}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 mt-5 text-xs">
              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div>
                  <h3 className="font-semibold text-neutral-900 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-600" />
                    Delivery Address
                  </h3>
                  <div className="text-neutral-700 space-y-0.5">
                    <span className="font-semibold block">
                      {selectedOrder.shipping_address?.name || "Recipient"}
                    </span>
                    <span>{selectedOrder.shipping_address?.address1}</span>
                    {selectedOrder.shipping_address?.address2 && (
                      <span className="block">{selectedOrder.shipping_address?.address2}</span>
                    )}
                    <span className="block">
                      {selectedOrder.shipping_address?.city},{" "}
                      {selectedOrder.shipping_address?.state} -{" "}
                      {selectedOrder.shipping_address?.pincode}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-neutral-900 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-neutral-600" />
                    Contact & Payment
                  </h3>
                  <div className="text-neutral-700 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-neutral-400" />
                      <span>{selectedOrder.guest_email || "No email provided"}</span>
                    </div>
                    {selectedOrder.guest_phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-neutral-400" />
                        <span>{selectedOrder.guest_phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 pt-1">
                      <CreditCard className="w-3 h-3 text-neutral-400" />
                      <span className="font-medium">
                        {selectedOrder.payment_method} ({selectedOrder.payment_status})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct UPI Verification & Approval Card */}
              {(selectedOrder.transaction_id || selectedOrder.payment_method === "UPI") && (
                <div
                  className={`p-4 rounded-xl border ${
                    selectedOrder.payment_status === "VERIFICATION_PENDING"
                      ? "bg-amber-50/80 border-amber-300 shadow-sm"
                      : selectedOrder.payment_status === "PAID"
                        ? "bg-emerald-50/70 border-emerald-300"
                        : "bg-neutral-50 border-neutral-200"
                  } space-y-3`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-peacock" />
                        UPI Payment Verification
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          selectedOrder.payment_status === "PAID"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : selectedOrder.payment_status === "VERIFICATION_PENDING"
                              ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse font-bold"
                              : "bg-neutral-100 text-neutral-800 border-neutral-300"
                        }`}
                      >
                        {selectedOrder.payment_status === "VERIFICATION_PENDING"
                          ? "Action Required: Pending Verification"
                          : selectedOrder.payment_status}
                      </span>
                    </div>

                    {selectedOrder.guest_phone && (
                      <a
                        href={`https://wa.me/${selectedOrder.guest_phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
                          `Hello ${
                            selectedOrder.shipping_address?.name || "Customer"
                          }, this is Ambika Traders regarding your order #${selectedOrder.id.slice(
                            0,
                            8,
                          )}.`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="self-start sm:self-auto inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100/80 hover:bg-emerald-100 px-2.5 py-1 rounded border border-emerald-200 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-white rounded-lg border border-neutral-200">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                        Customer's Submitted UTR / Ref ID
                      </span>
                      {selectedOrder.transaction_id ? (
                        <div className="flex items-center justify-between">
                          <code className="text-sm font-mono font-bold text-neutral-900 select-all">
                            {selectedOrder.transaction_id}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyUtr(selectedOrder.transaction_id!)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700 transition-colors"
                          >
                            {copiedUtrId === selectedOrder.transaction_id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700 font-semibold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">No UTR submitted</span>
                      )}
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-neutral-200 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                        Amount to Verify in Your Bank
                      </span>
                      <span className="text-base font-bold font-display text-neutral-900">
                        {inr(selectedOrder.total)}
                      </span>
                    </div>
                  </div>

                  {/* Approve / Reject Actions */}
                  {selectedOrder.payment_status === "VERIFICATION_PENDING" && (
                    <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-amber-200">
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleApproveUpiPayment(selectedOrder.id)}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Payment & Confirm Order</span>
                      </button>

                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleRejectUpiPayment(selectedOrder.id)}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject (Invalid UTR)</span>
                      </button>
                    </div>
                  )}

                  {selectedOrder.payment_status === "PAID" && (
                    <div className="pt-1 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Payment has been approved and confirmed by administrator.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Gift Message if present */}
              {selectedOrder.gift_detail && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h3 className="font-semibold text-amber-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-1.5">
                    <Gift className="w-3.5 h-3.5 text-amber-700" />
                    Personalized Gift Message
                  </h3>
                  {selectedOrder.gift_detail.recipientName && (
                    <span className="text-xs font-semibold text-amber-900 block">
                      To: {selectedOrder.gift_detail.recipientName}
                    </span>
                  )}
                  {selectedOrder.gift_detail.message ? (
                    <p className="text-xs text-amber-800 italic mt-1 bg-white/60 p-2.5 rounded border border-amber-200/60">
                      "{selectedOrder.gift_detail.message}"
                    </p>
                  ) : (
                    <span className="text-xs text-amber-700">Gift wrap requested</span>
                  )}
                </div>
              )}

              {/* Shipping & Tracking Info */}
              {(selectedOrder.shipment_id || selectedOrder.awb_number) && (
                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-lg space-y-3">
                  <h3 className="font-semibold text-blue-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-700" />
                    Shipping & Tracking
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    {selectedOrder.shipment_id && (
                      <div>
                        <span className="text-[10px] text-blue-600 block mb-0.5">Shipment ID</span>
                        <span className="font-mono font-bold text-blue-900">
                          {selectedOrder.shipment_id}
                        </span>
                      </div>
                    )}
                    {selectedOrder.awb_number && (
                      <div>
                        <span className="text-[10px] text-blue-600 block mb-0.5">
                          AWB / Tracking
                        </span>
                        <span className="font-mono font-bold text-blue-900">
                          {selectedOrder.awb_number}
                        </span>
                      </div>
                    )}
                    {selectedOrder.courier_name && (
                      <div>
                        <span className="text-[10px] text-blue-600 block mb-0.5">Courier</span>
                        <span className="font-semibold text-blue-900">
                          {selectedOrder.courier_name}
                        </span>
                      </div>
                    )}
                    {selectedOrder.estimated_delivery && (
                      <div>
                        <span className="text-[10px] text-blue-600 block mb-0.5">
                          Est. Delivery
                        </span>
                        <span className="font-semibold text-blue-900">
                          {new Date(selectedOrder.estimated_delivery).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    {selectedOrder.shipped_at && (
                      <div>
                        <span className="text-[10px] text-blue-600 block mb-0.5">Shipped On</span>
                        <span className="font-semibold text-blue-900">
                          {new Date(selectedOrder.shipped_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-200">
                    {!selectedOrder.shipment_id && selectedOrder.status === "CONFIRMED" && (
                      <button
                        type="button"
                        disabled={shippingLoading === selectedOrder.id}
                        onClick={() => handleShipOrder(selectedOrder)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                      >
                        {shippingLoading === selectedOrder.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Truck className="w-3.5 h-3.5" />
                        )}
                        Create Shipment
                      </button>
                    )}
                    {selectedOrder.shipment_id && (
                      <button
                        type="button"
                        disabled={labelLoading === selectedOrder.id}
                        onClick={() => handleGenerateLabel(selectedOrder)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {labelLoading === selectedOrder.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        Download Label
                      </button>
                    )}
                    {selectedOrder.awb_number && (
                      <button
                        type="button"
                        disabled={trackingLoading}
                        onClick={() => handleTrackShipment(selectedOrder)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {trackingLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Package className="w-3.5 h-3.5" />
                        )}
                        Track Shipment
                      </button>
                    )}
                    {selectedOrder.awb_number && (
                      <a
                        href={`https://www.shiprocket.in/shipment-tracking/?awb=${selectedOrder.awb_number}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Track on Shiprocket
                      </a>
                    )}
                  </div>

                  {/* Live Tracking Data */}
                  {trackingData && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100">
                      <span className="text-[10px] uppercase font-bold text-blue-500 block mb-2">
                        Live Tracking Status
                      </span>
                      {trackingData.scans && trackingData.scans.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {trackingData.scans.slice(0, 5).map((scan, i) => (
                            <div key={i} className="flex items-start gap-2 text-[11px]">
                              <div className="mt-0.5 w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                              <div>
                                <span className="font-medium text-foreground block">
                                  {scan.scan_type || "Update"}
                                </span>
                                <span className="text-muted-foreground">
                                  {scan.scan_record || scan.location || ""}
                                </span>
                                <span className="text-[10px] text-muted-foreground block">
                                  {scan.scan_datetime}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No tracking scans available yet
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Items List */}
              <div>
                <h3 className="font-semibold text-neutral-900 uppercase tracking-wider text-[10px] mb-2">
                  Order Line Items
                </h3>
                <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-100 overflow-hidden">
                  {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                    selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="p-3 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-neutral-900 block">{item.title}</span>
                          <span className="text-neutral-500 text-[11px]">
                            {inr(item.unit_price)} × {item.quantity}
                          </span>
                        </div>
                        <span className="font-semibold text-neutral-900">
                          {inr(item.unit_price * item.quantity)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-neutral-500">
                      Line items details unavailable
                    </div>
                  )}

                  {/* Financial summary */}
                  <div className="p-3 bg-neutral-50 space-y-1 text-right">
                    <div className="text-neutral-500 flex justify-between">
                      <span>Subtotal:</span>
                      <span>{inr(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="text-neutral-500 flex justify-between">
                      <span>Shipping:</span>
                      <span>
                        {selectedOrder.shipping_total === 0
                          ? "FREE"
                          : inr(selectedOrder.shipping_total)}
                      </span>
                    </div>
                    <div className="font-bold text-neutral-900 text-sm flex justify-between pt-1 border-t border-neutral-200">
                      <span>Grand Total:</span>
                      <span>{inr(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update Quick Action */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-200">
                <span className="font-semibold text-neutral-700">Update Fulfillment Stage:</span>
                <div className="flex items-center gap-2">
                  {["CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"].map((st) => (
                    <button
                      key={st}
                      disabled={isUpdatingStatus || selectedOrder.status === st}
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, st)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                        selectedOrder.status === st
                          ? "bg-neutral-900 text-white cursor-default"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
