import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { Minus, Plus, Trash2, ArrowRight, Truck, Loader2 } from "lucide-react";
import { cartSubtotal, useCart } from "@/lib/cart";
import { inr } from "@/lib/products";
import { calculateShipping, type ShippingResult } from "@/lib/shipping";
import { trackRemoveFromCart, trackAddToCart } from "@/lib/analytics";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your bag — Ambika Traders" },
      { name: "description", content: "Review your festive selection." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, setQty, remove } = useCart();
  const subtotal = cartSubtotal(lines);

  const handleRemove = (slug: string) => {
    const line = lines.find((l) => l.slug === slug);
    if (line)
      trackRemoveFromCart(
        { slug: line.slug, title: line.title, price: line.price },
        line.qty,
        line.price * line.qty,
      );
    remove(slug);
  };

  const handleSetQty = (slug: string, qty: number) => {
    const line = lines.find((l) => l.slug === slug);
    if (!line) return;
    if (qty > line.qty) {
      trackAddToCart(
        { slug: line.slug, title: line.title, price: line.price },
        qty - line.qty,
        line.price * (qty - line.qty),
      );
    } else if (qty < line.qty) {
      trackRemoveFromCart(
        { slug: line.slug, title: line.title, price: line.price },
        line.qty - qty,
        line.price * (line.qty - qty),
      );
    }
    setQty(slug, qty);
  };

  // Pincode shipping check
  const [pincode, setPincode] = useState("");
  const [shippingResult, setShippingResult] = useState<ShippingResult | null>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const handlePincodeCheck = useCallback(async () => {
    if (pincode.length !== 6) return;
    setPincodeLoading(true);
    try {
      const result = await calculateShipping(pincode, subtotal);
      setShippingResult(result);
    } catch {
      setShippingResult(null);
    } finally {
      setPincodeLoading(false);
    }
  }, [pincode, subtotal]);

  const ship = shippingResult?.isServiceable ? shippingResult.fee : 0;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-24">
      <header className="mb-12">
        <p className="eyebrow">Your selection</p>
        <h1 className="mt-3 font-display text-5xl lg:text-6xl">The bag</h1>
      </header>

      {lines.length === 0 ? (
        <div className="text-center py-20 border-t border-border">
          <p className="font-display text-3xl">Your bag is quiet.</p>
          <p className="mt-3 text-muted-foreground">Let's change that.</p>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 bg-peacock text-ivory px-7 py-3 rounded-full text-sm"
          >
            Browse the collection <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 border-t border-border">
            {lines.map((l) => (
              <div key={l.slug} className="flex gap-6 py-6 border-b border-border">
                <img src={l.image} alt={l.title} className="h-32 w-28 object-cover" />
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between gap-4">
                    <Link
                      to="/product/$slug"
                      params={{ slug: l.slug }}
                      className="font-display text-xl hover:text-peacock"
                    >
                      {l.title}
                    </Link>
                    <span className="font-medium tabular-nums">{inr(l.price * l.qty)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{inr(l.price)} each</p>
                  {l.giftMessage && (
                    <p className="text-xs italic text-peacock mt-2 max-w-md">“{l.giftMessage}”</p>
                  )}
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-border rounded-full">
                      <button
                        onClick={() => handleSetQty(l.slug, l.qty - 1)}
                        className="h-9 w-9 flex items-center justify-center hover:bg-parchment rounded-l-full"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm tabular-nums">{l.qty}</span>
                      <button
                        onClick={() => handleSetQty(l.slug, l.qty + 1)}
                        className="h-9 w-9 flex items-center justify-center hover:bg-parchment rounded-r-full"
                        aria-label="Increase"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(l.slug)}
                      className="text-sm text-muted-foreground hover:text-rose flex items-center gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="lg:sticky lg:top-24 self-start bg-parchment/50 p-8 rounded-sm border border-border">
            <p className="eyebrow mb-4">Summary</p>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{inr(subtotal)}</dd>
              </div>

              {/* Pincode Delivery Check */}
              {subtotal > 0 && (
                <div className="pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground block mb-2">Check delivery</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setPincode(val);
                        if (val.length < 6) setShippingResult(null);
                      }}
                      placeholder="6-digit pincode"
                      className="flex-1 bg-ivory border border-border rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-peacock"
                    />
                    <button
                      onClick={handlePincodeCheck}
                      disabled={pincode.length !== 6 || pincodeLoading}
                      className="px-3 py-2 bg-foreground text-ivory rounded-md text-xs font-semibold hover:bg-peacock-deep transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {pincodeLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Check"}
                    </button>
                  </div>

                  {shippingResult && (
                    <div className="mt-2.5 text-xs space-y-1.5">
                      {shippingResult.isServiceable ? (
                        <>
                          <div className="flex items-center gap-1.5 text-peacock font-medium">
                            <Truck className="h-3.5 w-3.5" />
                            <span>
                              {shippingResult.freeShipping
                                ? "Free shipping"
                                : `Shipping: ${inr(shippingResult.fee)}`}
                            </span>
                          </div>
                          <p className="text-muted-foreground">
                            Est. {shippingResult.estimatedDays.min}–
                            {shippingResult.estimatedDays.max} business days
                          </p>
                          {!shippingResult.freeShipping &&
                            shippingResult.remainingForFreeShipping > 0 && (
                              <p className="text-muted-foreground">
                                Add {inr(shippingResult.remainingForFreeShipping)} more for free
                                shipping
                              </p>
                            )}
                        </>
                      ) : (
                        <p className="text-rose font-medium">
                          Delivery not available to this pincode
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="tabular-nums">{ship === 0 ? "Free" : inr(ship)}</dd>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-display text-lg">
                <dt>Total</dt>
                <dd className="tabular-nums">{inr(subtotal + ship)}</dd>
              </div>
            </dl>
            <Link
              to="/checkout"
              className="mt-6 block text-center bg-peacock text-ivory py-4 rounded-full text-sm tracking-wider hover:bg-peacock-deep transition-colors"
            >
              Proceed to checkout
            </Link>
            <p className="mt-3 text-xs text-muted-foreground text-center">
              Secure payment · COD available
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
