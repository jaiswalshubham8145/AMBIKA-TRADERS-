"use client";

import { useState, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface ElevatedCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  enableSheen?: boolean;
  elevationScale?: number;
}

export function ElevatedCard({
  children,
  className = "",
  enableSheen = true,
  elevationScale = 1.02,
  ...props
}: ElevatedCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground transition-shadow duration-300 will-change-transform ${className}`}
      whileHover={{
        scale: elevationScale,
        y: -4,
        boxShadow:
          "0 20px 38px -10px rgba(14, 110, 107, 0.18), 0 10px 18px -4px rgba(0, 0, 0, 0.05)",
      }}
      whileTap={{
        scale: 0.985,
        y: 0,
        boxShadow: "0 6px 14px -3px rgba(14, 110, 107, 0.12)",
      }}
      transition={{
        type: "spring",
        stiffness: 340,
        damping: 24,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      {...props}
    >
      {children}

      {/* 2.5D Specular Sheen Beam (strictly 2D skew glide) */}
      {enableSheen && isHovered && (
        <span
          className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
          aria-hidden="true"
        >
          <span className="absolute inset-0 -translate-x-full animate-sheen bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        </span>
      )}
    </motion.div>
  );
}
