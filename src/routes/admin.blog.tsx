import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Loader2,
  Clock,
  Tag,
} from "lucide-react";
import { POST_CATEGORIES, getCategoryLabel } from "@/lib/blog";

export const Route = createFileRoute("/admin/blog")({
  head: () => ({
    meta: [{ title: "Blog CMS — Ambika Traders Admin" }],
  }),
  component: AdminBlogPage,
});

interface PostRecord {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author_name: string;
  category: string;
  tags: string[];
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

function AdminBlogPage() {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<PostRecord | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image_url: "",
    author_name: "Ambika Traders",
    category: "general",
    tags: "",
    is_published: false,
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load posts");
      } else {
        setPosts((data as PostRecord[]) || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const openAddModal = () => {
    setEditingPost(null);
    setForm({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image_url: "",
      author_name: "Ambika Traders",
      category: "general",
      tags: "",
      is_published: false,
    });
    setShowModal(true);
  };

  const openEditModal = (post: PostRecord) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      cover_image_url: post.cover_image_url || "",
      author_name: post.author_name,
      category: post.category,
      tags: post.tags.join(", "),
      is_published: post.is_published,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.content) {
      toast.error("Title and content are required");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: form.title,
        slug: form.slug || generateSlug(form.title),
        excerpt: form.excerpt || null,
        content: form.content,
        cover_image_url: form.cover_image_url || null,
        author_name: form.author_name,
        category: form.category,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        is_published: form.is_published,
        published_at:
          form.is_published && !editingPost
            ? new Date().toISOString()
            : editingPost?.published_at || null,
      };

      if (editingPost) {
        const { error } = await supabase.from("posts").update(payload).eq("id", editingPost.id);
        if (error) throw error;
        toast.success("Post updated");
      } else {
        const { error } = await supabase.from("posts").insert([payload]);
        if (error) throw error;
        toast.success("Post created");
      }
      setShowModal(false);
      fetchPosts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (post: PostRecord) => {
    try {
      const newStatus = !post.is_published;
      const { error } = await supabase
        .from("posts")
        .update({
          is_published: newStatus,
          published_at: newStatus ? new Date().toISOString() : null,
        })
        .eq("id", post.id);

      if (error) throw error;
      toast.success(newStatus ? "Post published" : "Post unpublished");
      fetchPosts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
      toast.success("Post deleted");
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
            <FileText className="w-6 h-6 text-neutral-800" />
            Blog / Journal
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Create and manage editorial content for SEO and brand building
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Post
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-neutral-400 animate-pulse">
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500">
            No posts yet. Create your first editorial piece.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-neutral-900 block">{post.title}</span>
                      <span className="text-[11px] text-neutral-500 truncate block max-w-xs">
                        {post.excerpt || "No excerpt"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[10px] font-semibold border border-neutral-200">
                        {getCategoryLabel(post.category)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {post.is_published ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold border border-emerald-200">
                          <Eye className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold border border-amber-200">
                          <EyeOff className="w-3 h-3" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-neutral-500">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("en-IN")
                        : new Date(post.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => handleTogglePublish(post)}
                          className="p-1.5 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title={post.is_published ? "Unpublish" : "Publish"}
                        >
                          {post.is_published ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(post)}
                          className="p-1.5 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
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
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h2 className="font-serif text-lg font-bold text-neutral-900">
                {editingPost ? "Edit Post" : "New Post"}
              </h2>
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
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                      slug: editingPost ? form.slug : generateSlug(e.target.value),
                    })
                  }
                  placeholder="The Art of Rakhi"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                  Slug
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="art-of-rakhi"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                  Excerpt
                </label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="A short summary for previews..."
                  rows={2}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                  Content (Markdown)
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your post content here. Supports Markdown formatting."
                  rows={12}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  >
                    {POST_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="rakhi, festival, guide"
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={form.cover_image_url}
                  onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                  placeholder="/cover-image.jpg or https://..."
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <label className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="accent-neutral-900"
                />
                <span className="text-xs font-medium">Publish immediately</span>
              </label>
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
                disabled={saving || !form.title}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {editingPost ? "Update Post" : "Create Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
