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
    <div className="flex items-center gap-1 rounded-md bg-background-light p-1">
      <button
        onClick={() => onLanguageChange("en")}
        className={`px-2 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors ${
          currentLanguage === "en"
            ? "bg-primary text-white"
            : "text-text-secondary hover:text-text-primary"
        }`}
        aria-label="Switch to English"
      >
        <span className="hidden sm:inline">English</span>
        <span className="sm:hidden">EN</span>
      </button>
      <button
        onClick={() => onLanguageChange("rw")}
        className={`px-2 sm:px-4 py-1 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors ${
          currentLanguage === "rw"
            ? "bg-primary text-white"
            : "text-text-secondary hover:text-text-primary"
        }`}
        aria-label="Switch to Kinyarwanda"
      >
        <span className="hidden sm:inline">Kinyarwanda</span>
        <span className="sm:hidden">RW</span>
      </button>
    </div>
  );
}
