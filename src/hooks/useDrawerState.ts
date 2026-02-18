"use client";

/**
 * useDrawerState — URL-synced drawer state
 *
 * Keeps drawer mode and expense ID in URL search params so
 * deep-linking and back-button navigation work correctly.
 *
 * URL patterns:
 *   ?drawer=create              → create mode
 *   ?id=abc-123&drawer=view     → view mode
 *   ?id=abc-123&drawer=edit     → edit mode
 *   (no params)                 → drawer closed
 */

import { useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export type DrawerMode = "create" | "view" | "edit" | "approve";

export interface DrawerState {
  isOpen: boolean;
  mode: DrawerMode | null;
  expenseId: string | null;
}

export interface UseDrawerStateReturn extends DrawerState {
  /** Opens drawer — pushes new history entry */
  openDrawer: (mode: DrawerMode, expenseId?: string) => void;
  /** Closes drawer — replaces history (no extra back entry) */
  closeDrawer: () => void;
  /** Switch mode without closing (e.g. view → edit) */
  switchMode: (mode: DrawerMode) => void;
  /** Get a shareable URL for the current drawer state */
  getShareableUrl: () => string;
}

export function useDrawerState(): UseDrawerStateReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const state: DrawerState = useMemo(() => {
    const drawer = searchParams.get("drawer") as DrawerMode | null;
    const id = searchParams.get("id");

    if (!drawer) {
      return { isOpen: false, mode: null, expenseId: null };
    }

    return {
      isOpen: true,
      mode: drawer,
      expenseId: id,
    };
  }, [searchParams]);

  const openDrawer = useCallback(
    (mode: DrawerMode, expenseId?: string) => {
      const params = new URLSearchParams();
      params.set("drawer", mode);
      if (expenseId) {
        params.set("id", expenseId);
      }
      // Push so Back button closes drawer
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  const closeDrawer = useCallback(() => {
    // Replace so closing doesn't pollute history
    router.replace(pathname);
  }, [router, pathname]);

  const switchMode = useCallback(
    (mode: DrawerMode) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("drawer", mode);
      // Replace — mode switch isn't a navigation
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const getShareableUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  return {
    ...state,
    openDrawer,
    closeDrawer,
    switchMode,
    getShareableUrl,
  };
}
