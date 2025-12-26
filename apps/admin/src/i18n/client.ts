"use client";

import i18next from "i18next";
import {
  UseTranslationOptions,
  initReactI18next,
  useTranslation as useTranslationOrg,
} from "react-i18next";
import { getOptions, languages, cookieName } from "./settings";
import resourcesToBackend from "i18next-resources-to-backend";
import LanguageDetector from "i18next-browser-languagedetector";

const runsOnServerSide = typeof window === "undefined";

// Initialize i18next
i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`../../public/locales/${language}/${namespace}.json`)
    )
  )
  .init({
    ...getOptions(),
    lng: undefined, // Let detector figure it out
    detection: {
      order: ["cookie", "localStorage", "navigator", "htmlTag"],
      lookupCookie: cookieName,
      caches: ["cookie"],
    },
    preload: runsOnServerSide ? languages : [],
  });

export function useTranslation(
  ns: string,
  options: UseTranslationOptions<undefined> = {}
) {
  const ret = useTranslationOrg(ns, options);
  const { i18n } = ret;
  if (
    runsOnServerSide &&
    i18n.resolvedLanguage &&
    i18n.resolvedLanguage !== languages[0]
  ) {
    i18n.changeLanguage(languages[0]);
  }
  return ret;
}
