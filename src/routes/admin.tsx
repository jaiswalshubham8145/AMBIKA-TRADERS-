import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Store,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  ShieldAlert,
  Tag,
  Truck,
  FileText,
  Star,
  Instagram,
  ShoppingCart,
  Gift,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — Ambika Traders" },
      { name: "description", content: "Management console for Ambika Traders storefront." },
    ],
  }),
  component: AdminLayout,
});

const adminNav = [
  { to: "/admin" as const, label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/products" as const, label: "Products CMS", icon: Package, exact: false },
  { to: "/admin/orders" as const, label: "Orders Board", icon: ShoppingBag, exact: false },
  { to: "/admin/shipping" as const, label: "Shipping Rules", icon: Truck, exact: false },
  { to: "/admin/coupons" as const, label: "Coupons", icon: Tag, exact: false },
  { to: "/admin/blog" as const, label: "Blog", icon: FileText, exact: false },
  { to: "/admin/testimonials" as const, label: "Reviews", icon: Star, exact: false },
  { to: "/admin/instagram" as const, label: "Instagram", icon: Instagram, exact: false },
  { to: "/admin/cart-events" as const, label: "Cart Analytics", icon: ShoppingCart, exact: false },
  { to: "/admin/gift-cards" as const, label: "Gift Cards", icon: Gift, exact: false },
  { to: "/admin/customers" as const, label: "Customers", icon: Users, exact: false },
];

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, profile, isAdmin, isLoading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Auth Guard
  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/login", search: { redirect: "/admin" } });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-300 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-neutral-400">
            Verifying Admin Credentials...
          </p>
        </div>
      </div>
    );
  }

  // Unauthorized screen for non-admin customers
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 bg-card border border-border rounded-xl shadow-lg">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl text-foreground">Access Restricted</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Your account (<strong>{user.email}</strong>) is registered as a customer and does not
            have administrative privileges.
          </p>
          <div className="mt-4 p-3 bg-muted/60 border border-border rounded-lg text-left text-xs text-muted-foreground">
            <p className="text-[11px] font-semibold text-foreground mb-1">
              Granting Admin Access in Supabase:
            </p>
            <code className="block bg-background p-2 rounded text-[11px] font-mono border border-border select-all overflow-x-auto text-foreground">
              UPDATE public.profiles SET role = 'admin' WHERE email = '{user.email}';
            </code>
            <p className="text-[10px] mt-1.5 text-muted-foreground">
              Run this one line in your Supabase Dashboard SQL Editor, then refresh this page.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/"
              className="w-full py-2.5 px-4 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              Return to Storefront
            </Link>
            <button
              onClick={() => signOut().then(() => navigate({ to: "/login" }))}
              className="w-full py-2.5 px-4 border border-input text-xs font-medium text-foreground rounded-md hover:bg-accent transition-colors"
            >
              Sign In as Different User
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-neutral-50 text-neutral-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-neutral-900 text-neutral-200 border-r border-neutral-800 flex flex-col transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif tracking-wide text-base text-white font-bold block">
                Ambika Traders
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-widest text-amber-400 block">
                Executive Admin
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminNav.map((item) => {
            const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to as never}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-amber-500/15 text-amber-400 font-semibold"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-800 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-400" />
              Live Storefront
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
            <div className="overflow-hidden">
              <span className="text-[11px] text-neutral-400 truncate block">
                {profile?.full_name || user?.email}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-500">
                Administrator
              </span>
            </div>
            <button
              onClick={() => signOut().then(() => navigate({ to: "/" }))}
              title="Sign Out"
              className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Administrative Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-neutral-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Admin Management Console
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-xs font-medium transition-colors shadow-sm"
              title="Open storefront in a new tab"
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Storefront</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </Link>

            <span className="hidden md:inline-block text-neutral-300">|</span>

            <span className="text-neutral-500 hidden sm:inline">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
