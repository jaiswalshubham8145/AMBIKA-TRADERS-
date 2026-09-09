import { supabase } from "@/lib/supabase";

export interface InstagramPost {
  id: string;
  image_url: string;
  post_url: string;
  caption: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export async function fetchInstagramPosts(limit?: number): Promise<InstagramPost[]> {
  let query = supabase
    .from("instagram_posts")
    .select("id, image_url, post_url, caption, display_order, is_active, created_at")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as InstagramPost[];
}
