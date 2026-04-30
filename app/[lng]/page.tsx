"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Modal, useOverlayState } from "@/lib/heroui";
import {
  addQrHistoryRecord,
  clearQrHistory,
  deleteQrHistoryRecord,
  listQrHistory,
  type QrHistoryRecord,
} from "@/lib/qr-history-db";
import {
  buildQrPayload,
  initialQrFieldsMap,
  type QrFieldsByMode,
  type QrFieldsMap,
  type QrMode,
} from "@/lib/qr-payload";
import { useT } from "../i18n/client";
import { GeneratorCard } from "./components/GeneratorCard";
import { PageFooter } from "./components/PageFooter";
import { PageHeader } from "./components/PageHeader";
import { QrHistoryPanel } from "./components/QrHistoryPanel";
import { QrPreviewCard, type QrPreviewItem } from "./components/QrPreviewCard";

async function payloadToDataUrl(payload: string): Promise<string> {
  const QR = await import("qrcode");
  return QR.toDataURL(payload, {
    width: 280,
    margin: 2,
    errorCorrectionLevel: "M",
  });
}

const TEXT_BATCH_MAX = 50;

function splitNonEmptyLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

export default function Home() {
  const { t } = useT();
  const previewSectionRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<QrMode>("text");
  const [fieldsByMode, setFieldsByMode] =
    useState<QrFieldsMap>(initialQrFieldsMap);
  const [previewItems, setPreviewItems] = useState<QrPreviewItem[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [history, setHistory] = useState<QrHistoryRecord[]>([]);
  const [showGenSuccess, setShowGenSuccess] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{
    isOpen: boolean;
    message: string;
  }>({ isOpen: false, message: "" });

  const errorModalState = useOverlayState({
    isOpen: errorDialog.isOpen,
    onOpenChange: (open) =>
      setErrorDialog((prev) => ({ ...prev, isOpen: open })),
  });

  const refreshHistory = useCallback(() => {
    listQrHistory(100).then(setHistory).catch(console.error);
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const patchFields = useCallback(
    <M extends QrMode>(m: M, patch: Partial<QrFieldsByMode[M]>) => {
      setFieldsByMode((prev) => ({
        ...prev,
        [m]: { ...prev[m], ...patch },
      }));
    },
    [],
  );

  const scrollPreviewIntoView = useCallback(() => {
    previewSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const handleGenerate = async () => {
    if (mode === "text") {
      const raw = fieldsByMode.text.text;
      const lines = splitNonEmptyLines(raw);
      if (lines.length === 0) {
        setErrorDialog({ isOpen: true, message: t("errors.qrTextEmpty") });
        return;
      }
      if (lines.length > TEXT_BATCH_MAX) {
        setErrorDialog({
          isOpen: true,
          message: t("errors.qrTextBatchTooMany", { max: TEXT_BATCH_MAX }),
        });
        return;
      }

      type OkLine = { line: string; payload: string };
      const successes: OkLine[] = [];
      const failureLines: { lineNum: number; message: string }[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line === undefined) continue;
        const built = buildQrPayload("text", { text: line });
        if (!built.ok) {
          failureLines.push({
            lineNum: i + 1,
            message: t(built.errorKey),
          });
        } else {
          successes.push({ line, payload: built.payload });
        }
      }

      if (successes.length === 0) {
        const msg = failureLines
          .map((f) =>
            t("errors.qrBatchLineError", {
              n: f.lineNum,
              message: f.message,
            }),
          )
          .join("\n");
        setErrorDialog({ isOpen: true, message: msg });
        return;
      }

      setPreviewLoading(true);
      setPreviewItems([]);
      try {
        const items: QrPreviewItem[] = [];
        for (const s of successes) {
          const dataUrl = await payloadToDataUrl(s.payload);
          items.push({
            id: crypto.randomUUID(),
            payload: s.payload,
            dataUrl,
          });
          await addQrHistoryRecord({
            mode: "text",
            fields: { text: s.line },
            payload: s.payload,
          });
        }
        setPreviewItems(items);
        refreshHistory();
        setShowGenSuccess(true);
        setTimeout(() => setShowGenSuccess(false), 2000);
        queueMicrotask(() => scrollPreviewIntoView());
      } catch {
        setErrorDialog({
          isOpen: true,
          message: t("errors.qrRenderFailed"),
        });
      } finally {
        setPreviewLoading(false);
      }
      return;
    }

    const fields = fieldsByMode[mode];
    const built = buildQrPayload(mode, fields);
    if (!built.ok) {
      setErrorDialog({ isOpen: true, message: t(built.errorKey) });
      return;
    }

    setPreviewLoading(true);
    setPreviewItems([]);
    try {
      const url = await payloadToDataUrl(built.payload);
      setPreviewItems([
        { id: crypto.randomUUID(), payload: built.payload, dataUrl: url },
      ]);
      await addQrHistoryRecord({
        mode,
        fields,
        payload: built.payload,
      });
      refreshHistory();
      setShowGenSuccess(true);
      setTimeout(() => setShowGenSuccess(false), 2000);
      queueMicrotask(() => scrollPreviewIntoView());
    } catch {
      setErrorDialog({
        isOpen: true,
        message: t("errors.qrRenderFailed"),
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRestore = async (row: QrHistoryRecord) => {
    setMode(row.mode);
    setFieldsByMode((prev) => ({
      ...prev,
      [row.mode]: row.fields as QrFieldsByMode[typeof row.mode],
    }));
    setPreviewLoading(true);
    setPreviewItems([]);
    try {
      const url = await payloadToDataUrl(row.payload);
      setPreviewItems([
        { id: crypto.randomUUID(), payload: row.payload, dataUrl: url },
      ]);
      queueMicrotask(() => scrollPreviewIntoView());
    } catch {
      setErrorDialog({
        isOpen: true,
        message: t("errors.qrRenderFailed"),
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await deleteQrHistoryRecord(id);
      refreshHistory();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearQrHistory();
      refreshHistory();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center overflow-x-hidden">
      <div className="flex h-full w-full max-w-3xl flex-col px-4 py-16 sm:py-24 lg:max-w-6xl">
        <PageHeader />

        <main className="mt-12 flex w-full flex-col gap-6">
          <div className="flex w-full min-w-0 flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
            <div className="min-w-0 flex-1 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
              <GeneratorCard
                mode={mode}
                onModeChange={setMode}
                fieldsByMode={fieldsByMode}
                onPatchFields={patchFields}
                showSuccess={showGenSuccess}
                onGenerate={handleGenerate}
              />
            </div>

            <div
              ref={previewSectionRef}
              className="min-w-0 w-full shrink-0 lg:flex lg:h-full lg:min-h-0 lg:max-w-md lg:flex-col"
            >
              <QrPreviewCard items={previewItems} loading={previewLoading} />
            </div>
          </div>

          <QrHistoryPanel
            items={history}
            onRestore={handleRestore}
            onDelete={handleDeleteHistory}
            onClear={handleClearHistory}
          />
        </main>

        <PageFooter />
      </div>

      <Modal state={errorModalState}>
        <Modal.Backdrop>
          <Modal.Container placement="center" scroll="inside">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>{t("errors.title")}</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="whitespace-pre-wrap">{errorDialog.message}</p>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="primary"
                  onPress={() => errorModalState.close()}
                >
                  {t("errors.ok")}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
