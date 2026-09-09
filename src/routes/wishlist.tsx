import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/product-card";
import { products } from "@/lib/products";
import { useWishlist } from "@/lib/wishlist";
import { trackShare } from "@/lib/analytics";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Ambika Traders" },
      { name: "description", content: "Your saved festive pieces from Ambika Traders." },
      { property: "og:title", content: "Wishlist — Ambika Traders" },
      { property: "og:description", content: "Your saved festive pieces." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const slugs = useWishlist((s) => s.slugs);
  const clear = useWishlist((s) => s.clear);
  const items = products.filter((p) => slugs.includes(p.slug));

  const handleShare = () => {
    const url = `${window.location.origin}/wishlist?shared=${slugs.join(",")}`;
    navigator.clipboard.writeText(url);
    trackShare("wishlist", slugs.join(","), "clipboard");
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16 lg:py-24">
      <header className="mb-12 flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="eyebrow">Saved for later</p>
          <h1 className="mt-3 font-display text-5xl lg:text-6xl">Wishlist</h1>
        </div>
        {items.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="text-sm underline underline-offset-4 text-muted-foreground hover:text-peacock"
            >
              Copy share link
            </button>
            <button
              onClick={clear}
              className="text-sm underline underline-offset-4 text-muted-foreground hover:text-rose"
            >
              Clear wishlist
            </button>
          </div>
        )}
      </header>

      {items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-2xl">Nothing saved yet</p>
          <p className="mt-2 text-muted-foreground text-sm">
            Tap the heart on any piece to save it here.
          </p>
          <Link to="/shop" className="mt-6 inline-block underline underline-offset-4">
            Browse the collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {items.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
