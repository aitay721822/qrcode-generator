"use client";

import { useT } from "@/app/i18n/client";
import { AmbientBackground } from "@/components/AmbientBackground";
import { PageEntrance } from "@/components/PageEntrance";
import { PageTransitionProvider } from "@/components/PageTransition";
import { PageFooter } from "../components/PageFooter";
import { PageHeader } from "../components/PageHeader";
import { PasswordPageContent } from "../components/PasswordPageContent";
import { ToolNav } from "../components/ToolNav";

export default function PasswordGeneratorPage() {
  const { t } = useT();

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center overflow-x-hidden">
      <AmbientBackground />

      <PageTransitionProvider>
        <PageEntrance stagger={0.08} y={20}>
          <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-4 py-16 sm:py-24 lg:max-w-7xl">
            <PageHeader
              title={t("passwordGenerator.title")}
              description={t("passwordGenerator.description")}
            />
            <ToolNav />

            <main className="mt-8 flex w-full flex-col gap-6">
              <PasswordPageContent />
            </main>

            <PageFooter />
          </div>
        </PageEntrance>
      </PageTransitionProvider>
    </div>
  );
}
