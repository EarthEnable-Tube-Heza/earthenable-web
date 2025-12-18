"use client";

/**
 * User Activity Page
 *
 * Full activity timeline with:
 * - Visual charts for behavior analysis
 * - Comprehensive behavior summary stats
 * - Category and screen usage breakdown
 * - Top actions analysis
 * - Infinite scroll pagination
 * - Category filter tabs
 * - Date range selection
 * - Export to CSV
 */

import { useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
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
import { apiClient } from "@/src/lib/api";
import { Card, Button, Badge, Spinner, LabeledSelect } from "@/src/components/ui";
import { ActivityTimelineItem } from "@/src/types/monitoring";

// Screen metadata for display names
const SCREEN_METADATA: Record<string, string> = {
  ti: "Task List",
  td: "Task Detail",
  mv: "Map View",
  sv: "Stats View",
  dr: "Drawer",
  pr: "Profile",
  st: "Settings",
  au: "Login",
};

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

// All category options for filter
const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "auth", label: "Authentication" },
  { value: "task", label: "Tasks" },
  { value: "form", label: "Forms" },
  { value: "call", label: "Calls" },
  { value: "nav", label: "Navigation" },
  { value: "map", label: "Map" },
  { value: "flt", label: "Filters" },
  { value: "sync", label: "Sync" },
  { value: "cfg", label: "Settings" },
];

// Date range options
const DATE_RANGE_OPTIONS = [
  { value: 7, label: "Last 7 days" },
  { value: 14, label: "Last 14 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
  { value: 0, label: "All time" },
];

/**
 * Format date/time for display
 */
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format relative time
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDateTime(dateString);
}

/**
 * Parse event name to extract parts
 */
function parseEventName(eventName: string): { category: string; screen: string; action: string } {
  const parts = eventName.split(":");
  return {
    category: parts[0] || "",
    screen: parts[1] || "",
    action: parts[2] || eventName,
  };
}

/**
 * Get category display info
 */
function getCategoryInfo(category: string | null) {
  if (!category) return { displayName: "Other", icon: "❓", color: "#9E9E9E" };
  return CATEGORY_METADATA[category] || { displayName: category, icon: "❓", color: "#9E9E9E" };
}

/**
 * Get screen display name
 */
function getScreenDisplayName(screen: string): string {
  return SCREEN_METADATA[screen] || screen;
}

/**
 * Activity row component
 */
function ActivityRow({ activity }: { activity: ActivityTimelineItem }) {
  const parsed = parseEventName(activity.event_name);
  const categoryInfo = getCategoryInfo(activity.category || parsed.category);
  const [showMetadata, setShowMetadata] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div
        className="flex items-center gap-4 py-3 px-4 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setShowMetadata(!showMetadata)}
      >
        {/* Category Icon */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${categoryInfo.color}20` }}
        >
          <span className="text-lg">{categoryInfo.icon}</span>
        </div>

        {/* Event Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 text-sm truncate">{parsed.action}</span>
            {activity.screen && (
              <Badge variant="default" size="sm">
                {getScreenDisplayName(activity.screen)}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 font-mono truncate">{activity.event_name}</p>
        </div>

        {/* Timestamp */}
        <div className="text-right flex-shrink-0">
          <p className="text-sm text-gray-600">{formatRelativeTime(activity.occurred_at)}</p>
          <p className="text-xs text-gray-400">{formatDateTime(activity.occurred_at)}</p>
        </div>

        {/* Expand indicator */}
        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${showMetadata ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      {/* Metadata panel */}
      {showMetadata && activity.metadata && Object.keys(activity.metadata).length > 0 && (
        <div className="px-4 pb-3 ml-14">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-2">Event Metadata</p>
            <pre className="text-xs text-gray-700 overflow-x-auto">
              {JSON.stringify(activity.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Stats Card Component
 */
function StatCard({
  label,
  value,
  subValue,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: string;
  color?: string;
}) {
  return (
    <div className="bg-background-secondary rounded-lg p-4 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-text-tertiary font-medium uppercase tracking-wide mb-1">
            {label}
          </p>
          <p
            className="text-xl font-bold truncate"
            style={{ color: color || "#1a1a1a" }}
            title={typeof value === "string" ? value : undefined}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {subValue && (
            <p className="text-xs text-text-secondary mt-1 truncate" title={subValue}>
              {subValue}
            </p>
          )}
        </div>
        {icon && <span className="text-2xl opacity-60 flex-shrink-0">{icon}</span>}
      </div>
    </div>
  );
}

/**
 * Custom Pie Chart Label
 */
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) => {
  if (percent < 0.05) return null; // Don't show label for small slices
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

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
function TopActionRow({ action, count, rank }: { action: string; count: number; rank: number }) {
  const rankColors = ["#EA6A00", "#78373B", "#3E57AB", "#124D37", "#D5A34C"];

  return (
    <div className="flex items-center gap-3 py-2 px-3 hover:bg-gray-50 rounded transition-colors">
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
        style={{ backgroundColor: rankColors[rank - 1] || "#9E9E9E" }}
      >
        {rank}
      </span>
      <span className="flex-1 text-sm text-gray-700 font-mono truncate">{action}</span>
      <span className="text-sm font-medium text-gray-900">{count.toLocaleString()}</span>
    </div>
  );
}

/**
 * User Activity Page Component
 */
export default function UserActivityPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  // Filter state
  const [category, setCategory] = useState("");
  const [days, setDays] = useState(30);
  const [showAllActions, setShowAllActions] = useState(false);

  // Fetch user info
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => apiClient.getUserById(userId),
    enabled: !!userId,
  });

  // Fetch ALL activity for stats (use page_size: 100 to stay within backend limits)
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["user-activity-stats", userId, days],
    queryFn: () => apiClient.getUserActivityTimeline(userId, 1, 100, undefined, days || undefined),
    enabled: !!userId,
  });

  // Fetch activity with infinite scroll (respects filters)
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["user-activity", userId, category, days],
      queryFn: async ({ pageParam = 1 }) => {
        return apiClient.getUserActivityTimeline(
          userId,
          pageParam,
          50,
          category || undefined,
          days || undefined
        );
      },
      getNextPageParam: (lastPage) => {
        if (lastPage.page < lastPage.total_pages) {
          return lastPage.page + 1;
        }
        return undefined;
      },
      initialPageParam: 1,
      enabled: !!userId,
    });

  // Flatten pages into single array (memoized to prevent useCallback deps from changing every render)
  const activities = useMemo(() => data?.pages.flatMap((page) => page.items) || [], [data?.pages]);
  const totalCount = data?.pages[0]?.total || 0;

  // Compute behavioral stats and chart data from statsData
  const behaviorStats = useMemo(() => {
    if (!statsData?.items || statsData.items.length === 0) {
      return null;
    }

    const items = statsData.items;
    const categoryStats: Record<string, number> = {};
    const screenStats: Record<string, number> = {};
    const actionStats: Record<string, number> = {};
    const dailyStats: Record<
      string,
      { total: number; logins: number; tasks: number; forms: number }
    > = {};

    items.forEach((item) => {
      const parsed = parseEventName(item.event_name);
      const cat = item.category || parsed.category || "other";
      const screen = item.screen || parsed.screen || "unknown";
      const action = parsed.action || item.event_name;

      // Category counts
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;

      // Screen counts
      if (screen && screen !== "unknown") {
        screenStats[screen] = (screenStats[screen] || 0) + 1;
      }

      // Action counts
      actionStats[action] = (actionStats[action] || 0) + 1;

      // Daily counts with breakdown
      const date = new Date(item.occurred_at).toISOString().split("T")[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { total: 0, logins: 0, tasks: 0, forms: 0 };
      }
      dailyStats[date].total += 1;
      if (cat === "auth") dailyStats[date].logins += 1;
      if (cat === "task") dailyStats[date].tasks += 1;
      if (cat === "form") dailyStats[date].forms += 1;
    });

    // Sort by count
    const sortedCategories = Object.entries(categoryStats).sort(([, a], [, b]) => b - a);
    const sortedScreens = Object.entries(screenStats).sort(([, a], [, b]) => b - a);
    const sortedActions = Object.entries(actionStats).sort(([, a], [, b]) => b - a);

    // Prepare chart data for categories (pie chart)
    const pieChartData = sortedCategories.map(([cat, count]) => ({
      name: getCategoryInfo(cat).displayName,
      value: count,
      color: getCategoryInfo(cat).color,
    }));

    // Prepare chart data for screens (bar chart)
    const screenChartData = sortedScreens.slice(0, 8).map(([screen, count]) => ({
      name: getScreenDisplayName(screen),
      count,
      fill: "#EA6A00",
    }));

    // Prepare time series data (sorted by date)
    const sortedDates = Object.keys(dailyStats).sort();
    const timeSeriesData = sortedDates.map((date) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: date,
      total: dailyStats[date].total,
      logins: dailyStats[date].logins,
      tasks: dailyStats[date].tasks,
      forms: dailyStats[date].forms,
    }));

    // Calculate averages
    const uniqueDays = Object.keys(dailyStats).length;
    const avgEventsPerDay = uniqueDays > 0 ? Math.round(items.length / uniqueDays) : 0;

    // Most active day
    const mostActiveDay = Object.entries(dailyStats).sort(([, a], [, b]) => b.total - a.total)[0];

    // Login count
    const loginCount = categoryStats["auth"] || 0;

    return {
      totalEvents: statsData.total,
      categoryCounts: sortedCategories,
      screenCounts: sortedScreens,
      actionCounts: sortedActions,
      topCategory: sortedCategories[0],
      topScreen: sortedScreens[0],
      topAction: sortedActions[0],
      avgEventsPerDay,
      mostActiveDay: mostActiveDay
        ? { date: mostActiveDay[0], count: mostActiveDay[1].total }
        : null,
      uniqueCategories: sortedCategories.length,
      uniqueScreens: sortedScreens.length,
      loginCount,
      pieChartData,
      screenChartData,
      timeSeriesData,
    };
  }, [statsData]);

  /**
   * Export to CSV
   */
  const handleExport = useCallback(() => {
    if (!activities.length) return;

    const headers = ["Event Name", "Category", "Screen", "Occurred At", "Metadata"];
    const rows = activities.map((a) => [
      a.event_name,
      a.category || "",
      a.screen || "",
      a.occurred_at,
      a.metadata ? JSON.stringify(a.metadata) : "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `user-activity-${userId}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [activities, userId]);

  // Loading state
  if (isLoading || userLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card padding="lg" className="text-center">
          <p className="text-red-600 font-medium">Failed to load activity</p>
          <p className="text-sm text-gray-500 mt-1">Please try refreshing the page</p>
          <Button variant="primary" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 text-sm text-text-secondary" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/dashboard" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
          </li>
          <li className="text-text-tertiary">/</li>
          <li>
            <Link href="/dashboard/users" className="hover:text-primary transition-colors">
              Users
            </Link>
          </li>
          <li className="text-text-tertiary">/</li>
          <li>
            <Link
              href={`/dashboard/users/${userId}`}
              className="hover:text-primary transition-colors"
            >
              {user?.name || user?.email || "User"}
            </Link>
          </li>
          <li className="text-text-tertiary">/</li>
          <li className="text-text-primary font-medium">Activity</li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">User Activity</h1>
          <p className="text-text-secondary">
            Behavioral insights and activity timeline for {user?.name || user?.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!activities.length}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/users/${userId}`)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </Button>
        </div>
      </div>

      {/* Behavior Summary Section with Charts */}
      {statsLoading ? (
        <Card padding="lg" className="mb-6">
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
            <span className="ml-3 text-gray-500">Loading analytics...</span>
          </div>
        </Card>
      ) : !behaviorStats ? (
        <Card padding="lg" className="mb-6">
          <div className="text-center py-8">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="font-medium text-gray-700">No Activity Data Available</p>
            <p className="text-sm text-gray-500 mt-1">
              Charts will appear once this user has activity in the mobile app
            </p>
          </div>
        </Card>
      ) : (
        <div className="mb-6 space-y-6">
          {/* Key Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              label="Total Events"
              value={behaviorStats.totalEvents}
              subValue={`${days ? `Last ${days} days` : "All time"}`}
              icon="📊"
              color="#EA6A00"
            />
            <StatCard
              label="Logins"
              value={behaviorStats.loginCount}
              subValue="Authentication events"
              icon="🔐"
              color="#3E57AB"
            />
            <StatCard
              label="Avg. Events/Day"
              value={behaviorStats.avgEventsPerDay}
              subValue="Daily engagement"
              icon="📈"
              color="#124D37"
            />
            <StatCard
              label="Most Used"
              value={
                behaviorStats.topCategory
                  ? getCategoryInfo(behaviorStats.topCategory[0]).displayName
                  : "N/A"
              }
              subValue={
                behaviorStats.topCategory
                  ? `${behaviorStats.topCategory[1].toLocaleString()} events`
                  : ""
              }
              icon={
                behaviorStats.topCategory
                  ? getCategoryInfo(behaviorStats.topCategory[0]).icon
                  : "❓"
              }
              color={
                behaviorStats.topCategory
                  ? getCategoryInfo(behaviorStats.topCategory[0]).color
                  : "#9E9E9E"
              }
            />
            <StatCard
              label="Primary Screen"
              value={
                behaviorStats.topScreen ? getScreenDisplayName(behaviorStats.topScreen[0]) : "N/A"
              }
              subValue={
                behaviorStats.topScreen
                  ? `${behaviorStats.topScreen[1].toLocaleString()} visits`
                  : ""
              }
              icon="📱"
              color="#78373B"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feature Usage Pie Chart */}
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Feature Usage Distribution
              </h3>
              {behaviorStats.pieChartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={behaviorStats.pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        innerRadius={40}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {behaviorStats.pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ fontSize: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </Card>

            {/* Screen Usage Bar Chart */}
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Screen Usage</h3>
              {behaviorStats.screenChartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={behaviorStats.screenChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Visits" fill="#EA6A00" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No screen data available
                </div>
              )}
            </Card>

            {/* Activity Over Time */}
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Over Time</h3>
              {behaviorStats.timeSeriesData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={behaviorStats.timeSeriesData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EA6A00" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#EA6A00" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3E57AB" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3E57AB" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        name="Total Events"
                        stroke="#EA6A00"
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                      />
                      <Area
                        type="monotone"
                        dataKey="logins"
                        name="Logins"
                        stroke="#3E57AB"
                        fillOpacity={1}
                        fill="url(#colorLogins)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No time series data available
                </div>
              )}
            </Card>
          </div>

          {/* Top Actions and Behavioral Insight */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Actions */}
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Top Actions</h3>
                <Badge variant="warning" size="sm">
                  {behaviorStats.actionCounts.length} unique
                </Badge>
              </div>
              <div className="space-y-1">
                {(showAllActions
                  ? behaviorStats.actionCounts.slice(0, 15)
                  : behaviorStats.actionCounts.slice(0, 5)
                ).map(([action, count], index) => (
                  <TopActionRow key={action} action={action} count={count} rank={index + 1} />
                ))}
              </div>
              {behaviorStats.actionCounts.length > 5 && (
                <button
                  onClick={() => setShowAllActions(!showAllActions)}
                  className="mt-3 text-sm text-primary hover:text-primary/80 font-medium"
                >
                  {showAllActions ? "Show less" : `Show top 15 actions`}
                </button>
              )}
            </Card>

            {/* Behavioral Insight */}
            <Card padding="lg" className="bg-primary/5 border-l-4 border-primary">
              <div className="flex items-start gap-3">
                <span className="text-3xl">💡</span>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-lg">Behavioral Insight</h4>
                  {behaviorStats.topCategory ? (
                    <div className="space-y-3 text-sm text-gray-700">
                      <p>
                        <strong>Primary Focus:</strong> This user primarily uses{" "}
                        <span className="text-primary font-semibold">
                          {getCategoryInfo(behaviorStats.topCategory[0]).displayName}
                        </span>{" "}
                        features, accounting for{" "}
                        <strong>
                          {(
                            (behaviorStats.topCategory[1] / behaviorStats.totalEvents) *
                            100
                          ).toFixed(1)}
                          %
                        </strong>{" "}
                        of all activity.
                      </p>
                      <p>
                        <strong>Screen Preference:</strong>{" "}
                        {behaviorStats.topScreen ? (
                          <>
                            The{" "}
                            <span className="font-semibold">
                              {getScreenDisplayName(behaviorStats.topScreen[0])}
                            </span>{" "}
                            is their most visited screen with{" "}
                            <strong>{behaviorStats.topScreen[1].toLocaleString()}</strong> visits.
                          </>
                        ) : (
                          "No specific screen preference detected."
                        )}
                      </p>
                      <p>
                        <strong>Engagement Level:</strong> Average of{" "}
                        <span className="text-primary font-semibold">
                          {behaviorStats.avgEventsPerDay} events/day
                        </span>
                        {behaviorStats.avgEventsPerDay > 50
                          ? " - highly active user"
                          : behaviorStats.avgEventsPerDay > 20
                            ? " - moderately active user"
                            : " - low activity user"}
                        .
                      </p>
                      {behaviorStats.mostActiveDay && (
                        <p>
                          <strong>Peak Activity:</strong> Most active on{" "}
                          <span className="font-semibold">
                            {new Date(behaviorStats.mostActiveDay.date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>{" "}
                          with <strong>{behaviorStats.mostActiveDay.count}</strong> events.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">Not enough data to generate insights.</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card padding="md" className="mb-6">
        <div className="flex flex-wrap items-end gap-4">
          {/* Category Filter */}
          <div className="w-44">
            <LabeledSelect
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={CATEGORY_OPTIONS}
              size="sm"
              fullWidth
            />
          </div>

          {/* Date Range Filter */}
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

          {/* Clear Filters */}
          {(category || days !== 30) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCategory("");
                setDays(30);
              }}
            >
              Clear Filters
            </Button>
          )}

          {/* Results count */}
          <div className="ml-auto text-sm text-gray-500">
            {totalCount.toLocaleString()} events
            {category && ` in ${getCategoryInfo(category).displayName}`}
          </div>
        </div>
      </Card>

      {/* Activity Timeline */}
      <Card padding="none">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Activity Timeline</h3>
        </div>
        {activities.length > 0 ? (
          <>
            <div className="divide-y divide-gray-100">
              {activities.map((activity, index) => (
                <ActivityRow key={`${activity.id}-${index}`} activity={activity} />
              ))}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="p-4 text-center border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  loading={isFetchingNextPage}
                >
                  {isFetchingNextPage ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}

            {/* End of results indicator */}
            {!hasNextPage && activities.length > 0 && (
              <div className="p-4 text-center text-sm text-gray-500 border-t border-gray-100">
                Showing all {totalCount.toLocaleString()} events
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="font-medium">No activity found</p>
            <p className="text-sm mt-1">
              {category || days !== 30
                ? "Try adjusting your filters"
                : "Activity will appear as the user interacts with the app"}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
