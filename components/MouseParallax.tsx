"use client";

import { gsap } from "gsap";
import { useCallback, useRef } from "react";

/* ─── props ─── */
interface MouseParallaxProps {
  /** Max tilt angle in degrees (default 6) */
  maxTilt?: number;
  /** Scale factor on hover (default 1.02) */
  hoverScale?: number;
  /** Perspective in px (default 800) */
  perspective?: number;
  /** Disable on touch devices */
  disableTouch?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps children in a container that applies a subtle 3D tilt
 * following mouse position. Great for cards, panels, previews.
 */
export function MouseParallax({
  maxTilt = 6,
  hoverScale = 1.02,
  perspective = 800,
  disableTouch = true,
  children,
  className,
}: MouseParallaxProps) {
  const elRef = useRef<HTMLDivElement>(null);

  /*── reset on leave ──*/
  const reset = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    gsap.to(el, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.5,
      ease: "power3.out",
      clearProps: "transformStyle",
    });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disableTouch && "ontouchstart" in window) return;

      const el = elRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = (e.clientX - cx) / (rect.width / 2); // -1 … 1
      const dy = (e.clientY - cy) / (rect.height / 2);

      gsap.to(el, {
        rotateX: -dy * maxTilt,
        rotateY: dx * maxTilt,
        scale: hoverScale,
        transformPerspective: perspective,
        duration: 0.6,
        ease: "power2.out",
      });
    },
    [maxTilt, hoverScale, perspective, disableTouch],
  );

  const handleMouseLeave = useCallback(
    (_e: React.MouseEvent<HTMLDivElement>) => {
      reset();
    },
    [reset],
  );

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: wrapper div for mouse parallax effect
    <div
      ref={elRef}
      role="presentation"
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ willChange: "transform" }}
    >
      {children}
    </div>
  );
}
