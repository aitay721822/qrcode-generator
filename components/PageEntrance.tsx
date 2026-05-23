"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";

/* ─── props ─── */
interface PageEntranceProps {
  /** Delay before the stagger starts (seconds) */
  delay?: number;
  /** Stagger gap between each child (seconds) */
  stagger?: number;
  /** Initial offset Y (px) */
  y?: number;
  /** Duration of each child's animation (seconds) */
  duration?: number;
  /** Ease function */
  ease?: string;
  children: React.ReactNode;
  /** Optional className forwarded to the wrapper */
  className?: string;
}

/**
 * Wraps children that fade+slide up sequentially on mount.
 * Great for page sections, cards, tool lists.
 */
export function PageEntrance({
  delay = 0.1,
  stagger = 0.07,
  y = 24,
  duration = 0.6,
  ease = "power3.out",
  children,
  className,
}: PageEntranceProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const targets = Array.from(wrapper.children);
    if (targets.length === 0) return;

    /*── set initial state ──*/
    gsap.set(targets, {
      opacity: 0,
      y,
      willChange: "transform, opacity",
    });

    /*── stagger in ──*/
    const ctx = gsap.context(() => {
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration,
        ease,
        stagger,
        delay,
        clearProps: "willChange",
      });
    }, wrapper);

    return () => ctx.revert();
  }, [delay, stagger, y, duration, ease]);

  return (
    <div ref={wrapperRef} className={`w-full ${className ?? ""}`.trim()}>
      {children}
    </div>
  );
}
