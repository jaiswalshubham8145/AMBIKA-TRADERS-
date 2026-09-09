import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Instagram,
  Plus,
  Trash2,
  Save,
  X,
  Loader2,
  GripVertical,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/admin/instagram")({
  head: () => ({
    meta: [{ title: "Instagram Feed — Ambika Traders Admin" }],
  }),
  component: AdminInstagramPage,
});

interface InstagramPostRecord {
  id: string;
  image_url: string;
  post_url: string;
  caption: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

function AdminInstagramPage() {
  const [posts, setPosts] = useState<InstagramPostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    image_url: "",
    post_url: "https://www.instagram.com/ambika_rakhi?igsh=MW4yaHF0YXR2enBzdQ==",
    caption: "",
    display_order: 0,
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("instagram_posts")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        toast.error("Failed to load Instagram posts");
      } else {
        setPosts((data as InstagramPostRecord[]) || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSave = async () => {
    if (!form.image_url) {
      toast.error("Image URL is required");
      return;
    }
    try {
      setSaving(true);
      const maxOrder = posts.length > 0 ? Math.max(...posts.map((p) => p.display_order)) : 0;
      const payload = {
        image_url: form.image_url,
        post_url: form.post_url,
        caption: form.caption || null,
        display_order: form.display_order || maxOrder + 1,
        is_active: true,
      };

      const { error } = await supabase.from("instagram_posts").insert([payload]);
      if (error) throw error;
      toast.success("Instagram post added");
      setShowModal(false);
      setForm({
        image_url: "",
        post_url: "https://www.instagram.com/ambika_rakhi?igsh=MW4yaHF0YXR2enBzdQ==",
        caption: "",
        display_order: 0,
      });
      fetchPosts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from("instagram_posts")
        .update({ is_active: !current })
        .eq("id", id);
      if (error) throw error;
      fetchPosts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this Instagram post?")) return;
    try {
      const { error } = await supabase.from("instagram_posts").delete().eq("id", id);
      if (error) throw error;
      toast.success("Deleted");
      fetchPosts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-bold flex items-center gap-2.5">
            <Instagram className="w-6 h-6 text-pink-500" />
            Instagram Feed
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Curate which Instagram posts appear on the homepage grid
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Post
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-neutral-400 animate-pulse">
            Loading Instagram posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500">
            No Instagram posts curated yet. Add one to display on the homepage.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className={`relative group rounded-lg overflow-hidden border border-neutral-200 ${
                  !post.is_active ? "opacity-50" : ""
                }`}
              >
                <div className="aspect-square">
                  <img
                    src={post.image_url}
                    alt={post.caption || "Instagram post"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={post.post_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-white/90 rounded-md text-neutral-700 hover:bg-white"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleToggle(post.id, post.is_active)}
                      className="p-1.5 bg-white/90 rounded-md text-neutral-700 hover:bg-white text-[10px] font-bold"
                    >
                      {post.is_active ? "ON" : "OFF"}
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-1.5 bg-red-500/90 rounded-md text-white hover:bg-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {post.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-[10px] text-white line-clamp-2">{post.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h2 className="font-serif text-lg font-bold text-neutral-900">Add Instagram Post</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-5 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                  Image URL
                </label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="/product-peacock-crimson.jpg or https://..."
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                  Instagram Post URL
                </label>
                <input
                  type="text"
                  value={form.post_url}
                  onChange={(e) => setForm({ ...form, post_url: e.target.value })}
                  placeholder="https://www.instagram.com/p/..."
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                  Caption
                </label>
                <input
                  type="text"
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  placeholder="Short caption for the post"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                  min={0}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
                <p className="text-[10px] text-neutral-400 mt-1">Lower numbers appear first</p>
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
                disabled={saving || !form.image_url}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Add Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
