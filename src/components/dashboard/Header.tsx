"use client";

/**
 * Dashboard Header
 *
 * Top header bar with breadcrumbs and entity selector.
 */

import { useState, useEffect } from "react";
import { useAuth, useTokenExpiry } from "@/src/lib/auth";
import { usePageHeaderData } from "@/src/contexts/PageHeaderContext";
import { Breadcrumbs } from "@/src/components/ui/Breadcrumbs";
import { Toast } from "@/src/components/ui/Toast";
import { HeaderEntitySelector } from "./HeaderEntitySelector";

export function Header() {
  const { user } = useAuth();
  const { isExpiring, timeRemaining } = useTokenExpiry();
  const pageHeaderData = usePageHeaderData();
  const [showExpiryToast, setShowExpiryToast] = useState(false);
  const [lastToastShown, setLastToastShown] = useState<number>(0);

  // Show toast when token is expiring (but not constantly)
  useEffect(() => {
    if (isExpiring && timeRemaining) {
      const now = Date.now();
      const minutesRemaining = Math.floor(timeRemaining / 1000 / 60);

      // Show toast if:
      // 1. Haven't shown in the last 5 minutes, OR
      // 2. It's critical (< 5 minutes remaining) and haven't shown in the last 2 minutes
      const timeSinceLastToast = now - lastToastShown;
      const shouldShow =
        (minutesRemaining <= 5 && timeSinceLastToast > 2 * 60 * 1000) || // Critical: every 2 min
        timeSinceLastToast > 5 * 60 * 1000; // Normal: every 5 min

      if (shouldShow) {
        setShowExpiryToast(true);
        setLastToastShown(now);
      }
    }
  }, [isExpiring, timeRemaining, lastToastShown]);

  /**
   * Format time remaining
   */
  const formatTimeRemaining = (ms: number | null): string => {
    if (!ms) return "";
    const minutes = Math.floor(ms / 1000 / 60);
    if (minutes < 1) return "less than 1 minute";
    if (minutes === 1) return "1 minute";
    return `${minutes} minutes`;
  };

  return (
    <header className="bg-white border-b border-border-light sticky top-0 z-30">
      {/* Breadcrumbs + Entity Selector */}
      <div className="flex items-center justify-between px-4 md:px-6 py-2 gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Breadcrumbs */}
          <div className="flex-1 min-w-0">
            <Breadcrumbs pathLabels={pageHeaderData?.pathLabels} />
          </div>
        </div>

        {/* Entity Selector */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user && <HeaderEntitySelector />}
        </div>
      </div>

      {/* Session Expiry Toast */}
      {isExpiring && (
        <Toast
          visible={showExpiryToast}
          type="warning"
          message={`⚠️ Session expires in ${formatTimeRemaining(timeRemaining)}`}
          duration={8000}
          position="top"
          onDismiss={() => setShowExpiryToast(false)}
        />
      )}
    </header>
  );
}
