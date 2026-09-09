import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Star, Instagram, Calendar } from "lucide-react";
import heroRakhi from "@/assets/hero-rakhi.jpg";
import { inr } from "@/lib/products";
import { useLiveCategories, useLiveProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/site/product-card";
import { fetchTestimonials, type Testimonial } from "@/lib/testimonials";
import { fetchInstagramPosts, type InstagramPost } from "@/lib/instagram";
import { fetchPosts, getCategoryLabel, type Post } from "@/lib/blog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ambika Traders — Celebrate the bond that shines forever" },
      {
        name: "description",
        content:
          "Premium rakhis, Krishna vastra, heirloom jewellery and festive beauty — hand-crafted in India.",
      },
      { property: "og:title", content: "Ambika Traders — Premium Festive Luxury" },
      {
        property: "og:description",
        content:
          "Premium rakhis, Krishna vastra, jewellery and beauty. Hand-crafted, gifted with intention.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: categories } = useLiveCategories();
  const { data: featured } = useLiveProducts({ featured: true, sort: "featured" });
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [blogPosts, setBlogPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchTestimonials({ featured: true, limit: 5 }).then(setTestimonials);
    fetchInstagramPosts(6).then(setInstagramPosts);
    fetchPosts({ publishedOnly: true, limit: 3 }).then(setBlogPosts);
  }, []);
  return (
    <>
      {/* HERO */}
      <section className="relative grain overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-6 pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative z-10">
            <h1 className="mt-6 font-display text-[clamp(2.75rem,7vw,6rem)] leading-[0.95] tracking-[-0.03em]">
              Celebrate
              <br />
              the bond
              <br />
              that <em className="not-italic text-peacock font-display">shines</em>
              <br />
              forever.
            </h1>
            <p className="mt-8 text-base lg:text-lg text-muted-foreground max-w-md leading-relaxed">
              Hand-set rakhis, finished with peacock motifs and luxury packaging —
              because every bond deserves a touch of luxury.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/shop/$category"
                params={{ category: "rakhi" }}
                className="group inline-flex items-center gap-3 bg-peacock text-ivory pl-7 pr-3 py-3 rounded-full text-sm tracking-wider hover:bg-peacock-deep transition-colors"
              >
                Discover the Collection
                <span className="h-9 w-9 rounded-full bg-ivory text-peacock flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link to="/about" className="text-sm underline underline-offset-4 hover:text-peacock">
                Our story
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={heroRakhi}
                alt="Premium Peacock Rakhi"
                width={1600}
                height={1280}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-ink/10 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between bg-ivory/85 backdrop-blur-md p-5 border border-border">
                <div>
                  <p className="eyebrow">Signature piece</p>
                  <p className="font-display text-xl mt-1">Peacock Rakhi</p>
                </div>
                <Link
                  to="/product/$slug"
                  params={{ slug: "peacock-ad-rakhi" }}
                  className="text-sm underline underline-offset-4 hover:text-peacock"
                >
                  {inr(499)} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 lg:py-32">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-16">
          <div className="max-w-xl">
            <p className="eyebrow">Four worlds, one craft</p>
            <h2 className="mt-3 font-display text-4xl lg:text-6xl">
              Elegance in every detail,
              <br />
              <span className="text-peacock italic">crafted for eternity.</span>
            </h2>
          </div>
          <Link to="/shop" className="text-sm underline underline-offset-4 hover:text-peacock">
            View everything →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {categories?.map((c, i) => (
            <Link
              key={c.slug}
              to="/shop/$category"
              params={{ category: c.slug }}
              className={`group relative overflow-hidden block ${
                i % 3 === 0 ? "md:row-span-2 md:aspect-[3/4]" : "aspect-[4/3]"
              }`}
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-ivory">
                <p className="text-[10px] tracking-[0.32em] uppercase opacity-80">{c.tagline}</p>
                <h3 className="font-display text-3xl lg:text-5xl mt-2 flex items-center gap-4">
                  {c.name}
                  <ArrowRight className="h-6 w-6 opacity-0 -translate-x-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0" />
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 lg:py-32 border-t border-border">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
          <div>
            <p className="eyebrow">Most loved</p>
            <h2 className="mt-3 font-display text-4xl lg:text-5xl">The Festive Edit</h2>
          </div>
          <Link to="/shop" className="text-sm underline underline-offset-4 hover:text-peacock">
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {featured?.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* STORY */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 lg:py-32 border-t border-border">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <p className="eyebrow">The house</p>
            <h2 className="mt-3 font-display text-4xl lg:text-5xl leading-tight">
              A small atelier with a singular obsession —{" "}
              <span className="text-peacock italic">festive luxury, gifted with intention.</span>
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 space-y-6 text-muted-foreground">
            <p>
              Ambika Traders began with a peacock rakhi, hand-set with exquisite stones, and a
              feeling — that the bond between a brother and sister deserved more than a token. It
              deserved a keepsake.
            </p>
            <p>
              Today we craft across four worlds — rakhi, Krishna vastra, heirloom jewellery and
              curated beauty — but the obsession is the same: fewer pieces, finished better,
              packaged like a love letter.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-foreground underline underline-offset-4 hover:text-peacock"
            >
              Read our story <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 py-24 lg:py-32 border-t border-border">
          <div className="text-center mb-12">
            <p className="eyebrow">What our customers say</p>
            <h2 className="mt-3 font-display text-4xl lg:text-5xl">Trusted by thousands</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  "{t.review_text}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm block">{t.customer_name}</span>
                    {t.location && (
                      <span className="text-xs text-muted-foreground">{t.location}</span>
                    )}
                  </div>
                  {t.product_slug && (
                    <Link
                      to="/product/$slug"
                      params={{ slug: t.product_slug }}
                      className="text-[10px] text-peacock font-semibold hover:underline"
                    >
                      View product →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* INSTAGRAM FEED */}
      {instagramPosts.length > 0 && (
        <section className="border-t border-border bg-parchment/30">
          <div className="mx-auto max-w-[1400px] px-6 py-24 lg:py-32">
            <div className="text-center mb-12">
              <p className="eyebrow flex items-center justify-center gap-2">
                <Instagram className="w-3 h-3" /> Follow us
              </p>
              <h2 className="mt-3 font-display text-4xl lg:text-5xl">@ambika_rakhi</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {instagramPosts.map((post) => (
                <a
                  key={post.id}
                  href={post.post_url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative aspect-square overflow-hidden bg-parchment rounded-sm"
                >
                  <img
                    src={post.image_url}
                    alt={post.caption || "Instagram post"}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors flex items-center justify-center">
                    <Instagram className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              ))}
            </div>
            <div className="text-center mt-8">
              <a
                href="https://www.instagram.com/ambika_rakhi?igsh=MW4yaHF0YXR2enBzdQ=="
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-peacock transition-colors"
              >
                Follow on Instagram <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* FROM THE JOURNAL */}
      {blogPosts.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 py-24 lg:py-32 border-t border-border">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div>
              <p className="eyebrow">From the Journal</p>
              <h2 className="mt-3 font-display text-4xl lg:text-5xl">Stories & guides</h2>
            </div>
            <Link to="/blog" className="text-sm underline underline-offset-4 hover:text-peacock">
              Read all →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
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
                        })}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl group-hover:text-peacock transition-colors leading-snug">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
