import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border bg-parchment/40">
      <div className="mx-auto max-w-[1400px] px-6 py-20 grid gap-12 lg:grid-cols-4">
        <div className="lg:col-span-2 max-w-md">
          <h3 className="font-display text-3xl">
            Ambika <span className="text-peacock">Traders</span>
          </h3>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Hand-crafted festive luxury — exquisite rakhis, Krishna vastra, heirloom jewellery and
            curated beauty. Made in India, gifted with intention.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const input = form.elements.namedItem("email") as HTMLInputElement;
              if (input.value && input.checkValidity()) {
                form.reset();
                const el = form.querySelector("[data-toast]") as HTMLElement | null;
                if (el) {
                  el.textContent = "Thank you — welcome to the atelier.";
                  el.hidden = false;
                }
              }
            }}
            className="mt-6"
          >
            <p className="eyebrow mb-3">Join the atelier</p>
            <div className="flex gap-2 max-w-sm">
              <input
                name="email"
                type="email"
                required
                maxLength={120}
                placeholder="you@email.com"
                className="flex-1 bg-ivory border border-border rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-peacock"
              />
              <button
                type="submit"
                className="bg-foreground text-ivory px-5 py-2.5 rounded-sm text-sm hover:bg-peacock transition-colors"
              >
                Join
              </button>
            </div>
            <p data-toast hidden className="mt-2 text-xs text-peacock" />
          </form>
          <a
            href="https://www.instagram.com/ambika_rakhi?igsh=MW4yaHF0YXR2enBzdQ=="
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm text-foreground hover:text-peacock transition-colors"
          >
            <Instagram className="h-4 w-4" /> @ambika_rakhi
          </a>
        </div>

        <div>
          <p className="eyebrow mb-4">Shop</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/shop/$category"
                params={{ category: "rakhi" }}
                className="hover:text-peacock"
              >
                Rakhi
              </Link>
            </li>
            <li>
              <Link
                to="/shop/$category"
                params={{ category: "krishna-vastra" }}
                className="hover:text-peacock"
              >
                Krishna Vastra
              </Link>
            </li>
            <li>
              <Link
                to="/shop/$category"
                params={{ category: "jewellery" }}
                className="hover:text-peacock"
              >
                Jewellery
              </Link>
            </li>
            <li>
              <Link
                to="/shop/$category"
                params={{ category: "makeup" }}
                className="hover:text-peacock"
              >
                Makeup
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-peacock">
                Wishlist
              </Link>
            </li>
            <li>
              <Link to="/maker" className="hover:text-peacock flex items-center gap-1.5">
                The Maker
                <span className="text-[9px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-peacock/10 text-peacock font-medium">
                  Artificer
                </span>
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Help</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/about" className="hover:text-peacock">
                Our Story
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-peacock">
                Journal
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-peacock">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/shipping-returns" className="hover:text-peacock">
                Shipping &amp; Returns
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-peacock">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/gift-cards" className="hover:text-peacock">
                Gift Cards
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-peacock">
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-peacock">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Ambika Traders. All rights reserved.</p>
          <Link
            to="/maker"
            className="inline-flex items-center gap-1.5 text-foreground hover:text-peacock transition-colors group"
          >
            <span>Maker &amp; Developer:</span>
            <span className="font-semibold text-peacock underline-offset-4 group-hover:underline">
              Shubham Jaiswal
            </span>
            <span className="text-[10px] text-muted-foreground">· The Maker</span>
          </Link>
          <p>Crafted in India · Shipped with love</p>
        </div>
      </div>
    </footer>
  );
}
