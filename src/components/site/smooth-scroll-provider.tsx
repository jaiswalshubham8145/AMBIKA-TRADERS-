"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { useRouterState } from "@tanstack/react-router";

interface SmoothScrollContextType {
  lenis: Lenis | null;
  velocity: number;
  progress: number;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  velocity: 0,
  progress: 0,
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const [velocity, setVelocity] = useState(0);
  const [progress, setProgress] = useState(0);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const rafHandleRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize Lenis with ultra-smooth momentum curves
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.3,
      infinite: false,
      autoRaf: false,
    });

    setLenisInstance(lenis);

    // RAF loop with delta
    function raf(time: number) {
      lenis.raf(time);
      rafHandleRef.current = requestAnimationFrame(raf);
    }
    rafHandleRef.current = requestAnimationFrame(raf);

    // Update state on scroll
    const onScroll = (e: Lenis) => {
      setVelocity(e.velocity || 0);
      setProgress(e.progress || 0);
    };

    lenis.on("scroll", onScroll);

    return () => {
      if (rafHandleRef.current) cancelAnimationFrame(rafHandleRef.current);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, []);

  // Scroll to top on route change smoothly
  useEffect(() => {
    if (lenisInstance) {
      lenisInstance.scrollTo(0, { immediate: true });
    } else if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenisInstance]);

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis: lenisInstance,
        velocity,
        progress,
      }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}
