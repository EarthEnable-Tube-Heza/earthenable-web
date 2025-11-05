'use client';

/**
 * Dashboard Sidebar
 *
 * Navigation sidebar for the dashboard.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, useIsAdmin } from '@/src/lib/auth';
import { cn } from '@/src/lib/theme';

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
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = useIsAdmin();

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly) {
      return isAdmin;
    }
    return true;
  });

  return (
    <aside className="w-64 bg-white border-r border-border-light h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border-light">
        <Link href="/dashboard">
          <h1 className="text-2xl font-heading font-bold text-primary">
            EarthEnable
          </h1>
          <p className="text-sm text-text-secondary font-body">Dashboard</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4">
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
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text-primary hover:bg-background-light'
                  )}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      {user && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-light bg-background-light">
          <div className="flex items-center gap-3">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name || user.email}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold">
                {user.name?.[0] || user.email[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {user.name || user.email}
              </p>
              <p className="text-xs text-text-secondary truncate">
                {user.role.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
