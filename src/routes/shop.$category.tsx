import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/product-card";
import { useLiveCategories, useLiveProducts } from "@/hooks/use-products";

export const Route = createFileRoute("/shop/$category")({
  head: () => ({
    meta: [
      { title: "Category — Ambika Traders" },
      { name: "description", content: "Browse our curated collection." },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Category not found</h1>
      <Link to="/shop" className="mt-6 inline-block underline">
        Browse all
      </Link>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useParams();
  const { data: allCategories } = useLiveCategories();
  const currentCat = allCategories?.find((c) => c.slug === category);
  const { data: items } = useLiveProducts({ category });

  return (
    <>
      {/* Category hero */}
      <section className="relative grain overflow-hidden border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow">{currentCat?.tagline}</p>
            <h1 className="mt-4 font-display text-5xl lg:text-8xl leading-[0.92] tracking-[-0.03em]">
              {currentCat?.name ?? category}
            </h1>
            <p className="mt-6 max-w-xl text-muted-foreground leading-relaxed">
              {currentCat?.description}
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] overflow-hidden">
              {currentCat?.image && (
                <img
                  src={currentCat.image}
                  alt={currentCat.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sub-nav */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-4 flex flex-wrap gap-2 items-center">
          <Link
            to="/shop"
            className="px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground"
          >
            All
          </Link>
          {allCategories?.map((c) => (
            <Link
              key={c.slug}
              to="/shop/$category"
              params={{ category: c.slug }}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                c.slug === category
                  ? "bg-foreground text-ivory"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.name}
            </Link>
          ))}
          <span className="ml-auto text-sm text-muted-foreground">{items?.length ?? 0} pieces</span>
        </div>
      </div>

      {/* Grid */}
      <section className="mx-auto max-w-[1400px] px-6 py-16">
        {!items || items.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">New pieces arriving soon.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {items.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
