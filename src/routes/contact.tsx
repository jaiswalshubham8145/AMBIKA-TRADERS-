import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Mail, Phone, MapPin, Check } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Ambika Traders" },
      {
        name: "description",
        content: "Reach the Ambika Traders atelier — for orders, gifting, custom pieces and press.",
      },
      { property: "og:title", content: "Contact — Ambika Traders" },
      { property: "og:description", content: "Reach the Ambika Traders atelier." },
    ],
  }),
  component: ContactPage,
});

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(160),
  subject: z.string().trim().min(2, "Add a short subject").max(120),
  message: z.string().trim().min(10, "Tell us a little more").max(1200),
});

type Errors = Partial<Record<keyof z.infer<typeof contactSchema>, string>>;

function ContactPage() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = contactSchema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      subject: fd.get("subject"),
      message: fd.get("message"),
    });
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof Errors;
        if (!errs[k]) errs[k] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-24 grid lg:grid-cols-12 gap-12">
      <header className="lg:col-span-5">
        <p className="eyebrow">Say hello</p>
        <h1 className="mt-3 font-display text-5xl lg:text-6xl leading-[0.95]">
          Let's talk about
          <br />
          <span className="text-peacock italic">your gift.</span>
        </h1>
        <p className="mt-6 text-muted-foreground max-w-md">
          For orders, custom pieces, bulk gifting, press or wholesale — leave a note and our atelier
          will reply within one working day.
        </p>

        <ul className="mt-10 space-y-4 text-sm">
          <li className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-peacock" /> adornaura19@gmail.com
          </li>
          <li className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-peacock" /> +91 98765 43210
          </li>
          <li className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-peacock" /> Mumbai · India
          </li>
        </ul>
      </header>

      <section className="lg:col-span-7">
        {sent ? (
          <div className="bg-parchment/60 border border-border rounded-sm p-10 text-center">
            <div className="h-14 w-14 mx-auto rounded-full bg-peacock text-ivory flex items-center justify-center">
              <Check className="h-6 w-6" />
            </div>
            <h2 className="mt-6 font-display text-3xl">Message sent</h2>
            <p className="mt-3 text-muted-foreground">We'll be in touch shortly.</p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            noValidate
            className="space-y-5 bg-parchment/40 border border-border rounded-sm p-8"
          >
            <Field name="name" label="Your name" placeholder="Priya Sharma" error={errors.name} />
            <Field
              name="email"
              type="email"
              label="Email"
              placeholder="you@email.com"
              error={errors.email}
            />
            <Field
              name="subject"
              label="Subject"
              placeholder="I'd like to order 20 rakhis for gifting"
              error={errors.subject}
            />
            <label className="block">
              <span className="block eyebrow mb-2">Message</span>
              <textarea
                name="message"
                rows={6}
                maxLength={1200}
                className="w-full bg-ivory border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-peacock"
                placeholder="Tell us about your gift…"
              />
              {errors.message && <p className="mt-1 text-xs text-rose">{errors.message}</p>}
            </label>
            <button
              type="submit"
              className="bg-peacock text-ivory px-7 py-3 rounded-full text-sm tracking-wider hover:bg-peacock-deep transition-colors"
            >
              Send message
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  error,
  ...props
}: { label: string; name: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block eyebrow mb-2">{label}</span>
      <input
        {...props}
        name={name}
        className="w-full bg-ivory border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-peacock"
      />
      {error && <p className="mt-1 text-xs text-rose">{error}</p>}
    </label>
  );
}
