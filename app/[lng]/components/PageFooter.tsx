"use client";

import { useT } from "@/app/i18n/client";
import { Link } from "@/lib/heroui";

export function PageFooter() {
  const { t } = useT();

  return (
    <footer className="mt-16 flex flex-wrap justify-center gap-6 text-center">
      <Link
        href="https://en.wikipedia.org/wiki/QR_code"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary transition-colors hover:underline"
      >
        {t("pageFooter.rfcLink")}
      </Link>
      <Link
        href="https://www.rfc-editor.org/rfc/rfc9562"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary transition-colors hover:underline"
      >
        UUID RFC 9562
      </Link>
      <Link
        href="https://en.wikipedia.org/wiki/Base64"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary transition-colors hover:underline"
      >
        Base64 (Wikipedia)
      </Link>
    </footer>
  );
}
