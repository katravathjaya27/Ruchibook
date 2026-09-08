import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en/translation.json";
import te from "./locales/te/translation.json";
import hi from "./locales/hi/translation.json";

i18n
  .use(LanguageDetector) // detects saved language from localStorage / browser
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      te: { translation: te },
      hi: { translation: hi },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "te", "hi"],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      // Persist the chosen language across refreshes, per requirement #33.
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "ruchibook_language",
    },
  });

export default i18n;
