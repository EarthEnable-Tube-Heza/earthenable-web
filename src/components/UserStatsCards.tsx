'use client';

/**
 * User Statistics Cards
 *
 * Displays user statistics overview cards for the dashboard.
 */

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '../lib/api';
import { UserRole, UserRoleLabels } from '../types/user';
import { cn } from '../lib/theme';

export function UserStatsCards() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => apiClient.getUserStats(),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-medium p-6 animate-pulse"
          >
            <div className="h-4 bg-background-light rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-background-light rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-status-error/10 border border-status-error rounded-lg p-4">
        <p className="text-status-error">Failed to load user statistics.</p>
      </div>
    );
  }

  if (!stats) return null;

  const totalUsers = stats.total_users;
  const activeUsers = stats.active_users;
  const inactiveUsers = totalUsers - activeUsers;
  const byRole = stats.by_role;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Link
          href="/dashboard/users"
          className="bg-white rounded-lg shadow-medium p-6 hover:shadow-large transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary mb-1">
                Total Users
              </p>
              <p className="text-3xl font-heading font-bold text-primary">
                {totalUsers}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </Link>

        {/* Active Users */}
        <Link
          href="/dashboard/users?status=active"
          className="bg-white rounded-lg shadow-medium p-6 hover:shadow-large transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary mb-1">
                Active Users
              </p>
              <p className="text-3xl font-heading font-bold text-status-success">
                {activeUsers}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(0) : 0}% of total
              </p>
            </div>
            <div className="w-12 h-12 bg-status-success/10 rounded-full flex items-center justify-center group-hover:bg-status-success/20 transition-colors">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </Link>

        {/* Inactive Users */}
        <Link
          href="/dashboard/users?status=inactive"
          className="bg-white rounded-lg shadow-medium p-6 hover:shadow-large transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary mb-1">
                Inactive Users
              </p>
              <p className="text-3xl font-heading font-bold text-text-disabled">
                {inactiveUsers}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {totalUsers > 0 ? ((inactiveUsers / totalUsers) * 100).toFixed(0) : 0}% of total
              </p>
            </div>
            <div className="w-12 h-12 bg-text-disabled/10 rounded-full flex items-center justify-center group-hover:bg-text-disabled/20 transition-colors">
              <span className="text-2xl">⏸️</span>
            </div>
          </div>
        </Link>

        {/* Recent Signups */}
        <Link
          href="/dashboard/users"
          className="bg-white rounded-lg shadow-medium p-6 hover:shadow-large transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary mb-1">
                Recent Signups
              </p>
              <p className="text-3xl font-heading font-bold text-status-info">
                {stats.recent_signups?.length || 0}
              </p>
              <p className="text-xs text-text-secondary mt-1">Last 30 days</p>
            </div>
            <div className="w-12 h-12 bg-status-info/10 rounded-full flex items-center justify-center group-hover:bg-status-info/20 transition-colors">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Users by Role */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <h3 className="text-lg font-heading font-bold text-text-primary mb-4">
          Users by Role
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Admins */}
          <Link
            href="/dashboard/users?role=admin"
            className="flex items-center justify-between p-4 bg-status-error/5 rounded-lg hover:bg-status-error/10 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-text-secondary">Admins</p>
              <p className="text-2xl font-heading font-bold text-status-error">
                {byRole[UserRole.ADMIN] || 0}
              </p>
            </div>
            <div className="text-status-error opacity-50 group-hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>

          {/* Managers */}
          <Link
            href="/dashboard/users?role=manager"
            className="flex items-center justify-between p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-text-secondary">Managers</p>
              <p className="text-2xl font-heading font-bold text-primary">
                {byRole[UserRole.MANAGER] || 0}
              </p>
            </div>
            <div className="text-primary opacity-50 group-hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>

          {/* QA Agents */}
          <Link
            href="/dashboard/users?role=qa_agent"
            className="flex items-center justify-between p-4 bg-status-info/5 rounded-lg hover:bg-status-info/10 transition-colors group"
          >
            <div>
              <p className="text-sm font-medium text-text-secondary">QA Agents</p>
              <p className="text-2xl font-heading font-bold text-status-info">
                {byRole[UserRole.QA_AGENT] || 0}
              </p>
            </div>
            <div className="text-status-info opacity-50 group-hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Signups List */}
      {stats.recent_signups && stats.recent_signups.length > 0 && (
        <div className="bg-white rounded-lg shadow-medium p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-heading font-bold text-text-primary">
              Recent Signups
            </h3>
            <Link
              href="/dashboard/users"
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recent_signups.slice(0, 5).map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-background-light rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold">
                    {user.name?.[0] || user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-text-secondary">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      user.role === UserRole.ADMIN
                        ? 'bg-status-error/10 text-status-error'
                        : user.role === UserRole.MANAGER
                        ? 'bg-primary/10 text-primary'
                        : 'bg-status-info/10 text-status-info'
                    )}
                  >
                    {UserRoleLabels[user.role]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
