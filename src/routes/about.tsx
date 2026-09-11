import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowUpRight } from "lucide-react";
import heroRakhi from "@/assets/hero-rakhi.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Ambika Traders" },
      {
        name: "description",
        content:
          "The story behind Ambika Traders — a small atelier crafting festive luxury, gifted with intention.",
      },
      { property: "og:title", content: "Our Story — Ambika Traders" },
      {
        property: "og:description",
        content: "A small atelier crafting festive luxury, gifted with intention.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="mx-auto max-w-[1100px] px-6 pt-20 pb-16 text-center">
        <p className="eyebrow">The house of Ambika Traders</p>
        <h1 className="mt-6 font-display text-5xl lg:text-7xl leading-[0.95]">
          A love letter to <em className="not-italic text-peacock">festive India.</em>
        </h1>
      </section>

      <div className="mx-auto max-w-[1100px] px-6 aspect-[16/9] overflow-hidden grain">
        <img src={heroRakhi} alt="" className="h-full w-full object-cover" />
      </div>

      <section className="mx-auto max-w-[720px] px-6 py-20 space-y-8 text-lg leading-relaxed text-muted-foreground">
        <p>
          Ambika Traders began with a single peacock rakhi — hand-set with exquisite stones, packed
          in a gold-foil box — and a quiet conviction that the bond between siblings, between a
          devotee and her Krishna, between a mother and her daughter, deserves more than a token.
        </p>
        <p>
          We are a small atelier, not a marketplace. We make fewer pieces, finish them better, and
          pack them like a love letter. Every rakhi, every vastra, every necklace is a small
          ceremony.
        </p>
        <p className="font-display text-foreground text-2xl">
          Because every bond deserves a touch of luxury.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-peacock text-ivory px-7 py-3 rounded-full text-sm hover:bg-peacock-deep transition-colors"
        >
          Explore the collection
        </Link>
      </section>

      {/* Editorial Chapter: The Architect & Artificer of the House */}
      <section className="mx-auto max-w-[840px] px-6 pb-24">
        <div className="relative rounded-3xl border border-gold/40 bg-parchment/40 p-8 sm:p-12 backdrop-blur-md overflow-hidden shadow-lg">
          <div className="pointer-events-none absolute -right-8 -bottom-10 opacity-5 select-none font-display text-[180px] font-bold text-peacock leading-none">
            SJ
          </div>
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-gold/50 bg-gold/10 text-peacock text-xs font-semibold uppercase tracking-[0.25em]">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              The Digital Atelier
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-foreground font-normal">
              The Architect of the House
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Beyond the threads, gemstones, and heirloom silks lies the digital ether orchestrating
              your experience. Conceived, architected, and engineered by{" "}
              <strong className="text-foreground font-semibold">Shubham Jaiswal</strong> — an
              artificer weaving architecture and intelligence into creations that breathe with quiet
              grandeur.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/maker"
                className="inline-flex items-center gap-2.5 bg-peacock text-ivory px-6 py-3 rounded-full text-sm font-medium hover:bg-peacock-deep transition-colors shadow-md group"
              >
                <span>Discover the Maker&apos;s Testament</span>
                <ArrowUpRight className="w-4 h-4 text-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
