import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/site/product-card";
import { useLiveCategories, useLiveProducts } from "@/hooks/use-products";

export const Route = createFileRoute("/shop/$category")({
  head: () => ({
    meta: [
      { title: "Category — Ambika Traders" },
      { name: "description", content: "Browse our curated festive collection." },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Category not found</h1>
      <Link to="/shop" className="mt-6 inline-block underline">
        Browse all collections
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
      {/* LUXURY CATEGORY HERO SECTION */}
      <section className="relative grain overflow-hidden border-b border-border/80 bg-parchment/30 py-12 lg:py-20">
        <div className="pointer-events-none absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-peacock/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-gold/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Text & Meta */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-peacock/20 bg-ivory/80 px-3.5 py-1 text-xs text-peacock backdrop-blur-xs mb-4 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span className="font-medium tracking-wide uppercase">
                {currentCat?.tagline ?? "Festive Atelier"}
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl leading-[0.96] tracking-[-0.03em]">
              {currentCat?.name ?? category}
            </h1>

            <p className="mt-5 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              {currentCat?.description}
            </p>

            <div className="mt-8 flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-peacock">
              <span>Handcrafted</span>
              <span>•</span>
              <span>Pan-India Delivery</span>
              <span>•</span>
              <span>Authentic Heirloom</span>
            </div>
          </motion.div>

          {/* Right Column: 2.5D Elevated Image Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden rounded-md border border-border/80 bg-parchment shadow-xl group">
              {currentCat?.image && (
                <img
                  src={currentCat.image}
                  alt={currentCat.name ?? category}
                  className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-ivory/90 backdrop-blur-md px-4 py-2.5 rounded-sm border border-border/60 shadow-xs text-xs">
                <span className="font-display text-sm font-medium text-foreground">
                  {currentCat?.name} Collection
                </span>
                <span className="text-muted-foreground font-semibold">
                  {items?.length ?? 0} {items?.length === 1 ? "Item" : "Items"}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FILTER & CATEGORY NAVIGATION BAR */}
      <div className="border-b border-border bg-ivory/60 backdrop-blur-xs sticky top-16 z-30">
        <div className="mx-auto max-w-[1400px] px-6 py-3.5 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/shop"
              className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-border/70 text-muted-foreground hover:text-foreground hover:bg-parchment transition-all"
            >
              All
            </Link>
            {allCategories?.map((c) => {
              const isActive = c.slug === category;
              return (
                <Link
                  key={c.slug}
                  to="/shop/$category"
                  params={{ category: c.slug }}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-peacock text-ivory shadow-xs border border-peacock"
                      : "border border-border/70 text-muted-foreground hover:text-foreground hover:bg-parchment/60"
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
          </div>

          <span className="text-xs font-medium text-muted-foreground tracking-wide">
            Showing {items?.length ?? 0} {(items?.length ?? 0) === 1 ? "piece" : "pieces"}
          </span>
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <section className="mx-auto max-w-[1400px] px-6 py-12 lg:py-20">
        {!items || items.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-2xl">New pieces arriving soon.</p>
            <p className="mt-2 text-muted-foreground text-sm">
              Our artisans are currently crafting new designs for this category.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 text-peacock font-medium underline"
            >
              Explore all collections <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 gap-y-10 sm:gap-y-12">
            {items.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
