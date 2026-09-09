import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect } from "react";
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
  const { data: items, isLoading } = useLiveProducts({
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
    <div className="mx-auto max-w-[1400px] px-6 py-16 lg:py-24">
      <header className="max-w-2xl mb-12">
        <p className="eyebrow">The full edit</p>
        <h1 className="mt-3 font-display text-5xl lg:text-7xl leading-[0.95]">Shop everything</h1>
        <p className="mt-6 text-muted-foreground">
          Every piece, across all four worlds. Search, sort, or filter by category.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="search"
          defaultValue={q}
          placeholder="Search the collection…"
          onChange={(e) => {
            const val = e.currentTarget.value;
            navigate({
              search: (prev: { q: string; sort: string }) => ({ ...prev, q: val }),
              replace: true,
            });
          }}
          className="flex-1 min-w-[220px] bg-ivory border border-border rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-peacock"
          maxLength={80}
        />
        <select
          value={activeSort}
          onChange={(e) => {
            const val = e.target.value;
            navigate({
              search: (prev: { q: string; sort: string }) => ({ ...prev, sort: val }),
              replace: true,
            });
          }}
          className="bg-ivory border border-border rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-peacock"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price · Low to high</option>
          <option value="price-desc">Price · High to low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>

      <nav className="flex flex-wrap gap-2 mb-12 border-b border-border pb-6">
        <span className="px-4 py-2 rounded-full bg-foreground text-ivory text-sm">All</span>
        {categories?.map((c) => (
          <Link
            key={c.slug}
            to="/shop/$category"
            params={{ category: c.slug }}
            className="px-4 py-2 rounded-full border border-border text-sm hover:bg-parchment transition-colors"
          >
            {c.name}
          </Link>
        ))}
        <span className="ml-auto text-sm text-muted-foreground self-center">
          {items?.length ?? 0} {(items?.length ?? 0) === 1 ? "piece" : "pieces"}
        </span>
      </nav>

      {!items || items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-2xl">No matches</p>
          <p className="mt-2 text-muted-foreground text-sm">
            Try a different search or browse a category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {items?.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
