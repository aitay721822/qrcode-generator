"use client";

import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="flex flex-col items-center text-center">
      <div className="absolute top-6 right-6 flex gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <h1 className="font-brand text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h1>

      {/* Brand accent bar */}
      <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-primary-400 to-primary-600" />

      {description && (
        <p className="mt-4 max-w-2xl text-lg text-[var(--text-muted)]">
          {description}
        </p>
      )}
    </header>
  );
}
