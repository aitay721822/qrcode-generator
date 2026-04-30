import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next/initReactI18next";
import enTranslation from "./locales/en/translation.json" with { type: "json" };
import zhHantTranslation from "./locales/zh-Hant/translation.json" with {
  type: "json",
};
import { defaultNS, fallbackLng, languages } from "./settings";

const runsOnServerSide = typeof window === "undefined";

export const resources = {
  en: {
    translation: enTranslation,
  },
  "zh-Hant": {
    translation: zhHantTranslation,
  },
};

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      return import(`./locales/${language}/${namespace}.json`);
    }),
  )
  .init({
    supportedLngs: languages,
    fallbackLng: fallbackLng,
    fallbackNS: defaultNS,
    lng: undefined,
    defaultNS: defaultNS,
    ns: Object.keys(resources[fallbackLng]),
    detection: {
      order: ["path", "htmlTag", "cookie", "navigator"],
    },
    preload: runsOnServerSide ? languages : [],
  });

export { default as i18next } from "i18next";
