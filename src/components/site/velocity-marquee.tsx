"use client";

import { useEffect, useRef } from "react";
import { useSmoothScroll } from "./smooth-scroll-provider";

interface VelocityMarqueeProps {
  text?: string;
  className?: string;
  speed?: number; // base speed
}

export function VelocityMarquee({
  text = "HANDCRAFTED HERITAGE • SACRED KRISHNA VASTRA • HEIRLOOM RAKHIS • AMBIKA TRADERS • TIMELESS LUXURY •",
  className = "",
  speed = 1.2,
}: VelocityMarqueeProps) {
  const { velocity } = useSmoothScroll();
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const baseSpeedRef = useRef(speed);
  const currentVelocityRef = useRef(0);

  // Smoothly damp velocity
  useEffect(() => {
    currentVelocityRef.current = velocity;
  }, [velocity]);

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Base speed + scroll velocity surge for aggressive kinetic reactivity
      const dynamicBoost = Math.min(Math.abs(currentVelocityRef.current) * 0.45, 12);
      const effectiveSpeed = (baseSpeedRef.current + dynamicBoost) * 60;

      offsetRef.current -= effectiveSpeed * delta;

      if (trackRef.current) {
        // Reset when halfway scrolled for seamless loop
        const halfWidth = trackRef.current.scrollWidth / 2;
        if (halfWidth > 0 && Math.abs(offsetRef.current) >= halfWidth) {
          offsetRef.current = 0;
        }
        trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      className={`relative overflow-hidden whitespace-nowrap select-none py-3.5 border-y border-border/60 bg-parchment/40 backdrop-blur-xs ${className}`}
      aria-hidden="true"
    >
      <div ref={trackRef} className="inline-flex items-center gap-8 will-change-transform">
        <span className="font-display tracking-[0.22em] text-xs uppercase font-medium text-foreground/85 flex items-center gap-8">
          <span>{text}</span>
          <span className="text-gold text-base">✦</span>
          <span>{text}</span>
          <span className="text-gold text-base">✦</span>
          <span>{text}</span>
          <span className="text-gold text-base">✦</span>
          <span>{text}</span>
        </span>
        <span className="font-display tracking-[0.22em] text-xs uppercase font-medium text-foreground/85 flex items-center gap-8">
          <span>{text}</span>
          <span className="text-gold text-base">✦</span>
          <span>{text}</span>
          <span className="text-gold text-base">✦</span>
          <span>{text}</span>
          <span className="text-gold text-base">✦</span>
          <span>{text}</span>
        </span>
      </div>
    </div>
  );
}
