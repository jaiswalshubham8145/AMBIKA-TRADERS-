import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Ambika Traders" },
      {
        name: "description",
        content: "How Ambika Traders collects, uses and protects your personal information.",
      },
      { property: "og:title", content: "Privacy Policy — Ambika Traders" },
      { property: "og:description", content: "How we handle your data." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-3 font-display text-5xl lg:text-6xl">Privacy Policy</h1>
      <p className="mt-4 text-sm text-muted-foreground">Last updated: July 2026</p>

      <div className="mt-14 space-y-10 text-[15px] leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-2xl mb-3 text-foreground">What we collect</h2>
          <p>
            When you place an order or contact us, we collect your name, email, phone number,
            shipping address and payment reference. We also collect basic usage information (device,
            IP, pages viewed) to keep the site performing.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl mb-3 text-foreground">How we use it</h2>
          <p>
            To process and ship your order, respond to enquiries, prevent fraud, improve the site
            and — only if you opt in — send festive drops and gifting inspiration.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl mb-3 text-foreground">Who we share it with</h2>
          <p>
            Only with the partners we need to serve you: our payment processor, our shipping partner
            and email service. We never sell your data.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl mb-3 text-foreground">Your choices</h2>
          <p>
            Ask us to see, correct or delete your data any time at{" "}
            <a className="text-peacock underline" href="mailto:adornaura19@gmail.com">
              adornaura19@gmail.com
            </a>
            . You can also unsubscribe from marketing from any email we send.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl mb-3 text-foreground">Cookies</h2>
          <p>
            We use essential cookies to keep your cart and login working, plus a small amount of
            analytics to understand what people love.
          </p>
        </section>
      </div>
    </article>
  );
}
