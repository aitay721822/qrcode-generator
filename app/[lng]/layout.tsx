import { cn } from "@heroui/react";
import { dir } from "i18next";
import type { Viewport } from "next";
import { Geist, Geist_Mono, Varela_Round } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { Providers } from "@/components/ui-provider";
import "../globals.css";
import { languages } from "../i18n";
import { getT } from "../i18n/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const varelaRound = Varela_Round({
  variable: "--font-varela-round",
  subsets: ["latin"],
  weight: "400",
});

export const viewport: Viewport = {
  themeColor: "black",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const fonts = cn(
  geistSans.variable,
  geistMono.variable,
  varelaRound.variable,
  "touch-manipulation font-sans antialiased",
);

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export async function generateMetadata() {
  const { t } = await getT();
  return {
    title: t("pageHeader.title"),
    description: t("pageHeader.description"),
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "QRCode 產生工具",
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}>) {
  const { lng } = await params;
  return (
    <html lang={lng} dir={dir(lng)} suppressHydrationWarning>
      <body className={fonts}>
        <ServiceWorkerRegister />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
