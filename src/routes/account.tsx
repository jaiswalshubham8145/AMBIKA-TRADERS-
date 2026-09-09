import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { inr } from "@/lib/products";
import { toast } from "sonner";
import { getOrCreateReferral } from "@/lib/referrals";
import { trackShare } from "@/lib/analytics";
import {
  Package,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  LayoutDashboard,
  ShoppingBag,
  Calendar,
  MapPin,
  Truck,
  ExternalLink,
  Gift,
  Copy,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Ambika Traders" },
      { name: "description", content: "View your festive orders and account profile." },
    ],
  }),
  component: AccountPage,
});

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  image_url?: string;
}

interface OrderRecord {
  id: string;
  created_at: string;
  status: string;
  total: number;
  payment_method: string;
  payment_status: string;
  transaction_id?: string | null;
  shipping_address: {
    name?: string;
    address1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  order_items?: OrderItem[];
  shipment_id?: string | null;
  awb_number?: string | null;
  courier_name?: string | null;
  estimated_delivery?: string | null;
  shipped_at?: string | null;
}

function AccountPage() {
  const navigate = useNavigate();
  const { user, profile, isAdmin, isLoading, signOut } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Protect route
  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/login", search: { redirect: "/account" } });
    }
  }, [user, isLoading, navigate]);

  // Fetch real customer orders from Supabase
  useEffect(() => {
    async function loadOrders() {
      if (!user) return;
      try {
        setOrdersLoading(true);
        const { data, error } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching customer orders:", error);
        } else {
          setOrders((data as OrderRecord[]) || []);
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setOrdersLoading(false);
      }
    }

    if (user) {
      loadOrders();
      getOrCreateReferral(user.email || "", profile?.full_name || undefined).then(setReferralCode);
    }
  }, [user, profile?.full_name]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully.");
    navigate({ to: "/" });
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">Loading account...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:py-16">
      {/* Executive Administrator Banner */}
      {isAdmin && (
        <div className="mb-8 p-6 rounded-2xl bg-neutral-900 text-neutral-100 border border-amber-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest font-bold text-amber-400">
                    Administrator Workspace
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active Session
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                  Ambika Traders Management Console
                </h2>
                <p className="text-xs text-neutral-300 mt-1.5 max-w-2xl leading-relaxed">
                  You have full administrator privileges. This screen displays your customer profile
                  & personal test orders. Click below to enter the full executive Admin Panel to
                  manage catalog products, live orders, discount coupons, and fulfillment.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                Launch Admin Panel
              </Link>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-neutral-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-neutral-400 text-[11px] font-medium mr-1 uppercase tracking-wider">
              Quick Portals:
            </span>
            <Link
              to="/admin/products"
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
            >
              📦 Products CMS
            </Link>
            <Link
              to="/admin/orders"
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
            >
              🛍️ Orders Board
            </Link>
            <Link
              to="/admin/customers"
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
            >
              👥 Customers
            </Link>
            <Link
              to="/admin/coupons"
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
            >
              🏷️ Coupons
            </Link>
            <Link
              to="/admin/shipping"
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
            >
              🚚 Shipping Rules
            </Link>
            <Link
              to="/admin/cart-events"
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
            >
              📊 Cart Analytics
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="eyebrow text-xs text-primary tracking-widest uppercase">
            {isAdmin ? "Store Administrator Profile" : "Atelier Member"}
          </span>
          <h1 className="font-serif text-3xl text-foreground mt-1">
            Namaste,{" "}
            {profile?.full_name || user.email?.split("@")[0] || (isAdmin ? "Admin" : "Customer")}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isAdmin
              ? "Customer storefront view & personal delivery details"
              : "Manage your past festive purchases and delivery details"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              Open Admin Console
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-input text-xs font-medium text-foreground rounded-lg hover:bg-accent transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Profile Details Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="font-serif text-lg text-foreground flex items-center gap-2 mb-4">
              <UserIcon className="w-4 h-4 text-primary" />
              Profile Details
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Full Name</span>
                <span className="font-medium text-foreground">
                  {profile?.full_name || "Not provided"}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Email Address</span>
                <span className="font-medium text-foreground">{user.email}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Account Role</span>
                <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-medium uppercase tracking-wider rounded bg-primary/10 text-primary">
                  {profile?.role || "customer"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-muted/40 border border-border/80 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-2">Need Gifting Assistance?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Our concierge atelier is available to customize Rakhis, idol vastra, or wedding
              hampers.
            </p>
            <Link to="/contact" className="text-xs font-medium text-primary hover:underline">
              Contact Atelier Concierge →
            </Link>
          </div>

          {referralCode && (
            <div className="bg-peacock/5 border border-peacock/20 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-peacock" />
                Refer & Earn
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Share your code and both of you get ₹50 off your next order.
              </p>
              <div className="flex gap-2">
                <code className="flex-1 bg-ivory border border-border rounded px-3 py-2 text-xs font-mono tracking-wider">
                  {referralCode}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(referralCode);
                    setCopiedReferral(true);
                    trackShare("referral", referralCode, "clipboard");
                    toast.success("Referral code copied!");
                    setTimeout(() => setCopiedReferral(false), 2000);
                  }}
                  className="px-3 py-2 bg-peacock text-ivory rounded text-xs font-semibold hover:bg-peacock-deep transition-colors flex items-center gap-1"
                >
                  {copiedReferral ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedReferral ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order History */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="font-serif text-xl text-foreground flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-primary" />
              Order History
            </h2>

            {ordersLoading ? (
              <p className="text-sm text-muted-foreground py-8 text-center animate-pulse">
                Fetching your orders...
              </p>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-lg">
                <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-sm font-medium text-foreground">No orders found</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  You haven't placed any festive orders with this account yet.
                </p>
                <Link
                  to="/shop"
                  className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors"
                >
                  Explore Festive Collection
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 border border-border rounded-lg bg-background hover:border-primary/40 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/50 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-medium text-foreground">
                          Order #{order.id.slice(0, 8)}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {order.payment_status === "VERIFICATION_PENDING" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                            Verifying Payment
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase ${
                            order.status === "DELIVERED"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : order.status === "SHIPPED"
                                ? "bg-blue-500/10 text-blue-600"
                                : order.status === "CONFIRMED"
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {order.transaction_id && (
                      <div className="text-[11px] text-muted-foreground py-1 border-b border-border/30 flex items-center justify-between font-mono">
                        <span>Submitted UTR / Ref ID:</span>
                        <span className="font-semibold text-foreground bg-muted/60 px-2 py-0.5 rounded">
                          {order.transaction_id}
                        </span>
                      </div>
                    )}

                    {/* Items summary */}
                    <div className="py-3 text-xs space-y-1">
                      {order.order_items && order.order_items.length > 0 ? (
                        order.order_items.map((item) => (
                          <div key={item.id} className="flex justify-between text-muted-foreground">
                            <span>
                              {item.title}{" "}
                              <strong className="text-foreground">× {item.quantity}</strong>
                            </span>
                            <span className="font-medium text-foreground">
                              {inr(item.unit_price * item.quantity)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">Order details placed via checkout</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-border/40 text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {order.shipping_address?.city}, {order.shipping_address?.state} (
                        {order.shipping_address?.pincode})
                      </span>
                      <div className="font-semibold text-foreground text-sm">
                        Total: {inr(order.total)}
                      </div>
                    </div>

                    {/* Tracking Info */}
                    {(order.status === "SHIPPED" || order.awb_number) && (
                      <div className="mt-3 pt-3 border-t border-border/40">
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          {order.awb_number && (
                            <span className="flex items-center gap-1 text-blue-600 font-medium">
                              <Truck className="w-3 h-3" />
                              Tracking: {order.awb_number}
                            </span>
                          )}
                          {order.estimated_delivery && (
                            <span className="text-muted-foreground">
                              Est. delivery:{" "}
                              {new Date(order.estimated_delivery).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          )}
                          <a
                            href={`/track?order=${order.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold hover:bg-blue-100 transition-colors"
                          >
                            <Truck className="w-3 h-3" />
                            Track Order
                          </a>
                          {order.awb_number && (
                            <a
                              href={`https://www.shiprocket.in/shipment-tracking/?awb=${order.awb_number}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-50 text-neutral-700 border border-neutral-200 rounded text-[11px] font-semibold hover:bg-neutral-100 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Carrier Site
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
