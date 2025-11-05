'use client';

/**
 * Analytics Dashboard Page (Admin only)
 *
 * Displays user analytics with charts and visualizations.
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/src/lib/api';
import { UserRole, UserRoleLabels } from '@/src/types/user';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { useMemo } from 'react';

const COLORS = {
  primary: '#EA6A00',
  secondary: '#78373B',
  accent: '#D5A34C',
  green: '#124D37',
  blue: '#3E57AB',
  error: '#E04562',
  warning: '#D5A34C',
  info: '#3E57AB',
};

const ROLE_COLORS: Record<string, string> = {
  admin: COLORS.error,
  manager: COLORS.blue,
  qa_agent: COLORS.green,
};

export default function AnalyticsPage() {
  // Fetch user statistics
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => apiClient.getUserStats(),
  });

  // Process data for charts
  const roleDistributionData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.by_role).map(([role, count]) => ({
      name: UserRoleLabels[role as UserRole] || role,
      value: count,
      color: ROLE_COLORS[role] || COLORS.accent,
    }));
  }, [stats]);

  const activeStatusData = useMemo(() => {
    if (!stats) return [];
    const inactive = stats.total_users - stats.active_users;
    return [
      { name: 'Active', value: stats.active_users, color: COLORS.green },
      { name: 'Inactive', value: inactive, color: COLORS.error },
    ];
  }, [stats]);

  // Process recent signups for timeline
  const signupsTimelineData = useMemo(() => {
    if (!stats?.recent_signups) return [];

    // Group signups by date
    const signupsByDate: Record<string, number> = {};
    stats.recent_signups.forEach((user) => {
      const date = new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      signupsByDate[date] = (signupsByDate[date] || 0) + 1;
    });

    return Object.entries(signupsByDate).map(([date, count]) => ({
      date,
      signups: count,
    }));
  }, [stats]);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-text-secondary mt-2">Loading analytics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center">
        <p className="text-status-error">Error loading analytics. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-text-primary">
          Analytics Dashboard
        </h1>
        <p className="text-text-secondary mt-2">
          User statistics and insights
        </p>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-medium p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Users</p>
              <p className="text-3xl font-bold text-text-primary mt-1">
                {stats.total_users}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-medium p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Active Users</p>
              <p className="text-3xl font-bold text-status-success mt-1">
                {stats.active_users}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {stats.total_users > 0
                  ? `${Math.round((stats.active_users / stats.total_users) * 100)}%`
                  : '0%'}
              </p>
            </div>
            <div className="w-12 h-12 bg-status-success/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-medium p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Inactive Users</p>
              <p className="text-3xl font-bold text-status-error mt-1">
                {stats.total_users - stats.active_users}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {stats.total_users > 0
                  ? `${Math.round(((stats.total_users - stats.active_users) / stats.total_users) * 100)}%`
                  : '0%'}
              </p>
            </div>
            <div className="w-12 h-12 bg-status-error/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-status-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-medium p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Recent Signups</p>
              <p className="text-3xl font-bold text-status-info mt-1">
                {stats.recent_signups?.length || 0}
              </p>
              <p className="text-xs text-text-secondary mt-1">Last 30 days</p>
            </div>
            <div className="w-12 h-12 bg-status-info/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-status-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Role Distribution & Active Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role - Pie Chart */}
        <div className="bg-white rounded-lg shadow-medium p-6">
          <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
            Users by Role
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roleDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {roleDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Active vs Inactive - Pie Chart */}
        <div className="bg-white rounded-lg shadow-medium p-6">
          <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
            User Activity Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={activeStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {activeStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Role Distribution Bar Chart */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
          Role Distribution
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={roleDistributionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="Users">
              {roleDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row 3: Recent Signups Timeline */}
      {signupsTimelineData.length > 0 && (
        <div className="bg-white rounded-lg shadow-medium p-6">
          <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
            Recent Signups Timeline
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={signupsTimelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="signups"
                name="Signups"
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Role Breakdown Table */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <h2 className="text-xl font-heading font-bold text-text-primary mb-4">
          Detailed Role Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-light border-b border-border-light">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Visualization
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {roleDistributionData.map((role) => {
                const percentage = stats.total_users > 0
                  ? (role.value / stats.total_users) * 100
                  : 0;
                return (
                  <tr key={role.name} className="hover:bg-background-light transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: role.color }}
                        />
                        <span className="text-sm font-medium text-text-primary">
                          {role.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary">
                      {role.value}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary">
                      {percentage.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-background-light rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: role.color,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
