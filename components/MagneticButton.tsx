"use client";

import { gsap } from "gsap";
import {
  type ForwardedRef,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";

/* ─── props ─── */
interface MagneticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Max translation in px (default 8) */
  magnetStrength?: number;
  /** Whether to disable the magnetic effect on touch devices */
  disableTouch?: boolean;
}

export const MagneticButton = forwardRef(function MagneticButton(
  {
    children,
    magnetStrength = 8,
    disableTouch = true,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
    style,
    ...rest
  }: MagneticButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const innerRef = useRef<HTMLButtonElement>(null);
  const posRef = useRef({ x: 0, y: 0 });

  // Expose the inner element ref so parent can focus() etc.
  useImperativeHandle(ref, () => innerRef.current as HTMLButtonElement);

  /*── quickTo for performance ──*/
  const quickToX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const quickToY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const initQuick = useCallback((el: HTMLElement) => {
    quickToX.current = gsap.quickTo(el, "x", {
      duration: 0.5,
      ease: "power3.out",
    });
    quickToY.current = gsap.quickTo(el, "y", {
      duration: 0.5,
      ease: "power3.out",
    });
  }, []);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseEnter?.(e);
      const el = innerRef.current;
      if (!el) return;

      // init quickTo once on first enter
      if (!quickToX.current) initQuick(el);

      // store original position (reset any prior offset)
      const rect = el.getBoundingClientRect();
      const parentRect = el.parentElement?.getBoundingClientRect() ?? rect;
      posRef.current = {
        x: rect.left - parentRect.left,
        y: rect.top - parentRect.top,
      };

      // snap back any leftover offset
      gsap.set(el, { x: 0, y: 0 });
    },
    [onMouseEnter, initQuick],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseMove?.(e);
      const el = innerRef.current;
      if (!el) return;
      if (disableTouch && "ontouchstart" in window) return;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const norm = Math.min(dist, 1);
      const angle = Math.atan2(dy, dx);

      const tx = Math.cos(angle) * norm * magnetStrength;
      const ty = Math.sin(angle) * norm * magnetStrength;

      quickToX.current?.(tx);
      quickToY.current?.(ty);
    },
    [magnetStrength, disableTouch, onMouseMove],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseLeave?.(e);
      const el = innerRef.current;
      if (!el) return;

      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.4,
        ease: "elastic.out(1, 0.4)",
      });
    },
    [onMouseLeave],
  );

  return (
    <button
      ref={innerRef}
      style={{ ...style, willChange: "transform" }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
    </button>
  );
});
