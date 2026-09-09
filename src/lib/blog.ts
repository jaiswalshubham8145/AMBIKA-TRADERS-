import { supabase } from "@/lib/supabase";

export interface Post {
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
  updated_at: string;
}

export async function fetchPosts(options?: {
  category?: string;
  limit?: number;
  publishedOnly?: boolean;
}): Promise<Post[]> {
  let query = supabase
    .from("posts")
    .select(
      "id, slug, title, excerpt, content, cover_image_url, author_name, category, tags, is_published, published_at, created_at, updated_at",
    )
    .order("published_at", { ascending: false });

  if (options?.publishedOnly !== false) {
    query = query.eq("is_published", true);
  }

  if (options?.category) {
    query = query.eq("category", options.category);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as Post[];
}

export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, slug, title, excerpt, content, cover_image_url, author_name, category, tags, is_published, published_at, created_at, updated_at",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) return null;
  return data as Post;
}

export async function searchPosts(query: string): Promise<Post[]> {
  const q = query.toLowerCase();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, slug, title, excerpt, content, cover_image_url, author_name, category, tags, is_published, published_at, created_at, updated_at",
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error || !data) return [];

  return (data as Post[]).filter((p) => {
    const hay = [p.title, p.excerpt ?? "", p.content, p.category, ...p.tags]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export const POST_CATEGORIES = [
  { value: "festival", label: "Festival" },
  { value: "gifting", label: "Gifting" },
  { value: "craft", label: "Craft" },
  { value: "behind-the-scenes", label: "Behind the Scenes" },
  { value: "general", label: "General" },
] as const;

export function getCategoryLabel(value: string): string {
  return POST_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
