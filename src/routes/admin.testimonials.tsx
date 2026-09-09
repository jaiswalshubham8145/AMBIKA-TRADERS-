import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Star,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  MapPin,
} from "lucide-react";

export const Route = createFileRoute("/admin/testimonials")({
  head: () => ({
    meta: [{ title: "Reviews & Testimonials — Ambika Traders Admin" }],
  }),
  component: AdminTestimonialsPage,
});

interface TestimonialRecord {
  id: string;
  customer_name: string;
  location: string | null;
  rating: number;
  review_text: string;
  product_slug: string | null;
  is_featured: boolean;
  is_approved: boolean;
  created_at: string;
}

function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<TestimonialRecord | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    customer_name: "",
    location: "",
    rating: 5,
    review_text: "",
    product_slug: "",
    is_featured: false,
    is_approved: false,
  });

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load testimonials");
      } else {
        setTestimonials((data as TestimonialRecord[]) || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openAddModal = () => {
    setEditing(null);
    setForm({
      customer_name: "",
      location: "",
      rating: 5,
      review_text: "",
      product_slug: "",
      is_featured: false,
      is_approved: false,
    });
    setShowModal(true);
  };

  const openEditModal = (t: TestimonialRecord) => {
    setEditing(t);
    setForm({
      customer_name: t.customer_name,
      location: t.location || "",
      rating: t.rating,
      review_text: t.review_text,
      product_slug: t.product_slug || "",
      is_featured: t.is_featured,
      is_approved: t.is_approved,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.customer_name || !form.review_text) {
      toast.error("Name and review text are required");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        customer_name: form.customer_name,
        location: form.location || null,
        rating: form.rating,
        review_text: form.review_text,
        product_slug: form.product_slug || null,
        is_featured: form.is_featured,
        is_approved: form.is_approved,
      };

      if (editing) {
        const { error } = await supabase.from("testimonials").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Testimonial updated");
      } else {
        const { error } = await supabase.from("testimonials").insert([payload]);
        if (error) throw error;
        toast.success("Testimonial created");
      }
      setShowModal(false);
      fetchTestimonials();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (
    id: string,
    field: "is_approved" | "is_featured",
    current: boolean,
  ) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ [field]: !current })
        .eq("id", id);
      if (error) throw error;
      fetchTestimonials();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
      toast.success("Deleted");
      fetchTestimonials();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const renderStars = (count: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i < count ? "fill-amber-400 text-amber-400" : "text-neutral-300"}`}
      />
    ));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-bold flex items-center gap-2.5">
            <Star className="w-6 h-6 text-amber-500" />
            Reviews & Testimonials
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage customer reviews and feature them on the storefront
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Review
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-neutral-400 animate-pulse">
            Loading testimonials...
          </div>
        ) : testimonials.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500">No testimonials yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Review</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4">Approved</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {testimonials.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-neutral-900 block">
                        {t.customer_name}
                      </span>
                      {t.location && (
                        <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {t.location}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-0.5">{renderStars(t.rating)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-neutral-700 line-clamp-2 max-w-xs block">
                        {t.review_text}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggle(t.id, "is_featured", t.is_featured)}
                        className={`p-1 rounded transition-colors ${
                          t.is_featured
                            ? "text-amber-500 hover:text-amber-600"
                            : "text-neutral-300 hover:text-amber-400"
                        }`}
                        title={t.is_featured ? "Unfeature" : "Feature"}
                      >
                        <Star className={`w-4 h-4 ${t.is_featured ? "fill-current" : ""}`} />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggle(t.id, "is_approved", t.is_approved)}
                        className={`p-1 rounded transition-colors ${
                          t.is_approved
                            ? "text-emerald-500 hover:text-emerald-600"
                            : "text-neutral-300 hover:text-emerald-400"
                        }`}
                        title={t.is_approved ? "Unapprove" : "Approve"}
                      >
                        {t.is_approved ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-1.5 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h2 className="font-serif text-lg font-bold text-neutral-900">
                {editing ? "Edit Review" : "Add Review"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    placeholder="Priya Sharma"
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                  Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setForm({ ...form, rating: n })}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          n <= form.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-neutral-300 hover:text-amber-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                  Review Text
                </label>
                <textarea
                  value={form.review_text}
                  onChange={(e) => setForm({ ...form, review_text: e.target.value })}
                  placeholder="What the customer said..."
                  rows={4}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                  Product Slug (optional)
                </label>
                <input
                  type="text"
                  value={form.product_slug}
                  onChange={(e) => setForm({ ...form, product_slug: e.target.value })}
                  placeholder="peacock-rakhi"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="accent-neutral-900"
                  />
                  <span className="text-xs font-medium">Featured on homepage</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_approved}
                    onChange={(e) => setForm({ ...form, is_approved: e.target.checked })}
                    className="accent-neutral-900"
                  />
                  <span className="text-xs font-medium">Approved (public)</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-neutral-200">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.customer_name}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
