"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useT } from "@/app/i18n/client";
import {
  type FormatOptions,
  formatMultipleGuids,
  generateMultipleGuids,
  generateSimilarGuids,
  isValidGuid,
  type UuidVersion,
} from "@/lib/guid";
import {
  Accordion,
  Button,
  Card,
  Checkbox,
  Input,
  Label,
  Modal,
  Radio,
  RadioGroup,
  TextField,
  useOverlayState,
} from "@/lib/heroui";

export function GuidPage() {
  const { t } = useT();
  const [quantity, setQuantity] = useState<string>("1");
  const [version, setVersion] = useState<UuidVersion>("v7");
  const [generatedGuids, setGeneratedGuids] = useState<string[]>([]);
  const [formatOptions, setFormatOptions] = useState<FormatOptions>({
    hyphens: true,
    braces: false,
    uppercase: false,
    quotes: false,
    commas: false,
  });
  const [autoCopy, setAutoCopy] = useState(true);
  const [referenceGuid, setReferenceGuid] = useState("");
  const [timeOffset, setTimeOffset] = useState("");
  const [errorDialog, setErrorDialog] = useState<{
    isOpen: boolean;
    message: string;
  }>({ isOpen: false, message: "" });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const errorModalState = useOverlayState({
    isOpen: errorDialog.isOpen,
    onOpenChange: (open) =>
      setErrorDialog((prev) => ({ ...prev, isOpen: open })),
  });

  const showError = (message: string) => {
    setErrorDialog({ isOpen: true, message });
  };

  const handleGenerate = async () => {
    const count = Number.parseInt(quantity, 10);
    if (Number.isNaN(count) || count < 1 || count > 1000) {
      showError(t("errors.guidInvalidQuantity"));
      return;
    }

    let offsetMs: number | undefined;
    if (timeOffset.trim()) {
      if (!referenceGuid.trim()) {
        showError(t("errors.guidTimeOffsetNeedsReference"));
        return;
      }
      const parsedOffset = Number.parseInt(timeOffset, 10);
      if (Number.isNaN(parsedOffset)) {
        showError(t("errors.guidInvalidTimeOffset"));
        return;
      }
      offsetMs = parsedOffset;
    }

    let guids: string[];
    if (referenceGuid.trim()) {
      if (!isValidGuid(referenceGuid)) {
        showError(t("errors.guidInvalidReferenceGuid"));
        return;
      }
      guids = generateSimilarGuids(referenceGuid, count, offsetMs);
    } else {
      guids = generateMultipleGuids(count, version);
    }

    const formatted = formatMultipleGuids(guids, formatOptions);
    setGeneratedGuids(formatted);

    if (autoCopy && formatted.length > 0) {
      try {
        await navigator.clipboard.writeText(formatted.join("\n"));
      } catch {
        showError(t("errors.copyFailed"));
      }
    }
  };

  const handleCopyGuid = async (guid: string, index: number) => {
    try {
      await navigator.clipboard.writeText(guid);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(generatedGuids.join("\n"));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const toggleFormat = (key: keyof FormatOptions) => {
    setFormatOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div className="flex w-full flex-col gap-6">
        {/* Generator Card */}
        <Card className="rounded-xl shadow-xs p-6 card-border">
          <Card.Content className="flex flex-col gap-6 p-0 overflow-visible">
            <h2 className="text-xl font-semibold">
              {t("guidGenerator.title")}
            </h2>

            <div className="flex flex-col gap-4">
              <RadioGroup
                label={t("guidGenerator.version")}
                value={version}
                onChange={(value: string) => setVersion(value as UuidVersion)}
                orientation="horizontal"
                className="flex flex-wrap gap-x-4 gap-y-2"
              >
                <Radio value="v4">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Radio.Content>
                    <Label>{t("guidGenerator.versionV4")}</Label>
                  </Radio.Content>
                </Radio>
                <Radio value="v7">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Radio.Content>
                    <Label>{t("guidGenerator.versionV7")}</Label>
                  </Radio.Content>
                </Radio>
              </RadioGroup>

              <TextField fullWidth value={quantity} onChange={setQuantity}>
                <Label className="mb-1.5 text-sm font-medium">
                  {t("guidGenerator.quantity")}
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  placeholder="1"
                  className="h-14"
                />
              </TextField>

              <Button
                variant="primary"
                onPress={handleGenerate}
                className="px-6 text-base font-semibold"
              >
                {t("guidGenerator.generate")}
              </Button>
            </div>

            {/* Format Options */}
            <div>
              <p className="mb-3 font-medium">
                {t("guidGenerator.formatTitle")}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 md:grid-cols-5">
                <Checkbox
                  isSelected={formatOptions.hyphens}
                  onChange={() => toggleFormat("hyphens")}
                >
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    <Label className="text-sm font-medium">
                      {t("guidGenerator.hyphens")}
                    </Label>
                  </Checkbox.Content>
                </Checkbox>
                <Checkbox
                  isSelected={formatOptions.braces}
                  onChange={() => toggleFormat("braces")}
                >
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    <Label className="text-sm font-medium">
                      {t("guidGenerator.braces")}
                    </Label>
                  </Checkbox.Content>
                </Checkbox>
                <Checkbox
                  isSelected={formatOptions.uppercase}
                  onChange={() => toggleFormat("uppercase")}
                >
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    <Label className="text-sm font-medium">
                      {t("guidGenerator.uppercase")}
                    </Label>
                  </Checkbox.Content>
                </Checkbox>
                <Checkbox
                  isSelected={formatOptions.quotes}
                  onChange={() => toggleFormat("quotes")}
                >
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    <Label className="text-sm font-medium">
                      {t("guidGenerator.quotes")}
                    </Label>
                  </Checkbox.Content>
                </Checkbox>
                <Checkbox
                  isSelected={formatOptions.commas}
                  onChange={() => toggleFormat("commas")}
                >
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    <Label className="text-sm font-medium">
                      {t("guidGenerator.commas")}
                    </Label>
                  </Checkbox.Content>
                </Checkbox>
              </div>
            </div>

            {/* Clipboard Options */}
            <div className="pt-4 border-t border-card">
              <p className="mb-3 font-medium">{t("guidGenerator.clipboard")}</p>
              <Checkbox
                isSelected={autoCopy}
                onChange={() => setAutoCopy(!autoCopy)}
              >
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Content>
                  <Label className="text-sm font-medium">
                    {t("guidGenerator.autoCopy")}
                  </Label>
                </Checkbox.Content>
              </Checkbox>
            </div>
          </Card.Content>
        </Card>

        {/* Advanced Options (v7 only) */}
        {version === "v7" && (
          <Card className="rounded-xl shadow-xs card-border">
            <Accordion.Root
              defaultExpandedKeys={[]}
              hideSeparator
              className="w-full px-6"
            >
              <Accordion.Item id="advanced-guid" className="border-0">
                <Accordion.Heading>
                  <Accordion.Trigger className="flex w-full min-w-0 items-center justify-between gap-3 rounded-medium py-4 text-left">
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-lg font-semibold">
                        {t("guidGenerator.advancedTitle")}
                      </span>
                      <span className="text-sm text-muted">
                        {t("guidGenerator.advancedSubtitle")}
                      </span>
                    </span>
                    <Accordion.Indicator className="shrink-0" />
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body className="flex flex-col gap-4 pb-6">
                    <TextField
                      fullWidth
                      value={referenceGuid}
                      onChange={setReferenceGuid}
                    >
                      <Label className="mb-1.5 text-sm font-medium">
                        {t("guidGenerator.referenceGuidLabel")}
                      </Label>
                      <Input
                        placeholder={t(
                          "guidGenerator.referenceGuidPlaceholder",
                        )}
                        className="h-14"
                      />
                      <span className="text-xs text-muted mt-1">
                        {t("guidGenerator.referenceGuidDescription")}
                      </span>
                    </TextField>
                    <TextField
                      fullWidth
                      value={timeOffset}
                      onChange={setTimeOffset}
                    >
                      <Label className="mb-1.5 text-sm font-medium">
                        {t("guidGenerator.timeOffsetLabel")}
                      </Label>
                      <Input
                        placeholder={t("guidGenerator.timeOffsetPlaceholder")}
                        type="number"
                        className="h-14"
                      />
                      <span className="text-xs text-muted mt-1">
                        {t("guidGenerator.timeOffsetDescription")}
                      </span>
                    </TextField>
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion.Root>
          </Card>
        )}

        {/* Results */}
        {generatedGuids.length > 0 && (
          <Card className="rounded-xl shadow-xs p-6 card-border">
            <Card.Content className="p-0">
              <div className="flex flex-col justify-between gap-4 pb-4 sm:flex-row sm:items-center border-b border-card">
                <h3 className="text-xl font-semibold">
                  {t("guidGenerator.resultsTitle", {
                    count: generatedGuids.length,
                  })}
                </h3>
                <Button
                  variant="secondary"
                  onPress={handleCopyAll}
                  className="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold whitespace-nowrap"
                >
                  {copiedAll ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copiedAll
                    ? t("guidGenerator.copied")
                    : t("guidGenerator.copyAll")}
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                {generatedGuids.map((guid, index) => (
                  <div
                    key={guid}
                    className="flex items-center gap-2"
                  >
                    <code className="text-sm overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0 bg-default-100 hover:bg-default-200 border-2 border-default-200 rounded-medium px-3 py-2 transition-colors">
                      {guid}
                    </code>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleCopyGuid(guid, index)}
                      aria-label={t("guidGenerator.copyGuid")}
                      className="flex-shrink-0"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-5 h-5 text-success" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        )}
      </div>

      {/* Error Dialog */}
      <Modal state={errorModalState}>
        <Modal.Backdrop>
          <Modal.Container placement="center" scroll="inside">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>{t("errors.title")}</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p>{errorDialog.message}</p>
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
    </>
  );
}
