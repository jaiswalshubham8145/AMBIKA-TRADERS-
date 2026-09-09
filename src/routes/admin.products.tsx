import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadProductImage, validateFile } from "@/lib/storage";
import { inr, resolveImageUrl, signProductImageUrls, signSingleProductImageUrl } from "@/lib/products";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
  ExternalLink,
  Upload,
  ImageIcon,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [{ title: "Products CMS — Ambika Traders Admin" }],
  }),
  component: AdminProductsPage,
});

interface DBProduct {
  id: string;
  slug: string;
  title: string;
  category_slug: string;
  price: number;
  compare_at?: number | null;
  image_url: string;
  motif?: string | null;
  description: string;
  included?: string[];
  rating?: number;
  reviews_count?: number;
  featured?: boolean;
  stock?: number;
  tags?: string[];
  is_published?: boolean;
}

const CATEGORIES = [
  { slug: "rakhi", name: "Rakhi" },
  { slug: "krishna-vastra", name: "Krishna Vastra" },
  { slug: "jewellery", name: "Jewellery" },
  { slug: "makeup", name: "Makeup & Beauty" },
];

const PRESET_IMAGES = [
  { label: "Peacock Crimson", url: "/product-peacock-crimson.jpg" },
  { label: "Kalash Rakhi", url: "/product-kalash-rakhi.jpg" },
  { label: "Lumba Set", url: "/product-lumba-set.jpg" },
  { label: "Minimal Rakhi", url: "/product-minimal-rakhi.jpg" },
  { label: "Swastik Rakhi", url: "/product-swastik-rakhi.jpg" },
  { label: "Vastra Saffron", url: "/product-vastra-saffron.jpg" },
  { label: "Vastra Blue", url: "/product-vastra-blue.jpg" },
  { label: "Kundan Necklace", url: "/product-kundan-necklace.jpg" },
  { label: "Jhumka", url: "/product-jhumka.jpg" },
  { label: "Choker Set", url: "/product-choker-set.jpg" },
  { label: "Bangles", url: "/product-bangles.jpg" },
  { label: "Lipstick Set", url: "/product-lipset.jpg" },
  { label: "Bindi Box", url: "/product-bindi-box.jpg" },
  { label: "Kajal", url: "/product-kajal.jpg" },
];

function ImageUpload({
  value,
  onChange,
  slug,
  label = "Product Image",
}: {
  value: string;
  onChange: (url: string) => void;
  slug?: string;
  label?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Automatically sign any private storage URL if received
  useEffect(() => {
    if (value && value.includes("/storage/v1/object/public/product-images/")) {
      signSingleProductImageUrl(value).then((signed) => {
        if (signed && signed !== value) {
          onChange(signed);
        }
      });
    }
  }, [value, onChange]);

  const handleFile = useCallback(
    async (file: File) => {
      const err = validateFile(file);
      if (err) {
        toast.error(err.message);
        return;
      }
      setUploading(true);
      setProgress(0);
      try {
        const result = await uploadProductImage(file, slug, setProgress);
        onChange(result.url);
        toast.success("Image uploaded successfully.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed.");
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [onChange, slug],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div>
      <label className="block font-medium text-neutral-700 mb-1">{label}</label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-neutral-900 bg-neutral-50"
            : "border-neutral-300 hover:border-neutral-400"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        {uploading ? (
          <div className="space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-neutral-400" />
            <div className="w-full bg-neutral-200 rounded-full h-1.5">
              <div
                className="bg-neutral-900 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-500">Processing & uploading... {progress}%</p>
          </div>
        ) : value ? (
          <div className="space-y-2">
            <img
              key={value}
              src={resolveImageUrl(value)}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-md mx-auto border border-neutral-200 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/product-peacock-crimson.jpg";
              }}
            />
            <p className="text-[11px] text-neutral-500 font-medium">Click or drag another image to replace</p>
          </div>
        ) : (
          <div className="space-y-2 py-2">
            <Upload className="w-6 h-6 mx-auto text-neutral-400" />
            <p className="text-xs text-neutral-500">
              <span className="font-medium text-neutral-700">Click to upload photo</span> or drag and drop
            </p>
            <p className="text-[10px] text-neutral-400">JPEG, PNG, WEBP, AVIF up to 5MB</p>
          </div>
        )}
      </div>

      <div className="mt-2.5 space-y-2">
        <div>
          <label className="block text-[11px] text-neutral-500 mb-1">Image URL / Path</label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/product-peacock-crimson.jpg or https://..."
            className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-500"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
            Or pick from studio presets:
          </label>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1.5 bg-neutral-50 border border-neutral-200 rounded-md">
            {PRESET_IMAGES.map((img) => (
              <button
                key={img.url}
                type="button"
                onClick={() => onChange(img.url)}
                className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                  value === img.url
                    ? "bg-neutral-900 text-white border-neutral-900 font-medium"
                    : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                }`}
              >
                {img.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminProductsPage() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DBProduct | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New product form state
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("rakhi");
  const [formPrice, setFormPrice] = useState<number | "">("");
  const [formCompareAt, setFormCompareAt] = useState<number | "">("");
  const [formStock, setFormStock] = useState<number>(30);
  const [formMotif, setFormMotif] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIncluded, setFormIncluded] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formFeatured, setFormFeatured] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products from database.");
      } else {
        const signed = await signProductImageUrls((data as DBProduct[]) || []);
        setProducts(signed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setFormTitle("");
    setFormSlug("");
    setFormCategory("rakhi");
    setFormPrice("");
    setFormCompareAt("");
    setFormStock(30);
    setFormMotif("");
    setFormDescription("");
    setFormIncluded("");
    setFormTags("");
    setFormImageUrl("/product-peacock-crimson.jpg");
    setFormFeatured(false);
    setIsAddModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    // Auto-generate slug
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormSlug(generated);
  };

  const handleSaveNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formSlug || !formPrice) {
      toast.error("Please fill in Title, Slug, and Price.");
      return;
    }

    try {
      setIsSubmitting(true);
      const includedArr = formIncluded
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const tagsArr = formTags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: formTitle,
        slug: formSlug,
        category_slug: formCategory,
        price: Number(formPrice),
        compare_at: formCompareAt ? Number(formCompareAt) : null,
        stock: Number(formStock),
        motif: formMotif || null,
        description: formDescription,
        included: includedArr,
        tags: tagsArr,
        image_url: formImageUrl || "/product-peacock-crimson.jpg",
        featured: formFeatured,
        is_published: true,
      };

      const { error } = await supabase.from("products").insert([payload]);

      if (error) {
        toast.error(`Error saving product: ${error.message}`);
      } else {
        toast.success(`Product "${formTitle}" added successfully!`);
        setIsAddModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error saving product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (p: DBProduct) => {
    setEditingProduct(p);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("products")
        .update({
          title: editingProduct.title,
          category_slug: editingProduct.category_slug,
          price: Number(editingProduct.price),
          compare_at: editingProduct.compare_at ? Number(editingProduct.compare_at) : null,
          motif: editingProduct.motif || null,
          image_url: editingProduct.image_url,
          stock: Number(editingProduct.stock),
          description: editingProduct.description,
          featured: editingProduct.featured,
          is_published: editingProduct.is_published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingProduct.id);

      if (error) {
        toast.error(`Failed to update: ${error.message}`);
      } else {
        toast.success("Product updated successfully.");
        setEditingProduct(null);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProductId) return;
    try {
      setIsSubmitting(true);
      const { error } = await supabase.from("products").delete().eq("id", deletingProductId);
      if (error) {
        toast.error(`Delete failed: ${error.message}`);
      } else {
        toast.success("Product deleted.");
        setDeletingProductId(null);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter products by search & category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.motif && p.motif.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || p.category_slug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900 font-bold flex items-center gap-2.5">
            <Package className="w-6 h-6 text-neutral-800" />
            Product Catalog CMS
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Add, update inventory, edit pricing, or publish festive creations
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, motif, or slug..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-neutral-500 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none text-neutral-700 font-medium"
          >
            <option value="all">All Categories ({products.length})</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-neutral-400 animate-pulse">
            Loading products from database...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500">
            No products match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          key={p.image_url}
                          src={resolveImageUrl(p.image_url)}
                          alt={p.title}
                          className="w-10 h-10 object-cover rounded-md border border-neutral-200 bg-neutral-100 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/product-peacock-crimson.jpg";
                          }}
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-neutral-900 block truncate">
                            {p.title}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-mono">/{p.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-neutral-600 capitalize">
                      {p.category_slug.replace("-", " ")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-neutral-900">{inr(p.price)}</span>
                      {p.compare_at && (
                        <span className="text-[10px] text-neutral-400 line-through block">
                          {inr(p.compare_at)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          (p.stock ?? 0) < 10 ? "text-amber-600 font-bold" : "text-neutral-700"
                        }`}
                      >
                        {(p.stock ?? 0) < 10 && (
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                        )}
                        {p.stock ?? 0} units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-600 font-medium">
                      ★ {p.rating || 5.0} ({p.reviews_count || 0})
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          p.is_published !== false
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {p.is_published !== false ? "Live" : "Draft"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/product/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View on Store"
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit"
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingProductId(p.id)}
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

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h2 className="font-serif text-lg font-bold text-neutral-900">Add New Product</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewProduct} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Royal Peacock Rakhi"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="royal-peacock-rakhi"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-500 capitalize"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formPrice}
                    onChange={(e) =>
                      setFormPrice(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="499"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Compare Price (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formCompareAt}
                    onChange={(e) =>
                      setFormCompareAt(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="699"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Initial Stock Units *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Motif (e.g. Peacock, Kalash)
                  </label>
                  <input
                    type="text"
                    value={formMotif}
                    onChange={(e) => setFormMotif(e.target.value)}
                    placeholder="Peacock"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Handcrafted festive medallion on crimson silk thread..."
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Included Items (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formIncluded}
                    onChange={(e) => setFormIncluded(e.target.value)}
                    placeholder="Gift Box, Roli-Chawal"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="bestseller, peacock, festive"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              <ImageUpload
                value={formImageUrl}
                onChange={setFormImageUrl}
                slug={formSlug}
                label="Product Image"
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="rounded text-neutral-900 focus:ring-0"
                />
                <label htmlFor="featuredCheck" className="font-medium text-neutral-700">
                  Feature on Homepage Edit
                </label>
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
                  {isSubmitting ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h2 className="font-serif text-lg font-bold text-neutral-900">Edit Product</h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.title}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, title: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Category</label>
                  <select
                    value={editingProduct.category_slug}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category_slug: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none capitalize"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Compare Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.compare_at ?? ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        compare_at: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingProduct.stock ?? 0}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Motif</label>
                  <input
                    type="text"
                    value={editingProduct.motif || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, motif: e.target.value })
                    }
                    placeholder="e.g. Peacock"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none"
                  />
                </div>
              </div>

              <ImageUpload
                value={editingProduct.image_url}
                onChange={(url) => setEditingProduct({ ...editingProduct, image_url: url })}
                slug={editingProduct.slug}
                label="Product Image"
              />

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-md focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured ?? false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, featured: e.target.checked })
                    }
                    className="rounded text-neutral-900"
                  />
                  <span>Featured Product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_published !== false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, is_published: e.target.checked })
                    }
                    className="rounded text-neutral-900"
                  />
                  <span>Live on Store</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3.5 py-2 border border-neutral-300 rounded-md text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-md font-semibold hover:bg-neutral-800 disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Update Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-neutral-900">Delete Product?</h3>
            <p className="text-xs text-neutral-500 mt-2">
              Are you sure you want to permanently delete this product? This action cannot be
              undone.
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeletingProductId(null)}
                className="px-4 py-2 border border-neutral-300 rounded-md text-xs font-medium text-neutral-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteProduct}
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
