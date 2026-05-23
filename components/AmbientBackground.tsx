"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";

/* ─── shape descriptors ─── */
type Shape = {
  id: string;
  size: number;
  radius: string;
  bg: string;
  initialX: number;
  initialY: number;
  moveX: number;
  moveY: number;
  duration: number;
  oscillateScale: boolean;
};

const SHAPES: Shape[] = [
  {
    id: "circle-lg",
    size: 180,
    radius: "50%",
    bg: "bg-primary-200/20 dark:bg-primary-800/20",
    initialX: 10,
    initialY: 15,
    moveX: 120,
    moveY: -80,
    duration: 14,
    oscillateScale: true,
  },
  {
    id: "circle-md",
    size: 120,
    radius: "50%",
    bg: "bg-accent-200/15 dark:bg-accent-700/20",
    initialX: 75,
    initialY: 10,
    moveX: -100,
    moveY: 140,
    duration: 18,
    oscillateScale: false,
  },
  {
    id: "circle-sm",
    size: 80,
    radius: "50%",
    bg: "bg-primary-300/15 dark:bg-primary-700/20",
    initialX: 50,
    initialY: 70,
    moveX: 90,
    moveY: -110,
    duration: 12,
    oscillateScale: true,
  },
  {
    id: "square-lg",
    size: 160,
    radius: "32px",
    bg: "bg-secondary-200/15 dark:bg-secondary-700/20",
    initialX: 85,
    initialY: 60,
    moveX: -70,
    moveY: 100,
    duration: 16,
    oscillateScale: false,
  },
  {
    id: "square-md",
    size: 90,
    radius: "20px",
    bg: "bg-primary-400/10 dark:bg-primary-600/15",
    initialX: 20,
    initialY: 75,
    moveX: 110,
    moveY: 60,
    duration: 15,
    oscillateScale: true,
  },
  {
    id: "circle-xl",
    size: 200,
    radius: "50%",
    bg: "bg-primary-100/10 dark:bg-primary-900/15",
    initialX: 40,
    initialY: 30,
    moveX: -80,
    moveY: -130,
    duration: 20,
    oscillateScale: false,
  },
  {
    id: "rect-sm",
    size: 60,
    radius: "8px",
    bg: "bg-accent-300/20 dark:bg-accent-600/20",
    initialX: 65,
    initialY: 85,
    moveX: -60,
    moveY: -70,
    duration: 10,
    oscillateScale: true,
  },
];

export function AmbientBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const els = Array.from(container.children) as HTMLElement[];
    const tweens: gsap.core.Tween[] = [];

    els.forEach((el, i) => {
      const s = SHAPES[i];
      if (!s) return;

      /*── main drift ──*/
      const drift = gsap.to(el, {
        x: s.moveX,
        y: s.moveY,
        duration: s.duration,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
      tweens.push(drift);

      /*── opacity breathing ──*/
      const breathe = gsap.to(el, {
        opacity: 0.55,
        duration: s.duration * 0.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: s.duration * 0.3,
      });
      tweens.push(breathe);

      /*── optional scale pulse ──*/
      if (s.oscillateScale) {
        const pulse = gsap.to(el, {
          scale: 0.85,
          duration: s.duration * 0.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: s.duration * 0.15,
        });
        tweens.push(pulse);
      }
    });

    return () => {
      tweens.forEach((t) => {
        t.kill();
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {SHAPES.map((s) => (
        <div
          key={s.id}
          className={`absolute ${s.bg}`}
          style={{
            width: s.size,
            height: s.size,
            borderRadius: s.radius,
            left: `${s.initialX}%`,
            top: `${s.initialY}%`,
            willChange: "transform, opacity",
            filter: "blur(40px)",
          }}
        />
      ))}
    </div>
  );
}
