"use client";

/**
 * EndpointUsageCard Component
 *
 * Displays API endpoint usage statistics with method badges, request counts,
 * response times, and error rates.
 */

import { Card, Spinner } from "@/src/components/ui";
import { useEndpointUsage } from "@/src/hooks/useMonitoring";

interface EndpointUsageCardProps {
  days?: number;
}

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-yellow-100 text-yellow-700",
  PATCH: "bg-orange-100 text-orange-700",
  DELETE: "bg-red-100 text-red-700",
};

export function EndpointUsageCard({ days = 7 }: EndpointUsageCardProps) {
  const { data, isLoading, error, dataUpdatedAt } = useEndpointUsage(days);

  const formatLastUpdated = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatEndpointName = (endpoint: string, name: string | null): string => {
    if (name) {
      return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
    // Extract meaningful part from endpoint path
    const parts = endpoint.replace("/api/v1/", "").split("/");
    return parts[0] || endpoint;
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
          <p className="font-medium">Failed to load endpoint usage</p>
          <p className="text-sm mt-1">Please try refreshing the page</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">API Endpoint Usage</h3>
        <span className="text-sm text-gray-500">Last {data.period_days} days</span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center bg-gray-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-gray-900">{data.total_requests.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total Requests</p>
        </div>
        <div className="text-center bg-gray-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-red-600">{data.total_errors.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total Errors</p>
        </div>
        <div className="text-center bg-gray-50 rounded-lg p-3">
          <p
            className={`text-2xl font-bold ${data.overall_error_rate > 5 ? "text-red-600" : "text-green-600"}`}
          >
            {data.overall_error_rate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">Error Rate</p>
        </div>
      </div>

      {/* Endpoint List */}
      {data.endpoints.length > 0 ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 border-b pb-2 px-1 sticky top-0 bg-white">
            <div className="col-span-5">Endpoint</div>
            <div className="col-span-2 text-right">Requests</div>
            <div className="col-span-2 text-right">Avg Time</div>
            <div className="col-span-2 text-right">Errors</div>
            <div className="col-span-1 text-right">Users</div>
          </div>
          {data.endpoints.map((ep) => (
            <div
              key={`${ep.method}-${ep.endpoint}`}
              className="grid grid-cols-12 gap-2 text-sm items-center py-2 px-1 hover:bg-gray-50 rounded"
            >
              <div className="col-span-5 flex items-center gap-2 min-w-0">
                <span
                  className={`px-1.5 py-0.5 text-xs font-medium rounded ${METHOD_COLORS[ep.method] || "bg-gray-100 text-gray-700"}`}
                >
                  {ep.method}
                </span>
                <span className="truncate text-gray-700" title={ep.endpoint}>
                  {formatEndpointName(ep.endpoint, ep.endpoint_name)}
                </span>
              </div>
              <div className="col-span-2 text-right font-medium">
                {ep.request_count.toLocaleString()}
              </div>
              <div className="col-span-2 text-right text-gray-600">
                {ep.avg_response_time_ms < 1000
                  ? `${ep.avg_response_time_ms.toFixed(0)}ms`
                  : `${(ep.avg_response_time_ms / 1000).toFixed(2)}s`}
              </div>
              <div className="col-span-2 text-right">
                {ep.error_count > 0 ? (
                  <span className="text-red-600">
                    {ep.error_count} ({ep.error_rate.toFixed(1)}%)
                  </span>
                ) : (
                  <span className="text-green-600">0</span>
                )}
              </div>
              <div className="col-span-1 text-right text-gray-500">{ep.unique_users}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No endpoint usage data available</p>
          <p className="text-sm mt-1">Activity will be tracked as users make API requests</p>
        </div>
      )}

      <div className="mt-4 pt-2 border-t text-xs text-gray-400 text-right">
        Last updated: {formatLastUpdated(dataUpdatedAt)}
      </div>
    </Card>
  );
}
