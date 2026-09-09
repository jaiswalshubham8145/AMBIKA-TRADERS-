import { supabase } from "@/lib/supabase";
import heroRakhi from "@/assets/hero-rakhi.jpg";
import catRakhi from "@/assets/cat-rakhi.jpg";
import catKrishna from "@/assets/cat-krishna.jpg";
import catJewellery from "@/assets/cat-jewellery.jpg";
import catMakeup from "@/assets/cat-makeup.jpg";
import pPeacock from "@/assets/product-peacock-crimson.jpg";
import pKalash from "@/assets/product-kalash-rakhi.jpg";
import pLumba from "@/assets/product-lumba-set.jpg";
import pMinimal from "@/assets/product-minimal-rakhi.jpg";
import pSwastik from "@/assets/product-swastik-rakhi.jpg";
import pVastraSaffron from "@/assets/product-vastra-saffron.jpg";
import pVastraBlue from "@/assets/product-vastra-blue.jpg";
import pKundan from "@/assets/product-kundan-necklace.jpg";
import pJhumka from "@/assets/product-jhumka.jpg";
import pChoker from "@/assets/product-choker-set.jpg";
import pBangles from "@/assets/product-bangles.jpg";
import pLipset from "@/assets/product-lipset.jpg";
import pBindi from "@/assets/product-bindi-box.jpg";
import pKajal from "@/assets/product-kajal.jpg";

export type CategorySlug = "rakhi" | "krishna-vastra" | "jewellery" | "makeup";

export const ASSET_MAP: Record<string, string> = {
  "hero-rakhi.jpg": heroRakhi,
  "cat-rakhi.jpg": catRakhi,
  "cat-krishna.jpg": catKrishna,
  "cat-jewellery.jpg": catJewellery,
  "cat-makeup.jpg": catMakeup,
  "product-peacock-crimson.jpg": pPeacock,
  "product-kalash-rakhi.jpg": pKalash,
  "product-lumba-set.jpg": pLumba,
  "product-minimal-rakhi.jpg": pMinimal,
  "product-swastik-rakhi.jpg": pSwastik,
  "product-vastra-saffron.jpg": pVastraSaffron,
  "product-vastra-blue.jpg": pVastraBlue,
  "product-kundan-necklace.jpg": pKundan,
  "product-jhumka.jpg": pJhumka,
  "product-choker-set.jpg": pChoker,
  "product-bangles.jpg": pBangles,
  "product-lipset.jpg": pLipset,
  "product-bindi-box.jpg": pBindi,
  "product-kajal.jpg": pKajal,
};

// ─── Storage Signed URL Cache & Resolver ────────────────────────────────────
const signedUrlCache = new Map<string, string>();

export async function signSingleProductImageUrl(url: string | null | undefined): Promise<string> {
  if (!url || typeof url !== "string") return url || "";
  if (signedUrlCache.has(url)) return signedUrlCache.get(url)!;

  const match = url.match(/\/storage\/v1\/object\/public\/product-images\/([^?#]+)/);
  if (match) {
    const filename = decodeURIComponent(match[1]);
    try {
      const { data } = await supabase.storage.from("product-images").createSignedUrl(filename, 315360000);
      if (data?.signedUrl) {
        signedUrlCache.set(url, data.signedUrl);
        return data.signedUrl;
      }
    } catch (e) {
      console.warn("Failed to sign storage URL:", e);
    }
  }
  return url;
}

export async function signProductImageUrls<T extends { image_url?: string | null }>(
  items: T[],
): Promise<T[]> {
  const result = [...items];
  const needSigning: { index: number; filename: string; originalUrl: string }[] = [];

  result.forEach((item, idx) => {
    if (!item.image_url) return;
    if (signedUrlCache.has(item.image_url)) {
      result[idx] = { ...item, image_url: signedUrlCache.get(item.image_url)! };
      return;
    }
    const match = item.image_url.match(/\/storage\/v1\/object\/public\/product-images\/([^?#]+)/);
    if (match) {
      needSigning.push({
        index: idx,
        filename: decodeURIComponent(match[1]),
        originalUrl: item.image_url,
      });
    }
  });

  if (needSigning.length === 0) return result;

  try {
    const filenames = needSigning.map((n) => n.filename);
    const { data } = await supabase.storage.from("product-images").createSignedUrls(filenames, 315360000);
    if (data && Array.isArray(data)) {
      data.forEach((signedItem, i) => {
        if (signedItem?.signedUrl) {
          const entry = needSigning[i];
          signedUrlCache.set(entry.originalUrl, signedItem.signedUrl);
          result[entry.index] = {
            ...result[entry.index],
            image_url: signedItem.signedUrl,
          };
        }
      });
    }
  } catch (err) {
    console.warn("Batch signing error:", err);
  }

  return result;
}

export function resolveImageUrl(url: string | null | undefined, fallback?: string): string {
  if (!url || typeof url !== "string" || !url.trim()) {
    return fallback || pPeacock;
  }
  const clean = url.trim();

  // If a pre-signed version is in cache, use it immediately
  if (signedUrlCache.has(clean)) {
    return signedUrlCache.get(clean)!;
  }

  // 1. Full URLs (http, https, data URL, blob URL)
  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("data:") ||
    clean.startsWith("blob:")
  ) {
    return clean;
  }

  // 2. Local asset mapping by filename
  const filename = clean.replace(/^\//, "");
  if (ASSET_MAP[filename]) {
    return ASSET_MAP[filename];
  }

  // 3. Root relative paths (served from public/)
  if (clean.startsWith("/")) {
    return clean;
  }

  // 4. If fallback provided
  if (fallback) {
    return fallback;
  }

  // 5. Default valid path
  return `/${clean}`;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  description: string;
  image: string;
}

export interface Product {
  slug: string;
  title: string;
  category: CategorySlug;
  price: number;
  compareAt?: number;
  image: string;
  motif?: string;
  description: string;
  included?: string[];
  rating: number;
  reviews: number;
  featured?: boolean;
  stock?: number;
  tags?: string[];
}

// ─── Supabase Row Types ──────────────────────────────────────────────────────
interface SupabaseCategory {
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  image_url: string | null;
}

interface SupabaseProduct {
  id?: string;
  slug: string;
  title: string;
  category_slug: string;
  price: number;
  compare_at: number | null;
  image_url: string | null;
  motif: string | null;
  description: string | null;
  included: string[] | null;
  rating: number | null;
  reviews_count: number | null;
  featured: boolean | null;
  stock: number | null;
  tags: string[] | null;
}

// ─── Normalizers ─────────────────────────────────────────────────────────────
function normalizeCategory(row: SupabaseCategory): Category {
  const fallback = fallbackCategories.find((c) => c.slug === row.slug);
  return {
    slug: row.slug as CategorySlug,
    name: row.name,
    tagline: row.tagline ?? fallback?.tagline ?? "",
    description: row.description ?? fallback?.description ?? "",
    image: resolveImageUrl(row.image_url, fallback?.image),
  };
}

function normalizeProduct(row: SupabaseProduct): Product {
  const fallback = fallbackProducts.find((p) => p.slug === row.slug);
  return {
    slug: row.slug,
    title: row.title,
    category: row.category_slug as CategorySlug,
    price: row.price,
    compareAt: row.compare_at ?? undefined,
    image: resolveImageUrl(row.image_url, fallback?.image),
    motif: row.motif ?? undefined,
    description: row.description ?? fallback?.description ?? "",
    included: row.included ?? undefined,
    rating: row.rating ?? 5.0,
    reviews: row.reviews_count ?? 0,
    featured: row.featured ?? false,
    stock: row.stock ?? undefined,
    tags: row.tags ?? undefined,
  };
}

// ─── Static Fallback Data ────────────────────────────────────────────────────
export const fallbackCategories: Category[] = [
  {
    slug: "rakhi",
    name: "Rakhi",
    tagline: "The bond that shines forever",
    description:
      "Hand-set rakhis, finished with peacock motifs, silken threads and luxury packaging — made for the brother who deserves more than tradition.",
    image: catRakhi,
  },
  {
    slug: "krishna-vastra",
    name: "Krishna Vastra",
    tagline: "Dressing the divine",
    description:
      "Hand-stitched vastra, mukut and shringar for your home Krishna — devotional craftsmanship for Janmashtami and everyday seva.",
    image: catKrishna,
  },
  {
    slug: "jewellery",
    name: "Jewellery",
    tagline: "Heirloom-grade craftsmanship",
    description:
      "Kundan, polki and classic necklaces, earrings and bangles — designed to be worn, gifted and remembered.",
    image: catJewellery,
  },
  {
    slug: "makeup",
    name: "Makeup & Beauty",
    tagline: "Festive-ready, every day",
    description:
      "A small, curated edit of bindi, kajal, lips and gifting boxes — designed for the rituals of getting ready.",
    image: catMakeup,
  },
];

export const fallbackProducts: Product[] = [
  {
    slug: "peacock-ad-rakhi",
    title: "Peacock Rakhi",
    category: "rakhi",
    price: 499,
    compareAt: 699,
    image: pPeacock,
    motif: "Peacock",
    description:
      "A signature peacock medallion set with hand-placed exquisite stones on a deep crimson silk thread. Arrives in our signature gold-foil keepsake box with roli-chawal.",
    included: ["Premium gift box", "Roli-Chawal sachet", "Hand-written tag"],
    rating: 4.9,
    reviews: 124,
    featured: true,
    stock: 42,
    tags: ["bestseller", "peacock", "crimson"],
  },
  {
    slug: "kalash-ad-rakhi",
    title: "Kalash Rakhi",
    category: "rakhi",
    price: 449,
    image: pKalash,
    motif: "Kalash",
    description: "A devotional kalash motif set in antique-finish craftsmanship on warm cream thread.",
    included: ["Premium gift box", "Roli-Chawal sachet"],
    rating: 4.8,
    reviews: 86,
    featured: true,
    stock: 30,
    tags: ["devotional", "gold"],
  },
  {
    slug: "lumba-rakhi-set",
    title: "Bhaiya–Bhabhi Lumba Set",
    category: "rakhi",
    price: 899,
    compareAt: 1199,
    image: pLumba,
    motif: "Floral",
    description:
      "A matching set for brother and sister-in-law — a peacock rakhi paired with a hanging lumba in ruby tones.",
    included: ["Set of 2", "Premium gift box", "Roli-Chawal sachet"],
    rating: 4.9,
    reviews: 53,
    featured: true,
    stock: 18,
    tags: ["set", "bhabhi", "ruby"],
  },
  {
    slug: "minimal-thread-rakhi",
    title: "Minimal Thread Rakhi",
    category: "rakhi",
    price: 299,
    image: pMinimal,
    motif: "Minimal",
    description: "A pared-back single-stone rakhi for the brother who prefers quiet luxury.",
    rating: 4.7,
    reviews: 41,
    stock: 60,
    tags: ["minimal", "everyday"],
  },
  {
    slug: "swastik-ad-rakhi",
    title: "Swastik Rakhi",
    category: "rakhi",
    price: 399,
    image: pSwastik,
    motif: "Swastik",
    description: "Auspicious swastik motif in antique gold with delicate stone work on maroon silk thread.",
    included: ["Premium gift box", "Roli-Chawal sachet"],
    rating: 4.8,
    reviews: 62,
    stock: 24,
    tags: ["devotional", "swastik"],
  },
  {
    slug: "krishna-vastra-orange",
    title: "Saffron Silk Vastra — Krishna",
    category: "krishna-vastra",
    price: 1299,
    image: pVastraSaffron,
    description:
      "Saffron silk vastra with hand-zari border, mukut and peacock-feather crown for laddu Gopal.",
    included: ["Vastra", "Mukut", "Peacock crown"],
    rating: 4.9,
    reviews: 38,
    featured: true,
    stock: 14,
    tags: ["saffron", "laddu-gopal"],
  },
  {
    slug: "krishna-vastra-royal",
    title: "Royal Blue Vastra Set",
    category: "krishna-vastra",
    price: 1499,
    image: pVastraBlue,
    description: "Deep peacock blue vastra with gold zari, paired with mukut and matching pagdi.",
    rating: 4.8,
    reviews: 22,
    stock: 11,
    tags: ["blue", "zari"],
  },
  {
    slug: "ad-kundan-necklace",
    title: "Kundan Necklace",
    category: "jewellery",
    price: 3499,
    compareAt: 4499,
    image: pKundan,
    description: "Statement kundan necklace with matching jhumka earrings.",
    included: ["Necklace", "Earrings"],
    rating: 4.8,
    reviews: 64,
    featured: true,
    stock: 8,
    tags: ["bridal", "kundan"],
  },
  {
    slug: "peacock-jhumka",
    title: "Peacock Jhumka Earrings",
    category: "jewellery",
    price: 1299,
    image: pJhumka,
    description: "Peacock-motif jhumkas in antique gold finish with emerald-tone stones.",
    rating: 4.7,
    reviews: 47,
    stock: 22,
    tags: ["peacock", "earrings"],
  },
  {
    slug: "kundan-choker-set",
    title: "Kundan Choker Bridal Set",
    category: "jewellery",
    price: 4999,
    compareAt: 6499,
    image: pChoker,
    description:
      "Kundan choker set with matching earrings and maang tikka — the bridal statement piece.",
    included: ["Choker", "Earrings", "Maang tikka"],
    rating: 4.9,
    reviews: 31,
    featured: true,
    stock: 6,
    tags: ["bridal", "choker"],
  },
  {
    slug: "rose-gold-bangles",
    title: "Rose Gold Bangles",
    category: "jewellery",
    price: 1799,
    image: pBangles,
    description: "A delicate pair of rose-gold bangles — everyday festive.",
    included: ["Set of 2"],
    rating: 4.6,
    reviews: 27,
    stock: 20,
    tags: ["bangles", "rose-gold"],
  },
  {
    slug: "festive-lip-set",
    title: "Festive Lip Edit",
    category: "makeup",
    price: 899,
    image: pLipset,
    description: "Two satin-matte festive reds in a keepsake gold box.",
    included: ["2 lipsticks", "Gold box"],
    rating: 4.6,
    reviews: 29,
    featured: true,
    stock: 34,
    tags: ["gifting", "lipstick"],
  },
  {
    slug: "bindi-edit-box",
    title: "Heritage Bindi Edit",
    category: "makeup",
    price: 349,
    image: pBindi,
    description: "A curated box of 12 bindi designs, from minimal dots to ornate kundan stickers.",
    rating: 4.5,
    reviews: 18,
    stock: 50,
    tags: ["bindi", "gifting"],
  },
  {
    slug: "kajal-mirror-set",
    title: "Heirloom Kajal & Mirror",
    category: "makeup",
    price: 649,
    image: pKajal,
    description:
      "A gold-cased kajal paired with an heirloom hand mirror — a ritual, not a routine.",
    included: ["Kajal pot", "Hand mirror"],
    rating: 4.7,
    reviews: 15,
    stock: 16,
    tags: ["kajal", "ritual"],
  },
];

// ─── Async Supabase Fetchers (with fallback) ─────────────────────────────────
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("slug, name, tagline, description, image_url")
    .order("name");

  if (error || !data || data.length === 0) {
    return fallbackCategories;
  }

  return data.map(normalizeCategory);
}

export async function fetchProducts(options?: {
  category?: string;
  search?: string;
  sort?: string;
  featured?: boolean;
}): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select(
      "slug, title, category_slug, price, compare_at, image_url, motif, description, included, rating, reviews_count, featured, stock, tags",
    )
    .eq("is_published", true);

  if (options?.category) {
    query = query.eq("category_slug", options.category);
  }

  if (options?.featured) {
    query = query.eq("featured", true);
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,motif.ilike.%${q}%`);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    let list = fallbackProducts;
    if (options?.category) list = list.filter((p) => p.category === options.category);
    if (options?.featured) list = list.filter((p) => p.featured);
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter((p) => {
        const hay = [p.title, p.description, p.category, p.motif ?? "", ...(p.tags ?? [])]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return sortProductList(list, (options?.sort as SortKey) ?? "featured");
  }

  const signedData = await signProductImageUrls(data);
  const normalized = signedData.map(normalizeProduct);
  return sortProductList(normalized, (options?.sort as SortKey) ?? "featured");
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "slug, title, category_slug, price, compare_at, image_url, motif, description, included, rating, reviews_count, featured, stock, tags",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    return fallbackProducts.find((p) => p.slug === slug) ?? null;
  }

  const [signed] = await signProductImageUrls([data]);
  return normalizeProduct(signed);
}

// ─── Synchronous Helpers (for static fallback / SSR) ─────────────────────────
export const categories = fallbackCategories;
export const products = fallbackProducts;

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const productsByCategory = (slug: CategorySlug) =>
  products.filter((p) => p.category === slug);
export const featuredProducts = () => products.filter((p) => p.featured);

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

export function sortProductList(list: Product[], key: SortKey): Product[] {
  const copy = [...list];
  switch (key) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "featured":
    default:
      return copy.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  }
}

export function sortProducts(list: Product[], key: SortKey): Product[] {
  return sortProductList(list, key);
}

export function searchProducts(query: string, list: Product[] = products): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((p) => {
    const hay = [p.title, p.description, p.category, p.motif ?? "", ...(p.tags ?? [])]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
