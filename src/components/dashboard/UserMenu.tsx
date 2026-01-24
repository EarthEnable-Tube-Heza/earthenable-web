"use client";

/**
 * User Menu Component (Sidebar Bottom)
 *
 * Displays user avatar + name + role at the bottom of the sidebar.
 * - Collapsed sidebar: Shows just user avatar
 * - Expanded sidebar: Shows avatar + name + role with upward-opening dropdown
 * - Menu items: Profile, Settings, Sign Out
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/lib/auth";
import { Menu } from "@headlessui/react";
import { cn } from "@/src/lib/theme";
import { formatRoleLabel } from "@/src/types/user";

interface UserMenuProps {
  isCollapsed: boolean;
}

export function UserMenu({ isCollapsed }: UserMenuProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  if (!user) return null;

  const avatar = user.picture ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={user.picture}
      alt={user.name || user.email}
      className="w-10 h-10 rounded-full flex-shrink-0"
    />
  ) : (
    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">
      {user.name?.[0] || user.email[0].toUpperCase()}
    </div>
  );

  // Collapsed: just avatar with tooltip
  if (isCollapsed) {
    return (
      <div className="p-4 border-t border-border-light bg-white flex justify-center">
        <Menu as="div" className="relative">
          <Menu.Button
            className="rounded-full hover:ring-2 hover:ring-primary/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
            title={user.name || user.email}
          >
            {avatar}
          </Menu.Button>

          <Menu.Items className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-large border border-border-light overflow-hidden z-50">
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
      </div>
    );
  }

  // Expanded: full user info + upward dropdown
  return (
    <div className="p-4 border-t border-border-light bg-white">
      <Menu as="div" className="relative">
        <Menu.Button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
            "hover:bg-background-light transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary"
          )}
        >
          {avatar}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-text-primary truncate">
              {user.name || user.email}
            </p>
            <p className="text-xs text-text-secondary truncate">
              {user.role ? formatRoleLabel(user.role) : "Loading..."}
            </p>
          </div>
          <svg
            className="w-4 h-4 text-text-secondary flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </Menu.Button>

        <Menu.Items className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-large border border-border-light overflow-hidden z-50">
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
    </div>
  );
}
