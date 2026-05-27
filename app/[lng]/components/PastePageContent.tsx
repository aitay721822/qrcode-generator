"use client";

import { ClipboardPaste, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/app/i18n/client";
import { MouseParallax } from "@/components/MouseParallax";
import { RippleEffect } from "@/components/RippleEffect";
import { Card } from "@/lib/heroui";

/** Download a Blob as a file by creating a temporary <a> and clicking it. */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function PastePageContent() {
  const { t } = useT();
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: "" });
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // t, setToast, toastTimer, triggerDownload are all stable references
  // biome-ignore lint/correctness/useExhaustiveDependencies: stable deps
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind !== "file" || !item.type.startsWith("image/")) continue;

        e.preventDefault();
        const blob = item.getAsFile();
        if (!blob) continue;

        const ext = blob.type.split("/")[1]?.replace("jpeg", "jpg") || "png";
        triggerDownload(blob, `clipboard-image.${ext}`);

        setToast({
          visible: true,
          message: t("pasteDownload.downloaded"),
        });
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(
          () => setToast((prev) => ({ ...prev, visible: false })),
          2000,
        );
        break;
      }
    };

    document.addEventListener("paste", handler);
    return () => document.removeEventListener("paste", handler);
  }, []);

  return (
    <>
      <RippleEffect color="rgba(242, 107, 53, 0.12)">
        <MouseParallax maxTilt={4} hoverScale={1.01}>
          <Card className="animate-fade-in rounded-xl p-12 shadow-[var(--shadow-card)] [border:1px_solid_var(--border-default)]">
            <Card.Content className="flex flex-col items-center gap-6 p-0">
              <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600 dark:from-primary-900/40 dark:to-primary-800/40 dark:text-primary-400">
                <ClipboardPaste className="size-12" />
              </div>

              <div className="text-center">
                <h2 className="font-brand text-2xl font-bold text-[var(--text-primary)]">
                  {t("pasteDownload.title")}
                </h2>
                <p className="mt-2 max-w-md text-[var(--text-muted)]">
                  {t("pasteDownload.description")}
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-[var(--surface-sunken)] px-6 py-4 text-sm text-[var(--text-secondary)]">
                <kbd>Ctrl</kbd>
                <span className="text-[var(--text-muted)]">+</span>
                <kbd>V</kbd>
              </div>

              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Download className="size-4" />
                <span>{t("pasteDownload.autoDetect")}</span>
              </div>
            </Card.Content>
          </Card>
        </MouseParallax>
      </RippleEffect>

      {/* Toast */}
      {toast.visible && (
        <button
          type="button"
          className="animate-slide-up fixed bottom-4 right-4 z-50 rounded-lg bg-success px-4 py-3 text-white shadow-lg"
          onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
        >
          {toast.message}
        </button>
      )}
    </>
  );
}
