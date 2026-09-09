import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Star, Calendar, Sparkles, Award, ShieldCheck } from "lucide-react";
import heroRakhi from "@/assets/hero-rakhi.jpg";
import { inr } from "@/lib/products";
import { useLiveCategories, useLiveProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/site/product-card";
import { fetchTestimonials, type Testimonial } from "@/lib/testimonials";
import { fetchPosts, getCategoryLabel, type Post } from "@/lib/blog";
import { VelocityMarquee } from "@/components/site/velocity-marquee";

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
  const [blogPosts, setBlogPosts] = useState<Post[]>([]);

  // Hero 2.5D Parallax Refs & Transforms (Strictly 2D translate & scale)
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Multi-plane velocity differential for 2.5D illusion
  const backgroundY = useTransform(heroScroll, [0, 1], [0, 90]);
  const midgroundY = useTransform(heroScroll, [0, 1], [0, 35]);
  const foregroundY = useTransform(heroScroll, [0, 1], [0, -75]);
  const heroBadgeY = useTransform(heroScroll, [0, 1], [0, -110]);
  const heroOpacity = useTransform(heroScroll, [0, 0.85], [1, 0.2]);

  // Story section 2.5D Parallax
  const storyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: storyScroll } = useScroll({
    target: storyRef,
    offset: ["start end", "end start"],
  });
  const storyBadgeY = useTransform(storyScroll, [0, 1], [40, -40]);

  useEffect(() => {
    fetchTestimonials({ featured: true, limit: 5 }).then(setTestimonials);
    fetchPosts({ publishedOnly: true, limit: 3 }).then(setBlogPosts);
  }, []);

  return (
    <>
      {/* 2.5D MULTI-PLANE PARALLAX HERO (MOBILE-FIRST) */}
      <section
        ref={heroRef}
        className="relative grain overflow-hidden min-h-[90vh] sm:min-h-[85vh] flex items-center"
      >
        {/* Plane 1: Background Ambient Glow Aura (Translates slowly: 0.2x) */}
        <motion.div
          style={{ y: backgroundY }}
          className="pointer-events-none absolute -top-24 -left-24 w-[360px] sm:w-[540px] h-[360px] sm:h-[540px] rounded-full bg-gradient-to-br from-peacock/15 via-gold/10 to-transparent blur-3xl will-change-transform z-0"
          aria-hidden="true"
        />
        <motion.div
          style={{ y: backgroundY }}
          className="pointer-events-none absolute top-1/2 -right-24 w-[300px] sm:w-[480px] h-[300px] sm:h-[480px] rounded-full bg-gradient-to-bl from-rose/10 via-gold/15 to-transparent blur-3xl will-change-transform z-0"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 pt-12 pb-20 lg:pt-20 lg:pb-28 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center w-full">
          {/* Left Column: Kinetic Typography & Actions */}
          <motion.div style={{ opacity: heroOpacity }} className="lg:col-span-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-peacock/20 bg-parchment/60 px-3.5 py-1 text-xs text-peacock backdrop-blur-xs mb-4"
            >
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span className="font-medium tracking-wide">
                Festive Collection 2026 • Handcrafted in India
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[clamp(2.6rem,7.5vw,5.5rem)] leading-[0.96] tracking-[-0.03em]"
            >
              Celebrate
              <br />
              the bond
              <br />
              that{" "}
              <em className="not-italic text-peacock font-display relative inline-block">
                shines
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.9, delay: 0.6, ease: "easeOut" }}
                  className="absolute left-0 -bottom-1 w-full h-[3px] bg-gradient-to-r from-peacock to-gold origin-left rounded-full"
                />
              </em>
              <br />
              forever.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 sm:mt-8 text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed"
            >
              Hand-set rakhis, finished with peacock motifs and velvet heirloom packaging — because
              every sacred bond deserves an everlasting keepsake.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/shop/$category"
                params={{ category: "rakhi" }}
                className="group inline-flex items-center gap-3 bg-peacock text-ivory pl-7 pr-3 py-3 rounded-full text-sm font-medium tracking-wider hover:bg-peacock-deep hover:shadow-[0_12px_28px_-6px_rgba(14,110,107,0.35)] active:scale-95 transition-all"
              >
                Discover the Collection
                <span className="h-9 w-9 rounded-full bg-ivory text-peacock flex items-center justify-center transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium underline underline-offset-4 hover:text-peacock transition-colors px-2 py-1"
              >
                Our story
              </Link>
            </motion.div>

            {/* Micro Trust Proofs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-10 sm:mt-12 pt-6 border-t border-border/70 flex items-center gap-6 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-peacock" /> Pure Brass & Zari
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-gold" /> 100% Handcrafted
              </span>
            </motion.div>
          </motion.div>

          {/* Right Column: Plane 2 & 3 (Midground Image + Foreground Floating Medallion) */}
          <div className="lg:col-span-6 relative">
            {/* Plane 2: Midground Hero Card with 2.5D Elevation */}
            <motion.div
              style={{ y: midgroundY }}
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border/80 bg-parchment shadow-[0_25px_50px_-12px_rgba(14,110,107,0.18)] will-change-transform group"
            >
              <img
                src={heroRakhi}
                alt="Premium Peacock Rakhi"
                width={1600}
                height={1280}
                className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-ink/20 via-transparent to-transparent pointer-events-none" />

              {/* In-card floating badge */}
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between bg-ivory/90 backdrop-blur-md p-4 sm:p-5 border border-border/80 rounded-xl shadow-md">
                <div>
                  <p className="eyebrow">Signature piece</p>
                  <p className="font-display text-lg sm:text-xl mt-1">Peacock AD Rakhi</p>
                </div>
                <Link
                  to="/product/$slug"
                  params={{ slug: "peacock-ad-rakhi" }}
                  className="text-xs sm:text-sm font-medium underline underline-offset-4 hover:text-peacock transition-colors"
                >
                  {inr(499)} →
                </Link>
              </div>
            </motion.div>

            {/* Plane 3: Foreground Detached Floating Medallion (Accelerated: 1.5x) */}
            <motion.div
              style={{ y: foregroundY }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
              className="hidden sm:flex absolute -top-8 -left-8 z-20 items-center gap-3 bg-ivory/95 border border-gold/40 shadow-[0_16px_32px_-6px_rgba(200,162,86,0.3)] backdrop-blur-md px-4 py-2.5 rounded-full will-change-transform"
            >
              <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                ✦
              </div>
              <div className="text-left">
                <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-peacock">
                  Heirloom Craft
                </p>
                <p className="text-xs font-serif text-foreground font-medium">
                  Jaipur Artisanal Workshop
                </p>
              </div>
            </motion.div>

            {/* Additional Floating Tag */}
            <motion.div
              style={{ y: heroBadgeY }}
              className="absolute -bottom-6 -right-4 sm:-right-6 z-20 bg-peacock text-ivory text-xs px-4 py-2 rounded-full shadow-lg border border-white/20 font-medium tracking-wide flex items-center gap-2 will-change-transform"
            >
              <span className="text-gold">★</span> Top Seller 2026
            </motion.div>
          </div>
        </div>
      </section>

      {/* KINETIC VELOCITY MARQUEE 1 (ACCELERATES ON USER TOUCH SWIPE) */}
      <VelocityMarquee
        speed={1.4}
        text="HANDCRAFTED HERITAGE • SACRED KRISHNA VASTRA • HEIRLOOM RAKHIS • AMBIKA TRADERS • TIMELESS LUXURY"
      />

      {/* "FOUR WORLDS" CATEGORIES SECTION (TACTILE 2.5D ELEVATION) */}
      <section className="mx-auto max-w-[1400px] px-6 py-20 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-end justify-between flex-wrap gap-6 mb-12 lg:mb-16"
        >
          <div className="max-w-xl">
            <p className="eyebrow">Four worlds, one craft</p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl lg:text-6xl leading-[1.05]">
              Elegance in every detail,
              <br />
              <span className="text-peacock italic">crafted for eternity.</span>
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-medium underline underline-offset-4 hover:text-peacock transition-colors"
          >
            View everything →
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {categories?.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{
                duration: 0.75,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{
                y: -6,
                scale: 1.015,
                boxShadow: "0 24px 40px -12px rgba(14, 110, 107, 0.22)",
              }}
              whileTap={{ scale: 0.985 }}
              className="group relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden rounded-md border border-border/80 bg-parchment shadow-md transition-all duration-300 will-change-transform"
            >
              <Link
                to="/shop/$category"
                params={{ category: c.slug }}
                className="block h-full w-full"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

                {/* 2.5D Specular Sheen Beam on Hover/Tap */}
                <span
                  className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-hidden="true"
                >
                  <span className="absolute inset-0 -translate-x-full animate-sheen bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </span>

                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-ivory z-20">
                  <p className="text-[10px] tracking-[0.32em] uppercase opacity-85 font-medium">
                    {c.tagline}
                  </p>
                  <h3 className="font-display text-2xl sm:text-4xl lg:text-5xl mt-2 flex items-center justify-between gap-4">
                    <span>{c.name}</span>
                    <span className="h-10 w-10 rounded-full bg-ivory/20 backdrop-blur-xs flex items-center justify-center transition-transform duration-500 group-hover:translate-x-1 group-hover:bg-ivory group-hover:text-peacock">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED: "THE FESTIVE EDIT" (SPRING WAVE 2.5D REVEALS) */}
      <section className="mx-auto max-w-[1400px] px-6 py-20 lg:py-28 border-t border-border">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7 }}
          className="flex items-end justify-between flex-wrap gap-6 mb-12"
        >
          <div>
            <p className="eyebrow">Most loved</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl">The Festive Edit</h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-medium underline underline-offset-4 hover:text-peacock transition-colors"
          >
            See all pieces →
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 gap-y-10 sm:gap-y-12">
          {featured?.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* BRAND STORY & ATELIER SECTION (2.5D PARALLAX DEPTH) */}
      <section
        ref={storyRef}
        className="mx-auto max-w-[1400px] px-6 py-20 lg:py-28 border-t border-border overflow-hidden"
      >
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6"
          >
            <p className="eyebrow">The house</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl leading-tight">
              A small atelier with a singular obsession —{" "}
              <span className="text-peacock italic">festive luxury, gifted with intention.</span>
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
              <p>
                Ambika Traders began with a single peacock rakhi, hand-set with faceted stones and
                pure zari, and a quiet conviction: that the sacred bond between siblings deserves
                more than a temporary token. It deserves an everlasting heirloom.
              </p>
              <p>
                Today we craft across four sacred worlds — rakhi, Krishna vastra, heirloom jewellery
                and curated beauty — with the same uncompromising ethos: fewer pieces, finished
                better, packaged like a love letter.
              </p>
            </div>
            <div className="mt-8">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-foreground font-medium underline underline-offset-4 hover:text-peacock transition-colors"
              >
                Read our full story <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          {/* 2.5D Layered Image & Floating Seal */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/3] rounded-md overflow-hidden border border-border/80 bg-parchment shadow-xl"
            >
              <img
                src={heroRakhi}
                alt="Ambika Traders Atelier Craftsmanship"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
            </motion.div>

            {/* Overlapping 2.5D Parallax Seal */}
            <motion.div
              style={{ y: storyBadgeY }}
              className="absolute -bottom-6 -left-4 sm:-left-8 bg-ivory/95 backdrop-blur-md border border-gold/40 p-4 sm:p-5 rounded-md shadow-2xl max-w-[240px] will-change-transform"
            >
              <span className="text-gold text-xl block mb-1">✦</span>
              <p className="font-display text-sm font-medium text-foreground">Zero Compromise</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Every thread inspected by hand before dispatch.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* KINETIC VELOCITY MARQUEE 2 (INTERLUDE RIBBON) */}
      <VelocityMarquee
        speed={1.2}
        className="bg-ivory border-y border-peacock/15"
        text="FREE EXPRESS SHIPPING ACROSS INDIA • SIGNATURE VELVET PACKAGING • OVER 10,000 SATISFIED SIBLINGS • PURE ZARI & BRASS"
      />

      {/* TESTIMONIALS (2.5D TACTILE ELEVATION CARDS) */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <p className="eyebrow">What our customers say</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl">
              Trusted by thousands
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -5,
                  scale: 1.015,
                  boxShadow: "0 20px 35px -10px rgba(14, 110, 107, 0.15)",
                }}
                whileTap={{ scale: 0.985 }}
                className="bg-card border border-border rounded-md p-6 shadow-xs transition-shadow duration-300 will-change-transform"
              >
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, starIdx) => (
                    <Star
                      key={starIdx}
                      className={`w-4 h-4 ${
                        starIdx < t.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  "{t.review_text}"
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
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
                      className="text-[11px] text-peacock font-semibold hover:underline"
                    >
                      View product →
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* FROM THE JOURNAL */}
      {blogPosts.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-6 py-20 lg:py-28 border-t border-border">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div>
              <p className="eyebrow">From the Journal</p>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl">
                Stories & guides
              </h2>
            </div>
            <Link
              to="/blog"
              className="text-sm font-medium underline underline-offset-4 hover:text-peacock transition-colors"
            >
              Read all →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="group block"
              >
                <Link to="/blog/$slug" params={{ slug: post.slug }} className="block">
                  {post.cover_image_url ? (
                    <div className="aspect-[16/9] overflow-hidden bg-parchment rounded-sm border border-border/50">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-gradient-to-br from-peacock/10 to-parchment rounded-sm flex items-center justify-center border border-border/50">
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
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
