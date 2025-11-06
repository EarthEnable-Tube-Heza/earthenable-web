'use client';

/**
 * Dashboard Sidebar
 *
 * Responsive navigation sidebar with collapsible functionality.
 * - Desktop: Collapsible sidebar (full width or icon-only)
 * - Mobile: Overlay sidebar with hamburger menu
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, useIsAdmin } from '@/src/lib/auth';
import { useSidebar } from '@/src/contexts/SidebarContext';
import { cn } from '@/src/lib/theme';
import { UserRole, UserRoleLabels } from '@/src/types/user';
import { useEffect } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: '🏠',
  },
  {
    href: '/dashboard/users',
    label: 'Users',
    icon: '👥',
    adminOnly: true,
  },
  {
    href: '/dashboard/forms',
    label: 'Forms',
    icon: '📋',
    adminOnly: true,
  },
  {
    href: '/dashboard/analytics',
    label: 'Analytics',
    icon: '📊',
    adminOnly: true,
  },
  {
    href: '/dashboard/components',
    label: 'Components',
    icon: '🎨',
    adminOnly: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const { isCollapsed, isMobileOpen, toggleCollapsed, closeMobileMenu } = useSidebar();

  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly) {
      return isAdmin;
    }
    return true;
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileMenu}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // Base styles
          'bg-white border-r border-border-light h-screen flex flex-col',
          'transition-all duration-300 ease-in-out',

          // Mobile: fixed overlay, hidden by default
          'fixed inset-y-0 left-0 z-50 w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',

          // Desktop: normal flow, always visible, collapsible width
          'lg:sticky lg:top-0 lg:translate-x-0',
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'p-6 border-b border-border-light',
          isCollapsed && 'px-4'
        )}>
          <Link href="/dashboard" className="block">
            {isCollapsed ? (
              // Collapsed: Show vertical/square icon
              <img
                src="/icon.png"
                alt="EarthEnable Hub"
                className="w-12 h-12 mx-auto"
              />
            ) : (
              // Expanded: Show full horizontal logo
              <img
                src="/logo.svg"
                alt="EarthEnable Hub"
                className="w-full max-w-[180px] h-auto"
              />
            )}
          </Link>
        </div>

        {/* Toggle Button (Desktop only) */}
        <button
          onClick={toggleCollapsed}
          className={cn(
            'hidden lg:flex absolute -right-3 top-24 z-10',
            'w-6 h-6 rounded-full bg-white border-2 border-border-light',
            'items-center justify-center',
            'hover:bg-background-light transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary'
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={cn(
              'w-3 h-3 text-text-secondary transition-transform',
              isCollapsed && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href ||
                              (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg font-body transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-primary',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-text-primary hover:bg-background-light',
                      isCollapsed && 'justify-center px-2'
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info */}
        {user && !isCollapsed && (
          <div className="p-4 border-t border-border-light bg-background-light">
            <div className="flex items-center gap-3">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || user.email}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold flex-shrink-0">
                  {user.name?.[0] || user.email[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user.name || user.email}
                </p>
                <p className="text-xs text-text-secondary truncate">
                  {user.role ? UserRoleLabels[user.role] : 'Loading...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed User Avatar */}
        {user && isCollapsed && (
          <div className="p-4 border-t border-border-light flex justify-center">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name || user.email}
                className="w-10 h-10 rounded-full"
                title={user.name || user.email}
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold"
                title={user.name || user.email}
              >
                {user.name?.[0] || user.email[0].toUpperCase()}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
