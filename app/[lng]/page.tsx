"use client";

import { Fingerprint, Image, QrCode } from "lucide-react";
import { useState } from "react";
import { useT } from "../i18n/client";
import { Base64Page } from "./components/Base64Page";
import { GuidPage } from "./components/GuidPage";
import { PageFooter } from "./components/PageFooter";
import { PageHeader } from "./components/PageHeader";
import { QrPage } from "./components/QrPage";

type Tool = "qr" | "guid" | "base64";

const TOOLS: { id: Tool; icon: typeof QrCode }[] = [
  { id: "qr", icon: QrCode },
  { id: "guid", icon: Fingerprint },
  { id: "base64", icon: Image },
];

export default function Home() {
  const [tool, setTool] = useState<Tool>("qr");
  const { t } = useT();

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center overflow-x-hidden">
      <div className="flex h-full w-full max-w-3xl flex-col px-4 py-16 sm:py-24 lg:max-w-6xl">
        <PageHeader currentTool={tool} />

        {/* Tool Navigation Tabs */}
        <div
          className="mt-8 flex w-full rounded-xl bg-default-100 p-1"
          role="tablist"
        >
          {TOOLS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={tool === id}
              onClick={() => setTool(id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                tool === id
                  ? "bg-content1 text-foreground shadow-xs"
                  : "text-default-500 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{t(`nav.${id}`)}</span>
            </button>
          ))}
        </div>

        <main className="mt-8 flex w-full flex-col gap-6">
          {tool === "qr" && <QrPage />}
          {tool === "guid" && <GuidPage />}
          {tool === "base64" && <Base64Page />}
        </main>

        <PageFooter />
      </div>
    </div>
  );
}
