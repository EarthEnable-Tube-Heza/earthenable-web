"use client";

/**
 * Confirm Dialog Component
 *
 * Custom confirmation modal to replace native browser confirm().
 * Matches mobile app design with custom styling.
 */

import { cn } from "@/src/lib/theme";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background-primary rounded-xl shadow-2xl max-w-md w-full border-l-[6px] border-l-primary">
        {/* Header */}
        <div className="p-6 border-b border-secondary/20">
          <h3 className="text-xl font-heading font-bold text-text-primary">{title}</h3>
        </div>

        {/* Message */}
        <div className="p-6">
          <p className="text-text-secondary text-base leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-secondary/20 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className={cn(
              "px-6 py-2.5 rounded-lg font-medium transition-colors",
              "border-2 border-secondary text-secondary bg-transparent",
              "hover:bg-secondary hover:text-white",
              "focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            )}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "px-6 py-2.5 rounded-lg font-medium transition-colors text-white",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              confirmVariant === "danger"
                ? "bg-status-error hover:bg-status-error/90 focus:ring-status-error"
                : "bg-primary hover:bg-primary/90 focus:ring-primary"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
