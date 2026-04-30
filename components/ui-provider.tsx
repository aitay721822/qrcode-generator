"use client";

import { ThemeProvider as ThemeProviderRaw } from "next-themes";
import type { ComponentProps, ComponentType, ReactNode } from "react";

const ThemeProvider = ThemeProviderRaw as ComponentType<
  ComponentProps<typeof ThemeProviderRaw> & { children?: ReactNode }
>;

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}
