import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Ambika Traders" },
      {
        name: "description",
        content:
          "Answers to common questions about orders, shipping, gifting, custom pieces and care.",
      },
      { property: "og:title", content: "FAQ — Ambika Traders" },
      { property: "og:description", content: "Answers to common questions." },
    ],
  }),
  component: Faq,
});

const faqs = [
  {
    q: "How soon will my rakhi arrive?",
    a: "Metro cities receive orders in 2–4 working days, rest of India in 4–7. Place Raksha Bandhan orders at least 10 days before the festival for peace of mind.",
  },
  {
    q: "Do you offer custom gifting?",
    a: "Yes. For 10+ pieces we curate customized boxes, gift tags and even engraving. Write to us at adornaura19@gmail.com with your brief.",
  },
  {
    q: "Are the stones real?",
    a: "Our exquisite stones are high-quality cubic zirconia — cut and set by hand to catch light like fine diamonds, at a fraction of the price.",
  },
  {
    q: "How do I care for my piece?",
    a: "Store your jewellery and rakhi in the keepsake box, away from moisture and perfume. Wipe gently with a soft cloth after wear.",
  },
  {
    q: "Can I add a gift message?",
    a: "Absolutely — every product page includes a gift-message field. We hand-write it on a tag and tuck it into the box.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, to most countries. Duties and taxes at destination are the buyer's responsibility.",
  },
  {
    q: "What is your return policy?",
    a: "Unused items in original packaging can be returned within 7 days. Personalized items are non-returnable. See Shipping & Returns for the full policy.",
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
      <p className="eyebrow">Answers</p>
      <h1 className="mt-3 font-display text-5xl lg:text-6xl">Frequently asked</h1>
      <p className="mt-6 text-muted-foreground">Everything else, in one place.</p>

      <div className="mt-12 border-t border-border">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className="border-b border-border">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-6 py-6 text-left"
              >
                <span className="font-display text-xl lg:text-2xl">{f.q}</span>
                {isOpen ? (
                  <Minus className="h-4 w-4 shrink-0 text-peacock" />
                ) : (
                  <Plus className="h-4 w-4 shrink-0 text-peacock" />
                )}
              </button>
              {isOpen && (
                <p className="pb-6 text-muted-foreground max-w-2xl leading-relaxed">{f.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}
