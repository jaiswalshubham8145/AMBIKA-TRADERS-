import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  type Variants,
} from "framer-motion";
import {
  Sparkles,
  Phone,
  Mail,
  Copy,
  Check,
  Crown,
  Cpu,
  Bot,
  ShieldCheck,
  Lock,
  Feather,
  ArrowUpRight,
  Send,
  Compass,
  Code2,
  Terminal,
  Layers,
  Star,
  Quote,
} from "lucide-react";

export const Route = createFileRoute("/maker")({
  head: () => ({
    meta: [
      {
        title: "The Maker & Architectural Artificer — Shubham Jaiswal | Ambika Traders",
      },
      {
        name: "description",
        content:
          "Meet the Maker behind Ambika Traders. Conceived, architected, and engineered by Shubham Jaiswal — artificer of digital architecture and intelligence.",
      },
      {
        property: "og:title",
        content: "The Maker & Architectural Artificer — Shubham Jaiswal",
      },
      {
        property: "og:description",
        content:
          "Where code becomes craft, intelligence becomes artistry, and vision becomes legacy.",
      },
    ],
  }),
  component: MakerPage,
});

interface ConstellationItem {
  id: string;
  title: string;
  codename: string;
  role: string;
  badge: string;
  isFlagship?: boolean;
  icon: typeof Crown;
  description: string;
  quoteSnippet: string;
  tags: string[];
  gradient: string;
}

const CONSTELLATION: ConstellationItem[] = [
  {
    id: "ambika-traders",
    title: "Ambika Traders",
    codename: "The Crown Jewel",
    role: "Commissioned Masterwork",
    badge: "Featured Flagship",
    isFlagship: true,
    icon: Crown,
    description:
      "A commissioned masterwork of e-commerce elegance, crafted for a patron of discerning taste. Infused with Ivory Luxe palettes, bespoke Indian typography, fluid kinetic scrolling, real-time checkout orchestration, and an artisan catalog celebrating festive heirlooms.",
    quoteSnippet: "Crafted for a patron of discerning taste.",
    tags: ["TanStack Start", "React 19", "Supabase", "Tailwind v4", "High Luxury"],
    gradient: "from-peacock/25 via-gold/15 to-transparent",
  },
  {
    id: "pu-unicare",
    title: "PU UNICARE",
    codename: "Enterprise Citadel",
    role: "AI Orchestration Platform",
    badge: "Autonomous Core",
    icon: Cpu,
    description:
      "A citadel of AI-orchestrated order amid enterprise chaos. Harmonizes multi-departmental topologies, automated triage, and systemic synchronization into unified operational poise.",
    quoteSnippet: "A citadel of AI-orchestrated order amid enterprise chaos.",
    tags: ["AI Orchestration", "Enterprise Architecture", "Autonomous Workflows"],
    gradient: "from-peacock/20 via-parchment/30 to-transparent",
  },
  {
    id: "velorplex",
    title: "VELORPLEX",
    codename: "Cognitive Hive",
    role: "Autonomous Agent Marketplace",
    badge: "Multi-Agent System",
    icon: Bot,
    description:
      "A marketplace where autonomous minds labor in silent harmony. Harnesses decentralized collaborative agents to perform complex, multi-modal tasks with cryptographic precision and continuous learning.",
    quoteSnippet: "Where autonomous minds labor in silent harmony.",
    tags: ["Multi-Agent AI", "Decentralized Systems", "Autonomous Economy"],
    gradient: "from-gold/25 via-peacock/10 to-transparent",
  },
  {
    id: "krishna",
    title: "Krishna",
    codename: "Local Sovereign",
    role: "Private AI Sentinel",
    badge: "JARVIS Spirit",
    icon: ShieldCheck,
    description:
      "A sentinel of local intelligence born in the spirit of JARVIS. Engineered with an unwavering ethos of total data sovereignty, zero external leaks, and contextual executive cognition directly on private silicon.",
    quoteSnippet: "A sentinel of local intelligence born in the spirit of JARVIS.",
    tags: ["On-Device AI", "JARVIS Paradigm", "Zero-Leak Sovereignty"],
    gradient: "from-rose/20 via-peacock/10 to-transparent",
  },
  {
    id: "murvnsin",
    title: "Murvnsin",
    codename: "Confessional Sanctum",
    role: "Cryptographic Privacy Sanctuary",
    badge: "Zero-Knowledge",
    icon: Lock,
    description:
      "A hushed sanctuary where confession finds refuge behind veils of AI-wrought privacy. Provides absolute emotional sanctuary with zero-knowledge cryptographic safeguards and empathetic machine understanding.",
    quoteSnippet: "Where confession finds refuge behind veils of AI-wrought privacy.",
    tags: ["Zero-Knowledge Privacy", "Confidential Compute", "Empathetic AI"],
    gradient: "from-peacock/20 via-rose/15 to-transparent",
  },
  {
    id: "likhasha",
    title: "Likhasha",
    codename: "Artificial Muse",
    role: "Cinematic Literary Engine",
    badge: "Generative Verse",
    icon: Feather,
    description:
      "A cinematic reverie where verse is composed by artificial muse. Synthesizes poetic cadence, classical metaphors, and lyrical resonance into breathtaking literary expressions.",
    quoteSnippet: "A cinematic reverie where verse is composed by artificial muse.",
    tags: ["Generative Literature", "Poetic Synthesis", "Cinematic Prompting"],
    gradient: "from-gold/20 via-rose/15 to-transparent",
  },
];

const DOMINION_PROJECTS = [
  {
    name: "PU UNICARE",
    badge: "Enterprise Citadel",
    prose: "a citadel of AI-orchestrated order amid enterprise chaos",
  },
  {
    name: "VELORPLEX",
    badge: "Cognitive Hive",
    prose: "a marketplace where autonomous minds labor in silent harmony",
  },
  {
    name: "Krishna",
    badge: "JARVIS Spirit",
    prose: "a sentinel of local intelligence born in the spirit of JARVIS",
  },
  {
    name: "Murvnsin",
    badge: "Zero-Knowledge Sanctum",
    prose: "a hushed sanctuary where confession finds refuge behind veils of AI-wrought privacy",
  },
  {
    name: "Likhasha",
    badge: "Artificial Muse",
    prose: "a cinematic reverie where verse is composed by artificial muse",
  },
];

const CRAFT_PILLARS = [
  {
    icon: Code2,
    num: "01",
    title: "Code as Craft",
    italicSub: "The discipline of mathematical purity",
    summary:
      "Architectures forged with mathematical purity. Zero-bloat, self-documenting, and meticulously engineered to endure without fragility.",
  },
  {
    icon: Sparkles,
    num: "02",
    title: "Intelligence as Artistry",
    italicSub: "Machine cognition with human grace",
    summary:
      "Autonomous minds and machine cognition interwoven as natural extensions of human intuition, grace, and purposeful aesthetic poise.",
  },
  {
    icon: Compass,
    num: "03",
    title: "Vision as Legacy",
    italicSub: "Monuments built beyond the ephemeral",
    summary:
      "Transcendence beyond ephemeral trends. Every line, schema, and layout is authored to stand as a testament of enduring quiet grandeur.",
  },
];

// Magnetic Hover Physics Wrapper
function MagneticElement({
  children,
  strength = 18,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 18, stiffness: 180, mass: 0.15 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    x.set(deltaX * strength);
    y.set(deltaY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Flow Mask Reveal + Blur-to-Sharp + Letter-Spacing Collapse + Word Stagger
function CinematicTextReveal({
  text,
  className = "",
  delay = 0,
  stagger = 0.035,
  highlightWords = [],
  italicWords = [],
  allItalic = false,
  expandTracking = true,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  highlightWords?: string[];
  italicWords?: string[];
  allItalic?: boolean;
  expandTracking?: boolean;
}) {
  const words = text.split(" ");

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
      className={`inline-block ${className}`}
    >
      {words.map((word, i) => {
        const clean = word.toLowerCase().replace(/[^a-z0-9]/g, "");
        const isHighlight = highlightWords.some((h) => clean.includes(h.toLowerCase()));
        const isItalic = allItalic || italicWords.some((w) => clean.includes(w.toLowerCase()));

        return (
          <motion.span
            key={`${word}-${i}`}
            variants={{
              hidden: {
                opacity: 0,
                y: 18,
                filter: "blur(12px)",
                letterSpacing: expandTracking ? "0.28em" : "normal",
                scale: 0.96,
              },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                letterSpacing: "normal",
                scale: 1,
                transition: {
                  duration: 0.65,
                  ease: [0.16, 1, 0.3, 1] as const,
                },
              },
            }}
            className={`inline-block mr-[0.28em] ${
              isItalic ? "italic font-light" : ""
            } ${isHighlight ? "text-peacock font-semibold" : ""}`}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.span>
  );
}

// Flow Mask Reveal Container
function FlowMaskReveal({
  children,
  delay = 0,
  duration = 1.1,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{
        clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)",
        opacity: 0,
        filter: "blur(8px)",
      }}
      whileInView={{
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        opacity: 1,
        filter: "blur(0px)",
      }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration,
        delay,
        ease: [0.19, 1, 0.22, 1] as const,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Perspective 3D Reveal Variants
const perspectiveVariants: Variants = {
  hidden: {
    opacity: 0,
    rotateX: 20,
    y: 55,
    filter: "blur(8px)",
    transformPerspective: 1200,
  },
  visible: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    filter: "blur(0px)",
    transformPerspective: 1200,
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

// Interactive celestial ether canvas
function CelestialEtherCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particleCount = Math.min(Math.floor((width * height) / 20000), 60);
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      baseAlpha: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = Math.random() * 0.45 + 0.15;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.8 + 0.8,
        alpha: baseAlpha,
        baseAlpha,
      });
    }

    let time = 0;
    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Connect near particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 135) {
            const lineAlpha = (1 - dist / 135) * 0.14;
            ctx.strokeStyle = `rgba(14, 110, 107, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const pulse = Math.sin(time + i) * 0.15;
        const currentAlpha = Math.max(0.05, p.baseAlpha + pulse);

        const isGold = i % 3 === 0;
        ctx.fillStyle = isGold
          ? `rgba(198, 155, 60, ${currentAlpha * 0.95})`
          : `rgba(14, 110, 107, ${currentAlpha})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-60"
    />
  );
}

function MakerPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scroll-Driven Typography & Parallax Calculations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  });

  // Parallax offsets
  const heroY = useTransform(smoothProgress, [0, 0.25], [0, -65]);
  const heroScale = useTransform(smoothProgress, [0, 0.25], [1, 0.94]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.22], [1, 0.4]);

  // Scroll-Driven Typography
  const heroLetterSpacing = useTransform(smoothProgress, [0, 0.2], ["0.04em", "0.14em"]);

  // Parallax on decorative watermark
  const watermarkY = useTransform(smoothProgress, [0.05, 0.4], [-40, 70]);
  const watermarkRotate = useTransform(smoothProgress, [0.05, 0.4], [-2, 5]);

  // Background Auroras Parallax
  const aurora1Y = useTransform(smoothProgress, [0, 0.6], [0, 160]);
  const aurora2Y = useTransform(smoothProgress, [0, 0.6], [0, -140]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => {
      setCopiedField(null);
    }, 2500);
  };

  return (
    <div
      ref={containerRef}
      className="font-cinzel relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-peacock/25 selection:text-peacock"
    >
      {/* Blackout Transition on Initial Load */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{
          duration: 1.25,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.1,
        }}
        className="pointer-events-none fixed inset-0 z-50 bg-[#0c0d0d] flex items-center justify-center"
      >
        <motion.div
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="h-[1px] w-48 bg-gradient-to-r from-transparent via-gold to-transparent"
        />
      </motion.div>

      {/* Interactive Celestial Ether Particle Field */}
      <CelestialEtherCanvas />

      {/* Slow Dissolve Animated Auroras with Parallax */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          style={{ y: aurora1Y }}
          animate={{
            scale: [1, 1.22, 1],
            x: [0, 45, 0],
            opacity: [0.35, 0.55, 0.35],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-32 left-1/2 -translate-x-1/2 h-[650px] w-[920px] rounded-full bg-gradient-to-b from-peacock/25 via-gold/15 to-transparent blur-3xl"
        />

        <motion.div
          style={{ y: aurora2Y }}
          animate={{
            scale: [1.1, 1, 1.1],
            x: [0, -45, 0],
            opacity: [0.2, 0.42, 0.2],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/3 -left-48 h-[550px] w-[600px] rounded-full bg-gradient-to-tr from-gold/20 via-rose/10 to-transparent blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            x: [0, 50, 0],
            opacity: [0.2, 0.45, 0.2],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute bottom-1/4 -right-40 h-[600px] w-[650px] rounded-full bg-gradient-to-bl from-peacock/20 via-parchment/20 to-transparent blur-3xl"
        />
      </div>

      <main className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 pb-32">
        {/* Navigation Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
          aria-label="Breadcrumb"
          className="mb-12 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground font-cinzel"
        >
          <Link to="/" className="hover:text-peacock transition-colors duration-300">
            Ambika Traders
          </Link>
          <span className="text-gold">✦</span>
          <span className="text-peacock font-semibold">The Maker</span>
        </motion.nav>

        {/* Section 1: Hero Section with Scroll-Driven Typography & Parallax */}
        <motion.section
          style={{
            y: heroY,
            scale: heroScale,
            opacity: heroOpacity,
          }}
          className="mx-auto max-w-4xl text-center space-y-7"
        >
          {/* Eyebrow Badge with Magnetic Hover */}
          <MagneticElement strength={16} className="inline-block">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-gold/40 bg-ivory/80 backdrop-blur-md text-peacock text-xs font-semibold uppercase tracking-[0.3em] shadow-sm relative overflow-hidden group">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-3.5 h-3.5 text-gold" />
              </motion.div>
              <span>The Architect &amp; Maker</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
            </div>
          </MagneticElement>

          {/* Hero Title with Flow Mask Reveal + Letter-Spacing Collapse + Blur-to-Sharp */}
          <FlowMaskReveal delay={0.15}>
            <motion.h1
              style={{ letterSpacing: heroLetterSpacing }}
              className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.12] text-foreground uppercase"
            >
              <CinematicTextReveal
                text="The Craftsman Behind the Canvas"
                italicWords={["Behind", "the", "Canvas"]}
                highlightWords={["Canvas"]}
                delay={0.1}
                expandTracking
              />
            </motion.h1>
          </FlowMaskReveal>

          {/* Golden Hairline Ornament with Flow Mask */}
          <FlowMaskReveal delay={0.35} className="flex items-center justify-center gap-4 py-1">
            <div className="h-[1px] w-28 bg-gradient-to-r from-transparent via-gold to-peacock" />
            <span className="text-gold text-xs">◆</span>
            <div className="h-[1px] w-28 bg-gradient-to-l from-transparent via-gold to-peacock" />
          </FlowMaskReveal>

          <div className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed tracking-wider">
            <CinematicTextReveal
              text="Honoring the architectural mind, engineering discipline, and creative intelligence that brought the house of Ambika Traders into living reality."
              italicWords={["architectural", "discipline", "intelligence", "living"]}
              delay={0.3}
              expandTracking={false}
            />
          </div>
        </motion.section>

        {/* Section 2: Creator Master Dossier with Perspective Reveal & Parallax */}
        <motion.section
          variants={perspectiveVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-20 relative rounded-3xl border border-gold/30 bg-parchment/40 p-8 sm:p-14 lg:p-16 backdrop-blur-xl shadow-2xl shadow-peacock/10 overflow-hidden"
        >
          {/* Shimmer Border Light */}
          <div className="pointer-events-none absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-gold/30 via-peacock/30 to-rose/30 opacity-40 blur-[1px]" />

          {/* Monumental Watermark Monogram with Parallax Motion */}
          <motion.div
            style={{ y: watermarkY, rotate: watermarkRotate }}
            className="pointer-events-none absolute -right-12 -bottom-16 opacity-5 select-none font-bold text-[310px] text-peacock leading-none italic"
          >
            SJ
          </motion.div>

          <div className="relative z-10 grid gap-12 lg:grid-cols-12 items-start">
            {/* Column 1: Identity, Magnetic Monogram, Direct Contacts */}
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center gap-6">
                {/* Monogram Crest with Magnetic Physics */}
                <MagneticElement strength={22}>
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-peacock to-peacock-deep text-ivory flex items-center justify-center font-bold text-4xl shadow-xl shadow-peacock/30 border-2 border-gold/60 cursor-pointer"
                  >
                    <span className="tracking-widest italic">SJ</span>
                    <motion.div
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.5, 0.9, 0.5],
                      }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute -inset-1 rounded-2xl border border-gold/50 pointer-events-none"
                    />
                  </motion.div>
                </MagneticElement>

                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-wider text-foreground uppercase">
                    Shubham Jaiswal
                  </h2>
                  <p className="text-sm font-semibold text-peacock tracking-[0.18em] uppercase italic">
                    Artificer &amp; Lead Systems Engineer
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest italic">
                      Autonomous Intelligence · Systems Architecture
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* Direct Communications Matrix with Magnetic Buttons */}
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-[0.25em] text-peacock font-semibold flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-gold" />
                  Direct Atelier &amp; Commission Channels
                </div>

                {/* Phone Card with Magnetic Hover */}
                <MagneticElement strength={12}>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-ivory/80 backdrop-blur-md hover:border-peacock/50 transition-all duration-300 shadow-sm">
                    <a
                      href="tel:9726239369"
                      className="flex items-center gap-3 text-sm text-foreground hover:text-peacock tracking-wider font-semibold"
                    >
                      <div className="w-8 h-8 rounded-lg bg-peacock/10 text-peacock flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="italic font-normal">+91 9726239369</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => copyToClipboard("+91 9726239369", "Phone number")}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-parchment/60 transition-colors"
                        title="Copy phone number"
                        aria-label="Copy phone number"
                      >
                        {copiedField === "Phone number" ? (
                          <Check className="w-4 h-4 text-peacock" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </motion.button>

                      <a
                        href="https://wa.me/919726239369"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-peacock hover:text-peacock-deep px-3 py-1.5 rounded-md bg-peacock/10 hover:bg-peacock/20 transition-colors uppercase tracking-wider italic"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </MagneticElement>

                {/* Email Card with Magnetic Hover */}
                <MagneticElement strength={12}>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-ivory/80 backdrop-blur-md hover:border-peacock/50 transition-all duration-300 shadow-sm">
                    <a
                      href="mailto:jaiswalshubham8145@gmail.com"
                      className="flex items-center gap-3 text-sm text-foreground hover:text-peacock tracking-wider font-semibold truncate max-w-[230px]"
                      title="jaiswalshubham8145@gmail.com"
                    >
                      <div className="w-8 h-8 rounded-lg bg-peacock/10 text-peacock flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="truncate italic font-normal">
                        jaiswalshubham8145@gmail.com
                      </span>
                    </a>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() =>
                        copyToClipboard("jaiswalshubham8145@gmail.com", "Email address")
                      }
                      className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-parchment/60 transition-colors shrink-0"
                      title="Copy email address"
                      aria-label="Copy email address"
                    >
                      {copiedField === "Email address" ? (
                        <Check className="w-4 h-4 text-peacock" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                </MagneticElement>

                {/* Commission CTA with Magnetic Hover */}
                <MagneticElement strength={15}>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="mailto:jaiswalshubham8145@gmail.com?subject=Commission%20Inquiry%20%E2%80%94%20Digital%20Artificer"
                    className="w-full mt-2 flex items-center justify-center gap-2.5 bg-gradient-to-r from-peacock via-peacock-deep to-peacock text-ivory py-3.5 px-6 rounded-xl text-sm font-semibold tracking-widest uppercase hover:shadow-lg hover:shadow-peacock/25 transition-all duration-300 border border-gold/40"
                  >
                    <Send className="w-4 h-4 text-gold" />
                    Commission Architecture
                  </motion.a>
                </MagneticElement>
              </div>
            </div>

            {/* Column 2: Verbatim Testament Manifest with EACH PROJECT ON A NEW LINE */}
            <div className="lg:col-span-7 space-y-7 lg:border-l lg:border-border/80 lg:pl-12">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-peacock font-semibold">
                <Layers className="w-3.5 h-3.5 text-gold" />
                The Maker&apos;s Testament
              </div>

              {/* Majestic Italic Quote with Flow Mask & Word Reveal */}
              <FlowMaskReveal delay={0.1}>
                <blockquote className="text-xl sm:text-2xl lg:text-3xl font-light text-foreground leading-relaxed italic border-l-2 border-gold pl-6 py-2 bg-gradient-to-r from-gold/5 via-transparent to-transparent rounded-r-xl">
                  <Quote className="w-6 h-6 text-gold/60 inline-block mr-2 -mt-2" />
                  <CinematicTextReveal
                    text="Where code becomes craft, intelligence becomes artistry, and vision becomes legacy."
                    italicWords={["craft", "artistry", "legacy"]}
                    highlightWords={["craft", "artistry", "legacy"]}
                    delay={0.1}
                    expandTracking
                  />
                </blockquote>
              </FlowMaskReveal>

              {/* Verbatim Intro Paragraph 1 with Word Reveal */}
              <div className="text-base sm:text-lg leading-relaxed text-foreground/90 font-normal tracking-wide">
                <p>
                  <strong className="text-foreground font-bold text-xl uppercase tracking-wider text-peacock mr-1.5">
                    Shubham
                  </strong>
                  <CinematicTextReveal
                    text="— an artificer of the digital ether, weaving architecture and intelligence into creations that breathe with quiet grandeur."
                    italicWords={["artificer", "ether", "architecture", "intelligence", "grandeur"]}
                    highlightWords={["artificer", "ether"]}
                    delay={0.2}
                    expandTracking
                  />
                </p>
              </div>

              {/* Every Project Starts on a NEW LINE */}
              <div className="space-y-3.5 border-y border-border/80 py-6">
                <p className="text-xs uppercase tracking-[0.28em] text-peacock font-bold flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-gold" />
                  Within his independent dominion rise:
                </p>

                <div className="space-y-3 pt-1">
                  {DOMINION_PROJECTS.map((proj, idx) => (
                    <motion.div
                      key={proj.name}
                      initial={{ opacity: 0, x: -20, filter: "blur(6px)" }}
                      whileInView={{
                        opacity: 1,
                        x: 0,
                        filter: "blur(0px)",
                      }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.6,
                        delay: idx * 0.12,
                        ease: [0.16, 1, 0.3, 1] as const,
                      }}
                      className="group flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 p-3 rounded-xl bg-ivory/60 hover:bg-ivory border border-border/60 hover:border-gold/50 transition-all duration-300 shadow-xs"
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-gold text-xs">✦</span>
                        <span className="font-bold text-base uppercase tracking-wider text-peacock group-hover:text-foreground transition-colors">
                          {proj.name}
                        </span>
                        <span className="text-[9px] uppercase font-bold tracking-[0.2em] px-2 py-0.5 rounded-full border border-gold/40 bg-gold/10 text-peacock">
                          {proj.badge}
                        </span>
                        <span className="text-muted-foreground hidden sm:inline">—</span>
                      </div>

                      <div className="text-sm text-foreground/85 italic font-light tracking-wide leading-relaxed">
                        <CinematicTextReveal
                          text={`${proj.prose};`}
                          allItalic
                          delay={0.15 + idx * 0.08}
                          expandTracking={false}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Crowning Constellation Flagship Note with Word Reveal */}
              <div className="space-y-4 text-base sm:text-lg leading-relaxed text-foreground/90 font-normal tracking-wide">
                <p>
                  <strong className="text-foreground font-bold uppercase tracking-wider text-peacock block sm:inline mr-1">
                    Crowning this constellation stands Ambika Traders,
                  </strong>{" "}
                  <CinematicTextReveal
                    text="a commissioned masterwork of e-commerce elegance, crafted for a patron of discerning taste."
                    italicWords={["commissioned", "masterwork", "elegance", "discerning", "taste"]}
                    highlightWords={["masterwork"]}
                    delay={0.2}
                    expandTracking
                  />
                </p>

                <p className="text-sm sm:text-base text-muted-foreground border-l-2 border-peacock/60 pl-4 py-1 italic font-light">
                  <CinematicTextReveal
                    text="Each creation, a brushstroke upon the same canvas — where code becomes craft, intelligence becomes artistry, and vision becomes legacy."
                    allItalic
                    highlightWords={["craft", "artistry", "legacy"]}
                    delay={0.3}
                    expandTracking
                  />
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Section 3: The Sovereign Constellation Showcase with 3D Perspective Reveal */}
        <section className="mt-32 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-peacock font-semibold">
              <span className="text-gold">✦</span> The Sovereign Constellation{" "}
              <span className="text-gold">✦</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-wide uppercase text-foreground">
              <CinematicTextReveal
                text="Creations of Architecture & Intelligence"
                italicWords={["Architecture", "Intelligence"]}
                highlightWords={["Intelligence"]}
                expandTracking
              />
            </h2>

            <p className="text-muted-foreground text-sm sm:text-base tracking-wider leading-relaxed italic font-light">
              <CinematicTextReveal
                text="Each system exists as a distinct digital dominion, engineered from first principles to balance functional sovereignty with aesthetic poise."
                allItalic
                delay={0.2}
                expandTracking={false}
              />
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {CONSTELLATION.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  variants={perspectiveVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.12 }}
                  whileHover={{ y: -8, transition: { duration: 0.28 } }}
                  className={`group relative rounded-2xl border p-8 flex flex-col justify-between transition-all duration-300 backdrop-blur-md ${
                    item.isFlagship
                      ? "border-gold/70 bg-gradient-to-b from-peacock/10 via-parchment/60 to-transparent shadow-xl ring-1 ring-gold/50 md:col-span-2 lg:col-span-1"
                      : "border-border/80 bg-parchment/30 hover:border-peacock/50 hover:bg-parchment/50 shadow-md"
                  }`}
                >
                  {/* Subtle Card Aura Glow */}
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${item.gradient}`}
                  />

                  <div className="relative z-10 space-y-5">
                    {/* Header: Icon & Badge with Magnetic Hover */}
                    <div className="flex items-start justify-between">
                      <MagneticElement strength={14}>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 3 }}
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform ${
                            item.isFlagship
                              ? "bg-peacock text-ivory shadow-lg shadow-peacock/30 border-2 border-gold"
                              : "bg-muted text-peacock border border-border group-hover:bg-peacock group-hover:text-ivory"
                          }`}
                        >
                          <Icon className="w-7 h-7" />
                        </motion.div>
                      </MagneticElement>

                      <span
                        className={`text-[10px] uppercase font-bold tracking-[0.2em] px-3 py-1 rounded-full border ${
                          item.isFlagship
                            ? "border-gold/60 bg-gold/15 text-peacock shadow-sm italic"
                            : "border-border bg-background/80 text-muted-foreground"
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>

                    {/* Titles */}
                    <div className="space-y-1">
                      <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-medium italic">
                        {item.codename}
                      </div>
                      <h3 className="text-2xl font-bold tracking-wider text-foreground group-hover:text-peacock transition-colors uppercase">
                        {item.title}
                      </h3>
                      <p className="text-xs font-semibold text-peacock uppercase tracking-wider italic">
                        {item.role}
                      </p>
                    </div>

                    {/* Poetic Snippet Quote */}
                    <div className="text-xs text-gold font-medium italic border-l border-gold/60 pl-3 py-0.5">
                      &ldquo;{item.quoteSnippet}&rdquo;
                    </div>

                    {/* Description with Word Reveal */}
                    <p className="text-sm text-foreground/80 leading-relaxed font-normal tracking-wide">
                      <CinematicTextReveal
                        text={item.description}
                        italicWords={[
                          "elegance",
                          "orchestration",
                          "harmony",
                          "intelligence",
                          "sanctuary",
                          "reverie",
                          "muse",
                          "privacy",
                        ]}
                        delay={0.1}
                        expandTracking={false}
                      />
                    </p>
                  </div>

                  {/* Tags footer */}
                  <div className="relative z-10 mt-8 pt-4 border-t border-border/60">
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md bg-ivory/80 text-muted-foreground border border-border/60 font-medium italic"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Section 4: Architectural Tenets with Flow Mask & Perspective */}
        <section className="mt-36 border-t border-border/80 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-3"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-peacock font-semibold italic">
              The Discipline of the Artificer
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-wider text-foreground">
              <CinematicTextReveal
                text="Tenets of Digital Artistry"
                italicWords={["Artistry"]}
                highlightWords={["Artistry"]}
                expandTracking
              />
            </h2>
          </motion.div>

          <div className="grid gap-10 lg:grid-cols-3">
            {CRAFT_PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  variants={perspectiveVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.16 }}
                  whileHover={{ y: -6 }}
                  className="rounded-2xl border border-border/80 bg-parchment/30 p-8 backdrop-blur-sm space-y-4 hover:border-gold/50 transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <MagneticElement strength={12}>
                      <div className="w-12 h-12 rounded-xl bg-peacock/10 text-peacock flex items-center justify-center border border-peacock/20">
                        <Icon className="w-6 h-6" />
                      </div>
                    </MagneticElement>
                    <span className="text-xs font-bold text-gold tracking-widest italic">
                      {pillar.num}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold uppercase tracking-wider text-foreground">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-peacock font-medium italic mt-1">
                      {pillar.italicSub}
                    </p>
                  </div>

                  <p className="text-sm text-foreground/80 leading-relaxed tracking-wide font-normal">
                    <CinematicTextReveal
                      text={pillar.summary}
                      italicWords={["mathematical", "intuition", "enduring", "grace", "grandeur"]}
                      delay={0.15 + idx * 0.1}
                      expandTracking={false}
                    />
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Section 5: Majestic Patronage Banner with Slow Dissolve & Magnetic CTAs */}
        <motion.section
          variants={perspectiveVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-32 rounded-3xl bg-gradient-to-br from-peacock via-peacock-deep to-[#093e3c] text-ivory p-9 sm:p-16 relative overflow-hidden shadow-2xl border-2 border-gold/40"
        >
          {/* Animated Background Mesh & Gold Sparkle */}
          <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
          <motion.div
            animate={{
              rotate: [0, 360],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-gold via-transparent to-transparent blur-2xl"
          />

          <div className="relative z-10 max-w-3xl space-y-7">
            <MagneticElement strength={10}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-gold/60 bg-gold/15 text-gold text-xs font-bold uppercase tracking-[0.25em] italic">
                <Sparkles className="w-3.5 h-3.5" />
                Commissioning Inquiries
              </div>
            </MagneticElement>

            <h2 className="text-3xl sm:text-5xl font-bold leading-tight uppercase tracking-wider text-ivory">
              <CinematicTextReveal
                text="Bring quiet grandeur to your next digital enterprise."
                italicWords={["quiet", "grandeur"]}
                expandTracking
              />
            </h2>

            <div className="text-ivory/85 text-base sm:text-lg leading-relaxed font-normal tracking-wide italic">
              <CinematicTextReveal
                text="Available for bespoke software commissions, enterprise AI orchestration, and luxury commerce architectures. Let us shape visionary ideas into enduring digital legacies."
                allItalic
                delay={0.2}
                expandTracking={false}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <MagneticElement strength={16}>
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  href="mailto:jaiswalshubham8145@gmail.com?subject=Project%20Inquiry%20%E2%80%94%20Digital%20Artificer"
                  className="inline-flex items-center gap-2.5 bg-ivory text-peacock px-7 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-gold transition-colors shadow-lg"
                >
                  <Mail className="w-4 h-4" />
                  Initiate Conversation
                </motion.a>
              </MagneticElement>

              <MagneticElement strength={16}>
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  href="tel:9726239369"
                  className="inline-flex items-center gap-2.5 border border-ivory/40 hover:border-ivory text-ivory px-7 py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +91 9726239369
                </motion.a>
              </MagneticElement>

              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 text-xs text-ivory/80 hover:text-ivory underline underline-offset-4 ml-auto font-semibold uppercase tracking-wider italic"
              >
                Return to Ambika Atelier
                <ArrowUpRight className="w-3.5 h-3.5 text-gold" />
              </Link>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
