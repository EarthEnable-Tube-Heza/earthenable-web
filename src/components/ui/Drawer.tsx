"use client";

/**
 * Drawer Component
 *
 * Reusable slide-over panel that opens from the right side.
 * Used for viewing/editing content without losing list context.
 */

import { useEffect, useCallback, useRef } from "react";
import { cn } from "@/src/lib/theme";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  size?: "md" | "lg" | "xl" | "full";
  children: React.ReactNode;
  /** If true, overlay click does NOT close (use for unsaved changes guard) */
  preventOverlayClose?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<DrawerProps["size"]>, string> = {
  md: "w-[50vw]",
  lg: "w-[65vw]",
  xl: "w-[80vw]",
  full: "w-full",
};

export function Drawer({
  isOpen,
  onClose,
  size = "lg",
  children,
  preventOverlayClose = false,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape key closes
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  // Body scroll lock + keyboard listener
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Focus trap: focus panel on open
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={preventOverlayClose ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(
          "fixed top-0 right-0 h-full bg-white shadow-2xl flex flex-col",
          "animate-slide-in-right",
          "focus:outline-none",
          // Responsive: full width on small screens
          "max-lg:w-full",
          SIZE_CLASSES[size]
        )}
      >
        {children}
      </div>
    </div>
  );
}

Drawer.displayName = "Drawer";
