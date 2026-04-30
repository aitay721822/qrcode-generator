/** Modes supported by the QR generator UI */
export type QrMode = "text" | "url" | "wifi" | "email" | "phone" | "sms";

export const QR_MODES: QrMode[] = [
  "text",
  "url",
  "wifi",
  "email",
  "phone",
  "sms",
];

export const QR_TEXT_MAX_LENGTH = 2048;

export type WifiSecurity = "WPA" | "WPA2" | "WEP" | "nopass";

export type TextFields = { text: string };
export type UrlFields = { url: string };
export type WifiFields = {
  ssid: string;
  password: string;
  security: WifiSecurity;
  hidden: boolean;
};
export type EmailFields = {
  to: string;
  subject: string;
  body: string;
};
export type PhoneFields = { number: string };
export type SmsFields = { number: string; message: string };

export type QrFieldsByMode = {
  text: TextFields;
  url: UrlFields;
  wifi: WifiFields;
  email: EmailFields;
  phone: PhoneFields;
  sms: SmsFields;
};

export type QrFields = QrFieldsByMode[QrMode];

/** All mode buckets for form state */
export type QrFieldsMap = { [K in QrMode]: QrFieldsByMode[K] };

/** Stored with history rows to restore the form */
export type QrStoredFields = QrFieldsByMode[keyof QrFieldsByMode];

function escapeWifiField(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;");
}

export function normalizeTelNumber(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const digits = trimmed.replace(/\s+/g, "");
  if (digits.startsWith("tel:")) return digits;
  return `tel:${digits}`;
}

export function normalizeSmsNumber(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  let n = trimmed.replace(/\s+/g, "");
  if (n.startsWith("sms:")) n = n.slice(4);
  if (n.startsWith("//")) n = n.slice(2);
  return n;
}

function buildWifiPayload(fields: WifiFields): string {
  const { ssid, password, security, hidden } = fields;
  const S = escapeWifiField(ssid.trim());
  const T = security;
  const P = security === "nopass" ? "" : escapeWifiField(password);
  const H = hidden ? "true" : "false";
  return `WIFI:T:${T};S:${S};P:${P};H:${H};;`;
}

/** mailto URI: encode query values per RFC 6068 */
function buildMailtoUri(fields: EmailFields): string {
  const to = fields.to.trim();
  const subject = fields.subject.trim();
  const body = fields.body.trim();
  let uri = `mailto:${to}`;
  const qp: string[] = [];
  if (subject) qp.push(`subject=${encodeURIComponent(subject)}`);
  if (body) qp.push(`body=${encodeURIComponent(body)}`);
  if (qp.length) uri += `?${qp.join("&")}`;
  return uri;
}

function buildSmsPayload(fields: SmsFields): string {
  const num = normalizeSmsNumber(fields.number);
  const msg = fields.message.trim();
  if (!msg) return `sms:${num}`;
  return `sms:${num}?body=${encodeURIComponent(msg)}`;
}

export type BuildPayloadResult =
  | { ok: true; payload: string }
  | { ok: false; errorKey: string };

export function buildQrPayload(
  mode: QrMode,
  fields: QrStoredFields,
): BuildPayloadResult {
  switch (mode) {
    case "text": {
      const text = (fields as TextFields).text;
      if (!text.trim()) return { ok: false, errorKey: "errors.qrTextEmpty" };
      if (text.length > QR_TEXT_MAX_LENGTH) {
        return { ok: false, errorKey: "errors.qrTextTooLong" };
      }
      return { ok: true, payload: text };
    }
    case "url": {
      let u = (fields as UrlFields).url.trim();
      if (!u) return { ok: false, errorKey: "errors.qrUrlEmpty" };
      if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
      try {
        // eslint-disable-next-line no-new
        new URL(u);
      } catch {
        return { ok: false, errorKey: "errors.qrUrlInvalid" };
      }
      return { ok: true, payload: u };
    }
    case "wifi": {
      const f = fields as WifiFields;
      if (!f.ssid.trim())
        return { ok: false, errorKey: "errors.qrWifiSsidEmpty" };
      if (f.security !== "nopass" && !f.password) {
        return { ok: false, errorKey: "errors.qrWifiPasswordRequired" };
      }
      return { ok: true, payload: buildWifiPayload(f) };
    }
    case "email": {
      const f = fields as EmailFields;
      if (!f.to.trim()) return { ok: false, errorKey: "errors.qrEmailToEmpty" };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.to.trim())) {
        return { ok: false, errorKey: "errors.qrEmailInvalid" };
      }
      return { ok: true, payload: buildMailtoUri(f) };
    }
    case "phone": {
      const n = (fields as PhoneFields).number.trim();
      if (!n) return { ok: false, errorKey: "errors.qrPhoneEmpty" };
      return { ok: true, payload: normalizeTelNumber(n) };
    }
    case "sms": {
      const f = fields as SmsFields;
      if (!f.number.trim())
        return { ok: false, errorKey: "errors.qrSmsNumberEmpty" };
      return { ok: true, payload: buildSmsPayload(f) };
    }
    default:
      return { ok: false, errorKey: "errors.qrUnknownMode" };
  }
}

export function defaultFieldsForMode(mode: QrMode): QrFields {
  switch (mode) {
    case "text":
      return { text: "" };
    case "url":
      return { url: "" };
    case "wifi":
      return { ssid: "", password: "", security: "WPA2", hidden: false };
    case "email":
      return { to: "", subject: "", body: "" };
    case "phone":
      return { number: "" };
    case "sms":
      return { number: "", message: "" };
    default:
      return { text: "" };
  }
}

export function initialQrFieldsMap(): QrFieldsMap {
  return {
    text: defaultFieldsForMode("text") as TextFields,
    url: defaultFieldsForMode("url") as UrlFields,
    wifi: defaultFieldsForMode("wifi") as WifiFields,
    email: defaultFieldsForMode("email") as EmailFields,
    phone: defaultFieldsForMode("phone") as PhoneFields,
    sms: defaultFieldsForMode("sms") as SmsFields,
  };
}
