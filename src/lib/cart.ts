import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./products";
import { trackCartEvent } from "./cart-events";

export interface CartLine {
  slug: string;
  title: string;
  price: number;
  image: string;
  qty: number;
  giftMessage?: string;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  add: (p: Product, qty?: number, giftMessage?: string) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      add: (p, qty = 1, giftMessage) =>
        set((s) => {
          const existing = s.lines.find((l) => l.slug === p.slug);
          const newQty = existing ? existing.qty + qty : qty;
          const newTotal = s.lines.reduce((sum, l) => sum + l.price * l.qty, 0) + p.price * qty;
          trackCartEvent({
            eventType: "add",
            productSlug: p.slug,
            productTitle: p.title,
            productPrice: p.price,
            quantity: qty,
            cartValue: newTotal,
          });
          if (existing) {
            return {
              isOpen: true,
              lines: s.lines.map((l) =>
                l.slug === p.slug
                  ? { ...l, qty: l.qty + qty, giftMessage: giftMessage ?? l.giftMessage }
                  : l,
              ),
            };
          }
          return {
            isOpen: true,
            lines: [
              ...s.lines,
              { slug: p.slug, title: p.title, price: p.price, image: p.image, qty, giftMessage },
            ],
          };
        }),
      remove: (slug) =>
        set((s) => {
          const line = s.lines.find((l) => l.slug === slug);
          if (line) {
            trackCartEvent({
              eventType: "remove",
              productSlug: line.slug,
              productTitle: line.title,
              productPrice: line.price,
              quantity: line.qty,
              cartValue:
                s.lines.reduce((sum, l) => sum + l.price * l.qty, 0) - line.price * line.qty,
            });
          }
          return { lines: s.lines.filter((l) => l.slug !== slug) };
        }),
      setQty: (slug, qty) =>
        set((s) => ({
          lines: s.lines
            .map((l) => (l.slug === slug ? { ...l, qty: Math.max(0, qty) } : l))
            .filter((l) => l.qty > 0),
        })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    { name: "aa-cart", partialize: (s) => ({ lines: s.lines }) },
  ),
);

export const cartSubtotal = (lines: CartLine[]) =>
  lines.reduce((sum, l) => sum + l.price * l.qty, 0);
export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);
