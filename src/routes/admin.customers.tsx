import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Mail,
  User as UserIcon,
} from "lucide-react";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [{ title: "Customers — Ambika Traders Admin" }],
  }),
  component: AdminCustomersPage,
});

interface CustomerProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
  created_at: string;
}

function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading profiles:", error);
        toast.error("Failed to load customer profiles.");
      } else {
        setCustomers((data as CustomerProfile[]) || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleRole = async (customer: CustomerProfile) => {
    const newRole = customer.role === "admin" ? "customer" : "admin";
    try {
      setUpdatingId(customer.id);
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", customer.id);

      if (error) {
        toast.error(`Failed to update role: ${error.message}`);
      } else {
        toast.success(`User role updated to ${newRole}`);
        setCustomers((prev) =>
          prev.map((c) => (c.id === customer.id ? { ...c, role: newRole } : c)),
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const query = searchQuery.toLowerCase();
    const name = c.full_name?.toLowerCase() || "";
    const email = c.email?.toLowerCase() || "";
    return name.includes(query) || email.includes(query);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-bold flex items-center gap-2.5">
            <Users className="w-6 h-6 text-neutral-800" />
            Customer & Staff Management
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Registered customer accounts, contact directories, and administrator access control
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 bg-white border border-neutral-200 text-xs font-medium rounded-lg text-neutral-700 hover:bg-neutral-50 shadow-sm"
        >
          Refresh Directory
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-neutral-400 animate-pulse">
            Loading customer accounts...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500">
            No customer profiles registered yet. Users will appear here when they register or place
            orders.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">Access Role</th>
                  <th className="py-3 px-4 text-right">Role Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center font-semibold text-xs">
                          {c.full_name ? (
                            c.full_name.charAt(0).toUpperCase()
                          ) : (
                            <UserIcon className="w-4 h-4" />
                          )}
                        </div>
                        <span className="font-semibold text-neutral-900">
                          {c.full_name || "Unnamed Customer"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        {c.email || "No email"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        {new Date(c.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          c.role === "admin"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {c.role === "admin" ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            Admin
                          </>
                        ) : (
                          "Customer"
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        disabled={updatingId === c.id}
                        onClick={() => handleToggleRole(c)}
                        className={`px-3 py-1 text-[11px] font-medium rounded transition-colors ${
                          c.role === "admin"
                            ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                            : "bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200"
                        }`}
                      >
                        {updatingId === c.id
                          ? "Updating..."
                          : c.role === "admin"
                            ? "Demote to Customer"
                            : "Promote to Admin"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
