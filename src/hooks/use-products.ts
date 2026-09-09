import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCategories,
  fetchProducts,
  fetchProductBySlug,
  fallbackCategories,
  fallbackProducts,
  sortProductList,
  searchProducts,
  type Category,
  type Product,
  type SortKey,
} from "@/lib/products";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 30 * 60 * 1000; // 30 minutes

// ─── useLiveCategories ───────────────────────────────────────────────────────
export function useLiveCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    placeholderData: fallbackCategories,
  });
}

// ─── useLiveProducts ─────────────────────────────────────────────────────────
interface UseLiveProductsOptions {
  category?: string;
  search?: string;
  sort?: SortKey;
  featured?: boolean;
  enabled?: boolean;
}

export function useLiveProducts(options: UseLiveProductsOptions = {}) {
  const { category, search, sort = "featured", featured, enabled = true } = options;

  return useQuery<Product[]>({
    queryKey: ["products", { category, search, sort, featured }],
    queryFn: () => fetchProducts({ category, search, sort, featured }),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled,
    placeholderData: () => {
      let list = fallbackProducts;
      if (category) list = list.filter((p) => p.category === category);
      if (featured) list = list.filter((p) => p.featured);
      if (search) list = searchProducts(search, list);
      return sortProductList(list, sort);
    },
  });
}

// ─── useLiveProduct ──────────────────────────────────────────────────────────
export function useLiveProduct(slug: string) {
  return useQuery<Product | null>({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    placeholderData: () => fallbackProducts.find((p) => p.slug === slug) ?? null,
  });
}

// ─── Cache Invalidation Helper ───────────────────────────────────────────────
export function useInvalidateProductCatalog() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["product"] });
  };
}
