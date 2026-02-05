"use client";

/**
 * Dashboard Sidebar
 *
 * Responsive navigation sidebar with:
 * - Modular, permission-aware navigation
 * - Collapsible module groups with flyout menus when collapsed
 * - Desktop: Collapsible sidebar (full width or icon-only)
 * - Smaller screens: Always visible in collapsed/icon-only mode
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState, useEffect, useRef } from "react";
import { useSidebar } from "@/src/contexts/SidebarContext";
import { useFilteredNavigation } from "@/src/lib/auth";
import { cn } from "@/src/lib/theme";
import { NavGroup } from "./NavGroup";
import { UserMenu } from "./UserMenu";

/**
 * Hook to track if screen matches lg breakpoint (1024px+)
 */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mql.matches);

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}

/**
 * Storage key for persisting expanded module state
 */
const EXPANDED_MODULES_KEY = "earthenable_nav_expanded";

/**
 * Get initial expanded state from localStorage or use defaults
 */
function getInitialExpandedState(): Record<string, boolean> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = localStorage.getItem(EXPANDED_MODULES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Invalid JSON, use defaults
  }

  return {};
}

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed } = useSidebar();
  const { modules, isLoading } = useFilteredNavigation();
  const isDesktop = useIsDesktop();

  // Small screens: default to collapsed but allow user to expand
  const [smallScreenCollapsed, setSmallScreenCollapsed] = useState(true);
  const prevIsDesktop = useRef(isDesktop);

  // Auto-collapse when transitioning to a smaller screen
  useEffect(() => {
    if (prevIsDesktop.current && !isDesktop) {
      setSmallScreenCollapsed(true);
    }
    prevIsDesktop.current = isDesktop;
  }, [isDesktop]);

  // Desktop: use persisted context state; small screen: use local state
  const effectiveCollapsed = isDesktop ? isCollapsed : smallScreenCollapsed;

  // Toggle that works on both screen sizes
  const handleToggle = useCallback(() => {
    if (isDesktop) {
      toggleCollapsed();
    } else {
      setSmallScreenCollapsed((prev) => !prev);
    }
  }, [isDesktop, toggleCollapsed]);

  // Track expanded state for each module
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Initialize expanded state from localStorage and module defaults
  useEffect(() => {
    const stored = getInitialExpandedState();

    // Merge with defaults from modules
    const initial: Record<string, boolean> = {};
    modules.forEach((module) => {
      // Use stored state if available, otherwise use module default
      initial[module.id] =
        stored[module.id] !== undefined ? stored[module.id] : (module.defaultExpanded ?? false);
    });

    setExpandedModules(initial);
  }, [modules]);

  // Toggle expanded state for a module
  const handleToggleExpanded = useCallback((moduleId: string) => {
    setExpandedModules((prev) => {
      const next = { ...prev, [moduleId]: !prev[moduleId] };

      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(EXPANDED_MODULES_KEY, JSON.stringify(next));
      }

      return next;
    });
  }, []);

  return (
    <aside
      className={cn(
        "bg-white border-r border-border-light h-screen flex flex-col",
        "transition-all duration-300 ease-in-out",
        "sticky top-0 z-40",
        effectiveCollapsed ? "w-20 overflow-visible" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("p-6 border-b border-border-light", effectiveCollapsed && "px-4")}>
        <Link href="/dashboard" className="block">
          {effectiveCollapsed ? (
            // Collapsed: Show vertical/square icon
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/logo-square.png" alt="EarthEnable Hub" className="w-12 h-12 mx-auto" />
          ) : (
            // Expanded: Show full horizontal logo
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/logo.svg" alt="EarthEnable Hub" className="w-full max-w-[180px] h-auto" />
          )}
        </Link>
      </div>

      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className={cn(
          "flex absolute -right-3 top-12 z-10",
          "w-6 h-6 rounded-full bg-white border-2 border-border-light",
          "items-center justify-center",
          "hover:bg-background-light transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary"
        )}
        aria-label={effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg
          className={cn(
            "w-3 h-3 text-text-secondary transition-transform",
            effectiveCollapsed && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Navigation */}
      <nav
        className={cn("flex-1 p-4", effectiveCollapsed ? "overflow-visible" : "overflow-y-auto")}
      >
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-10 bg-background-light rounded-lg animate-pulse",
                  effectiveCollapsed && "w-10 mx-auto"
                )}
              />
            ))}
          </div>
        ) : (
          <ul className="space-y-1">
            {modules.map((module) => (
              <NavGroup
                key={module.id}
                module={module}
                isCollapsed={effectiveCollapsed}
                isExpanded={expandedModules[module.id] ?? module.defaultExpanded ?? false}
                onToggleExpanded={handleToggleExpanded}
                pathname={pathname}
              />
            ))}
          </ul>
        )}
      </nav>

      {/* User Menu - Shows avatar when collapsed, full user info when expanded */}
      <UserMenu isCollapsed={effectiveCollapsed} />
    </aside>
  );
}
