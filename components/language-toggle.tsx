"use client";

import { cn } from "@heroui/react";
import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useT } from "@/app/i18n/client";
import { Button, Dropdown, Label, type Selection } from "@/lib/heroui";

const languages = [
  { key: "en", label: "English", flag: "🇺🇸" },
  { key: "zh-Hant", label: "繁體中文", flag: "🇹🇼" },
];

export function LanguageToggle() {
  const [mounted, setMounted] = useState(false);
  const { i18n } = useT();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        isIconOnly
        variant="ghost"
        aria-label="Toggle language"
        isDisabled
      >
        <Languages className="w-5 h-5" />
      </Button>
    );
  }

  const triggerClass = cn(
    "inline-flex size-10 shrink-0 items-center justify-center rounded-lg",
    "text-default-600 hover:bg-default-100 active:bg-default-200",
    "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  );

  return (
    <Dropdown>
      <Button
        isIconOnly
        variant="ghost"
        aria-label="Change language"
        className={triggerClass}
      >
        <Languages className="w-5 h-5" />
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu
          aria-label="Language selection"
          selectedKeys={new Set([i18n.language])}
          selectionMode="single"
          onSelectionChange={(keys: Selection) => {
            if (keys === "all") return;
            const selected = [...keys][0];
            if (typeof selected === "string" && selected) {
              router.push(`/${selected}`);
            }
          }}
        >
          {languages.map((lang) => (
            <Dropdown.Item key={lang.key} id={lang.key} textValue={lang.label}>
              <Dropdown.ItemIndicator />
              <Label>
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden>{lang.flag}</span>
                  {lang.label}
                </span>
              </Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
