"use client";

import { useSmoothScroll } from "./smooth-scroll-provider";

export function ScrollProgressBar() {
  const { progress } = useSmoothScroll();
  const percentage = Math.min(100, Math.max(0, progress * 100));

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-[3px] pointer-events-none bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-peacock via-gold to-rose transition-[width] duration-75 ease-out shadow-[0_0_12px_rgba(200,162,86,0.8)]"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
