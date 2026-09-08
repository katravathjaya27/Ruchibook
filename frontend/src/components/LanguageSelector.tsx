import React from "react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "te", label: "తెలుగు" },
  { code: "hi", label: "हिन्दी" },
];

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  return (
    <select
      aria-label="Select language"
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="bg-white border border-orange-200 rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 cursor-pointer hover:border-primary-400 transition-colors"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;
