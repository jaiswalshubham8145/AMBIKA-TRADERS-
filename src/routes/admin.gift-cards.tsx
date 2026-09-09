import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  fetchGiftCards,
  createGiftCard,
  disableGiftCard,
  enableGiftCard,
  type GiftCard,
} from "@/lib/gift-cards";
import { inr } from "@/lib/products";
import { Gift, Plus, Ban, CheckCircle, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/gift-cards")({
  head: () => ({
    meta: [{ title: "Gift Cards — Ambika Traders Admin" }],
  }),
  component: GiftCardsAdmin,
});

function GiftCardsAdmin() {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newValue, setNewValue] = useState(1000);
  const [newRecipient, setNewRecipient] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setCards(await fetchGiftCards());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (newValue < 100) {
      toast.error("Minimum gift card value is ₹100");
      return;
    }
    setCreating(true);
    try {
      const card = await createGiftCard({
        value: newValue,
        recipientEmail: newRecipient || undefined,
        message: newMessage || undefined,
      });
      if (card) {
        toast.success(`Gift card created: ${card.code}`);
        setShowCreate(false);
        setNewValue(1000);
        setNewRecipient("");
        setNewMessage("");
        load();
      } else {
        toast.error("Failed to create gift card");
      }
    } catch {
      toast.error("Failed to create gift card");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (card: GiftCard) => {
    if (card.status === "active") {
      await disableGiftCard(card.id);
      toast.success("Gift card disabled");
    } else {
      await enableGiftCard(card.id);
      toast.success("Gift card enabled");
    }
    load();
  };

  const activeCards = cards.filter((c) => c.status === "active");
  const totalValue = activeCards.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Gift Cards</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage digital gift cards</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm hover:bg-parchment transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 bg-peacock text-ivory rounded-md text-sm font-semibold hover:bg-peacock-deep transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Gift Card
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-border p-6">
          <p className="text-2xl font-bold">{cards.length}</p>
          <p className="text-xs text-muted-foreground">Total Gift Cards</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-6">
          <p className="text-2xl font-bold text-emerald-600">{activeCards.length}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-6">
          <p className="text-2xl font-bold text-peacock">{inr(totalValue)}</p>
          <p className="text-xs text-muted-foreground">Outstanding Balance</p>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-lg border border-border p-6 space-y-4">
          <h3 className="font-semibold">New Gift Card</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs eyebrow mb-2">Value</label>
              <select
                value={newValue}
                onChange={(e) => setNewValue(Number(e.target.value))}
                className="w-full bg-ivory border border-border rounded-sm px-4 py-3 text-sm"
              >
                {[500, 1000, 1500, 2000, 3000, 5000, 10000].map((v) => (
                  <option key={v} value={v}>
                    {inr(v)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs eyebrow mb-2">Recipient email (optional)</label>
              <input
                type="email"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full bg-ivory border border-border rounded-sm px-4 py-3 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs eyebrow mb-2">Message (optional)</label>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Happy festive season!"
              className="w-full bg-ivory border border-border rounded-sm px-4 py-3 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-5 py-2.5 bg-peacock text-ivory rounded-md text-sm font-semibold hover:bg-peacock-deep transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Gift className="h-4 w-4" />
              )}
              Create
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-5 py-2.5 border border-border rounded-md text-sm hover:bg-parchment transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cards Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-parchment/50 text-left">
              <tr>
                <th className="px-6 py-3 font-medium text-muted-foreground">Code</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Value</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Balance</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Recipient</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Created</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cards.map((card) => (
                <tr key={card.id} className="hover:bg-parchment/20">
                  <td className="px-6 py-3 font-mono text-xs tracking-wider">{card.code}</td>
                  <td className="px-6 py-3">{inr(card.initial_value)}</td>
                  <td className="px-6 py-3 font-semibold">{inr(card.balance)}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        card.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : card.status === "redeemed"
                            ? "bg-peacock/10 text-peacock"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {card.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-xs text-muted-foreground">
                    {card.recipient_email || "—"}
                  </td>
                  <td className="px-6 py-3 text-xs text-muted-foreground">
                    {new Date(card.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-6 py-3">
                    {card.status !== "redeemed" && (
                      <button
                        onClick={() => handleToggle(card)}
                        className="text-xs font-semibold hover:underline flex items-center gap-1"
                      >
                        {card.status === "active" ? (
                          <>
                            <Ban className="h-3 w-3 text-rose" /> Disable
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3 text-emerald-600" /> Enable
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {cards.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <Gift className="h-8 w-8 mx-auto mb-3 opacity-40" />
                    <p>No gift cards yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
