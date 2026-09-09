import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Ambika Traders" },
      {
        name: "description",
        content: "Terms of service governing your use of the Ambika Traders website and store.",
      },
      { property: "og:title", content: "Terms of Service — Ambika Traders" },
      { property: "og:description", content: "Terms of using our website and store." },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-3 font-display text-5xl lg:text-6xl">Terms of Service</h1>
      <p className="mt-4 text-sm text-muted-foreground">Last updated: July 2026</p>

      <div className="mt-14 space-y-10 text-[15px] leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-2xl mb-3 text-foreground">Using the site</h2>
          <p>
            By using ambikatraders.com you agree to these terms. Please don't scrape, disrupt or
            misuse the site or attempt to access accounts that aren't yours.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl mb-3 text-foreground">Orders &amp; pricing</h2>
          <p>
            All prices are in INR and inclusive of applicable taxes unless stated. We reserve the
            right to correct pricing errors and to refuse or cancel orders in exceptional cases
            (stock, suspected fraud, delivery restrictions).
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl mb-3 text-foreground">Product images</h2>
          <p>
            Each piece is hand-finished, so slight variations from photographs are natural and part
            of the craft.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl mb-3 text-foreground">Intellectual property</h2>
          <p>
            All content, imagery and designs on this site are the property of Ambika Traders and
            may not be reproduced without permission.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl mb-3 text-foreground">Governing law</h2>
          <p>
            These terms are governed by the laws of India. Disputes are subject to the exclusive
            jurisdiction of the courts of Mumbai.
          </p>
        </section>
      </div>
    </article>
  );
}
