"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

/* ─── Context ─── */
interface LoadingCtx {
  loading: boolean;
  setLoading: (v: boolean) => void;
}

const Ctx = createContext<LoadingCtx>({ loading: false, setLoading: () => {} });

export function useLoadingIndicator() {
  return useContext(Ctx);
}

/* ─── Provider (lives in layout, survives page changes) ─── */
export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((v: boolean) => {
    if (v) {
      // small delay: skip ultra-fast navs
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setLoading(true), 150);
    } else {
      clearTimeout(timerRef.current);
      setLoading(false);
    }
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <Ctx.Provider value={{ loading, setLoading: show }}>
      {children}
    </Ctx.Provider>
  );
}

/* ─── Overlay ─── */
export function LoadingOverlay() {
  const { loading } = useLoadingIndicator();
  const { t } = useTranslation();

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        loading ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ background: "var(--surface-overlay)" }}
      aria-hidden
    >
      <div className="flex flex-col items-center gap-4">
        <span className="relative flex h-10 w-10">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary-400/40" />
          <span className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-primary-500" />
          <span className="absolute inset-2 animate-pulse rounded-full bg-primary-400/60" />
        </span>
        <p className="animate-pulse text-sm font-medium text-[var(--text-muted)]">
          {t("loading")}
        </p>
      </div>
    </div>
  );
}
