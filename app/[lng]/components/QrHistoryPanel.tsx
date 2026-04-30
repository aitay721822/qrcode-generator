"use client";

import { History, Trash2 } from "lucide-react";
import { useState } from "react";
import { useT } from "@/app/i18n/client";
import { Accordion, Button, Card, Modal, useOverlayState } from "@/lib/heroui";
import type { QrHistoryRecord } from "@/lib/qr-history-db";

interface QrHistoryPanelProps {
  items: QrHistoryRecord[];
  onRestore: (row: QrHistoryRecord) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function QrHistoryPanel({
  items,
  onRestore,
  onDelete,
  onClear,
}: QrHistoryPanelProps) {
  const { t } = useT();
  const [clearOpen, setClearOpen] = useState(false);
  const clearModalState = useOverlayState({
    isOpen: clearOpen,
    onOpenChange: setClearOpen,
  });

  return (
    <>
      <Card className="rounded-xl shadow-xs p-6 card-border">
        <Card.Content className="p-0">
          <Accordion.Root
            defaultExpandedKeys={[]}
            hideSeparator
            className="w-full"
          >
            <Accordion.Item id="qr-history" className="border-0">
              <Accordion.Heading>
                <Accordion.Trigger className="flex w-full min-w-0 items-center justify-between gap-3 rounded-medium py-1 text-left">
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <History className="h-5 w-5 shrink-0 text-default-500" />
                    <span className="truncate text-xl font-semibold">
                      {t("qrHistory.title")}
                    </span>
                    {items.length > 0 ? (
                      <span className="shrink-0 text-sm tabular-nums text-default-500">
                        ({items.length})
                      </span>
                    ) : null}
                  </span>
                  <Accordion.Indicator className="shrink-0" />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body className="flex flex-col gap-4 pt-4">
                  <div className="flex justify-end border-b border-card pb-4">
                    <Button
                      size="sm"
                      variant="danger-soft"
                      onPress={() => setClearOpen(true)}
                      isDisabled={items.length === 0}
                    >
                      {t("qrHistory.clearAll")}
                    </Button>
                  </div>

                  {items.length === 0 ? (
                    <p className="py-2 text-center text-sm text-muted">
                      {t("qrHistory.empty")}
                    </p>
                  ) : (
                    <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
                      {items.map((row) => (
                        <li
                          key={row.id}
                          className="flex flex-col gap-2 rounded-medium border border-default-200 bg-default-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <button
                            type="button"
                            className="min-w-0 flex-1 text-left text-sm hover:opacity-80"
                            onClick={() => onRestore(row)}
                          >
                            <span className="font-medium text-primary">
                              {t(`generatorCard.mode_${row.mode}`)}
                            </span>
                            <span className="mx-2 text-default-400">·</span>
                            <time
                              dateTime={new Date(row.createdAt).toISOString()}
                              className="text-xs text-default-500"
                            >
                              {new Date(row.createdAt).toLocaleString()}
                            </time>
                            <div className="mt-1 truncate font-mono text-xs text-default-600">
                              {row.payload}
                            </div>
                          </button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label={t("qrHistory.deleteOne")}
                            onPress={() => onDelete(row.id)}
                            className="self-end sm:self-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion.Root>
        </Card.Content>
      </Card>

      <Modal state={clearModalState}>
        <Modal.Backdrop>
          <Modal.Container placement="center" scroll="inside">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>
                  {t("qrHistory.clearConfirmTitle")}
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p>{t("qrHistory.clearConfirmBody")}</p>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onPress={() => clearModalState.close()}
                >
                  {t("qrHistory.cancel")}
                </Button>
                <Button
                  variant="danger"
                  onPress={() => {
                    onClear();
                    clearModalState.close();
                  }}
                >
                  {t("qrHistory.clearConfirmAction")}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
