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
import { useQuery } from "@tanstack/react-query";
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
import { Card, Spinner, Button, LabeledSelect, MultiSelect } from "@/src/components/ui";
import { useSetPageHeader } from "@/src/contexts/PageHeaderContext";
import { PAGE_SPACING } from "@/src/lib/theme";
import {
  useUserActivityStats,
  useHierarchicalFeatureUsage,
  usePlatformAnalytics,
  useActiveAppUsers,
  useActivityTimeSeries,
} from "@/src/hooks/useMonitoring";
import { apiClient } from "@/src/lib/api/apiClient";
import { formatRoleLabel } from "@/src/types/user";
import { LoginFrequencyCard } from "@/src/components/monitoring";

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
  useSetPageHeader({
    title: "Mobile Analytics",
    pathLabels: { analytics: "Analytics", mobile: "Mobile App" },
  });

  // Filter state
  const [days, setDays] = useState(30);
  const [selectedRole, setSelectedRole] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string[]>([]);

  // Fetch user stats (includes dynamic roles from by_role)
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["user-stats"],
    queryFn: () => apiClient.getUserStats(),
  });

  // Fetch data using existing hooks - pass role and user filters
  const { data: userActivityStats, isLoading: activityLoading } = useUserActivityStats();
  const { data: hierarchicalUsage, isLoading: hierarchicalLoading } = useHierarchicalFeatureUsage(
    days,
    selectedCategory.length > 0 ? selectedCategory.join(",") : undefined,
    selectedRole.length > 0 ? selectedRole.join(",") : undefined,
    selectedUserId.length > 0 ? selectedUserId.join(",") : undefined
  );
  const { data: platformAnalytics, isLoading: platformLoading } = usePlatformAnalytics(days);
  const { data: activeUsers, isLoading: activeUsersLoading } = useActiveAppUsers();
  const { data: activityTimeSeries, isLoading: timeSeriesLoading } = useActivityTimeSeries(days);

  // Build dynamic role options from user stats
  const roleOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    if (userStats?.by_role) {
      Object.keys(userStats.by_role).forEach((role) => {
        // Normalize role string and format label
        const normalizedRole = role.startsWith("UserRole.")
          ? role.replace("UserRole.", "").toLowerCase()
          : role.toLowerCase();
        options.push({
          value: normalizedRole,
          label: `${formatRoleLabel(normalizedRole)} (${userStats.by_role[role]})`,
        });
      });
    }
    return options;
  }, [userStats]);

  // Build user options from active app users
  const userOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    if (activeUsers?.users) {
      activeUsers.users.forEach((user) => {
        options.push({
          value: user.id,
          label: user.name || user.email,
        });
      });
    }
    return options;
  }, [activeUsers]);

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

  // Transform time series data for chart display
  const timeSeriesData = useMemo(() => {
    if (!activityTimeSeries?.data) return [];

    return activityTimeSeries.data.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      sessions: item.sessions,
      activeUsers: item.unique_users,
      actions: item.actions,
    }));
  }, [activityTimeSeries]);

  // Loading state
  const isLoading =
    activityLoading ||
    hierarchicalLoading ||
    statsLoading ||
    platformLoading ||
    activeUsersLoading ||
    timeSeriesLoading;

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
    <div className={`container mx-auto max-w-7xl ${PAGE_SPACING}`}>
      {/* Filters */}
      <Card padding="md" className="mb-6 overflow-visible">
        <div className="flex flex-wrap items-end gap-4">
          {/* Date Range */}
          <div className="w-40">
            <LabeledSelect
              label="Period"
              value={String(days)}
              onChange={(e) => setDays(Number(e.target.value))}
              options={DATE_RANGE_OPTIONS.map((opt) => ({
                value: String(opt.value),
                label: opt.label,
              }))}
              size="sm"
              fullWidth
            />
          </div>

          {/* Role Filter */}
          <div className="w-56">
            <MultiSelect
              label="Role"
              placeholder="All Roles"
              options={roleOptions}
              value={selectedRole}
              onChange={(values) => setSelectedRole(values)}
              size="sm"
            />
          </div>

          {/* Category Filter */}
          <div className="w-56">
            <MultiSelect
              label="Feature"
              placeholder="All Features"
              options={Object.entries(CATEGORY_METADATA).map(([key, meta]) => ({
                value: key,
                label: `${meta.icon} ${meta.displayName}`,
              }))}
              value={selectedCategory}
              onChange={(values) => setSelectedCategory(values)}
              size="sm"
            />
          </div>

          {/* User Filter */}
          <div className="w-56">
            <MultiSelect
              label="User"
              placeholder="All Users"
              options={userOptions}
              value={selectedUserId}
              onChange={(values) => setSelectedUserId(values)}
              size="sm"
            />
          </div>

          {/* Clear Filters */}
          {(selectedRole.length > 0 ||
            selectedCategory.length > 0 ||
            selectedUserId.length > 0 ||
            days !== 30) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedRole([]);
                setSelectedCategory([]);
                setSelectedUserId([]);
                setDays(30);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active Filters Indicator */}
        {(selectedRole.length > 0 ||
          selectedCategory.length > 0 ||
          selectedUserId.length > 0 ||
          days !== 30) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Active Filters:
              </span>

              {days !== 30 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  <span>📅</span>
                  {DATE_RANGE_OPTIONS.find((opt) => opt.value === days)?.label || `${days} days`}
                  <button
                    onClick={() => setDays(30)}
                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    aria-label="Remove period filter"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedRole.map((role) => (
                <span
                  key={`role-${role}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                >
                  <span>👤</span>
                  {formatRoleLabel(role)}
                  <button
                    onClick={() => setSelectedRole(selectedRole.filter((r) => r !== role))}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${formatRoleLabel(role)} filter`}
                  >
                    ×
                  </button>
                </span>
              ))}

              {selectedCategory.map((category) => (
                <span
                  key={`category-${category}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                >
                  <span>{CATEGORY_METADATA[category]?.icon || "📦"}</span>
                  {CATEGORY_METADATA[category]?.displayName || category}
                  <button
                    onClick={() =>
                      setSelectedCategory(selectedCategory.filter((c) => c !== category))
                    }
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${CATEGORY_METADATA[category]?.displayName || category} filter`}
                  >
                    ×
                  </button>
                </span>
              ))}

              {selectedUserId.map((userId) => (
                <span
                  key={`user-${userId}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700"
                >
                  <span>🧑</span>
                  {userOptions.find((u) => u.value === userId)?.label || "Selected User"}
                  <button
                    onClick={() => setSelectedUserId(selectedUserId.filter((u) => u !== userId))}
                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                    aria-label="Remove user filter"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
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
          subtitle={
            activityTimeSeries
              ? `${activityTimeSeries.totals.sessions.toLocaleString()} sessions, ${activityTimeSeries.totals.unique_users.toLocaleString()} unique users, ${activityTimeSeries.totals.actions.toLocaleString()} actions over ${days} days`
              : "Sessions, active users, and actions over time"
          }
        />
        {timeSeriesData && timeSeriesData.length > 0 ? (
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
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No activity data available for this period
          </div>
        )}
      </Card>

      {/* User Login Frequency */}
      <div className="mb-6">
        <LoginFrequencyCard />
      </div>

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

      {/* Platform Analytics */}
      <div className="mb-6">
        <SectionHeader
          title="Platform Analytics"
          subtitle={`Device and OS distribution from ${platformAnalytics?.total_sessions?.toLocaleString() || 0} sessions by ${platformAnalytics?.total_unique_users?.toLocaleString() || 0} users`}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Device Type Distribution (Android vs iOS) */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Distribution</h3>
            {platformAnalytics?.device_types && platformAnalytics.device_types.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformAnalytics.device_types.map((dt) => ({
                        name:
                          dt.device_type === "android"
                            ? "Android"
                            : dt.device_type === "ios"
                              ? "iOS"
                              : dt.device_type,
                        value: dt.session_count,
                        users: dt.unique_users,
                        percentage: dt.percentage,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={2}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                    >
                      {platformAnalytics.device_types.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.device_type === "android"
                              ? "#3DDC84"
                              : entry.device_type === "ios"
                                ? "#007AFF"
                                : "#9E9E9E"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No platform data available
              </div>
            )}
            {/* Platform stats */}
            {platformAnalytics?.device_types && platformAnalytics.device_types.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {platformAnalytics.device_types.map((dt) => (
                  <div key={dt.device_type} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p
                      className="text-2xl font-bold"
                      style={{ color: dt.device_type === "android" ? "#3DDC84" : "#007AFF" }}
                    >
                      {dt.percentage}%
                    </p>
                    <p className="text-sm text-gray-600">
                      {dt.device_type === "android" ? "Android" : "iOS"}
                    </p>
                    <p className="text-xs text-gray-400">{dt.unique_users} users</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* OS Version Distribution */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">OS Version Distribution</h3>
            {platformAnalytics?.os_versions && platformAnalytics.os_versions.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={platformAnalytics.os_versions.slice(0, 10).map((os) => ({
                      name: os.display_name,
                      sessions: os.session_count,
                      users: os.unique_users,
                      percentage: os.percentage,
                    }))}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={95} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="sessions" name="Sessions" fill="#EA6A00" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-500">
                No OS version data available
              </div>
            )}
          </Card>

          {/* App Version Adoption */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">App Version Adoption</h3>
            {platformAnalytics?.app_versions && platformAnalytics.app_versions.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={platformAnalytics.app_versions.map((av) => ({
                      name: av.display_version,
                      sessions: av.session_count,
                      users: av.unique_users,
                      percentage: av.percentage,
                      isLatest: av.is_latest,
                    }))}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={75} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="sessions" name="Sessions" radius={[0, 4, 4, 0]}>
                      {platformAnalytics.app_versions.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.is_latest ? "#124D37" : "#78373B"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-500">
                No app version data available
              </div>
            )}
            {/* Latest version indicator */}
            {platformAnalytics?.app_versions && platformAnalytics.app_versions.length > 0 && (
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#124D37]"></span>
                  <span className="text-gray-600">Latest Version</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#78373B]"></span>
                  <span className="text-gray-600">Older Versions</span>
                </div>
              </div>
            )}
          </Card>

          {/* Popular Device Models */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Device Models</h3>
            {platformAnalytics?.device_models && platformAnalytics.device_models.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={platformAnalytics.device_models.slice(0, 10).map((dm) => ({
                      name: dm.device_model,
                      sessions: dm.session_count,
                      users: dm.unique_users,
                      percentage: dm.percentage,
                      platform: dm.device_type,
                    }))}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={95} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="sessions" name="Sessions" radius={[0, 4, 4, 0]}>
                      {platformAnalytics.device_models.slice(0, 10).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.device_type === "android"
                              ? "#3DDC84"
                              : entry.device_type === "ios"
                                ? "#007AFF"
                                : "#3E57AB"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-500">
                No device model data available
              </div>
            )}
          </Card>
        </div>
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
    </div>
  );
}
