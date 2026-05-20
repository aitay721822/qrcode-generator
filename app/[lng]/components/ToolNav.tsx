"use client";

import {
  ChevronDown,
  ChevronLeft,
  ClipboardPaste,
  Fingerprint,
  Image,
  KeyRound,
  QrCode,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useT } from "@/app/i18n/client";
import { Button, Dropdown, Label, type Selection } from "@/lib/heroui";

const TOOLS = [
  { id: "qr", href: "qrcode", icon: QrCode },
  { id: "guid", href: "guid-generator", icon: Fingerprint },
  { id: "base64", href: "b64viewer", icon: Image },
  { id: "pasteDownload", href: "paste", icon: ClipboardPaste },
  { id: "password", href: "password-generator", icon: KeyRound },
] as const;

export function ToolNav() {
  const { t } = useT();
  const pathname = usePathname();
  const router = useRouter();

  const active = pathname.split("/").pop() ?? "qrcode";
  const currentTool = TOOLS.find((t) => t.href === active) ?? TOOLS[0];

  return (
    <>
      {/* ── Mobile: breadcrumb-style dropdown ── */}
      <nav className="mt-8 w-full md:hidden">
        <Dropdown>
          <Button
            variant="ghost"
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--surface-raised)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] shadow-xs transition-all duration-200 hover:border-[var(--border-hover)]"
          >
            <span className="flex items-center gap-2 min-w-0">
              <ChevronLeft className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
              <currentTool.icon className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{t(`nav.${currentTool.id}`)}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          </Button>

          <Dropdown.Popover>
            <Dropdown.Menu
              aria-label="Tool navigation"
              selectedKeys={new Set([active])}
              selectionMode="single"
              onSelectionChange={(keys: Selection) => {
                if (keys === "all") return;
                const selected = [...keys][0];
                const tool = TOOLS.find((t) => t.href === selected);
                if (tool) {
                  router.push(tool.href);
                }
              }}
            >
              {TOOLS.map(({ id, href, icon: Icon }) => (
                <Dropdown.Item key={href} id={href} textValue={t(`nav.${id}`)}>
                  <Dropdown.ItemIndicator />
                  <Label>
                    <span className="inline-flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      {t(`nav.${id}`)}
                    </span>
                  </Label>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </nav>

      {/* ── Desktop: tab navigation ── */}
      <nav className="mt-8 hidden w-full rounded-xl bg-default-100 p-1 md:flex">
        {TOOLS.map(({ id, href, icon: Icon }) => {
          const isActive = active === href;
          return (
            <Link
              key={id}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-[var(--surface-raised)] text-primary shadow-xs ring-1 ring-primary/20 dark:ring-primary/30"
                  : "text-default-400 hover:text-foreground hover:bg-default-200/50"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{t(`nav.${id}`)}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
