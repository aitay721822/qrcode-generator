"use client";

import { gsap } from "gsap";
import { useCallback, useRef } from "react";

/* ─── props ─── */
interface RippleEffectProps {
  /** Ripple color (default primary-500) */
  color?: string;
  /** Ripple size factor */
  scale?: number;
  /** Duration in seconds (default 0.6) */
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper that spawns a radial ripple wherever the user clicks/taps.
 * Does NOT intercept child events — ripple appears as a visual layer
 * underneath any interactive children.
 */
export function RippleEffect({
  color = "rgba(242, 107, 53, 0.3)",
  scale = 1,
  duration = 0.6,
  children,
  className,
}: RippleEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const spawnRipple = useCallback(
    (x: number, y: number) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.4 * scale;

      const ripple = document.createElement("span");
      ripple.style.cssText = `
        position: absolute;
        pointer-events: none;
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        left: ${x - rect.left - size / 2}px;
        top: ${y - rect.top - size / 2}px;
        background: radial-gradient(circle, ${color} 0%, transparent 70%);
        transform: scale(0);
        opacity: 0.9;
        will-change: transform, opacity;
        z-index: 0;
      `;
      container.appendChild(ripple);

      gsap
        .to(ripple, {
          scale: 1,
          duration: duration * 0.65,
          ease: "power2.out",
        })
        .then(() =>
          gsap.to(ripple, {
            opacity: 0,
            duration: duration * 0.35,
            ease: "power1.in",
            onComplete: () => ripple.remove(),
          }),
        );
    },
    [color, scale, duration],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      spawnRipple(e.clientX, e.clientY);
    },
    [spawnRipple],
  );

  return (
    <div
      ref={containerRef}
      className={`relative ${className ?? ""}`}
      onPointerDown={handlePointerDown}
    >
      {children}
    </div>
  );
}
