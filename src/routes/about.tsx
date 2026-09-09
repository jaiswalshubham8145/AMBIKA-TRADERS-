import { createFileRoute, Link } from "@tanstack/react-router";
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
          className="inline-flex items-center gap-2 bg-peacock text-ivory px-7 py-3 rounded-full text-sm"
        >
          Explore the collection
        </Link>
      </section>
    </>
  );
}
