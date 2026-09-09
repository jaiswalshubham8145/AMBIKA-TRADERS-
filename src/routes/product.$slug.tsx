import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Gift, Minus, Plus, Star, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { inr } from "@/lib/products";
import { useLiveProduct, useLiveProducts } from "@/hooks/use-products";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/site/product-card";
import { fetchTestimonials, type Testimonial } from "@/lib/testimonials";
import { trackViewItem, trackAddToCart } from "@/lib/analytics";

export const Route = createFileRoute("/product/$slug")({
  head: () => ({
    meta: [
      { title: "Product — Ambika Traders" },
      { name: "description", content: "View product details." },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Product not found</h1>
      <Link to="/shop" className="mt-6 inline-block underline">
        Back to shop
      </Link>
    </div>
  ),
  component: PDP,
});

function PDP() {
  const { slug } = Route.useParams();
  const { data: product } = useLiveProduct(slug);
  const { data: relatedProducts } = useLiveProducts({ category: product?.category });
  const related = relatedProducts?.filter((p) => p.slug !== slug).slice(0, 3) ?? [];
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [gift, setGift] = useState(false);
  const [message, setMessage] = useState("");
  const [reviews, setReviews] = useState<Testimonial[]>([]);

  useEffect(() => {
    if (product) {
      fetchTestimonials({ productSlug: product.slug, limit: 10 }).then(setReviews);
      trackViewItem({
        slug: product.slug,
        title: product.title,
        price: product.price,
        category: product.category,
      });
    }
  }, [product]);

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="font-display text-4xl">Product not found</h1>
        <Link to="/shop" className="mt-6 inline-block underline">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-6 pt-8 pb-20 grid lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Gallery */}
        <div>
          <div className="aspect-[4/5] overflow-hidden bg-parchment">
            <img
              src={product.image}
              alt={product.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/product-peacock-crimson.jpg";
              }}
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square overflow-hidden bg-parchment opacity-80 hover:opacity-100 transition-opacity"
              >
                <img
                  src={product.image}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/product-peacock-crimson.jpg";
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="lg:pt-8 lg:sticky lg:top-24 self-start">
          <nav className="text-xs text-muted-foreground mb-4">
            <Link to="/shop" className="hover:text-foreground">
              Shop
            </Link>{" "}
            ·{" "}
            <Link
              to="/shop/$category"
              params={{ category: product.category }}
              className="hover:text-foreground capitalize"
            >
              {product.category.replace("-", " ")}
            </Link>
          </nav>
          <h1 className="font-display text-4xl lg:text-5xl leading-tight">{product.title}</h1>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              <span className="font-medium">{product.rating}</span>
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{product.reviews} reviews</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-3xl">{inr(product.price)}</span>
            {product.compareAt && (
              <>
                <span className="text-muted-foreground line-through">{inr(product.compareAt)}</span>
                <span className="text-rose text-sm">
                  Save {inr(product.compareAt - product.price)}
                </span>
              </>
            )}
          </div>

          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>

          {product.included && (
            <div className="mt-6">
              <p className="eyebrow mb-3">What's included</p>
              <ul className="space-y-1.5 text-sm">
                {product.included.map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-peacock" /> {i}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gift flow */}
          <div className="mt-8 border border-border rounded-sm">
            <button
              onClick={() => setGift((g) => !g)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-parchment/50 transition-colors"
            >
              <span className="flex items-center gap-3">
                <Gift className="h-4 w-4 text-peacock" />
                <span className="font-medium">Gift this</span>
                <span className="text-xs text-muted-foreground">Add a message · free wrap</span>
              </span>
              <span className="text-xl leading-none">{gift ? "−" : "+"}</span>
            </button>
            {gift && (
              <div className="px-5 pb-5 border-t border-border">
                <label className="block text-xs eyebrow mt-4 mb-2">Gift message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="To my brother, the one constant…"
                  maxLength={200}
                  rows={3}
                  className="w-full bg-ivory border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-peacock"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">{message.length}/200</p>
              </div>
            )}
          </div>

          {/* Qty + CTA */}
          <div className="mt-8 flex items-stretch gap-3">
            <div className="flex items-center border border-border rounded-full">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-12 w-12 flex items-center justify-center hover:bg-parchment rounded-l-full"
                aria-label="Decrease"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center tabular-nums text-sm">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="h-12 w-12 flex items-center justify-center hover:bg-parchment rounded-r-full"
                aria-label="Increase"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={() => {
                add(product, qty, gift ? message : undefined);
                trackAddToCart(
                  {
                    slug: product.slug,
                    title: product.title,
                    price: product.price,
                    category: product.category,
                  },
                  qty,
                  product.price * qty,
                );
              }}
              className="flex-1 bg-peacock text-ivory rounded-full tracking-wider text-sm hover:bg-peacock-deep transition-colors"
            >
              Add to bag — {inr(product.price * qty)}
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 text-xs text-muted-foreground">
            <div className="flex flex-col gap-1.5">
              <Truck className="h-4 w-4 text-peacock" /> Free ship ₹999+
            </div>
            <div className="flex flex-col gap-1.5">
              <ShieldCheck className="h-4 w-4 text-peacock" /> Quality promise
            </div>
            <div className="flex flex-col gap-1.5">
              <Gift className="h-4 w-4 text-peacock" /> Gift-ready
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-[1400px] px-6 py-16 lg:py-24">
            <h2 className="font-display text-3xl lg:text-4xl mb-10">You may also love</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {related.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Customer Reviews */}
      {reviews.length > 0 && (
        <section className="border-t border-border bg-parchment/30">
          <div className="mx-auto max-w-[1400px] px-6 py-16 lg:py-24">
            <h2 className="font-display text-3xl lg:text-4xl mb-10">Customer Reviews</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-card border border-border rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    "{review.review_text}"
                  </p>
                  <div>
                    <span className="font-semibold text-sm block">{review.customer_name}</span>
                    {review.location && (
                      <span className="text-xs text-muted-foreground">{review.location}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
