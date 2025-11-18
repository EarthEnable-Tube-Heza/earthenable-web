/**
 * Language Hook for Documentation Pages
 * Manages English/Kinyarwanda language preference with localStorage persistence
 */

import { useState, useEffect } from "react";

export type Language = "en" | "rw";

const STORAGE_KEY = "docsLanguage";

export function useLanguage() {
  const [language, setLanguage] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(true);

  // Load language preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored === "en" || stored === "rw") {
      setLanguage(stored);
    }
    setIsLoading(false);
  }, []);

  // Save language preference when it changes
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  return {
    language,
    setLanguage: changeLanguage,
    isLoading,
  };
}
