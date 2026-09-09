import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/site/product-card";
import { type SortKey } from "@/lib/products";
import { useLiveCategories, useLiveProducts } from "@/hooks/use-products";
import { trackViewItemList, trackSearch } from "@/lib/analytics";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  sort: fallback(z.string(), "featured").default("featured"),
});

export const Route = createFileRoute("/shop/")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Shop All — Ambika Traders" },
      {
        name: "description",
        content:
          "Browse the full Ambika Traders collection — rakhi, Krishna vastra, jewellery and festive beauty.",
      },
      { property: "og:title", content: "Shop All — Ambika Traders" },
      { property: "og:description", content: "Browse the full Ambika Traders collection." },
    ],
  }),
  component: ShopAll,
});

function ShopAll() {
  const { q, sort } = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const validSorts: SortKey[] = ["featured", "price-asc", "price-desc", "rating"];
  const activeSort: SortKey = validSorts.includes(sort as SortKey) ? (sort as SortKey) : "featured";

  const { data: categories } = useLiveCategories();
  const { data: items } = useLiveProducts({
    search: q || undefined,
    sort: activeSort,
  });

  useEffect(() => {
    if (items && items.length > 0) {
      trackViewItemList(
        items.map((p) => ({ slug: p.slug, title: p.title, price: p.price, category: p.category })),
      );
    }
  }, [items]);

  useEffect(() => {
    if (q) trackSearch(q, items?.length);
  }, [q, items]);

  return (
    <>
      {/* SHOP ALL HERO BANNER */}
      <section className="relative grain overflow-hidden border-b border-border/80 bg-parchment/30 py-12 lg:py-16">
        <div className="relative z-10 mx-auto max-w-[1400px] px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-peacock/20 bg-ivory/80 px-3.5 py-1 text-xs text-peacock backdrop-blur-xs mb-3 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span className="font-medium tracking-wide uppercase">The Full Atelier Edit</span>
            </div>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl leading-[0.96] tracking-[-0.03em]">
              Shop Everything
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Every handcrafted piece, across all four sacred worlds. Search, sort, or filter by
              category.
            </p>
          </motion.div>

          {/* SEARCH & SORT BAR */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                defaultValue={q}
                placeholder="Search by name, motif, or material…"
                onChange={(e) => {
                  const val = e.currentTarget.value;
                  navigate({
                    search: (prev: { q: string; sort: string }) => ({ ...prev, q: val }),
                    replace: true,
                  });
                }}
                className="w-full bg-ivory/95 border border-border/80 rounded-full pl-11 pr-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-peacock/30 focus:border-peacock shadow-xs"
                maxLength={80}
              />
            </div>

            <select
              value={activeSort}
              onChange={(e) => {
                const val = e.target.value;
                navigate({
                  search: (prev: { q: string; sort: string }) => ({ ...prev, sort: val }),
                  replace: true,
                });
              }}
              className="bg-ivory/95 border border-border/80 rounded-full px-5 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-peacock/30 focus:border-peacock shadow-xs cursor-pointer"
            >
              <option value="featured">Featured Edit</option>
              <option value="price-asc">Price · Low to High</option>
              <option value="price-desc">Price · High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </section>

      {/* CATEGORY NAV BAR */}
      <div className="border-b border-border bg-ivory/60 backdrop-blur-xs sticky top-16 z-30">
        <div className="mx-auto max-w-[1400px] px-6 py-3.5 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-peacock text-ivory shadow-xs border border-peacock">
              All
            </span>
            {categories?.map((c) => (
              <Link
                key={c.slug}
                to="/shop/$category"
                params={{ category: c.slug }}
                className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-border/70 text-muted-foreground hover:text-foreground hover:bg-parchment/60 transition-all"
              >
                {c.name}
              </Link>
            ))}
          </div>

          <span className="text-xs font-medium text-muted-foreground tracking-wide">
            {items?.length ?? 0} {(items?.length ?? 0) === 1 ? "piece" : "pieces"}
          </span>
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <section className="mx-auto max-w-[1400px] px-6 py-12 lg:py-20">
        {!items || items.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-2xl">No matching pieces</p>
            <p className="mt-2 text-muted-foreground text-sm">
              Try adjusting your search terms or clearing filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 gap-y-10 sm:gap-y-12">
            {items?.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
