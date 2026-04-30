"use client";

import { Check } from "lucide-react";
import { useT } from "@/app/i18n/client";
import { Button, Card, Tabs } from "@/lib/heroui";
import type { QrFieldsByMode, QrFieldsMap, QrMode } from "@/lib/qr-payload";
import { QR_MODES } from "@/lib/qr-payload";
import { QrModeFields } from "./QrModeFields";

interface GeneratorCardProps {
  mode: QrMode;
  onModeChange: (mode: QrMode) => void;
  fieldsByMode: QrFieldsMap;
  onPatchFields: <M extends QrMode>(
    m: M,
    patch: Partial<QrFieldsByMode[M]>,
  ) => void;
  showSuccess: boolean;
  onGenerate: () => void;
}

function isQrMode(key: unknown): key is QrMode {
  return (
    typeof key === "string" && (QR_MODES as readonly string[]).includes(key)
  );
}

export function GeneratorCard({
  mode,
  onModeChange,
  fieldsByMode,
  onPatchFields,
  showSuccess,
  onGenerate,
}: GeneratorCardProps) {
  const { t } = useT();

  return (
    <Card className="rounded-xl shadow-xs p-6 card-border lg:flex lg:h-full lg:min-h-0 lg:flex-col">
      <Card.Content className="flex flex-col gap-6 p-0 overflow-visible lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden lg:gap-4">
        <h2 className="shrink-0 text-xl font-semibold">
          {t("generatorCard.title")}
        </h2>

        <Tabs
          selectedKey={mode}
          onSelectionChange={(key: unknown) => {
            if (isQrMode(key)) onModeChange(key);
          }}
          className="flex w-full max-w-full min-w-0 flex-col gap-0 lg:min-h-0 lg:flex-1 lg:overflow-hidden"
        >
          <Tabs.ListContainer className="w-full min-w-0 shrink-0">
            <Tabs.List
              aria-label={t("generatorCard.mode")}
              className="flex w-full min-w-0 flex-nowrap gap-0"
            >
              {QR_MODES.map((m) => (
                <Tabs.Tab
                  key={m}
                  id={m}
                  className="min-w-0 flex-1 basis-0 px-1 py-2 text-center text-xs font-medium sm:px-2 sm:text-sm"
                >
                  <span className="block w-full truncate">
                    {t(`generatorCard.mode_${m}`)}
                  </span>
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>

          {QR_MODES.map((m) => (
            <Tabs.Panel
              key={m}
              id={m}
              className="pt-4 outline-none lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
            >
              <QrModeFields
                mode={m}
                fieldsByMode={fieldsByMode}
                onPatch={onPatchFields}
              />
            </Tabs.Panel>
          ))}
        </Tabs>

        <Button
          variant="primary"
          onPress={onGenerate}
          className="shrink-0 px-6 text-base font-semibold"
        >
          {showSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>{t("generatorCard.success")}</span>
            </>
          ) : (
            <span>{t("generatorCard.generate")}</span>
          )}
        </Button>
      </Card.Content>
    </Card>
  );
}
