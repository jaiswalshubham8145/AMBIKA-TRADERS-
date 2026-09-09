import { supabase } from "@/lib/supabase";

export interface Testimonial {
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

export async function fetchTestimonials(options?: {
  featured?: boolean;
  limit?: number;
  productSlug?: string;
}): Promise<Testimonial[]> {
  let query = supabase
    .from("testimonials")
    .select(
      "id, customer_name, location, rating, review_text, product_slug, is_featured, is_approved, created_at",
    )
    .eq("is_approved", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (options?.featured) {
    query = query.eq("is_featured", true);
  }

  if (options?.productSlug) {
    query = query.eq("product_slug", options.productSlug);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as Testimonial[];
}
