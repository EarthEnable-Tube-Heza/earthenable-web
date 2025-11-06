'use client';

/**
 * Dashboard Home Page
 *
 * Main dashboard overview page showing stats and quick access.
 */

import { useAuth, useIsAdmin, useIsManager } from '@/src/lib/auth';
import { UserStatsCards } from '@/src/components/UserStatsCards';
import Link from 'next/link';

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
  managerOnly?: boolean;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const isManager = useIsManager();

  // Quick actions based on role
  const quickActions: QuickAction[] = [
    {
      title: 'Manage Users',
      description: 'View, edit, and manage user roles and permissions',
      href: '/dashboard/users',
      icon: '👥',
      adminOnly: true,
    },
    {
      title: 'Configure Forms',
      description: 'Manage TaskSubject-to-FormYoula form mappings',
      href: '/dashboard/forms',
      icon: '📋',
      adminOnly: true,
    },
    {
      title: 'View Analytics',
      description: 'User statistics and performance insights',
      href: '/dashboard/analytics',
      icon: '📊',
      adminOnly: true,
    },
  ];

  // Filter actions based on role
  const filteredActions = quickActions.filter(action => {
    if (action.adminOnly) return isAdmin;
    if (action.managerOnly) return isManager;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
          Welcome back, {user?.name || user?.email}!
        </h1>
        <p className="text-text-secondary font-body">
          Here&apos;s an overview of your EarthEnable operations dashboard.
        </p>
      </div>

      {/* User Statistics (Admin only) */}
      {isAdmin && <UserStatsCards />}

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-text-primary mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="bg-white rounded-lg shadow-medium p-6 hover:shadow-large hover:border-primary border-2 border-transparent transition-all"
            >
              <div className="text-4xl mb-3">{action.icon}</div>
              <h3 className="text-xl font-heading font-bold text-text-primary mb-2">
                {action.title}
              </h3>
              <p className="text-text-secondary font-body text-sm">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity (Placeholder) */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <h2 className="text-2xl font-heading font-bold text-text-primary mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4 pb-4 border-b border-border-light last:border-0 last:pb-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary">📌</span>
              </div>
              <div className="flex-1">
                <p className="text-text-primary font-medium">Activity {i}</p>
                <p className="text-text-secondary text-sm">
                  This is a placeholder for recent activity. Real data will be fetched from the API.
                </p>
                <p className="text-text-disabled text-xs mt-1">{i} hour{i > 1 ? 's' : ''} ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
