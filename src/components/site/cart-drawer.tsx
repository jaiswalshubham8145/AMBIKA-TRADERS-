import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { cartSubtotal, useCart } from "@/lib/cart";
import { inr } from "@/lib/products";
import { useEffect } from "react";

export function CartDrawer() {
  const { isOpen, close, lines, setQty, remove } = useCart();
  const subtotal = cartSubtotal(lines);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-full sm:w-[440px] bg-ivory border-l border-border shadow-2xl transition-transform duration-500 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <p className="eyebrow">Your bag</p>
            <h3 className="font-display text-xl mt-1">
              {lines.length} {lines.length === 1 ? "piece" : "pieces"}
            </h3>
          </div>
          <button
            onClick={close}
            className="h-9 w-9 rounded-full hover:bg-parchment flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {lines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-6 text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-parchment flex items-center justify-center text-2xl">
                ✨
              </div>
              <p className="font-display text-2xl">Your bag is empty</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Start your festive edit — every order arrives in our signature gold-foil box.
              </p>
              <Link
                to="/shop"
                onClick={close}
                className="mt-2 inline-flex items-center justify-center bg-peacock text-ivory px-6 py-3 rounded-full text-sm tracking-wide hover:bg-peacock-deep transition-colors"
              >
                Discover the collection
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {lines.map((l) => (
                <li key={l.slug} className="flex gap-4 p-6">
                  <img src={l.image} alt={l.title} className="h-24 w-20 object-cover rounded-sm" />
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="font-display text-base leading-tight">{l.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{inr(l.price)}</p>
                      </div>
                      <button
                        onClick={() => remove(l.slug)}
                        aria-label="Remove"
                        className="text-muted-foreground hover:text-rose"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {l.giftMessage && (
                      <p className="text-xs italic text-peacock mt-2 line-clamp-2">
                        “{l.giftMessage}”
                      </p>
                    )}
                    <div className="mt-auto flex items-center gap-3">
                      <button
                        onClick={() => setQty(l.slug, l.qty - 1)}
                        className="h-7 w-7 border border-border rounded-full flex items-center justify-center hover:bg-parchment"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm tabular-nums w-6 text-center">{l.qty}</span>
                      <button
                        onClick={() => setQty(l.slug, l.qty + 1)}
                        className="h-7 w-7 border border-border rounded-full flex items-center justify-center hover:bg-parchment"
                        aria-label="Increase"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-border px-6 py-5 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">{inr(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Shipping and gift-wrap calculated at checkout.
            </p>
            <Link
              to="/checkout"
              onClick={close}
              className="block text-center bg-peacock text-ivory py-4 rounded-full tracking-wider text-sm hover:bg-peacock-deep transition-colors"
            >
              Checkout · {inr(subtotal)}
            </Link>
            <Link
              to="/cart"
              onClick={close}
              className="block text-center text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              View full bag
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
