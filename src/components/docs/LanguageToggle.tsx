/**
 * Language Toggle Component
 * Allows users to switch between English and Kinyarwanda
 */

"use client";

import { Language } from "@/src/hooks/useLanguage";

interface LanguageToggleProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export function LanguageToggle({ currentLanguage, onLanguageChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-background-light p-1">
      <button
        onClick={() => onLanguageChange("en")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          currentLanguage === "en"
            ? "bg-primary text-white"
            : "text-text-secondary hover:text-text-primary"
        }`}
        aria-label="Switch to English"
      >
        English
      </button>
      <button
        onClick={() => onLanguageChange("rw")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          currentLanguage === "rw"
            ? "bg-primary text-white"
            : "text-text-secondary hover:text-text-primary"
        }`}
        aria-label="Switch to Kinyarwanda"
      >
        Kinyarwanda
      </button>
    </div>
  );
}
