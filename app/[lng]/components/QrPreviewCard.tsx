"use client";

import { Check, Copy, Download } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useT } from "@/app/i18n/client";
import { Button, Card, Spinner } from "@/lib/heroui";

export type QrPreviewItem = { id: string; payload: string; dataUrl: string };

interface QrPreviewCardProps {
  items: QrPreviewItem[];
  loading: boolean;
}

export function QrPreviewCard({ items, loading }: QrPreviewCardProps) {
  const { t } = useT();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyPayload = async (payload: string, index: number) => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleDownload = (dataUrl: string, index: number) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = index === 0 ? "qrcode.png" : `qrcode-${index + 1}.png`;
    a.click();
  };

  if (!loading && items.length === 0) {
    return (
      <Card className="flex h-full min-h-0 flex-col rounded-xl p-6 shadow-xs card-border">
        <Card.Content className="flex min-h-0 flex-1 flex-col gap-2 p-0">
          <h3 className="w-full shrink-0 text-left text-xl font-semibold">
            {t("qrPreview.title")}
          </h3>
          <p className="flex flex-1 items-center justify-center py-6 text-center text-sm text-default-500">
            {t("qrPreview.empty")}
          </p>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card className="flex h-full min-h-0 flex-col rounded-xl p-6 shadow-xs card-border">
      <Card.Content className="flex min-h-0 flex-1 flex-col items-center gap-4 p-0">
        <h3 className="w-full shrink-0 text-left text-xl font-semibold">
          {t("qrPreview.title")}
        </h3>

        {loading && items.length === 0 ? (
          <div className="flex min-h-0 flex-1 w-full items-center justify-center rounded-medium border-2 border-dashed border-default-200 bg-default-50 p-4">
            <div className="flex flex-col items-center gap-2">
              <Spinner size="lg" />
              <span className="text-sm text-default-500">
                {t("qrPreview.rendering")}
              </span>
            </div>
          </div>
        ) : (
          <div
            className={
              items.length > 1
                ? "grid min-h-0 w-full flex-1 grid-cols-1 gap-6 overflow-y-auto sm:grid-cols-2"
                : "flex min-h-0 w-full flex-1 flex-col gap-4"
            }
          >
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`flex flex-col items-center gap-3 rounded-medium border border-default-200 bg-default-50 p-4 ${
                  items.length === 1 ? "min-h-0 flex-1" : ""
                }`}
              >
                <div
                  className={`flex w-full items-center justify-center ${
                    items.length === 1
                      ? "min-h-[200px] flex-1"
                      : "min-h-[200px]"
                  }`}
                >
                  {loading ? (
                    <div className="flex flex-col items-center gap-2 py-8">
                      <Spinner size="lg" />
                      <span className="text-sm text-default-500">
                        {t("qrPreview.rendering")}
                      </span>
                    </div>
                  ) : (
                    <Image
                      src={item.dataUrl}
                      alt=""
                      width={280}
                      height={280}
                      unoptimized
                      className="max-w-full h-auto rounded-medium"
                    />
                  )}
                </div>

                {item.payload ? (
                  <code className="w-full max-h-24 overflow-auto text-xs break-all rounded-medium bg-default-100 px-3 py-2 border border-default-200">
                    {item.payload}
                  </code>
                ) : null}

                <div className="flex w-full flex-wrap gap-2 justify-center sm:justify-start">
                  <Button
                    variant="secondary"
                    onPress={() => handleCopyPayload(item.payload, index)}
                    isDisabled={!item.payload || loading}
                    className="inline-flex items-center gap-2"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copiedIndex === index
                      ? t("qrPreview.copied")
                      : t("qrPreview.copyPayload")}
                  </Button>
                  <Button
                    variant="secondary"
                    onPress={() => handleDownload(item.dataUrl, index)}
                    isDisabled={!item.dataUrl || loading}
                    className="inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {t("qrPreview.downloadPng")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
