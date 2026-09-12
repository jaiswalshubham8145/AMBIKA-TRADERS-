import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, type ReactNode, useId } from "react";
import { toast } from "sonner";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useVelocity,
  useMotionValue,
  type Variants,
  AnimatePresence,
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
  ChevronDown,
  Activity,
  Atom,
  Eye,
  Zap,
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
  number: string;
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
  accentColor: string;
  status: string;
}

const CONSTELLATION: ConstellationItem[] = [
  {
    id: "ambika-traders",
    number: "01",
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
    gradient: "from-peacock/30 via-gold/20 to-transparent",
    accentColor: "#0E6E6B",
    status: "Active Commission // Production",
  },
  {
    id: "pu-unicare",
    number: "02",
    title: "PU UNICARE",
    codename: "Enterprise Citadel",
    role: "AI Orchestration Platform",
    badge: "Autonomous Core",
    icon: Cpu,
    description:
      "A citadel of AI-orchestrated order amid enterprise chaos. Harmonizes multi-departmental topologies, automated triage, and systemic synchronization into unified operational poise.",
    quoteSnippet: "A citadel of AI-orchestrated order amid enterprise chaos.",
    tags: ["AI Orchestration", "Enterprise Architecture", "Autonomous Workflows"],
    gradient: "from-peacock/25 via-parchment/30 to-transparent",
    accentColor: "#0E6E6B",
    status: "Autonomous Core // Deployed",
  },
  {
    id: "velorplex",
    number: "03",
    title: "VELORPLEX",
    codename: "Cognitive Hive",
    role: "Autonomous Agent Marketplace",
    badge: "Multi-Agent System",
    icon: Bot,
    description:
      "A marketplace where autonomous minds labor in silent harmony. Harnesses decentralized collaborative agents to perform complex, multi-modal tasks with cryptographic precision and continuous learning.",
    quoteSnippet: "Where autonomous minds labor in silent harmony.",
    tags: ["Multi-Agent AI", "Decentralized Systems", "Autonomous Economy"],
    gradient: "from-gold/30 via-peacock/15 to-transparent",
    accentColor: "#C69B3C",
    status: "Multi-Agent Mesh // Operational",
  },
  {
    id: "krishna",
    number: "04",
    title: "Krishna",
    codename: "Local Sovereign",
    role: "Private AI Sentinel",
    badge: "JARVIS Spirit",
    icon: ShieldCheck,
    description:
      "A sentinel of local intelligence born in the spirit of JARVIS. Engineered with an unwavering ethos of total data sovereignty, zero external leaks, and contextual executive cognition directly on private silicon.",
    quoteSnippet: "A sentinel of local intelligence born in the spirit of JARVIS.",
    tags: ["On-Device AI", "JARVIS Paradigm", "Zero-Leak Sovereignty"],
    gradient: "from-rose/25 via-peacock/15 to-transparent",
    accentColor: "#9C2452",
    status: "Private Silicon // Sovereign",
  },
  {
    id: "murvnsin",
    number: "05",
    title: "Murvnsin",
    codename: "Confessional Sanctum",
    role: "Cryptographic Privacy Sanctuary",
    badge: "Zero-Knowledge",
    icon: Lock,
    description:
      "A hushed sanctuary where confession finds refuge behind veils of AI-wrought privacy. Provides absolute emotional sanctuary with zero-knowledge cryptographic safeguards and empathetic machine understanding.",
    quoteSnippet: "Where confession finds refuge behind veils of AI-wrought privacy.",
    tags: ["Zero-Knowledge Privacy", "Confidential Compute", "Empathetic AI"],
    gradient: "from-peacock/25 via-rose/20 to-transparent",
    accentColor: "#0E6E6B",
    status: "ZK Cryptographic Veil // Sealed",
  },
  {
    id: "likhasha",
    number: "06",
    title: "Likhasha",
    codename: "Artificial Muse",
    role: "Cinematic Literary Engine",
    badge: "Generative Verse",
    icon: Feather,
    description:
      "A cinematic reverie where verse is composed by artificial muse. Synthesizes poetic cadence, classical metaphors, and lyrical resonance into breathtaking literary expressions.",
    quoteSnippet: "A cinematic reverie where verse is composed by artificial muse.",
    tags: ["Generative Literature", "Poetic Synthesis", "Cinematic Prompting"],
    gradient: "from-gold/25 via-rose/20 to-transparent",
    accentColor: "#C69B3C",
    status: "Generative Verse // Synthesizing",
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

const CHAPTERS = [
  { id: "portal", label: "01 // THE PORTAL", threshold: 0.05 },
  { id: "sanctum", label: "02 // THE SANCTUM", threshold: 0.22 },
  { id: "constellation", label: "03 // CONSTELLATION", threshold: 0.48 },
  { id: "codex", label: "04 // CODEX OF CRAFT", threshold: 0.74 },
  { id: "patronage", label: "05 // PATRONAGE", threshold: 0.9 },
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

  const springConfig = { damping: 16, stiffness: 190, mass: 0.12 };
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
  stagger = 0.032,
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
                y: 24,
                filter: "blur(14px)",
                letterSpacing: expandTracking ? "0.32em" : "normal",
                scale: 0.94,
              },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                letterSpacing: "normal",
                scale: 1,
                transition: {
                  duration: 0.7,
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
  duration = 1.15,
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
        filter: "blur(10px)",
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
    rotateX: 24,
    y: 70,
    filter: "blur(10px)",
    transformPerspective: 1400,
  },
  visible: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    filter: "blur(0px)",
    transformPerspective: 1400,
    transition: {
      duration: 0.95,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

// Interactive celestial ether canvas with dynamic starry depth
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

    const particleCount = Math.min(Math.floor((width * height) / 16000), 85);
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      baseAlpha: number;
      layer: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      const layer = Math.random();
      const baseAlpha = layer * 0.45 + 0.15;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (0.3 + layer * 0.2),
        vy: (Math.random() - 0.5) * (0.3 + layer * 0.2),
        radius: layer * 2 + 0.6,
        alpha: baseAlpha,
        baseAlpha,
        layer,
      });
    }

    let time = 0;
    const render = () => {
      time += 0.012;
      ctx.clearRect(0, 0, width, height);

      // Connect near particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const lineAlpha = (1 - dist / 140) * 0.16;
            ctx.strokeStyle = `rgba(14, 110, 107, ${lineAlpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles with gold and peacock luminescences
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const pulse = Math.sin(time * 2 + i) * 0.18;
        const currentAlpha = Math.max(0.04, Math.min(1, p.baseAlpha + pulse));

        const isGold = i % 3 === 0;
        ctx.fillStyle = isGold
          ? `rgba(198, 155, 60, ${currentAlpha})`
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
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-65"
    />
  );
}

function MakerPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeConstellation, setActiveConstellation] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(CHAPTERS[0].label);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const deckRef = useRef<HTMLDivElement | null>(null);

  // Global Scroll-Driven Progress & Dynamics
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 26,
    restDelta: 0.0005,
  });

  // Scroll Velocity for aggressive kinetic responsiveness
  const scrollVelocity = useVelocity(scrollYProgress);
  const velocityFactor = useTransform(scrollVelocity, [-2, 2], [-14, 14]);
  const smoothSkew = useSpring(velocityFactor, { stiffness: 220, damping: 20 });

  // Pinned Portal Stage Scroll Transforms
  const { scrollYProgress: portalProgress } = useScroll({
    target: portalRef,
    offset: ["start start", "end start"],
  });

  const portalSmooth = useSpring(portalProgress, {
    stiffness: 100,
    damping: 24,
  });

  // Aggressive Portal transformations
  const portalScale = useTransform(portalSmooth, [0, 0.4, 0.95], [1, 1.18, 2.4]);
  const portalOpacity = useTransform(portalSmooth, [0, 0.65, 0.98], [1, 0.8, 0]);
  const portalY = useTransform(portalSmooth, [0, 1], [0, -120]);
  const portalTitleRotate = useTransform(portalSmooth, [0, 0.8], [0, -6]);
  const portalTitleTracking = useTransform(portalSmooth, [0, 0.7], ["0.08em", "0.45em"]);
  const portalSigilRotate = useTransform(portalSmooth, [0, 1], [0, 180]);
  const portalSigilScale = useTransform(portalSmooth, [0, 0.5, 1], [1, 1.35, 0.4]);
  const portalBlur = useTransform(portalSmooth, [0, 0.75, 1], ["0px", "0px", "16px"]);

  // Floating Parallax Auroras & Watermark Monogram
  const watermarkY = useTransform(smoothProgress, [0.1, 0.55], [-70, 110]);
  const watermarkRotate = useTransform(smoothProgress, [0.1, 0.55], [-3, 8]);
  const aurora1Y = useTransform(smoothProgress, [0, 1], [0, 320]);
  const aurora2Y = useTransform(smoothProgress, [0, 1], [0, -280]);

  // Constellation Deck Pinned Stage
  const { scrollYProgress: deckProgress } = useScroll({
    target: deckRef,
    offset: ["start start", "end end"],
  });

  const deckSmooth = useSpring(deckProgress, {
    stiffness: 110,
    damping: 25,
  });

  // Dynamically switch active constellation card based on scroll in the pinned deck
  useEffect(() => {
    const unsubscribe = deckSmooth.on("change", (latest) => {
      const step = 1 / CONSTELLATION.length;
      const index = Math.min(Math.floor(latest / step), CONSTELLATION.length - 1);
      if (index >= 0 && index !== activeConstellation) {
        setActiveConstellation(index);
      }
    });
    return () => unsubscribe();
  }, [deckSmooth, activeConstellation]);

  // Update telemetry chapter
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (val) => {
      let matched = CHAPTERS[0].label;
      for (const ch of CHAPTERS) {
        if (val >= ch.threshold) matched = ch.label;
      }
      setCurrentChapter(matched);
    });
    return () => unsubscribe();
  }, [smoothProgress]);

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
      className="font-cinzel relative min-h-screen bg-background text-foreground selection:bg-peacock/25 selection:text-peacock overflow-x-clip"
    >
      {/* 1. Cinematic Blackout Transition on Load */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{
          duration: 1.35,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.15,
        }}
        className="pointer-events-none fixed inset-0 z-50 bg-[#090b0b] flex flex-col items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.05, 1], opacity: [0, 1, 0] }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="text-gold font-bold text-5xl sm:text-7xl tracking-[0.3em] font-cinzel italic"
        >
          SJ
        </motion.div>
        <motion.div
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="h-[1.5px] w-64 bg-gradient-to-r from-transparent via-gold to-transparent mt-4"
        />
      </motion.div>

      {/* 2. Interactive Celestial Ether Canvas */}
      <CelestialEtherCanvas />

      {/* 3. Cinematic Ambient Auroras */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          style={{ y: aurora1Y }}
          animate={{
            scale: [1, 1.25, 1],
            x: [0, 60, 0],
            opacity: [0.35, 0.6, 0.35],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-44 left-1/2 -translate-x-1/2 h-[750px] w-[1050px] rounded-full bg-gradient-to-b from-peacock/30 via-gold/18 to-transparent blur-[120px]"
        />

        <motion.div
          style={{ y: aurora2Y }}
          animate={{
            scale: [1.15, 1, 1.15],
            x: [0, -60, 0],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute top-1/2 -left-60 h-[700px] w-[750px] rounded-full bg-gradient-to-tr from-gold/25 via-rose/15 to-transparent blur-[130px]"
        />
      </div>

      {/* 4. Cinematic Telemetry & Scroll Progress HUD (Fixed) */}
      <div className="pointer-events-none fixed top-24 right-6 sm:right-10 z-40 hidden md:flex flex-col items-end gap-3 text-right">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gold/40 bg-ivory/80 backdrop-blur-md shadow-lg shadow-peacock/5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
          </span>
          <span className="text-[10px] font-bold tracking-[0.25em] text-peacock uppercase">
            {currentChapter}
          </span>
        </div>

        {/* Dynamic Scrub Metric Dial */}
        <div className="flex items-center gap-2 text-[10px] tracking-widest text-muted-foreground uppercase font-mono bg-parchment/60 backdrop-blur-xs px-2.5 py-1 rounded border border-border/50">
          <Activity className="w-3 h-3 text-peacock animate-pulse" />
          <span>SCROLL KINETICS //</span>
          <motion.span className="text-foreground font-bold font-cinzel">
            {Math.round(smoothProgress.get() * 100)}%
          </motion.span>
        </div>
      </div>

      {/* Floating Left Telemetry Timeline */}
      <div className="pointer-events-none fixed left-6 sm:left-10 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-4">
        <div className="text-[9px] uppercase tracking-[0.35em] text-peacock font-bold rotate-180 [writing-mode:vertical-lr]">
          ATELIER OF THE ARTIFICER
        </div>
        <div className="w-[1.5px] h-36 bg-gradient-to-b from-transparent via-gold/60 to-transparent relative overflow-hidden">
          <motion.div
            style={{ scaleY: smoothProgress, transformOrigin: "top" }}
            className="w-full h-full bg-peacock"
          />
        </div>
        <div className="text-gold text-xs">✦</div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: FULLY SCROLL-BASED CINEMATIC PORTAL (Pinned 200vh Stage)       */}
      {/* ========================================================================= */}
      <div ref={portalRef} className="relative h-[220vh] w-full">
        <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden px-6">
          <motion.div
            style={{
              scale: portalScale,
              opacity: portalOpacity,
              y: portalY,
              filter: portalBlur,
            }}
            className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center justify-center space-y-8"
          >
            {/* Monumental Compass Ring Sigil */}
            <motion.div
              style={{
                rotate: portalSigilRotate,
                scale: portalSigilScale,
              }}
              className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-peacock to-peacock-deep text-ivory flex items-center justify-center font-bold text-4xl sm:text-5xl shadow-2xl shadow-peacock/40 border-2 border-gold/70 group cursor-pointer"
            >
              <span className="tracking-widest italic font-cinzel">SJ</span>
              {/* Concentric Celestial Orbit Ring */}
              <div className="absolute -inset-4 rounded-full border border-dashed border-gold/50 animate-[spin_35s_linear_infinite] pointer-events-none" />
              <div className="absolute -inset-8 rounded-full border border-gold/20 pointer-events-none" />
            </motion.div>

            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full border border-gold/50 bg-ivory/80 backdrop-blur-md text-peacock text-xs font-bold uppercase tracking-[0.35em] shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-gold animate-spin" />
              <span>Architect &amp; Maker</span>
              <span className="text-gold">✦</span>
              <span className="italic font-light">The Masterwork Dossier</span>
            </div>

            {/* Monumental Scrolled Title */}
            <motion.h1
              style={{
                letterSpacing: portalTitleTracking,
                rotateX: portalTitleRotate,
              }}
              className="text-4xl sm:text-7xl lg:text-8xl font-extrabold uppercase leading-[1.05] text-foreground font-cinzel tracking-wider"
            >
              Shubham Jaiswal
            </motion.h1>

            {/* Gold Hairline Ornament */}
            <div className="flex items-center justify-center gap-4 w-full py-1">
              <div className="h-[1px] w-24 sm:w-44 bg-gradient-to-r from-transparent via-gold to-peacock" />
              <span className="text-gold text-sm">◆</span>
              <div className="h-[1px] w-24 sm:w-44 bg-gradient-to-l from-transparent via-gold to-peacock" />
            </div>

            {/* Monumental Subtitle */}
            <p className="text-base sm:text-2xl text-foreground/80 max-w-3xl font-light italic leading-relaxed tracking-wide">
              &ldquo;Where code becomes craft, intelligence becomes artistry, and vision becomes
              legacy.&rdquo;
            </p>

            {/* Scroll Indicator Prompt */}
            <motion.div
              animate={{ y: [0, 8, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="pt-8 flex flex-col items-center gap-2 text-xs uppercase tracking-[0.3em] text-peacock font-semibold"
            >
              <span>Scroll to enter sanctum</span>
              <ChevronDown className="w-4 h-4 text-gold" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Flow Container with Velocity Skew */}
      <motion.main
        style={{ skewY: smoothSkew }}
        className="relative z-10 mx-auto max-w-[1320px] px-6 pb-36"
      >
        {/* Navigation Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
          aria-label="Breadcrumb"
          className="mb-14 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground font-cinzel"
        >
          <Link to="/" className="hover:text-peacock transition-colors duration-300">
            Ambika Traders
          </Link>
          <span className="text-gold">✦</span>
          <span className="text-peacock font-semibold">The Maker</span>
        </motion.nav>

        {/* ========================================================================= */}
        {/* SECTION 2: THE CREATOR SANCTUM & VERBATIM TESTAMENT                       */}
        {/* ========================================================================= */}
        <motion.section
          variants={perspectiveVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="relative rounded-3xl border border-gold/40 bg-parchment/45 p-8 sm:p-14 lg:p-18 backdrop-blur-2xl shadow-2xl shadow-peacock/15 overflow-hidden"
        >
          {/* Shimmer Border Ray */}
          <div className="pointer-events-none absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-gold/40 via-peacock/30 to-rose/30 opacity-50 blur-[2px]" />

          {/* Monumental Watermark Monogram with Scroll Parallax */}
          <motion.div
            style={{ y: watermarkY, rotate: watermarkRotate }}
            className="pointer-events-none absolute -right-10 -bottom-20 opacity-5 select-none font-bold text-[340px] text-peacock leading-none italic font-cinzel"
          >
            SJ
          </motion.div>

          <div className="relative z-10 grid gap-14 lg:grid-cols-12 items-start">
            {/* Column 1: Identity & Direct Communications Matrix */}
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center gap-6">
                <MagneticElement strength={24}>
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-peacock to-peacock-deep text-ivory flex items-center justify-center font-bold text-4xl shadow-xl shadow-peacock/30 border-2 border-gold/70 cursor-pointer"
                  >
                    <span className="tracking-widest italic">SJ</span>
                    <motion.div
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.4, 0.85, 0.4],
                      }}
                      transition={{
                        duration: 3.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute -inset-1 rounded-2xl border border-gold/50 pointer-events-none"
                    />
                  </motion.div>
                </MagneticElement>

                <div className="space-y-1.5">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-foreground uppercase">
                    Shubham Jaiswal
                  </h2>
                  <p className="text-sm font-semibold text-peacock tracking-[0.2em] uppercase italic">
                    Artificer &amp; Lead Systems Engineer
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest italic">
                      Autonomous Intelligence · Digital Architecture
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* Direct Atelier Channels */}
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-[0.28em] text-peacock font-bold flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-gold" />
                  Direct Atelier &amp; Commission Channels
                </div>

                {/* Phone Card */}
                <MagneticElement strength={12}>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-ivory/85 backdrop-blur-md hover:border-peacock/60 transition-all duration-300 shadow-sm">
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

                {/* Email Card */}
                <MagneticElement strength={12}>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-ivory/85 backdrop-blur-md hover:border-peacock/60 transition-all duration-300 shadow-sm">
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

                {/* Commission CTA Button */}
                <MagneticElement strength={16}>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="mailto:jaiswalshubham8145@gmail.com?subject=Commission%20Inquiry%20%E2%80%94%20Digital%20Artificer"
                    className="w-full mt-2 flex items-center justify-center gap-2.5 bg-gradient-to-r from-peacock via-peacock-deep to-peacock text-ivory py-4 px-6 rounded-xl text-sm font-semibold tracking-widest uppercase hover:shadow-xl hover:shadow-peacock/25 transition-all duration-300 border border-gold/50"
                  >
                    <Send className="w-4 h-4 text-gold" />
                    Commission Architecture
                  </motion.a>
                </MagneticElement>
              </div>
            </div>

            {/* Column 2: Verbatim Intro with Every Project on a New Line */}
            <div className="lg:col-span-7 space-y-7 lg:border-l lg:border-border/80 lg:pl-12">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-peacock font-bold">
                <Layers className="w-3.5 h-3.5 text-gold" />
                The Maker&apos;s Testament
              </div>

              {/* Majestic Italic Quote */}
              <FlowMaskReveal delay={0.1}>
                <blockquote className="text-xl sm:text-2xl lg:text-3xl font-light text-foreground leading-relaxed italic border-l-2 border-gold pl-6 py-2 bg-gradient-to-r from-gold/10 via-transparent to-transparent rounded-r-xl">
                  <Quote className="w-6 h-6 text-gold/70 inline-block mr-2 -mt-2" />
                  <CinematicTextReveal
                    text="Where code becomes craft, intelligence becomes artistry, and vision becomes legacy."
                    italicWords={["craft", "artistry", "legacy"]}
                    highlightWords={["craft", "artistry", "legacy"]}
                    delay={0.1}
                    expandTracking
                  />
                </blockquote>
              </FlowMaskReveal>

              {/* Verbatim Paragraph 1 */}
              <div className="text-base sm:text-lg leading-relaxed text-foreground/90 font-normal tracking-wide">
                <p>
                  <strong className="text-foreground font-bold text-2xl uppercase tracking-wider text-peacock mr-1.5">
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
                      initial={{ opacity: 0, x: -24, filter: "blur(8px)" }}
                      whileInView={{
                        opacity: 1,
                        x: 0,
                        filter: "blur(0px)",
                      }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.65,
                        delay: idx * 0.12,
                        ease: [0.16, 1, 0.3, 1] as const,
                      }}
                      whileHover={{ x: 6, transition: { duration: 0.2 } }}
                      className="group flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 p-3.5 rounded-xl bg-ivory/70 hover:bg-ivory border border-border/70 hover:border-gold/60 transition-all duration-300 shadow-xs"
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-gold text-xs">✦</span>
                        <span className="font-bold text-base uppercase tracking-wider text-peacock group-hover:text-foreground transition-colors">
                          {proj.name}
                        </span>
                        <span className="text-[9px] uppercase font-bold tracking-[0.2em] px-2.5 py-0.5 rounded-full border border-gold/40 bg-gold/10 text-peacock">
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

              {/* Crowning Constellation Flagship Note */}
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

        {/* ========================================================================= */}
        {/* SECTION 3: FULLY SCROLL-BASED CONSTELLATION DECK (Pinned Scrubbing Stage) */}
        {/* ========================================================================= */}
        <section className="mt-36 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-peacock font-bold">
              <span className="text-gold">✦</span> The Sovereign Constellation{" "}
              <span className="text-gold">✦</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-wide uppercase text-foreground">
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

          {/* Interactive Constellation Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {CONSTELLATION.map((item, idx) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setActiveConstellation(idx)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 border ${
                  activeConstellation === idx
                    ? "bg-peacock text-ivory border-gold shadow-lg shadow-peacock/25"
                    : "bg-parchment/60 text-muted-foreground border-border hover:border-peacock/50"
                }`}
              >
                <span className="text-gold mr-1.5">{item.number}.</span>
                {item.title}
              </motion.button>
            ))}
          </div>

          {/* Spotlight Hero Deck of the Active Constellation with 3D Depth */}
          <div className="relative mt-8 min-h-[480px]">
            <AnimatePresence mode="wait">
              {(() => {
                const current = CONSTELLATION[activeConstellation];
                const Icon = current.icon;
                return (
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, scale: 0.92, rotateY: -10, y: 30 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, rotateY: 10, y: -30 }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    className={`relative rounded-3xl border-2 p-8 sm:p-14 backdrop-blur-xl shadow-2xl overflow-hidden ${
                      current.isFlagship
                        ? "border-gold/80 bg-gradient-to-br from-peacock/15 via-parchment/60 to-transparent"
                        : "border-border/90 bg-parchment/40"
                    }`}
                  >
                    {/* Glowing Aura Gradient */}
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${current.gradient} opacity-40`}
                    />

                    <div className="relative z-10 grid gap-10 lg:grid-cols-12 items-center">
                      <div className="lg:col-span-8 space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                          <MagneticElement strength={16}>
                            <div className="w-16 h-16 rounded-2xl bg-peacock text-ivory flex items-center justify-center shadow-lg border border-gold/60">
                              <Icon className="w-8 h-8" />
                            </div>
                          </MagneticElement>

                          <div>
                            <div className="text-[11px] uppercase tracking-[0.25em] text-gold font-bold italic">
                              {current.codename} · {current.number} / 06
                            </div>
                            <h3 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-wide text-foreground">
                              {current.title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-gold/50 bg-gold/10 text-peacock">
                            {current.badge}
                          </span>
                          <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
                            {current.status}
                          </span>
                        </div>

                        {/* Poetic Quote Snippet */}
                        <div className="text-base sm:text-lg text-gold font-medium italic border-l-2 border-gold pl-4 py-1">
                          &ldquo;{current.quoteSnippet}&rdquo;
                        </div>

                        {/* Full Detailed Description */}
                        <p className="text-base text-foreground/85 leading-relaxed font-normal tracking-wide">
                          {current.description}
                        </p>

                        {/* Tech Tags */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {current.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs uppercase tracking-wider px-3 py-1 rounded-md bg-ivory/90 text-peacock border border-peacock/20 font-medium italic shadow-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right Spec Card & Interactive Stepper */}
                      <div className="lg:col-span-4 flex flex-col justify-between space-y-6 lg:border-l lg:border-border/70 lg:pl-10">
                        <div className="space-y-4">
                          <div className="text-xs uppercase tracking-[0.25em] text-peacock font-bold flex items-center gap-2">
                            <Atom className="w-4 h-4 text-gold animate-spin" />
                            Architectural Spec
                          </div>
                          <div className="space-y-2 text-xs font-mono text-muted-foreground">
                            <div className="flex justify-between py-1 border-b border-border/50">
                              <span>Topology:</span>
                              <span className="text-foreground font-semibold">
                                Sovereign System
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-border/50">
                              <span>Architect:</span>
                              <span className="text-foreground font-semibold">Shubham Jaiswal</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-border/50">
                              <span>Deployment:</span>
                              <span className="text-peacock font-semibold">Enterprise</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/60">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveConstellation(
                                (prev) => (prev - 1 + CONSTELLATION.length) % CONSTELLATION.length,
                              )
                            }
                            className="text-xs uppercase tracking-wider font-semibold text-muted-foreground hover:text-peacock transition-colors"
                          >
                            ← Prev Sovereign
                          </button>
                          <span className="text-xs font-mono font-bold text-gold">
                            {activeConstellation + 1} / {CONSTELLATION.length}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveConstellation((prev) => (prev + 1) % CONSTELLATION.length)
                            }
                            className="text-xs uppercase tracking-wider font-semibold text-muted-foreground hover:text-peacock transition-colors"
                          >
                            Next Sovereign →
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>

          {/* All 6 Constellation Cards in 3D Perspective Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 pt-6">
            {CONSTELLATION.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = activeConstellation === idx;
              return (
                <motion.div
                  key={item.id}
                  variants={perspectiveVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.28 } }}
                  onClick={() => setActiveConstellation(idx)}
                  className={`group relative rounded-2xl border p-8 flex flex-col justify-between transition-all duration-300 backdrop-blur-md cursor-pointer ${
                    isSelected
                      ? "border-gold bg-parchment/60 ring-2 ring-gold/60 shadow-xl"
                      : "border-border/80 bg-parchment/30 hover:border-peacock/50 hover:bg-parchment/50 shadow-md"
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${item.gradient}`}
                  />

                  <div className="relative z-10 space-y-5">
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

                    <div className="text-xs text-gold font-medium italic border-l border-gold/60 pl-3 py-0.5">
                      &ldquo;{item.quoteSnippet}&rdquo;
                    </div>

                    <p className="text-sm text-foreground/80 leading-relaxed font-normal tracking-wide line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="relative z-10 mt-8 pt-4 border-t border-border/60">
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.slice(0, 3).map((tag) => (
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

        {/* ========================================================================= */}
        {/* SECTION 4: ARCHITECTURAL TENETS OF DIGITAL ARTISTRY (3D CODEX)            */}
        {/* ========================================================================= */}
        <section className="mt-36 border-t border-border/80 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-3"
          >
            <p className="text-xs uppercase tracking-[0.32em] text-peacock font-bold italic">
              The Discipline of the Artificer
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-wider text-foreground">
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
                  whileHover={{ y: -8 }}
                  className="rounded-2xl border border-border/80 bg-parchment/35 p-8 backdrop-blur-md space-y-5 hover:border-gold/60 transition-all duration-300 shadow-md relative overflow-hidden group"
                >
                  {/* Subtle top laser line */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="flex items-center justify-between">
                    <MagneticElement strength={12}>
                      <div className="w-14 h-14 rounded-2xl bg-peacock/10 text-peacock flex items-center justify-center border border-peacock/25 group-hover:bg-peacock group-hover:text-ivory transition-colors">
                        <Icon className="w-7 h-7" />
                      </div>
                    </MagneticElement>
                    <span className="text-sm font-bold text-gold tracking-widest italic">
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

        {/* ========================================================================= */}
        {/* SECTION 5: MAJESTIC PATRONAGE BANNER & DIRECT COMMISSION TERMINAL         */}
        {/* ========================================================================= */}
        <motion.section
          variants={perspectiveVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-36 rounded-3xl bg-gradient-to-br from-peacock via-peacock-deep to-[#093e3c] text-ivory p-9 sm:p-18 relative overflow-hidden shadow-2xl border-2 border-gold/50"
        >
          {/* Animated Background Mesh */}
          <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:22px_22px]" />
          <motion.div
            animate={{
              rotate: [0, 360],
              opacity: [0.15, 0.35, 0.15],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute -top-44 -right-44 w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-gold via-transparent to-transparent blur-3xl"
          />

          <div className="relative z-10 max-w-3xl space-y-8">
            <MagneticElement strength={10}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/70 bg-gold/15 text-gold text-xs font-bold uppercase tracking-[0.28em] italic">
                <Sparkles className="w-3.5 h-3.5" />
                Commissioning Inquiries
              </div>
            </MagneticElement>

            <h2 className="text-3xl sm:text-6xl font-extrabold leading-tight uppercase tracking-wider text-ivory">
              <CinematicTextReveal
                text="Bring quiet grandeur to your next digital enterprise."
                italicWords={["quiet", "grandeur"]}
                expandTracking
              />
            </h2>

            <div className="text-ivory/85 text-base sm:text-xl leading-relaxed font-normal tracking-wide italic">
              <CinematicTextReveal
                text="Available for bespoke software commissions, enterprise AI orchestration, and luxury commerce architectures. Let us shape visionary ideas into enduring digital legacies."
                allItalic
                delay={0.2}
                expandTracking={false}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <MagneticElement strength={18}>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  href="mailto:jaiswalshubham8145@gmail.com?subject=Project%20Inquiry%20%E2%80%94%20Digital%20Artificer"
                  className="inline-flex items-center gap-2.5 bg-ivory text-peacock px-8 py-4 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-gold transition-colors shadow-xl"
                >
                  <Mail className="w-4 h-4" />
                  Initiate Conversation
                </motion.a>
              </MagneticElement>

              <MagneticElement strength={18}>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  href="tel:9726239369"
                  className="inline-flex items-center gap-2.5 border border-ivory/50 hover:border-ivory text-ivory px-8 py-4 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +91 9726239369
                </motion.a>
              </MagneticElement>

              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 text-xs text-ivory/80 hover:text-ivory underline underline-offset-4 ml-auto font-semibold uppercase tracking-wider italic pt-2"
              >
                Return to Ambika Atelier
                <ArrowUpRight className="w-3.5 h-3.5 text-gold" />
              </Link>
            </div>
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
}
