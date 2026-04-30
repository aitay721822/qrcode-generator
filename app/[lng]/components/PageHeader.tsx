"use client";

import { useT } from "@/app/i18n/client";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

export function PageHeader() {
  const { t } = useT();

  return (
    <header className="flex flex-col items-center text-center">
      <div className="absolute top-6 right-6 flex gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
        {t("pageHeader.title")}
      </h1>
      <p className="text-lg max-w-2xl text-muted">
        {t("pageHeader.description")}
      </p>
    </header>
  );
}
