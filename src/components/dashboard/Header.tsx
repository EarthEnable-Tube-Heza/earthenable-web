"use client";

/**
 * Dashboard Header
 *
 * Top header bar with hamburger menu (mobile), breadcrumbs, and user menu.
 * Responsive design for mobile, tablet, and desktop.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useTokenExpiry } from "@/src/lib/auth";
import { useSidebar } from "@/src/contexts/SidebarContext";
import { useScrollbarCompensation } from "@/src/hooks/useScrollbarCompensation";
import { Menu } from "@headlessui/react";
import { cn } from "@/src/lib/theme";
import { formatRoleLabel } from "@/src/types/user";
import { Breadcrumbs } from "./Breadcrumbs";
import { Toast } from "@/src/components/ui/Toast";

export function Header() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { isExpiring, timeRemaining } = useTokenExpiry();
  const { toggleMobileMenu } = useSidebar();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showExpiryToast, setShowExpiryToast] = useState(false);
  const [lastToastShown, setLastToastShown] = useState<number>(0);

  // Prevent layout shift when dropdown menu opens
  useScrollbarCompensation();

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
   * Handle sign out
   */
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      router.push("/auth/signin");
    } catch (error) {
      console.error("Sign out error:", error);
      setIsSigningOut(false);
    }
  };

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
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        {/* Left Side: Hamburger Menu (Mobile) + Breadcrumbs */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Hamburger Menu Button (Mobile only) */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-background-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Breadcrumbs (Hidden on mobile to save space) */}
          <div className="hidden md:block flex-1 min-w-0">
            <Breadcrumbs />
          </div>
        </div>

        {/* Right Side: User Menu */}
        <div className="flex items-center gap-4">
          {/* User Menu */}
          {user && (
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-background-light transition-colors">
                {user.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.picture}
                    alt={user.name || user.email}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold text-sm">
                    {user.name?.[0] || user.email[0].toUpperCase()}
                  </div>
                )}
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-text-primary">{user.name || user.email}</p>
                  <p className="text-xs text-text-secondary">
                    {user.role ? formatRoleLabel(user.role) : "Loading..."}
                  </p>
                </div>
                <svg
                  className="w-4 h-4 text-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Menu.Button>

              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-large border border-border-light overflow-hidden">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => router.push("/dashboard/profile")}
                        className={cn(
                          "flex items-center gap-3 w-full px-4 py-2 text-sm text-left",
                          active ? "bg-background-light" : ""
                        )}
                      >
                        <span>👤</span>
                        <span>Profile</span>
                      </button>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => router.push("/dashboard/settings")}
                        className={cn(
                          "flex items-center gap-3 w-full px-4 py-2 text-sm text-left",
                          active ? "bg-background-light" : ""
                        )}
                      >
                        <span>⚙️</span>
                        <span>Settings</span>
                      </button>
                    )}
                  </Menu.Item>

                  <div className="border-t border-border-light my-1" />

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className={cn(
                          "flex items-center gap-3 w-full px-4 py-2 text-sm text-left text-status-error",
                          active ? "bg-status-error/10" : "",
                          isSigningOut ? "opacity-50 cursor-not-allowed" : ""
                        )}
                      >
                        <span>🚪</span>
                        <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Menu>
          )}
        </div>
      </div>

      {/* Session Expiry Toast */}
      {isExpiring && (
        <Toast
          visible={showExpiryToast}
          type="warning"
          message={`⚠️ Session expires in ${formatTimeRemaining(timeRemaining)}`}
          duration={8000} // 8 seconds
          position="top"
          onDismiss={() => setShowExpiryToast(false)}
        />
      )}
    </header>
  );
}
