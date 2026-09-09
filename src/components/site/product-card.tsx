import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/products";
import { inr } from "@/lib/products";
import { useWishlist } from "@/lib/wishlist";
import { Heart, Truck } from "lucide-react";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const wished = useWishlist((s) => s.slugs.includes(product.slug));
  const toggle = useWishlist((s) => s.toggle);
  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group block"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-parchment">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/product-peacock-crimson.jpg";
          }}
        />
        {product.compareAt && (
          <span className="absolute top-3 left-3 bg-ivory/90 backdrop-blur-sm text-[10px] tracking-[0.2em] uppercase px-2 py-1 text-rose">
            Save {inr(product.compareAt - product.price)}
          </span>
        )}
        <button
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product.slug);
          }}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-ivory/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-ivory transition-colors"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${wished ? "fill-rose text-rose" : "text-foreground"}`}
          />
        </button>
        {typeof product.stock === "number" && product.stock <= 10 && product.stock > 0 && (
          <span className="absolute bottom-3 left-3 bg-foreground/90 text-ivory backdrop-blur-sm text-[10px] tracking-[0.2em] uppercase px-2 py-1">
            Only {product.stock} left
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg leading-tight group-hover:text-peacock transition-colors">
          {product.title}
        </h3>
        <div className="text-sm tabular-nums shrink-0">
          <span className="font-medium">{inr(product.price)}</span>
          {product.compareAt && (
            <span className="ml-2 text-muted-foreground line-through text-xs">
              {inr(product.compareAt)}
            </span>
          )}
        </div>
      </div>
      {product.price >= 999 && (
        <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase text-peacock">
          <Truck className="h-3 w-3" />
          Free Shipping
        </span>
      )}
      {product.motif && (
        <p className="mt-1 text-xs text-muted-foreground tracking-wide">{product.motif} motif</p>
      )}
    </Link>
  );
}
