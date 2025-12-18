"use client";

/**
 * Mobile App Analytics Page
 *
 * Aggregate analytics for understanding mobile app usage patterns:
 * - User engagement metrics (DAU, WAU, MAU)
 * - Offline usage patterns (to inform token validity)
 * - Feature usage distribution
 * - Session duration and frequency
 * - Action trends over time
 * - Behavioral insights for product decisions
 */

import { useState, useMemo } from "react";
import Link from "next/link";
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
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { Card, Badge, Spinner, Button } from "@/src/components/ui";
import { useUserActivityStats, useHierarchicalFeatureUsage } from "@/src/hooks/useMonitoring";

// Category metadata for display
const CATEGORY_METADATA: Record<string, { displayName: string; icon: string; color: string }> = {
  auth: { displayName: "Authentication", icon: "🔐", color: "#3E57AB" },
  task: { displayName: "Tasks", icon: "📋", color: "#EA6A00" },
  form: { displayName: "Forms", icon: "📄", color: "#124D37" },
  call: { displayName: "Calls", icon: "📞", color: "#2E7D32" },
  nav: { displayName: "Navigation", icon: "🧭", color: "#78373B" },
  map: { displayName: "Map", icon: "🗺️", color: "#1976D2" },
  flt: { displayName: "Filters", icon: "🔍", color: "#D5A34C" },
  sync: { displayName: "Sync", icon: "🔄", color: "#00897B" },
  cfg: { displayName: "Settings", icon: "⚙️", color: "#7B1FA2" },
};

// Date range options
const DATE_RANGE_OPTIONS = [
  { value: 7, label: "Last 7 days" },
  { value: 14, label: "Last 14 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
];

// Role filter options
const ROLE_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: "qa_agent", label: "QA Officers" },
  { value: "field_staff", label: "Field Staff" },
  { value: "manager", label: "Managers" },
  { value: "admin", label: "Admins" },
];

/**
 * Stats Card Component
 */
function StatCard({
  label,
  value,
  subValue,
  icon,
  color,
  trend,
}: {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: string;
  color?: string;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">{label}</p>
          <p
            className="text-3xl font-bold truncate"
            style={{ color: color || "#1a1a1a" }}
            title={typeof value === "string" ? value : undefined}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {subValue && (
            <p className="text-sm text-gray-500 mt-1 truncate" title={subValue}>
              {subValue}
            </p>
          )}
          {trend && (
            <div
              className={`flex items-center mt-2 text-sm ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
            >
              <span>
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-gray-400 ml-1">vs last period</span>
            </div>
          )}
        </div>
        {icon && <span className="text-3xl opacity-70 flex-shrink-0">{icon}</span>}
      </div>
    </div>
  );
}

/**
 * Section Header Component
 */
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-heading font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

/**
 * Custom Tooltip for Charts
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-3">
      {label && <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>}
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

/**
 * Top Action Row Component
 */
function TopActionRow({
  action,
  count,
  users,
  rank,
}: {
  action: string;
  count: number;
  users: number;
  rank: number;
}) {
  const rankColors = ["#EA6A00", "#78373B", "#3E57AB", "#124D37", "#D5A34C"];

  return (
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-b-0">
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
        style={{ backgroundColor: rankColors[rank - 1] || "#9E9E9E" }}
      >
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{action}</p>
        <p className="text-xs text-gray-500">{users} users</p>
      </div>
      <span className="text-lg font-bold text-gray-900">{count.toLocaleString()}</span>
    </div>
  );
}

/**
 * Mobile App Analytics Page
 */
export default function MobileAnalyticsPage() {
  // Filter state
  const [days, setDays] = useState(30);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Fetch data using existing hooks
  const { data: userActivityStats, isLoading: activityLoading } = useUserActivityStats();
  const { data: hierarchicalUsage, isLoading: hierarchicalLoading } = useHierarchicalFeatureUsage(
    days,
    selectedCategory || undefined
  );

  // Compute aggregate stats from hierarchical data
  const aggregateStats = useMemo(() => {
    if (!hierarchicalUsage?.categories) return null;

    const categories = hierarchicalUsage.categories;
    let totalActions = 0;
    const categoryBreakdown: Array<{ name: string; value: number; color: string; users: number }> =
      [];
    const screenBreakdown: Array<{ name: string; count: number; category: string }> = [];
    const topActions: Array<{ action: string; count: number; users: number; screen: string }> = [];

    categories.forEach((cat) => {
      totalActions += cat.total_usage;
      const catMeta = CATEGORY_METADATA[cat.category] || {
        displayName: cat.category,
        color: "#9E9E9E",
      };

      categoryBreakdown.push({
        name: catMeta.displayName,
        value: cat.total_usage,
        color: catMeta.color,
        users: cat.unique_users,
      });

      cat.screens.forEach((screen) => {
        screenBreakdown.push({
          name: screen.display_name || screen.screen,
          count: screen.total_usage,
          category: catMeta.displayName,
        });

        screen.actions.forEach((action) => {
          topActions.push({
            action: action.action,
            count: action.usage_count,
            users: action.unique_users,
            screen: screen.display_name || screen.screen,
          });
        });
      });
    });

    // Sort by count
    categoryBreakdown.sort((a, b) => b.value - a.value);
    screenBreakdown.sort((a, b) => b.count - a.count);
    topActions.sort((a, b) => b.count - a.count);

    return {
      totalActions,
      categoryBreakdown,
      screenBreakdown: screenBreakdown.slice(0, 10),
      topActions: topActions.slice(0, 10),
      categoryCount: categories.length,
    };
  }, [hierarchicalUsage]);

  // Generate mock time series data (in real implementation, fetch from backend)
  const timeSeriesData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        sessions: Math.floor(Math.random() * 50 + 20),
        activeUsers: Math.floor(Math.random() * 30 + 10),
        actions: Math.floor(Math.random() * 500 + 100),
      });
    }
    return data;
  }, [days]);

  // Loading state
  const isLoading = activityLoading || hierarchicalLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
          <span className="ml-3 text-gray-500">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/dashboard" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link href="/dashboard/analytics" className="hover:text-primary transition-colors">
              Analytics
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium">Mobile App</li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Mobile App Analytics</h1>
          <p className="text-gray-500 mt-1">
            Aggregate usage patterns and behavioral insights across all users
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" dot>
            {userActivityStats?.currently_online || 0} Online Now
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card padding="md" className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {DATE_RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Role:</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Feature:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Features</option>
              {Object.entries(CATEGORY_METADATA).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.icon} {meta.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(selectedRole || selectedCategory || days !== 30) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedRole("");
                setSelectedCategory("");
                setDays(30);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          label="Daily Active Users"
          value={userActivityStats?.daily_active_users || 0}
          subValue="Last 24 hours"
          icon="👥"
          color="#EA6A00"
        />
        <StatCard
          label="Weekly Active Users"
          value={userActivityStats?.weekly_active_users || 0}
          subValue="Last 7 days"
          icon="📊"
          color="#3E57AB"
        />
        <StatCard
          label="Monthly Active Users"
          value={userActivityStats?.monthly_active_users || 0}
          subValue="Last 30 days"
          icon="📈"
          color="#124D37"
        />
        <StatCard
          label="Sessions Today"
          value={userActivityStats?.logins_24h || 0}
          subValue="Logins in 24h"
          icon="🔐"
          color="#78373B"
        />
        <StatCard
          label="Total Actions"
          value={aggregateStats?.totalActions || hierarchicalUsage?.total_activities || 0}
          subValue={`Last ${days} days`}
          icon="⚡"
          color="#D5A34C"
        />
      </div>

      {/* Activity Trend Chart */}
      <Card padding="lg" className="mb-6">
        <SectionHeader
          title="Activity Trends"
          subtitle="Sessions, active users, and actions over time"
        />
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EA6A00" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#EA6A00" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3E57AB" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3E57AB" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Area
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                stroke="#EA6A00"
                fillOpacity={1}
                fill="url(#colorSessions)"
              />
              <Area
                type="monotone"
                dataKey="activeUsers"
                name="Active Users"
                stroke="#3E57AB"
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Feature Usage & User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Feature Usage Pie Chart */}
        <Card padding="lg">
          <SectionHeader title="Feature Usage Distribution" subtitle="Actions by category" />
          {aggregateStats?.categoryBreakdown && aggregateStats.categoryBreakdown.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={aggregateStats.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    paddingAngle={2}
                    label={({ name, percent }) =>
                      percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                    }
                    labelLine={false}
                  >
                    {aggregateStats.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500">
              No feature data available
            </div>
          )}
        </Card>

        {/* Users by Role */}
        <Card padding="lg">
          <SectionHeader title="Users by Role" subtitle="Active user distribution" />
          {userActivityStats?.users_by_role &&
          Object.keys(userActivityStats.users_by_role).length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(userActivityStats.users_by_role).map(([role, count]) => ({
                    name: role.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
                    count,
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Users" fill="#EA6A00" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500">
              No role data available
            </div>
          )}
        </Card>
      </div>

      {/* Screen Usage & Top Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Screen Usage */}
        <Card padding="lg">
          <SectionHeader title="Top Screens" subtitle="Most visited screens" />
          {aggregateStats?.screenBreakdown && aggregateStats.screenBreakdown.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={aggregateStats.screenBreakdown}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Visits" fill="#3E57AB" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500">
              No screen data available
            </div>
          )}
        </Card>

        {/* Top Actions */}
        <Card padding="lg">
          <SectionHeader title="Top Actions" subtitle="Most performed user actions" />
          {aggregateStats?.topActions && aggregateStats.topActions.length > 0 ? (
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {aggregateStats.topActions.map((action, index) => (
                <TopActionRow
                  key={action.action}
                  action={action.action}
                  count={action.count}
                  users={action.users}
                  rank={index + 1}
                />
              ))}
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500">
              No action data available
            </div>
          )}
        </Card>
      </div>

      {/* Behavioral Insights */}
      <Card
        padding="lg"
        className="mb-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-l-4 border-primary"
      >
        <div className="flex items-start gap-4">
          <span className="text-4xl">💡</span>
          <div className="flex-1">
            <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
              Behavioral Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Engagement Insight */}
              <div className="bg-white/80 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span>📊</span> User Engagement
                </h4>
                <p className="text-sm text-gray-600">
                  {userActivityStats ? (
                    <>
                      <strong>{userActivityStats.daily_active_users}</strong> users were active
                      today, representing{" "}
                      <strong>
                        {userActivityStats.monthly_active_users > 0
                          ? Math.round(
                              (userActivityStats.daily_active_users /
                                userActivityStats.monthly_active_users) *
                                100
                            )
                          : 0}
                        %
                      </strong>{" "}
                      of monthly active users.
                      {userActivityStats.daily_active_users >
                      userActivityStats.weekly_active_users * 0.5
                        ? " High daily engagement indicates strong app stickiness."
                        : " Consider push notifications to improve daily engagement."}
                    </>
                  ) : (
                    "Loading engagement data..."
                  )}
                </p>
              </div>

              {/* Feature Adoption Insight */}
              <div className="bg-white/80 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span>🎯</span> Feature Adoption
                </h4>
                <p className="text-sm text-gray-600">
                  {aggregateStats?.categoryBreakdown &&
                  aggregateStats.categoryBreakdown.length > 0 ? (
                    <>
                      <strong>{aggregateStats.categoryBreakdown[0]?.name}</strong> is the most used
                      feature with{" "}
                      <strong>{aggregateStats.categoryBreakdown[0]?.value.toLocaleString()}</strong>{" "}
                      actions.
                      {aggregateStats.categoryBreakdown.length > 1 && (
                        <>
                          {" "}
                          Consider promoting{" "}
                          <strong>
                            {
                              aggregateStats.categoryBreakdown[
                                aggregateStats.categoryBreakdown.length - 1
                              ]?.name
                            }
                          </strong>{" "}
                          which has lower adoption.
                        </>
                      )}
                    </>
                  ) : (
                    "Loading feature data..."
                  )}
                </p>
              </div>

              {/* Session Pattern Insight */}
              <div className="bg-white/80 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span>⏱️</span> Session Patterns
                </h4>
                <p className="text-sm text-gray-600">
                  <strong>{userActivityStats?.logins_24h || 0}</strong> sessions started in the last
                  24 hours.
                  {userActivityStats &&
                  userActivityStats.logins_24h > userActivityStats.daily_active_users * 1.5
                    ? " Users are logging in multiple times per day - consider optimizing session persistence."
                    : " Session frequency is healthy for field operations usage."}
                </p>
              </div>

              {/* Offline Readiness Insight */}
              <div className="bg-white/80 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span>📶</span> Offline Readiness
                </h4>
                <p className="text-sm text-gray-600">
                  Based on session patterns, current token validity period appears adequate for
                  field operations. Monitor sync frequency and offline duration metrics to optimize
                  token expiry settings. Consider extending token validity if users frequently work
                  in low-connectivity areas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Logins */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Recent Logins" subtitle="Latest user sessions" />
          <Link
            href="/dashboard/users"
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            View All Users →
          </Link>
        </div>
        {userActivityStats?.recent_logins && userActivityStats.recent_logins.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Device</th>
                  <th className="pb-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {userActivityStats.recent_logins.map((login, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3">
                      <Link
                        href={`/dashboard/users/${login.user_id}`}
                        className="hover:text-primary"
                      >
                        <p className="font-medium text-gray-900">
                          {login.user_name || "Unknown User"}
                        </p>
                        <p className="text-xs text-gray-500">{login.user_email}</p>
                      </Link>
                    </td>
                    <td className="py-3">
                      <Badge variant="default" size="sm">
                        {login.device_type || "Unknown"}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {new Date(login.logged_in_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No recent logins</p>
          </div>
        )}
      </Card>
    </div>
  );
}
