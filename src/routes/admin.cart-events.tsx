import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { inr } from "@/lib/products";
import { formatCartRecoveryMessage, buildRecoveryWhatsAppUrl } from "@/lib/cart-recovery";
import {
  ShoppingCart,
  TrendingDown,
  Clock,
  ExternalLink,
  RefreshCw,
  Package,
  IndianRupee,
} from "lucide-react";

export const Route = createFileRoute("/admin/cart-events")({
  head: () => ({
    meta: [{ title: "Cart Analytics — Ambika Traders Admin" }],
  }),
  component: CartEventsDashboard,
});

interface AbandonedSession {
  session_id: string;
  last_event_at: string;
  total_cart_value: number;
  unique_products: number;
  user_email: string | null;
  user_phone: string | null;
}

interface CartEventRecord {
  id: string;
  session_id: string;
  event_type: string;
  product_slug: string | null;
  product_title: string | null;
  product_price: number | null;
  quantity: number;
  cart_value: number | null;
  user_email: string | null;
  created_at: string;
}

function CartEventsDashboard() {
  const [abandoned, setAbandoned] = useState<AbandonedSession[]>([]);
  const [recentEvents, setRecentEvents] = useState<CartEventRecord[]>([]);
  const [stats, setStats] = useState({ totalEvents: 0, abandonedCount: 0, recoveredCount: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, abandonedRes, completedRes] = await Promise.all([
        supabase
          .from("cart_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("cart_events")
          .select("session_id, event_type, cart_value, user_email, user_phone, created_at")
          .eq("event_type", "abandoned")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase.from("cart_events").select("session_id").eq("event_type", "checkout_complete"),
      ]);

      setRecentEvents(eventsRes.data || []);

      // Group abandoned by session
      const abandonedMap = new Map<string, AbandonedSession>();
      for (const ev of abandonedRes.data || []) {
        if (!abandonedMap.has(ev.session_id)) {
          abandonedMap.set(ev.session_id, {
            session_id: ev.session_id,
            last_event_at: ev.created_at,
            total_cart_value: ev.cart_value || 0,
            unique_products: 0,
            user_email: ev.user_email,
            user_phone: ev.user_phone,
          });
        }
      }

      // Enrich with add events for product count and value
      const addEvents = (eventsRes.data || []).filter((e) => e.event_type === "add");
      for (const [sid, session] of abandonedMap) {
        const sessionAdds = addEvents.filter((e) => e.session_id === sid);
        session.unique_products = new Set(
          sessionAdds.map((e) => e.product_slug).filter(Boolean),
        ).size;
        if (sessionAdds.length > 0) {
          session.total_cart_value =
            sessionAdds.reduce((sum, e) => sum + (e.cart_value || 0), 0) / sessionAdds.length;
        }
      }

      setAbandoned(Array.from(abandonedMap.values()));
      setStats({
        totalEvents: (eventsRes.data || []).length,
        abandonedCount: abandonedMap.size,
        recoveredCount: (completedRes.data || []).length,
      });
    } catch (err) {
      console.error("Cart events fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Cart Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track abandoned carts and recovery opportunities
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-foreground text-ivory rounded-md text-sm font-semibold hover:bg-peacock-deep transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={ShoppingCart} label="Total Cart Events" value={stats.totalEvents} />
        <StatCard
          icon={TrendingDown}
          label="Abandoned Carts"
          value={stats.abandonedCount}
          color="text-rose"
        />
        <StatCard
          icon={Package}
          label="Checkouts Completed"
          value={stats.recoveredCount}
          color="text-emerald-600"
        />
      </div>

      {/* Abandoned Carts Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold">Abandoned Carts ({abandoned.length})</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Carts inactive for 30+ minutes without checkout
          </p>
        </div>
        {abandoned.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <ShoppingCart className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No abandoned carts yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-parchment/50 text-left">
                <tr>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Session</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Cart Value</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Products</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Last Active</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Contact</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {abandoned.map((s) => (
                  <tr key={s.session_id} className="hover:bg-parchment/20">
                    <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                      {s.session_id.slice(0, 8)}…
                    </td>
                    <td className="px-6 py-3 font-medium">{inr(s.total_cart_value)}</td>
                    <td className="px-6 py-3">{s.unique_products}</td>
                    <td className="px-6 py-3 text-xs text-muted-foreground">
                      {new Date(s.last_event_at).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-3 text-xs">{s.user_email || s.user_phone || "—"}</td>
                    <td className="px-6 py-3">
                      <a
                        href={buildRecoveryWhatsAppUrl({
                          items: [],
                          totalValue: s.total_cart_value,
                          userEmail: s.user_email,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-peacock hover:underline"
                      >
                        WhatsApp Recovery <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold">Recent Cart Events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-parchment/50 text-left">
              <tr>
                <th className="px-6 py-3 font-medium text-muted-foreground">Time</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Event</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Product</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Qty</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Cart Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentEvents.slice(0, 20).map((ev) => (
                <tr key={ev.id} className="hover:bg-parchment/20">
                  <td className="px-6 py-3 text-xs text-muted-foreground">
                    {new Date(ev.created_at).toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        ev.event_type === "add"
                          ? "bg-emerald-100 text-emerald-700"
                          : ev.event_type === "remove"
                            ? "bg-rose-100 text-rose-700"
                            : ev.event_type === "checkout_complete"
                              ? "bg-peacock/10 text-peacock"
                              : ev.event_type === "abandoned"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {ev.event_type}
                    </span>
                  </td>
                  <td className="px-6 py-3">{ev.product_title || "—"}</td>
                  <td className="px-6 py-3">{ev.quantity}</td>
                  <td className="px-6 py-3">{ev.cart_value ? inr(ev.cart_value) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color = "text-foreground",
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-border p-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-parchment flex items-center justify-center">
          <Icon className="h-5 w-5 text-peacock" />
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums {color}">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}
