"use client";

import { Clipboard, Copy, Image as ImageIcon, Trash2 } from "lucide-react";
import NextImage from "next/image";
import { useState } from "react";
import { useT } from "@/app/i18n/client";
import {
  extractBase64,
  getFileSize,
  getMimeType,
  isValidBase64Image,
  toDataUri,
} from "@/lib/base64";
import {
  Button,
  Card,
  Modal,
  TextArea,
  TextField,
  useOverlayState,
} from "@/lib/heroui";

export function Base64Page() {
  const { t } = useT();
  const [base64Input, setBase64Input] = useState("");
  const [errorDialog, setErrorDialog] = useState<{
    isOpen: boolean;
    message: string;
  }>({ isOpen: false, message: "" });
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({ visible: false, message: "", type: "success" });

  const errorModalState = useOverlayState({
    isOpen: errorDialog.isOpen,
    onOpenChange: (open) =>
      setErrorDialog((prev) => ({ ...prev, isOpen: open })),
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setBase64Input(text);
    } catch {
      showToast(t("errors.copyFailed"), "error");
    }
  };

  const handleClear = () => {
    setBase64Input("");
  };

  const handleCopyImage = async () => {
    try {
      const dataUriValue = toDataUri(base64Input);
      const response = await fetch(dataUriValue);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      showToast(t("base64Viewer.copiedImage"), "success");
    } catch {
      showToast(t("errors.copyFailed"), "error");
    }
  };

  const handleCopyBase64 = async () => {
    try {
      const pureBase64 = extractBase64(base64Input);
      await navigator.clipboard.writeText(pureBase64);
      showToast(t("base64Viewer.copiedBase64"), "success");
    } catch {
      showToast(t("errors.copyFailed"), "error");
    }
  };

  const handleCopyDataUri = async () => {
    try {
      const dataUriValue = toDataUri(base64Input);
      await navigator.clipboard.writeText(dataUriValue);
      showToast(t("base64Viewer.copiedDataUri"), "success");
    } catch {
      showToast(t("errors.copyFailed"), "error");
    }
  };

  const isValid = base64Input.trim() && isValidBase64Image(base64Input);
  const showError = base64Input.trim() && !isValidBase64Image(base64Input);
  const mimeType = isValid ? getMimeType(base64Input) : null;
  const fileSize = isValid ? getFileSize(base64Input) : null;
  const imageSrc =
    isValid && base64Input.startsWith("data:")
      ? base64Input
      : isValid
        ? `data:${mimeType};base64,${extractBase64(base64Input)}`
        : null;

  return (
    <>
      <div className="flex w-full flex-col gap-6">
        {/* Input Card */}
        <Card className="rounded-xl shadow-xs p-6 card-border">
          <Card.Content className="flex flex-col gap-4 p-0">
            <h2 className="text-xl font-semibold">{t("base64Viewer.title")}</h2>

            <TextField fullWidth value={base64Input} onChange={setBase64Input}>
              <TextArea
                label={t("base64Viewer.inputLabel")}
                placeholder={t("base64Viewer.inputPlaceholder")}
                rows={6}
                className="min-h-32"
              />
            </TextField>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onPress={handlePaste}
                className="inline-flex items-center gap-2"
              >
                <Clipboard size={16} />
                {t("base64Viewer.pasteFromClipboard")}
              </Button>
              {base64Input && (
                <Button
                  variant="danger-soft"
                  size="sm"
                  onPress={handleClear}
                  className="inline-flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  {t("base64Viewer.clear")}
                </Button>
              )}
            </div>
          </Card.Content>
        </Card>

        {/* Error Message */}
        {showError && (
          <div className="rounded-lg bg-danger-50 p-4 text-danger-600 dark:border-danger-900 dark:bg-danger-950 dark:text-danger-400">
            <p>{t("errors.base64InvalidFormat")}</p>
          </div>
        )}

        {/* Image Display */}
        {isValid && imageSrc && (
          <Card className="rounded-xl shadow-xs p-6 card-border">
            <Card.Content className="flex flex-col items-center gap-4 p-0">
              <div className="relative max-h-[600px] w-full overflow-hidden rounded-lg">
                <NextImage
                  src={imageSrc}
                  alt="Base64 Image"
                  width={600}
                  height={400}
                  unoptimized
                  className="h-auto max-h-[600px] w-full object-contain"
                  style={{ maxHeight: "600px" }}
                />
              </div>

              {mimeType && fileSize && (
                <div className="flex gap-4 text-sm text-default-500">
                  <span>
                    {t("base64Viewer.fileFormat")}:{" "}
                    {mimeType.split("/")[1].toUpperCase()}
                  </span>
                  <span>
                    {t("base64Viewer.fileSize")}: {fileSize}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={handleCopyImage}
                  className="inline-flex items-center gap-2"
                >
                  <ImageIcon size={16} />
                  {t("base64Viewer.copiedImage")}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={handleCopyBase64}
                  className="inline-flex items-center gap-2"
                >
                  <Copy size={16} />
                  {t("base64Viewer.copiedBase64")}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={handleCopyDataUri}
                  className="inline-flex items-center gap-2"
                >
                  <Copy size={16} />
                  {t("base64Viewer.copiedDataUri")}
                </Button>
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

      {/* Toast */}
      {toast.visible && (
        <button
          type="button"
          className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 shadow-lg ${
            toast.type === "success"
              ? "bg-success-500 text-white"
              : "bg-danger-500 text-white"
          }`}
          onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
        >
          {toast.message}
        </button>
      )}
    </>
  );
}
