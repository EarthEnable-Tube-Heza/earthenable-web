"use client";

/**
 * StatusIndicator Component
 *
 * A colored status dot indicator for health status visualization.
 */

import { ServiceStatusType } from "@/src/types";

interface StatusIndicatorProps {
  status: ServiceStatusType;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const statusColors: Record<ServiceStatusType, string> = {
  healthy: "bg-green-500",
  degraded: "bg-yellow-500",
  unhealthy: "bg-red-500",
};

const statusLabels: Record<ServiceStatusType, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  unhealthy: "Unhealthy",
};

const sizeClasses = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

export function StatusIndicator({
  status,
  size = "md",
  showLabel = false,
  className = "",
}: StatusIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className={`inline-block rounded-full ${statusColors[status]} ${sizeClasses[size]} animate-pulse`}
        role="status"
        aria-label={statusLabels[status]}
      />
      {showLabel && (
        <span className="text-sm font-medium text-gray-700">{statusLabels[status]}</span>
      )}
    </div>
  );
}
