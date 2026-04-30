"use client";

import { useT } from "@/app/i18n/client";
import {
  Checkbox,
  Input,
  Label,
  Radio,
  RadioGroup,
  TextArea,
  TextField,
} from "@/lib/heroui";
import type {
  QrFieldsByMode,
  QrFieldsMap,
  QrMode,
  WifiSecurity,
} from "@/lib/qr-payload";

interface QrModeFieldsProps {
  mode: QrMode;
  fieldsByMode: QrFieldsMap;
  onPatch: <M extends QrMode>(m: M, patch: Partial<QrFieldsByMode[M]>) => void;
}

const WIFI_TYPES: WifiSecurity[] = ["WPA2", "WPA", "WEP", "nopass"];

export function QrModeFields({
  mode,
  fieldsByMode,
  onPatch,
}: QrModeFieldsProps) {
  const { t } = useT();

  switch (mode) {
    case "text": {
      const f = fieldsByMode.text;
      return (
        <TextField
          fullWidth
          value={f.text}
          onChange={(v: string) => onPatch("text", { text: v })}
        >
          <Label className="mb-1.5 text-sm font-medium">
            {t("qrFields.textLabel")}
          </Label>
          <TextArea
            placeholder={t("qrFields.textPlaceholder")}
            rows={6}
            className="min-h-32"
          />
        </TextField>
      );
    }
    case "url": {
      const f = fieldsByMode.url;
      return (
        <TextField
          fullWidth
          value={f.url}
          onChange={(v: string) => onPatch("url", { url: v })}
        >
          <Label className="mb-1.5 text-sm font-medium">
            {t("qrFields.urlLabel")}
          </Label>
          <Input placeholder={t("qrFields.urlPlaceholder")} className="h-14" />
        </TextField>
      );
    }
    case "wifi": {
      const f = fieldsByMode.wifi;
      return (
        <div className="flex flex-col gap-4">
          <TextField
            fullWidth
            value={f.ssid}
            onChange={(v: string) => onPatch("wifi", { ssid: v })}
          >
            <Label className="mb-1.5 text-sm font-medium">
              {t("qrFields.wifiSsid")}
            </Label>
            <Input
              placeholder={t("qrFields.wifiSsidPlaceholder")}
              className="h-14"
            />
          </TextField>
          <p className="text-sm font-medium text-foreground">
            {t("qrFields.wifiSecurity")}
          </p>
          <RadioGroup
            name="wifi-security"
            aria-label={t("qrFields.wifiSecurity")}
            value={f.security}
            onChange={(v: string) =>
              onPatch("wifi", { security: v as WifiSecurity })
            }
            orientation="horizontal"
            className="flex flex-wrap gap-x-4 gap-y-2"
          >
            {WIFI_TYPES.map((sec) => (
              <Radio key={sec} value={sec} className="text-sm">
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                <Radio.Content>
                  <Label>{t(`qrFields.wifiSec_${sec}`)}</Label>
                </Radio.Content>
              </Radio>
            ))}
          </RadioGroup>
          {f.security !== "nopass" && (
            <TextField
              fullWidth
              value={f.password}
              onChange={(v: string) => onPatch("wifi", { password: v })}
            >
              <Label className="mb-1.5 text-sm font-medium">
                {t("qrFields.wifiPassword")}
              </Label>
              <Input
                placeholder={t("qrFields.wifiPasswordPlaceholder")}
                type="password"
                className="h-14"
              />
            </TextField>
          )}
          <Checkbox
            isSelected={f.hidden}
            onChange={(selected: boolean) =>
              onPatch("wifi", { hidden: selected })
            }
            className="flex items-start gap-2"
          >
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Content>
              <Label className="text-sm font-medium">
                {t("qrFields.wifiHidden")}
              </Label>
            </Checkbox.Content>
          </Checkbox>
        </div>
      );
    }
    case "email": {
      const f = fieldsByMode.email;
      return (
        <div className="flex flex-col gap-4">
          <TextField
            fullWidth
            value={f.to}
            onChange={(v: string) => onPatch("email", { to: v })}
          >
            <Label className="mb-1.5 text-sm font-medium">
              {t("qrFields.emailTo")}
            </Label>
            <Input
              placeholder={t("qrFields.emailToPlaceholder")}
              type="email"
              className="h-14"
            />
          </TextField>
          <TextField
            fullWidth
            value={f.subject}
            onChange={(v: string) => onPatch("email", { subject: v })}
          >
            <Label className="mb-1.5 text-sm font-medium">
              {t("qrFields.emailSubject")}
            </Label>
            <Input
              placeholder={t("qrFields.emailSubjectPlaceholder")}
              className="h-14"
            />
          </TextField>
          <TextField
            fullWidth
            value={f.body}
            onChange={(v: string) => onPatch("email", { body: v })}
          >
            <Label className="mb-1.5 text-sm font-medium">
              {t("qrFields.emailBody")}
            </Label>
            <TextArea
              placeholder={t("qrFields.emailBodyPlaceholder")}
              rows={4}
            />
          </TextField>
        </div>
      );
    }
    case "phone": {
      const f = fieldsByMode.phone;
      return (
        <TextField
          fullWidth
          value={f.number}
          onChange={(v: string) => onPatch("phone", { number: v })}
        >
          <Label className="mb-1.5 text-sm font-medium">
            {t("qrFields.phoneNumber")}
          </Label>
          <Input
            placeholder={t("qrFields.phonePlaceholder")}
            type="tel"
            className="h-14"
          />
        </TextField>
      );
    }
    case "sms": {
      const f = fieldsByMode.sms;
      return (
        <div className="flex flex-col gap-4">
          <TextField
            fullWidth
            value={f.number}
            onChange={(v: string) => onPatch("sms", { number: v })}
          >
            <Label className="mb-1.5 text-sm font-medium">
              {t("qrFields.smsNumber")}
            </Label>
            <Input
              placeholder={t("qrFields.smsNumberPlaceholder")}
              type="tel"
              className="h-14"
            />
          </TextField>
          <TextField
            fullWidth
            value={f.message}
            onChange={(v: string) => onPatch("sms", { message: v })}
          >
            <Label className="mb-1.5 text-sm font-medium">
              {t("qrFields.smsMessage")}
            </Label>
            <TextArea
              placeholder={t("qrFields.smsMessagePlaceholder")}
              rows={4}
            />
          </TextField>
        </div>
      );
    }
    default:
      return null;
  }
}
