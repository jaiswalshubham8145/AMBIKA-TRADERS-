import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { inr } from "@/lib/products";
import {
  IndianRupee,
  ShoppingBag,
  Package,
  AlertTriangle,
  Users,
  ArrowRight,
  TrendingUp,
  Clock,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Overview — Ambika Traders Admin" }],
  }),
  component: AdminOverview,
});

interface MetricStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockCount: number;
  totalCustomers: number;
}

interface RecentOrder {
  id: string;
  created_at: string;
  status: string;
  total: number;
  guest_email?: string;
  shipping_address?: { name?: string };
}

function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MetricStats>({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, total, status, created_at, guest_email, shipping_address")
        .order("created_at", { ascending: false });

      const orders = ordersData || [];
      const revenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const pending = orders.filter(
        (o) => o.status === "PENDING" || o.status === "CONFIRMED",
      ).length;

      // 2. Fetch Products
      const { data: productsData } = await supabase.from("products").select("id, stock");

      const products = productsData || [];
      const lowStock = products.filter((p) => (p.stock ?? 0) < 10).length;

      // 3. Fetch Customers
      const { count: customerCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

      setStats({
        totalRevenue: revenue,
        totalOrders: orders.length,
        pendingOrders: pending,
        totalProducts: products.length,
        lowStockCount: lowStock,
        totalCustomers: customerCount || 0,
      });

      setRecentOrders(orders.slice(0, 5) as RecentOrder[]);
    } catch (err) {
      console.error("Error loading admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-bold">
            Executive Overview
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time performance snapshot of Ambika Traders atelier sales and inventory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors shadow-sm"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-serif font-bold text-neutral-900">
              {loading ? "..." : inr(stats.totalRevenue)}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>Gross sales to date</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-serif font-bold text-neutral-900">
              {loading ? "..." : stats.totalOrders}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{stats.pendingOrders} pending fulfillment</span>
            </div>
          </div>
        </div>

        {/* Live Catalog */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Active Catalog
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-serif font-bold text-neutral-900">
              {loading ? "..." : stats.totalProducts}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-1">
              <span>Rakhis, Vastra, Kundan, Makeup</span>
            </div>
          </div>
        </div>

        {/* Inventory Attention */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Low Stock Alerts
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-serif font-bold text-neutral-900">
              {loading ? "..." : stats.lowStockCount}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-1 font-medium">
              <span>Items below 10 units</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Recent Customer Orders</h2>
            <p className="text-xs text-neutral-500">Latest transactions requiring fulfillment</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
          >
            View all orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-400">Loading orders...</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            No orders placed yet. Placed orders will appear here automatically.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="px-6 py-3.5 flex items-center justify-between hover:bg-neutral-50/70"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-neutral-900">
                      #{order.id.slice(0, 8)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        order.status === "DELIVERED"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.status === "SHIPPED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 block">
                    {order.shipping_address?.name || order.guest_email || "Customer"} •{" "}
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-neutral-900 block">
                    {inr(order.total)}
                  </span>
                  <Link
                    to="/admin/orders"
                    className="text-[11px] text-neutral-500 hover:text-neutral-800 underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
