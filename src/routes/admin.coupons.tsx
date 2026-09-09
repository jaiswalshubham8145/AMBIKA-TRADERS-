import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Tag, Plus, Search, Edit2, Trash2, X, Check, ToggleLeft, ToggleRight } from "lucide-react";

export const Route = createFileRoute("/admin/coupons")({
  head: () => ({
    meta: [{ title: "Coupons CMS — Ambika Traders Admin" }],
  }),
  component: AdminCouponsPage,
});

interface DBCoupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  valid_from: string;
  valid_until: string | null;
  usage_limit: number | null;
  times_used: number;
  is_active: boolean;
  created_at: string;
}

function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<DBCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<DBCoupon | null>(null);
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formCode, setFormCode] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [formDiscountValue, setFormDiscountValue] = useState<number | "">("");
  const [formMinOrder, setFormMinOrder] = useState<number | "">(0);
  const [formMaxDiscount, setFormMaxDiscount] = useState<number | "">("");
  const [formValidUntil, setFormValidUntil] = useState("");
  const [formUsageLimit, setFormUsageLimit] = useState<number | "">("");

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching coupons:", error);
        toast.error("Failed to load coupons.");
      } else {
        setCoupons((data as DBCoupon[]) || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setFormCode("");
    setFormDiscountType("percentage");
    setFormDiscountValue("");
    setFormMinOrder(0);
    setFormMaxDiscount("");
    setFormValidUntil("");
    setFormUsageLimit("");
    setIsAddModalOpen(true);
  };

  const handleSaveNewCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formDiscountValue) {
      toast.error("Please fill in Code and Discount Value.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        code: formCode.toUpperCase().trim(),
        discount_type: formDiscountType,
        discount_value: Number(formDiscountValue),
        min_order_amount: formMinOrder ? Number(formMinOrder) : 0,
        max_discount_amount: formMaxDiscount ? Number(formMaxDiscount) : null,
        valid_until: formValidUntil || null,
        usage_limit: formUsageLimit ? Number(formUsageLimit) : null,
        is_active: true,
      };

      const { error } = await supabase.from("coupons").insert([payload]);

      if (error) {
        if (error.code === "23505") {
          toast.error("A coupon with this code already exists.");
        } else {
          toast.error(`Error saving coupon: ${error.message}`);
        }
      } else {
        toast.success(`Coupon "${payload.code}" created successfully!`);
        setIsAddModalOpen(false);
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error saving coupon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon: DBCoupon) => {
    try {
      const { error } = await supabase
        .from("coupons")
        .update({ is_active: !coupon.is_active })
        .eq("id", coupon.id);

      if (error) {
        toast.error(`Failed to toggle: ${error.message}`);
      } else {
        toast.success(`Coupon ${coupon.is_active ? "deactivated" : "activated"}.`);
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!deletingCouponId) return;
    try {
      setIsSubmitting(true);
      const { error } = await supabase.from("coupons").delete().eq("id", deletingCouponId);
      if (error) {
        toast.error(`Delete failed: ${error.message}`);
      } else {
        toast.success("Coupon deleted.");
        setDeletingCouponId(null);
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCoupons = coupons.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.code.toLowerCase().includes(q) || c.discount_type.includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-bold flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-neutral-800" />
            Coupons & Promo Codes
          </h1>
          <p className="text-xs text-muted-500 mt-1">
            Create, manage, and toggle discount codes for customers
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Coupon
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 uppercase tracking-wider"
          />
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-neutral-400 animate-pulse">
            Loading coupons...
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500">
            No coupons found. Create your first coupon to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Min Order</th>
                  <th className="py-3 px-4">Max Discount</th>
                  <th className="py-3 px-4">Usage</th>
                  <th className="py-3 px-4">Expires</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-neutral-900 tracking-wider">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-neutral-900">
                        {c.discount_type === "percentage"
                          ? `${c.discount_value}%`
                          : `₹${c.discount_value}`}
                      </span>
                      <span className="text-[10px] text-neutral-400 block capitalize">
                        {c.discount_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {c.min_order_amount > 0 ? `₹${c.min_order_amount}` : "—"}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {c.max_discount_amount ? `₹${c.max_discount_amount}` : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-neutral-700">
                        {c.times_used}
                        {c.usage_limit !== null ? ` / ${c.usage_limit}` : ""}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-500">
                      {c.valid_until
                        ? new Date(c.valid_until).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Never"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          c.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {c.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleActive(c)}
                          title={c.is_active ? "Deactivate" : "Activate"}
                          className={`p-1.5 rounded transition-colors ${
                            c.is_active
                              ? "text-emerald-600 hover:bg-emerald-50"
                              : "text-neutral-400 hover:bg-neutral-100"
                          }`}
                        >
                          {c.is_active ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingCoupon(c)}
                          title="Edit"
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingCouponId(c.id)}
                          title="Delete"
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD COUPON MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h2 className="font-serif text-lg font-bold text-neutral-900">Add New Coupon</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewCoupon} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="e.g. AURA10"
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-500 uppercase tracking-wider font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Discount Type *</label>
                  <select
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value as "percentage" | "fixed")}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formDiscountValue}
                    onChange={(e) =>
                      setFormDiscountValue(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder={formDiscountType === "percentage" ? "10" : "500"}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Min Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formMinOrder}
                    onChange={(e) =>
                      setFormMinOrder(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formMaxDiscount}
                    onChange={(e) =>
                      setFormMaxDiscount(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="No cap"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={formValidUntil}
                    onChange={(e) => setFormValidUntil(e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">Leave empty for no expiry</p>
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={formUsageLimit}
                    onChange={(e) =>
                      setFormUsageLimit(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="Unlimited"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">Leave empty for unlimited</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 border border-neutral-300 rounded-md text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-md font-semibold hover:bg-neutral-800 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COUPON MODAL */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h2 className="font-serif text-lg font-bold text-neutral-900">Edit Coupon</h2>
              <button
                onClick={() => setEditingCoupon(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingCoupon) return;
                try {
                  setIsSubmitting(true);
                  const { error } = await supabase
                    .from("coupons")
                    .update({
                      discount_type: editingCoupon.discount_type,
                      discount_value: editingCoupon.discount_value,
                      min_order_amount: editingCoupon.min_order_amount,
                      max_discount_amount: editingCoupon.max_discount_amount,
                      valid_until: editingCoupon.valid_until,
                      usage_limit: editingCoupon.usage_limit,
                    })
                    .eq("id", editingCoupon.id);

                  if (error) {
                    toast.error(`Update failed: ${error.message}`);
                  } else {
                    toast.success("Coupon updated.");
                    setEditingCoupon(null);
                    fetchCoupons();
                  }
                } catch (err) {
                  console.error(err);
                  toast.error("Error updating coupon.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4 mt-4 text-xs"
            >
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Code</label>
                <input
                  type="text"
                  disabled
                  value={editingCoupon.code}
                  className="w-full px-3 py-1.5 border border-neutral-200 rounded-md bg-neutral-50 text-neutral-500 font-mono tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Discount Type</label>
                  <select
                    value={editingCoupon.discount_type}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        discount_type: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingCoupon.discount_value}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        discount_value: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Min Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingCoupon.min_order_amount}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        min_order_amount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingCoupon.max_discount_amount ?? ""}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        max_discount_amount: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    placeholder="No cap"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={editingCoupon.valid_until?.split("T")[0] || ""}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        valid_until: e.target.value || null,
                      })
                    }
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={editingCoupon.usage_limit ?? ""}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        usage_limit: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    placeholder="Unlimited"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
                  className="px-3.5 py-2 border border-neutral-300 rounded-md text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-md font-semibold hover:bg-neutral-800 disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Update Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCouponId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-neutral-900">Delete Coupon?</h3>
            <p className="text-xs text-neutral-500 mt-2">
              Are you sure you want to permanently delete this coupon? This action cannot be undone.
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeletingCouponId(null)}
                className="px-4 py-2 border border-neutral-300 rounded-md text-xs font-medium text-neutral-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteCoupon}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
