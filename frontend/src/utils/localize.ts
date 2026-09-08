import { LocalizedString, LocalizedStringArray, Language } from "../types";

// Picks the right language field out of a { en, te, hi } object,
// falling back to English if the requested language is somehow missing.
export const localize = (value: LocalizedString, lang: string): string => {
  const key = lang as Language;
  return value[key] || value.en;
};

export const localizeArray = (value: LocalizedStringArray, lang: string): string[] => {
  const key = lang as Language;
  return value[key] && value[key].length > 0 ? value[key] : value.en;
};
