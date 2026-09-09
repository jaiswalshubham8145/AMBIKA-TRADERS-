import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Truck,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  MapPin,
  Loader2,
  Package,
  DollarSign,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/admin/shipping")({
  head: () => ({
    meta: [{ title: "Shipping Rules — Ambika Traders Admin" }],
  }),
  component: AdminShippingPage,
});

interface ShippingRule {
  id: string;
  pincode_prefix: string;
  zone: string;
  shipping_fee: number;
  free_shipping_min: number;
  cod_available: boolean;
  estimated_days_min: number;
  estimated_days_max: number;
  is_serviceable: boolean;
  created_at: string;
}

const ZONE_COLORS: Record<string, string> = {
  metro: "bg-emerald-100 text-emerald-800 border-emerald-200",
  tier1: "bg-blue-100 text-blue-800 border-blue-200",
  tier2: "bg-amber-100 text-amber-800 border-amber-200",
  remote: "bg-rose-100 text-rose-800 border-rose-200",
  standard: "bg-neutral-100 text-neutral-800 border-neutral-200",
};

function AdminShippingPage() {
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<ShippingRule | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    pincode_prefix: "",
    zone: "standard",
    shipping_fee: 0,
    free_shipping_min: 999,
    cod_available: true,
    estimated_days_min: 3,
    estimated_days_max: 7,
    is_serviceable: true,
  });

  const fetchRules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("shipping_rules")
        .select("*")
        .order("pincode_prefix");

      if (error) {
        toast.error("Failed to load shipping rules");
      } else {
        setRules((data as ShippingRule[]) || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const openAddModal = () => {
    setEditingRule(null);
    setForm({
      pincode_prefix: "",
      zone: "standard",
      shipping_fee: 0,
      free_shipping_min: 999,
      cod_available: true,
      estimated_days_min: 3,
      estimated_days_max: 7,
      is_serviceable: true,
    });
    setShowModal(true);
  };

  const openEditModal = (rule: ShippingRule) => {
    setEditingRule(rule);
    setForm({
      pincode_prefix: rule.pincode_prefix,
      zone: rule.zone,
      shipping_fee: rule.shipping_fee,
      free_shipping_min: rule.free_shipping_min,
      cod_available: rule.cod_available,
      estimated_days_min: rule.estimated_days_min,
      estimated_days_max: rule.estimated_days_max,
      is_serviceable: rule.is_serviceable,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.pincode_prefix || form.pincode_prefix.length < 3) {
      toast.error("Pincode prefix must be at least 3 digits");
      return;
    }

    try {
      setSaving(true);
      if (editingRule) {
        const { error } = await supabase
          .from("shipping_rules")
          .update(form)
          .eq("id", editingRule.id);
        if (error) throw error;
        toast.success("Shipping rule updated");
      } else {
        const { error } = await supabase.from("shipping_rules").insert([form]);
        if (error) throw error;
        toast.success("Shipping rule created");
      }
      setShowModal(false);
      fetchRules();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save rule");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this shipping rule?")) return;
    try {
      const { error } = await supabase.from("shipping_rules").delete().eq("id", id);
      if (error) throw error;
      toast.success("Rule deleted");
      fetchRules();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const stats = {
    total: rules.length,
    serviceable: rules.filter((r) => r.is_serviceable).length,
    zones: [...new Set(rules.map((r) => r.zone))].length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-bold flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-neutral-800" />
            Shipping Rules
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure delivery zones, fees, and serviceability by pincode prefix
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
            Total Rules
          </span>
          <span className="text-2xl font-bold text-neutral-900">{stats.total}</span>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
            Serviceable
          </span>
          <span className="text-2xl font-bold text-emerald-600">{stats.serviceable}</span>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Zones</span>
          <span className="text-2xl font-bold text-neutral-900">{stats.zones}</span>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-neutral-400 animate-pulse">
            Loading shipping rules...
          </div>
        ) : rules.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500">
            No shipping rules configured. Add one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Pincode Prefix</th>
                  <th className="py-3 px-4">Zone</th>
                  <th className="py-3 px-4">Shipping Fee</th>
                  <th className="py-3 px-4">Free Above</th>
                  <th className="py-3 px-4">COD</th>
                  <th className="py-3 px-4">Est. Days</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-neutral-900 text-sm">
                        {rule.pincode_prefix}***
                      </span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">
                        Covers {Math.pow(10, 6 - rule.pincode_prefix.length).toLocaleString()}{" "}
                        pincodes
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          ZONE_COLORS[rule.zone] || ZONE_COLORS.standard
                        }`}
                      >
                        {rule.zone}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-900">
                      {rule.shipping_fee === 0 ? (
                        <span className="text-emerald-600">Free</span>
                      ) : (
                        `₹${rule.shipping_fee}`
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">₹{rule.free_shipping_min}</td>
                    <td className="py-3 px-4">
                      {rule.cod_available ? (
                        <span className="text-emerald-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-rose font-medium">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {rule.estimated_days_min}–{rule.estimated_days_max} days
                    </td>
                    <td className="py-3 px-4">
                      {rule.is_serviceable ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold border border-red-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEditModal(rule)}
                          className="p-1.5 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit rule"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete rule"
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
                {editingRule ? "Edit Shipping Rule" : "Add Shipping Rule"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-5 text-xs">
              {/* Pincode Prefix */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                  Pincode Prefix (3 digits)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={form.pincode_prefix}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        pincode_prefix: e.target.value.replace(/\D/g, "").slice(0, 3),
                      })
                    }
                    placeholder="e.g. 400"
                    maxLength={3}
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  First 3 digits of pincodes in this zone. Covers{" "}
                  {form.pincode_prefix.length === 3
                    ? `${Math.pow(10, 6 - form.pincode_prefix.length).toLocaleString()} pincodes`
                    : "..."}{" "}
                  in the range.
                </p>
              </div>

              {/* Zone */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                  Zone
                </label>
                <select
                  value={form.zone}
                  onChange={(e) => setForm({ ...form, zone: e.target.value })}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                >
                  <option value="metro">Metro (Delhi, Mumbai, Bangalore...)</option>
                  <option value="tier1">Tier 1 (Lucknow, Chandigarh...)</option>
                  <option value="tier2">Tier 2 (Indore, Madurai...)</option>
                  <option value="remote">Remote (NE India, Kashmir...)</option>
                  <option value="standard">Standard (default)</option>
                </select>
              </div>

              {/* Shipping Fee */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                  Shipping Fee (₹)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="number"
                    value={form.shipping_fee}
                    onChange={(e) => setForm({ ...form, shipping_fee: Number(e.target.value) })}
                    min={0}
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Set to 0 for free shipping.</p>
              </div>

              {/* Free Shipping Min */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                  Free Shipping Minimum (₹)
                </label>
                <input
                  type="number"
                  value={form.free_shipping_min}
                  onChange={(e) => setForm({ ...form, free_shipping_min: Number(e.target.value) })}
                  min={0}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              {/* Estimated Days */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                    Min Days
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="number"
                      value={form.estimated_days_min}
                      onChange={(e) =>
                        setForm({ ...form, estimated_days_min: Number(e.target.value) })
                      }
                      min={1}
                      max={30}
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                    Max Days
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="number"
                      value={form.estimated_days_max}
                      onChange={(e) =>
                        setForm({ ...form, estimated_days_max: Number(e.target.value) })
                      }
                      min={1}
                      max={30}
                      className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.cod_available}
                    onChange={(e) => setForm({ ...form, cod_available: e.target.checked })}
                    className="accent-neutral-900"
                  />
                  <span className="text-xs font-medium">COD Available</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_serviceable}
                    onChange={(e) => setForm({ ...form, is_serviceable: e.target.checked })}
                    className="accent-neutral-900"
                  />
                  <span className="text-xs font-medium">Serviceable</span>
                </label>
              </div>
            </div>

            {/* Save / Cancel */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-neutral-200">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.pincode_prefix}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {editingRule ? "Update Rule" : "Create Rule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
