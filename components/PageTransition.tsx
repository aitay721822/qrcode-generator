"use client";

import { gsap } from "gsap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type AnchorHTMLAttributes,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
} from "react";

/* ─── Context ─── */
interface PageTransitionCtx {
  pageRef: React.RefObject<HTMLDivElement | null>;
  navigate: (href: string) => void;
}

const Ctx = createContext<PageTransitionCtx | null>(null);

/* ─── Provider ─── */
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const navigate = useCallback(
    (href: string) => {
      const el = pageRef.current;
      if (!el) {
        router.push(href);
        return;
      }

      gsap.to(el, {
        opacity: 0,
        y: -16,
        scale: 0.97,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => router.push(href),
      });
    },
    [router],
  );

  return (
    <Ctx.Provider value={{ pageRef, navigate }}>
      <div ref={pageRef} className="w-full">
        {children}
      </div>
    </Ctx.Provider>
  );
}

/* ─── Hook ─── */
export function usePageTransition() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error(
      "usePageTransition must be used within a <PageTransitionProvider>",
    );
  return ctx;
}

/* ─── Transition Link ─── */
interface TransitionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

export function TransitionLink({
  href,
  onClick,
  children,
  ...rest
}: TransitionLinkProps) {
  const { navigate } = usePageTransition();

  return (
    <Link
      href={href}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
        onClick?.(e as unknown as React.MouseEvent<HTMLAnchorElement>);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
