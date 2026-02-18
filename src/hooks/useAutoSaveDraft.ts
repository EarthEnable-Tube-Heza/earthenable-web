"use client";

/**
 * useAutoSaveDraft — localStorage auto-save for create/edit expense forms
 *
 * Saves form field values (not file objects) to localStorage.
 * On next create drawer open, the parent can check hasSavedDraft and
 * show a "Restore draft?" banner.
 */

import { useCallback, useEffect, useRef } from "react";

const STORAGE_KEY = "expense-draft";
const DEBOUNCE_MS = 1000;

export interface DraftFormData {
  expenseTypeId: string;
  title: string;
  description: string;
  amount: string;
  currency: string;
  expenseDate: string;
  categoryId: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
}

interface StoredDraft {
  formData: DraftFormData;
  savedAt: number;
}

/** Max age: 7 days */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function readDraft(): StoredDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: StoredDraft = JSON.parse(raw);
    // Expired?
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    // Has any non-empty field?
    const { formData } = parsed;
    const hasContent =
      formData.title.trim() || formData.description.trim() || formData.amount.trim();
    if (!hasContent) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export interface UseAutoSaveDraftReturn {
  /** Whether a saved draft exists in localStorage */
  hasSavedDraft: boolean;
  /** Get the saved draft data (returns null if none or expired) */
  getSavedDraft: () => DraftFormData | null;
  /** Save current form data to localStorage (debounced internally) */
  saveDraft: (formData: DraftFormData) => void;
  /** Clear the saved draft from localStorage */
  clearDraft: () => void;
}

export function useAutoSaveDraft(): UseAutoSaveDraftReturn {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check on mount
  const hasSavedDraft = typeof window !== "undefined" && readDraft() !== null;

  const getSavedDraft = useCallback((): DraftFormData | null => {
    const draft = readDraft();
    return draft?.formData || null;
  }, []);

  const saveDraft = useCallback((formData: DraftFormData) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      try {
        const stored: StoredDraft = { formData, savedAt: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      } catch {
        // localStorage full or unavailable — ignore
      }
    }, DEBOUNCE_MS);
  }, []);

  const clearDraft = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { hasSavedDraft, getSavedDraft, saveDraft, clearDraft };
}
