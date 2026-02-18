"use client";

import { DrawerMode } from "@/src/hooks/useDrawerState";
import { X, Maximize2, Link2, Plus, Eye, Edit } from "@/src/lib/icons";
import { cn } from "@/src/lib/theme";

interface DrawerHeaderProps {
  mode: DrawerMode;
  expenseId?: string | null;
  onClose: () => void;
  onMaximize?: () => void;
  onCopyLink?: () => void;
}

const MODE_CONFIG: Record<DrawerMode, { icon: React.ReactNode; title: string }> = {
  create: { icon: <Plus className="w-5 h-5" />, title: "New Expense" },
  edit: { icon: <Edit className="w-5 h-5" />, title: "Edit Expense" },
  view: { icon: <Eye className="w-5 h-5" />, title: "Expense Details" },
  approve: { icon: <Eye className="w-5 h-5" />, title: "Review Expense" },
};

export function DrawerHeader({
  mode,
  expenseId,
  onClose,
  onMaximize,
  onCopyLink,
}: DrawerHeaderProps) {
  const config = MODE_CONFIG[mode];

  return (
    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-primary">{config.icon}</span>
        <h2 className="text-lg font-semibold text-text-primary">{config.title}</h2>
      </div>

      <div className="flex items-center gap-1">
        {/* Copy link (only for view/edit/approve modes with an ID) */}
        {expenseId && onCopyLink && (
          <button
            onClick={onCopyLink}
            className={cn(
              "p-2 rounded-lg transition-colors",
              "text-text-tertiary hover:text-text-primary hover:bg-gray-100"
            )}
            title="Copy link"
          >
            <Link2 className="w-4 h-4" />
          </button>
        )}

        {/* Maximize (open full page) */}
        {expenseId && onMaximize && (
          <button
            onClick={onMaximize}
            className={cn(
              "p-2 rounded-lg transition-colors",
              "text-text-tertiary hover:text-text-primary hover:bg-gray-100"
            )}
            title="Open full page"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className={cn(
            "p-2 rounded-lg transition-colors",
            "text-text-tertiary hover:text-text-primary hover:bg-gray-100"
          )}
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
