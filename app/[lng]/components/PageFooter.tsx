"use client";

import { useT } from "@/app/i18n/client";
import { Link } from "@/lib/heroui";

export function PageFooter() {
  const { t } = useT();

  return (
    <footer className="mt-16 text-center">
      <Link
        href="https://en.wikipedia.org/wiki/QR_code"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary transition-colors hover:underline"
      >
        {t("pageFooter.rfcLink")}
      </Link>
    </footer>
  );
}
