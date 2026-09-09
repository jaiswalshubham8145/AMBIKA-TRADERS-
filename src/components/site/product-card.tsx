import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { Product } from "@/lib/products";
import { inr } from "@/lib/products";
import { useWishlist } from "@/lib/wishlist";
import { Heart, Truck } from "lucide-react";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const wished = useWishlist((s) => s.slugs.includes(product.slug));
  const toggle = useWishlist((s) => s.toggle);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 24,
        delay: Math.min(index * 0.06, 0.35),
      }}
      whileHover={{
        y: -6,
        scale: 1.018,
      }}
      whileTap={{
        scale: 0.985,
        y: -1,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative rounded-2xl transition-shadow duration-300 hover:shadow-[0_20px_35px_-10px_rgba(14,110,107,0.18),0_8px_16px_-4px_rgba(0,0,0,0.06)]"
    >
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-parchment/60">
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/product-peacock-crimson.jpg";
            }}
          />

          {/* 2.5D Specular Sheen Beam on Hover/Tap */}
          {isHovered && (
            <span
              className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
              aria-hidden="true"
            >
              <span className="absolute inset-0 -translate-x-full animate-sheen bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </span>
          )}

          {product.compareAt && (
            <span className="absolute top-3 left-3 bg-ivory/95 backdrop-blur-sm text-[10px] font-semibold tracking-[0.2em] uppercase px-2.5 py-1 text-rose border border-border/50 shadow-xs">
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
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-ivory/90 backdrop-blur-sm border border-border/70 flex items-center justify-center hover:bg-ivory hover:scale-110 active:scale-95 transition-all shadow-xs z-10"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                wished ? "fill-rose text-rose" : "text-foreground"
              }`}
            />
          </button>

          {typeof product.stock === "number" && product.stock <= 10 && product.stock > 0 && (
            <span className="absolute bottom-3 left-3 bg-foreground/90 text-ivory backdrop-blur-sm text-[10px] tracking-[0.2em] uppercase px-2 py-1">
              Only {product.stock} left
            </span>
          )}
        </div>

        <div className="mt-3.5 px-1 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-base sm:text-lg leading-tight group-hover:text-peacock transition-colors">
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

        <div className="px-1 flex items-center justify-between mt-1">
          {product.price >= 999 ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase text-peacock">
              <Truck className="h-3 w-3" />
              Free Shipping
            </span>
          ) : (
            <span />
          )}

          {product.motif && (
            <p className="text-xs text-muted-foreground tracking-wide">{product.motif} motif</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
