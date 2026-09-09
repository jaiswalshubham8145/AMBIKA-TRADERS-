import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, ArrowLeft, Tag, User } from "lucide-react";
import { fetchPostBySlug, getCategoryLabel, type Post } from "@/lib/blog";

export const Route = createFileRoute("/blog/$slug")({
  head: () => ({
    meta: [
      { title: "Blog — Ambika Traders" },
      { name: "description", content: "Read the full article." },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Article not found</h1>
      <Link to="/blog" className="mt-6 inline-block underline">
        Back to journal
      </Link>
    </div>
  ),
  component: BlogPost,
});

function BlogPost() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchPostBySlug(slug);
      if (data) {
        setPost(data);
        document.title = `${data.title} — Ambika Traders`;
      } else {
        setNotFoundState(true);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="text-sm text-muted-foreground animate-pulse">Loading article...</p>
      </div>
    );
  }

  if (notFoundState || !post) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="font-display text-4xl">Article not found</h1>
        <Link to="/blog" className="mt-6 inline-block underline">
          Back to journal
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 lg:py-20">
      <Link
        to="/blog"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Journal
      </Link>

      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2.5 py-0.5 bg-parchment text-[10px] font-semibold uppercase tracking-wider text-muted-foreground rounded">
            {getCategoryLabel(post.category)}
          </span>
          {post.published_at && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.published_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          )}
        </div>
        <h1 className="font-display text-3xl lg:text-5xl leading-tight">{post.title}</h1>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <User className="w-3.5 h-3.5" />
          <span>{post.author_name}</span>
        </div>
      </header>

      {post.cover_image_url && (
        <div className="aspect-[16/9] overflow-hidden bg-parchment rounded-sm mb-10">
          <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}

      {post.excerpt && (
        <p className="text-lg text-muted-foreground italic mb-8 border-l-2 border-peacock pl-4">
          {post.excerpt}
        </p>
      )}

      {/* Content rendered with basic markdown support */}
      <div className="prose prose-neutral max-w-none">
        {post.content.split("\n\n").map((block, i) => {
          if (block.startsWith("## ")) {
            return (
              <h2 key={i} className="font-display text-2xl mt-10 mb-4 text-foreground">
                {block.replace("## ", "")}
              </h2>
            );
          }
          return (
            <p key={i} className="text-muted-foreground leading-relaxed mb-4">
              {block}
            </p>
          );
        })}
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mt-10 pt-6 border-t border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 bg-parchment text-[11px] font-medium text-muted-foreground rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter CTA */}
      <div className="mt-12 p-8 bg-parchment/50 border border-border rounded-xl text-center">
        <p className="eyebrow mb-2">Stay inspired</p>
        <p className="text-sm text-muted-foreground mb-4">
          Get festive stories, behind-the-scenes content, and exclusive offers.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-peacock text-ivory px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-peacock-deep transition-colors"
        >
          Explore the collection
        </Link>
      </div>
    </article>
  );
}
