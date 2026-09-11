import { Link, useRouterState } from "@tanstack/react-router";
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  Heart,
  User as UserIcon,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { cartCount, useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useAuth } from "@/hooks/use-auth";

const nav = [
  { to: "/shop/rakhi", label: "Rakhi" },
  { to: "/shop/krishna-vastra", label: "Krishna Vastra" },
  { to: "/shop/jewellery", label: "Jewellery" },
  { to: "/shop/makeup", label: "Makeup" },
  { to: "/shop", label: "Shop All" },
  { to: "/about", label: "Our Story" },
  { to: "/maker", label: "The Maker" },
];

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const lines = useCart((s) => s.lines);
  const openCart = useCart((s) => s.open);
  const count = cartCount(lines);
  const wishCount = useWishlist((s) => s.slugs.length);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => setSearchOpen(false), [path]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    navigate({ to: "/shop", search: { q: query, sort: "featured" } });
    setSearchOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-ivory/85 backdrop-blur-md border-b border-border"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 lg:py-5">
        <Link to="/" className="flex flex-col leading-none">
          <span className="font-display text-2xl tracking-tight">
            Ambika <span className="text-peacock">Traders</span>
          </span>
          <span className="text-[10px] tracking-[0.32em] text-muted-foreground uppercase mt-0.5">
            Festive · Luxury
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {nav.map((n) => {
            const active = path === n.to || (n.to !== "/shop" && path.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`relative text-sm tracking-wide transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-peacock transition-all duration-300 ${
                    active ? "w-full" : "w-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900 text-amber-300 hover:bg-neutral-800 border border-amber-500/40 text-xs font-semibold tracking-wide transition-all shadow-sm"
              title="Open Admin Management Console"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden md:inline">Admin Panel</span>
            </Link>
          )}
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
            className="hidden sm:inline-flex relative h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-parchment transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="hidden sm:inline-flex relative h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-parchment transition-colors"
          >
            <Heart className="h-4 w-4" />
            {wishCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-peacock text-[10px] font-medium text-ivory flex items-center justify-center">
                {wishCount}
              </span>
            )}
          </Link>
          <Link
            to={user ? (isAdmin ? "/admin" : "/account") : "/login"}
            aria-label={user ? (isAdmin ? "Admin Console" : "My Account") : "Sign In"}
            title={user ? (isAdmin ? "Admin Console" : "My Account") : "Sign In"}
            className="hidden sm:inline-flex relative h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-parchment transition-colors"
          >
            <UserIcon className="h-4 w-4" />
            {isAdmin && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-ivory ring-2 ring-amber-500/30" />
            )}
          </Link>
          <button
            onClick={openCart}
            aria-label="Open cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-parchment transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose text-[10px] font-medium text-ivory flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-border"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border bg-ivory/95 backdrop-blur-md">
          <form
            onSubmit={submitSearch}
            className="mx-auto max-w-[1400px] px-6 py-5 flex items-center gap-3"
          >
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search rakhis, vastra, kundan, bindi…"
              className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
              maxLength={80}
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {open && (
        <div className="lg:hidden border-t border-border bg-ivory">
          <nav className="flex flex-col px-6 py-4 gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="py-3 text-base border-b border-border/60 last:border-0"
              >
                {n.label}
              </Link>
            ))}
            <Link to="/wishlist" className="py-3 text-base border-b border-border/60">
              Wishlist ({wishCount})
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="my-2 p-3.5 rounded-xl bg-neutral-900 text-amber-300 border border-amber-500/30 flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white">Admin Management Console</div>
                    <div className="text-[11px] text-neutral-400">
                      Products, Orders, Customers & Settings
                    </div>
                  </div>
                </div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                  Open
                </span>
              </Link>
            )}
            <Link
              to={user ? (isAdmin ? "/admin" : "/account") : "/login"}
              onClick={() => setOpen(false)}
              className="py-3 text-base border-b border-border/60 flex items-center justify-between"
            >
              <span>{user ? (isAdmin ? "Admin Portal" : "My Account") : "Sign In / Register"}</span>
              {user && (
                <span className="text-xs text-primary font-medium">
                  {isAdmin ? "Administrator" : "Logged In"}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setSearchOpen(true);
              }}
              className="py-3 text-base text-left border-b border-border/60"
            >
              Search
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
