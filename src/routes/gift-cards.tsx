import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Gift, CreditCard, ShieldCheck, Clock, Sparkles } from "lucide-react";
import { createGiftCard, validateGiftCard } from "@/lib/gift-cards";
import { inr } from "@/lib/products";
import { toast } from "sonner";

export const Route = createFileRoute("/gift-cards")({
  head: () => ({
    meta: [
      { title: "Gift Cards — Ambika Traders" },
      {
        name: "description",
        content: "Give the gift of choice. Premium festive gift cards from Ambika Traders.",
      },
      { property: "og:title", content: "Gift Cards — Ambika Traders" },
      {
        property: "og:description",
        content: "Give the gift of choice. Premium festive gift cards.",
      },
    ],
  }),
  component: GiftCardsPage,
});

const DENOMINATIONS = [500, 1000, 1500, 2000, 3000, 5000];

function GiftCardsPage() {
  const [selectedValue, setSelectedValue] = useState(1000);
  const [customValue, setCustomValue] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkCode, setCheckCode] = useState("");
  const [checkResult, setCheckResult] = useState<{ balance: number; status: string } | null>(null);

  const handleCheckBalance = async () => {
    if (!checkCode.trim()) return;
    setChecking(true);
    setCheckResult(null);
    try {
      const card = await validateGiftCard(checkCode);
      if (card) {
        setCheckResult({ balance: card.balance, status: card.status });
      } else {
        toast.error("Gift card not found or expired");
      }
    } catch {
      toast.error("Could not check gift card");
    } finally {
      setChecking(false);
    }
  };

  const finalValue = customValue ? parseInt(customValue, 10) || 0 : selectedValue;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-24">
      {/* Hero */}
      <header className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 bg-peacock/10 text-peacock px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6">
          <Gift className="h-3.5 w-3.5" />
          Gift Cards
        </div>
        <h1 className="font-display text-5xl lg:text-6xl leading-[0.95]">
          Give the gift of <span className="text-peacock">choice</span>
        </h1>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          Let your loved ones pick their perfect festive piece. Our gift cards never expire and work
          across the entire Ambika Traders collection.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-16">
        {/* Buy Gift Card */}
        <div>
          <h2 className="font-display text-2xl mb-6">Purchase a Gift Card</h2>

          {/* Denominations */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {DENOMINATIONS.map((v) => (
              <button
                key={v}
                onClick={() => {
                  setSelectedValue(v);
                  setCustomValue("");
                }}
                className={`py-3 rounded-lg border text-sm font-semibold transition-colors ${
                  selectedValue === v && !customValue
                    ? "bg-peacock text-ivory border-peacock"
                    : "border-border hover:border-peacock/50"
                }`}
              >
                {inr(v)}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-xs eyebrow mb-2">Custom amount</label>
            <input
              type="number"
              min={100}
              max={10000}
              placeholder="Enter amount (₹100–₹10,000)"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              className="w-full bg-ivory border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-peacock"
            />
          </div>

          {/* Recipient */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs eyebrow mb-2">Recipient's name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Who is this for?"
                className="w-full bg-ivory border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-peacock"
              />
            </div>
            <div>
              <label className="block text-xs eyebrow mb-2">Recipient's email</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="their-email@example.com"
                className="w-full bg-ivory border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-peacock"
              />
            </div>
          </div>

          {/* Sender */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs eyebrow mb-2">Your name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="From..."
                className="w-full bg-ivory border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-peacock"
              />
            </div>
            <div>
              <label className="block text-xs eyebrow mb-2">Your email</label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="your-email@example.com"
                className="w-full bg-ivory border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-peacock"
              />
            </div>
          </div>

          {/* Message */}
          <div className="mb-8">
            <label className="block text-xs eyebrow mb-2">Personal message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Wishing you a beautiful festive season..."
              maxLength={200}
              rows={3}
              className="w-full bg-ivory border border-border rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-peacock resize-none"
            />
            <p className="mt-1 text-[10px] text-muted-foreground text-right">
              {message.length}/200
            </p>
          </div>

          <Link
            to="/checkout"
            search={{ gift_card: finalValue.toString() }}
            className="w-full bg-peacock text-ivory py-3.5 rounded-full text-sm font-semibold tracking-wider hover:bg-peacock-deep transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Buy Gift Card — {inr(finalValue)}
          </Link>
        </div>

        {/* Check Balance + Features */}
        <div>
          {/* Balance Checker */}
          <div className="bg-parchment/50 rounded-lg border border-border p-8 mb-8">
            <h3 className="font-display text-xl mb-4">Check Balance</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={checkCode}
                onChange={(e) => setCheckCode(e.target.value.toUpperCase())}
                placeholder="GIFT-XXXX-XXXX-XXXX"
                className="flex-1 bg-ivory border border-border rounded-sm px-4 py-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-peacock tracking-wider"
              />
              <button
                onClick={handleCheckBalance}
                disabled={checking || !checkCode.trim()}
                className="px-5 py-3 bg-foreground text-ivory rounded-sm text-sm font-semibold hover:bg-peacock-deep transition-colors disabled:opacity-50"
              >
                {checking ? "Checking..." : "Check"}
              </button>
            </div>
            {checkResult && (
              <div className="mt-4 p-4 bg-white rounded border border-border">
                <p className="text-sm">
                  <span className="text-muted-foreground">Balance: </span>
                  <span className="font-semibold text-lg">{inr(checkResult.balance)}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">Status: {checkResult.status}</p>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="space-y-6">
            <Feature
              icon={Clock}
              title="Never expires"
              desc="Use it whenever you're ready. No pressure, no deadlines."
            />
            <Feature
              icon={Sparkles}
              title="Works on everything"
              desc="Rakhis, jewellery, vastra, beauty — the entire collection."
            />
            <Feature
              icon={ShieldCheck}
              title="Secure & instant"
              desc="Digital delivery via email. Track your balance anytime."
            />
          </div>

          {/* FAQ */}
          <div className="mt-12 space-y-4">
            <h3 className="font-display text-xl">Frequently asked</h3>
            <FaqItem
              q="How do I use my gift card?"
              a="Enter the gift card code at checkout. The balance will be applied to your order total."
            />
            <FaqItem
              q="Can I use multiple gift cards?"
              a="Yes! You can apply multiple gift cards to a single order until the balance is covered."
            />
            <FaqItem
              q="What if my order costs more than my gift card?"
              a="You can pay the remaining balance via UPI or Cash on Delivery."
            />
            <FaqItem
              q="Can I buy a gift card for someone else?"
              a="Absolutely. Enter their name and email, and we'll deliver the gift card to them."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="h-10 w-10 rounded-full bg-peacock/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-peacock" />
      </div>
      <div>
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left text-sm font-medium hover:bg-parchment/50 transition-colors"
      >
        {q}
        <span className="text-xl leading-none">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-5 pb-4 text-sm text-muted-foreground">{a}</div>}
    </div>
  );
}
