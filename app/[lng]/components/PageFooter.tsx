"use client";

import { useT } from "@/app/i18n/client";
import { Link } from "@/lib/heroui";

export function PageFooter() {
  const { t } = useT();

  return (
    <footer className="mt-16 border-t border-[var(--border-subtle)] pt-8">
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-center">
        <Link
          href="https://en.wikipedia.org/wiki/QR_code"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[var(--text-muted)] transition-colors duration-200 hover:text-primary"
        >
          {t("pageFooter.rfcLink")}
        </Link>
        <Link
          href="https://www.rfc-editor.org/rfc/rfc9562"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[var(--text-muted)] transition-colors duration-200 hover:text-primary"
        >
          UUID RFC 9562
        </Link>
        <Link
          href="https://en.wikipedia.org/wiki/Base64"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[var(--text-muted)] transition-colors duration-200 hover:text-primary"
        >
          Base64 (Wikipedia)
        </Link>
      </div>
    </footer>
  );
}
