"use client";

/**
 * UserActivityTab Component
 *
 * Displays a summary of user activity including:
 * - Activity summary stats
 * - Category breakdown
 * - Recent activity list (last 10)
 * - Link to full activity page
 */

import Link from "next/link";
import { Card, Spinner } from "@/src/components/ui";
import { useUserActivityTimeline } from "@/src/hooks/useMonitoring";
import { ActivityTimelineItem } from "@/src/types/monitoring";

interface UserActivityTabProps {
  userId: string;
  userName?: string;
}

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

/**
 * Format a relative time string
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

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Parse event name to extract category
 */
function parseEventCategory(eventName: string): string | null {
  // Event format: category:screen:action
  const parts = eventName.split(":");
  if (parts.length >= 1) {
    return parts[0];
  }
  return null;
}

/**
 * Get display info for a category
 */
function getCategoryInfo(category: string | null) {
  if (!category) return { displayName: "Other", icon: "❓", color: "#9E9E9E" };
  return CATEGORY_METADATA[category] || { displayName: category, icon: "❓", color: "#9E9E9E" };
}

/**
 * Activity item row
 */
function ActivityItem({ activity }: { activity: ActivityTimelineItem }) {
  const category = activity.category || parseEventCategory(activity.event_name);
  const categoryInfo = getCategoryInfo(category);

  return (
    <div className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded transition-colors">
      <span className="text-lg flex-shrink-0">{categoryInfo.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{activity.event_name}</p>
        <p className="text-xs text-gray-500">
          {activity.screen && <span className="mr-2">{activity.screen}</span>}
          {activity.feature_name && <span>{activity.feature_name}</span>}
        </p>
      </div>
      <span className="text-xs text-gray-400 flex-shrink-0">
        {formatRelativeTime(activity.occurred_at)}
      </span>
    </div>
  );
}

/**
 * Category stat card
 */
function CategoryStat({
  category,
  count,
  total,
}: {
  category: string;
  count: number;
  total: number;
}) {
  const info = getCategoryInfo(category);
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
      <span className="text-lg">{info.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700 truncate">{info.displayName}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${percentage}%`, backgroundColor: info.color }}
            />
          </div>
          <span className="text-xs text-gray-500">{count}</span>
        </div>
      </div>
    </div>
  );
}

export function UserActivityTab({ userId }: UserActivityTabProps) {
  const { data, isLoading, error } = useUserActivityTimeline(userId, 1, 10);

  // Calculate category stats from recent activities
  const categoryStats = data?.items.reduce(
    (acc, item) => {
      const category = item.category || parseEventCategory(item.event_name) || "other";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalActivities = data?.total || 0;
  const recentCount = data?.items.length || 0;

  if (isLoading) {
    return (
      <Card padding="lg">
        <div className="flex items-center justify-center h-48">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg">
        <div className="text-center text-red-600 py-8">
          <p className="font-medium">Failed to load activity</p>
          <p className="text-sm mt-1">Please try refreshing the page</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" divided>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 -mt-2">
        <h3 className="text-lg font-heading font-semibold text-text-primary">App Activity</h3>
        <Link
          href={`/dashboard/users/${userId}/activity`}
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          View All Activity →
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-background-secondary rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">{totalActivities}</div>
          <div className="text-xs text-text-secondary font-medium uppercase tracking-wide">
            Total Events
          </div>
        </div>
        <div className="bg-background-secondary rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-secondary mb-1">
            {categoryStats ? Object.keys(categoryStats).length : 0}
          </div>
          <div className="text-xs text-text-secondary font-medium uppercase tracking-wide">
            Categories
          </div>
        </div>
        <div className="bg-background-secondary rounded-lg p-4 text-center col-span-2 sm:col-span-1">
          <div className="text-2xl font-bold text-accent mb-1">{data?.total_pages || 0}</div>
          <div className="text-xs text-text-secondary font-medium uppercase tracking-wide">
            Pages
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryStats && Object.keys(categoryStats).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Activity by Category</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(categoryStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([category, count]) => (
                <CategoryStat
                  key={category}
                  category={category}
                  count={count}
                  total={recentCount}
                />
              ))}
          </div>
        </div>
      )}

      {/* Recent Activity List */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h4>
        {data?.items && data.items.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {data.items.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No activity recorded yet</p>
            <p className="text-sm mt-1">Activity will appear as the user interacts with the app</p>
          </div>
        )}
      </div>

      {/* View All Link */}
      {data?.items && data.items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <Link
            href={`/dashboard/users/${userId}/activity`}
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View Full Activity Timeline
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      )}
    </Card>
  );
}
