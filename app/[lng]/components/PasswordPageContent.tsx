"use client";

import { Check, Copy, Shuffle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "@/app/i18n/client";
import { MouseParallax } from "@/components/MouseParallax";
import { RippleEffect } from "@/components/RippleEffect";
import { Button, Card, Checkbox, Input, Label, TextField } from "@/lib/heroui";

// Default printable ASCII special characters (no alphanumerics)
const DEFAULT_SPECIAL = `!"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~`;

const MIN_LENGTH = 4;
const MAX_LENGTH = 128;

/** Fisher-Yates shuffle to avoid bias in random order */
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePassword(
  length: number,
  useUpper: boolean,
  useLower: boolean,
  useDigits: boolean,
  specialChars: string,
): string {
  const pool: string[] = [];
  if (useUpper) pool.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (useLower) pool.push("abcdefghijklmnopqrstuvwxyz");
  if (useDigits) pool.push("0123456789");
  if (specialChars.length > 0) pool.push(specialChars);

  // Guarantee at least one char from each selected category
  const guaranteed: string[] = [];
  if (useUpper) guaranteed.push(pickRandom(pool[0].split("")));
  if (useLower) guaranteed.push(pickRandom(pool[1].split("")));
  if (useDigits) guaranteed.push(pickRandom(pool[2].split("")));
  if (specialChars.length > 0)
    guaranteed.push(pickRandom(specialChars.split("")));

  const flatPool = pool.join("");
  const needed = length - guaranteed.length;
  const rest = Array.from({ length: Math.max(0, needed) }, () =>
    pickRandom(flatPool.split("")),
  );

  return shuffleArray([...guaranteed, ...rest])
    .join("")
    .slice(0, length);
}

export function PasswordPageContent() {
  const { t } = useT();
  const [length, setLength] = useState("24");
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSpecial, setUseSpecial] = useState(true);
  const [specialChars, setSpecialChars] = useState(DEFAULT_SPECIAL);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);

  const generate = useCallback(() => {
    const len = Number.parseInt(length, 10);
    if (Number.isNaN(len) || len < MIN_LENGTH || len > MAX_LENGTH) {
      setError(`${t("passwordGenerator.length")} ${MIN_LENGTH}–${MAX_LENGTH}`);
      return;
    }

    const hasUpper = useUpper;
    const hasLower = useLower;
    const hasDigits = useDigits;
    const hasSpecial = useSpecial && specialChars.trim().length > 0;
    const effectiveSpecial = useSpecial ? specialChars.trim() : "";

    if (!hasUpper && !hasLower && !hasDigits && !hasSpecial) {
      setError(t("passwordGenerator.noCharTypeSelected"));
      return;
    }

    setError("");
    setPassword(
      generatePassword(len, hasUpper, hasLower, hasDigits, effectiveSpecial),
    );
  }, [length, useUpper, useLower, useDigits, useSpecial, specialChars, t]);

  // Auto-generate on first render and when settings change
  useEffect(() => {
    generate();
  }, [generate]);

  // Bi-directional length sync
  const handleLengthChange = (val: string) => {
    // Allow empty while typing
    if (val === "") {
      setLength("");
      return;
    }
    const n = Number.parseInt(val, 10);
    if (!Number.isNaN(n)) {
      setLength(String(Math.max(MIN_LENGTH, Math.min(MAX_LENGTH, n))));
    }
  };

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const activeCount =
    (useUpper ? 1 : 0) +
    (useLower ? 1 : 0) +
    (useDigits ? 1 : 0) +
    (useSpecial && specialChars.trim().length > 0 ? 1 : 0);

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Generator Card */}
      <RippleEffect color="rgba(242, 107, 53, 0.12)">
      <MouseParallax maxTilt={4} hoverScale={1.01}>
      <Card className="rounded-xl shadow-xs p-6 card-border">
        <Card.Content className="flex flex-col gap-6 p-0">
          <h2 className="text-xl font-semibold">
            {t("passwordGenerator.title")}
          </h2>

          {/* Length */}
          <TextField fullWidth value={length} onChange={handleLengthChange}>
            <Label className="mb-1.5 text-sm font-medium">
              {t("passwordGenerator.length")}
            </Label>
            <Input
              type="number"
              min={MIN_LENGTH}
              max={MAX_LENGTH}
              placeholder="24"
              className="h-14"
            />
          </TextField>

          {/* Character type toggles */}
          <div className="flex flex-col gap-3">
            <Checkbox
              isSelected={useUpper}
              onChange={() => setUseUpper(!useUpper)}
            >
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Content>
                <Label className="text-sm font-medium">
                  {t("passwordGenerator.includeUppercase")}
                </Label>
              </Checkbox.Content>
            </Checkbox>

            <Checkbox
              isSelected={useLower}
              onChange={() => setUseLower(!useLower)}
            >
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Content>
                <Label className="text-sm font-medium">
                  {t("passwordGenerator.includeLowercase")}
                </Label>
              </Checkbox.Content>
            </Checkbox>

            <Checkbox
              isSelected={useDigits}
              onChange={() => setUseDigits(!useDigits)}
            >
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Content>
                <Label className="text-sm font-medium">
                  {t("passwordGenerator.includeDigits")}
                </Label>
              </Checkbox.Content>
            </Checkbox>

            <Checkbox
              isSelected={useSpecial}
              onChange={() => setUseSpecial(!useSpecial)}
            >
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Content>
                <Label className="text-sm font-medium">
                  {t("passwordGenerator.includeSpecial")}
                </Label>
              </Checkbox.Content>
            </Checkbox>

            {/* Custom special characters input */}
            {useSpecial && (
              <TextField
                fullWidth
                value={specialChars}
                onChange={setSpecialChars}
              >
                <Label className="mb-1.5 text-sm font-medium">
                  {t("passwordGenerator.specialCharsLabel")}
                </Label>
                <Input
                  placeholder={t("passwordGenerator.specialCharsPlaceholder")}
                  className="h-14"
                />
              </TextField>
            )}
          </div>

          {/* Error */}
          {error && <p className="text-sm text-danger-500">{error}</p>}

          {/* Generate button */}
          <Button
            variant="primary"
            onPress={generate}
            isDisabled={activeCount === 0}
            className="inline-flex items-center gap-2 px-6 text-base font-semibold"
          >
            <Shuffle className="size-4" />
            {password
              ? t("passwordGenerator.regenerate")
              : t("passwordGenerator.generate")}
          </Button>
        </Card.Content>
      </Card>
      </MouseParallax>
      </RippleEffect>

      {/* Password Display */}
      {password && (
        <RippleEffect color="rgba(242, 107, 53, 0.12)">
        <MouseParallax maxTilt={4} hoverScale={1.01}>
        <Card className="rounded-xl shadow-xs p-6 card-border">
          <Card.Content className="flex flex-col gap-4 p-0">
            <div className="relative">
              <input
                ref={passwordRef}
                type="text"
                readOnly
                value={password}
                className="w-full rounded-lg border-2 border-default-200 bg-default-50 px-4 py-4 pr-12 font-mono text-lg tracking-wider outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onPress={handleCopy}
                className="inline-flex items-center gap-2 px-5 text-sm font-semibold"
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied
                  ? t("passwordGenerator.copied")
                  : t("passwordGenerator.copy")}
              </Button>
              <Button
                variant="secondary"
                onPress={generate}
                className="inline-flex items-center gap-2 px-5 text-sm font-semibold"
              >
                <Shuffle className="size-4" />
                {t("passwordGenerator.regenerate")}
              </Button>
            </div>
          </Card.Content>
        </Card>
        </MouseParallax>
        </RippleEffect>
      )}
    </div>
  );
}
