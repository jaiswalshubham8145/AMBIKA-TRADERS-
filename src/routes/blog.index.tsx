import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Calendar, ArrowRight } from "lucide-react";
import { fetchPosts, POST_CATEGORIES, getCategoryLabel, type Post } from "@/lib/blog";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "The Journal — Ambika Traders" },
      {
        name: "description",
        content:
          "Stories on festive traditions, gifting guides, artisan craft, and the art of celebration.",
      },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchPosts({ publishedOnly: true });
      setPosts(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = posts.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      [p.title, p.excerpt ?? "", p.content, ...p.tags]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 lg:py-20">
      <header className="text-center mb-12">
        <p className="eyebrow">The Journal</p>
        <h1 className="mt-3 font-display text-4xl lg:text-6xl">
          Stories, guides & <span className="text-peacock italic">behind the craft</span>
        </h1>
        <p className="mt-4 text-sm text-muted-foreground max-w-lg mx-auto">
          Explore festive traditions, gifting inspiration, and the artistry behind every piece.
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 max-w-2xl mx-auto">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2.5 bg-parchment/50 border border-border rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-peacock"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeCategory === "all"
                ? "bg-peacock text-ivory"
                : "bg-parchment text-muted-foreground hover:bg-parchment/80"
            }`}
          >
            All
          </button>
          {POST_CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setActiveCategory(c.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === c.value
                  ? "bg-peacock text-ivory"
                  : "bg-parchment text-muted-foreground hover:bg-parchment/80"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground animate-pulse">
          Loading articles...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          No articles found. Try a different search or category.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((post) => (
            <Link
              key={post.id}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="group block"
            >
              {post.cover_image_url ? (
                <div className="aspect-[16/9] overflow-hidden bg-parchment rounded-sm">
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-[16/9] bg-gradient-to-br from-peacock/10 to-parchment rounded-sm flex items-center justify-center">
                  <span className="font-display text-5xl text-peacock/20">✦</span>
                </div>
              )}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-parchment text-[10px] font-semibold uppercase tracking-wider text-muted-foreground rounded">
                    {getCategoryLabel(post.category)}
                  </span>
                  {post.published_at && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.published_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
                <h2 className="font-display text-xl group-hover:text-peacock transition-colors leading-snug">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                )}
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-peacock">
                  Read more <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
