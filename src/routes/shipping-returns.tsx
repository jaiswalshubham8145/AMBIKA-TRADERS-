import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/shipping-returns")({
  head: () => ({
    meta: [
      { title: "Shipping & Returns — Ambika Traders" },
      {
        name: "description",
        content: "Shipping timelines, packaging, returns and exchange policy at Ambika Traders.",
      },
      { property: "og:title", content: "Shipping & Returns — Ambika Traders" },
      { property: "og:description", content: "How we ship, pack and handle returns." },
    ],
  }),
  component: ShippingReturns,
});

function ShippingReturns() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
      <p className="eyebrow">Policies</p>
      <h1 className="mt-3 font-display text-5xl lg:text-6xl">Shipping &amp; Returns</h1>
      <p className="mt-6 text-muted-foreground">
        Everything you need to know before your festive parcel arrives.
      </p>

      <div className="mt-14 space-y-12 text-[15px] leading-relaxed">
        <section>
          <h2 className="font-display text-2xl mb-3">Shipping timelines</h2>
          <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
            <li>Metro cities — 2 to 4 working days</li>
            <li>Rest of India — 4 to 7 working days</li>
            <li>International — 7 to 14 working days (duties may apply)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl mb-3">Shipping charges</h2>
          <p className="text-muted-foreground">
            Free shipping across India on orders above ₹999. Below that, a flat ₹99 applies.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl mb-3">Packaging</h2>
          <p className="text-muted-foreground">
            Every order ships in our signature gold-foil keepsake box, sealed and wrapped in tissue
            with a hand-written tag.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl mb-3">Returns &amp; exchanges</h2>
          <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
            <li>Unused items in original packaging can be returned within 7 days of delivery.</li>
            <li>
              Personalized or custom pieces (gift messages, name engraving) are non-returnable.
            </li>
            <li>
              Refunds are processed to the original payment method within 5–7 working days after
              inspection.
            </li>
            <li>Exchanges are honored subject to availability.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl mb-3">Damaged in transit?</h2>
          <p className="text-muted-foreground">
            Email us at{" "}
            <a className="text-peacock underline" href="mailto:adornaura19@gmail.com">
              adornaura19@gmail.com
            </a>{" "}
            within 48 hours of delivery with photos of the parcel and item.
          </p>
        </section>
      </div>
    </article>
  );
}
