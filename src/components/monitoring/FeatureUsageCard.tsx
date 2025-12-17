"use client";

/**
 * FeatureUsageCard Component
 *
 * Displays feature usage statistics with a bar chart visualization.
 */

import { Card, Spinner } from "@/src/components/ui";
import { useFeatureUsage } from "@/src/hooks/useMonitoring";

interface FeatureUsageCardProps {
  days?: number;
}

export function FeatureUsageCard({ days = 7 }: FeatureUsageCardProps) {
  const { data, isLoading, error, dataUpdatedAt } = useFeatureUsage(days);

  const formatLastUpdated = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-48">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p className="font-medium">Failed to load feature usage</p>
          <p className="text-sm mt-1">Please try refreshing the page</p>
        </div>
      </Card>
    );
  }

  const maxUsage =
    data.top_features.length > 0 ? Math.max(...data.top_features.map((f) => f.usage_count)) : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Feature Usage</h3>
        <span className="text-sm text-gray-500">Last {data.period_days} days</span>
      </div>

      <div className="mb-4 text-center bg-gray-50 rounded-lg p-4">
        <p className="text-3xl font-bold text-gray-900">{data.total_activities.toLocaleString()}</p>
        <p className="text-sm text-gray-500">Total Activities</p>
      </div>

      {data.top_features.length > 0 ? (
        <div className="space-y-3">
          {data.top_features.map((feature, index) => (
            <div key={feature.feature_name}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">{feature.feature_name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">{feature.usage_count}</span>
                  <span className="text-xs text-gray-400">
                    ({feature.unique_users} {feature.unique_users === 1 ? "user" : "users"})
                  </span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    index === 0
                      ? "bg-blue-500"
                      : index === 1
                        ? "bg-blue-400"
                        : index === 2
                          ? "bg-blue-300"
                          : "bg-blue-200"
                  }`}
                  style={{ width: `${(feature.usage_count / maxUsage) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No feature usage data available</p>
          <p className="text-sm mt-1">Activity will be tracked as users interact with features</p>
        </div>
      )}

      <div className="mt-4 pt-2 border-t text-xs text-gray-400 text-right">
        Last updated: {formatLastUpdated(dataUpdatedAt)}
      </div>
    </Card>
  );
}
