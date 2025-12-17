"use client";

/**
 * SystemResourcesCard Component
 *
 * Displays system resource utilization with gauges for CPU, memory, and disk.
 */

import { Card, Spinner } from "@/src/components/ui";
import { useSystemResources } from "@/src/hooks/useMonitoring";

interface GaugeProps {
  value: number;
  label: string;
  subLabel?: string;
  color?: string;
}

function Gauge({ value, label, subLabel, color = "blue" }: GaugeProps) {
  const circumference = 2 * Math.PI * 40;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (value >= 90) return "stroke-red-500";
    if (value >= 75) return "stroke-yellow-500";
    return `stroke-${color}-500`;
  };

  const getTextColor = () => {
    if (value >= 90) return "text-red-600";
    if (value >= 75) return "text-yellow-600";
    return `text-${color}-600`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-24">
        <svg className="transform -rotate-90 h-24 w-24" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle cx="50" cy="50" r="40" className="stroke-gray-200" fill="none" strokeWidth="8" />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            className={getColor()}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            style={{
              strokeDasharray,
              strokeDashoffset,
              transition: "stroke-dashoffset 0.5s ease-in-out",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${getTextColor()}`}>{value.toFixed(0)}%</span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-700 mt-2">{label}</p>
      {subLabel && <p className="text-xs text-gray-500">{subLabel}</p>}
    </div>
  );
}

export function SystemResourcesCard() {
  const { data, isLoading, error, dataUpdatedAt } = useSystemResources();

  const formatBytes = (mb: number): string => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

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
          <p className="font-medium">Failed to load system resources</p>
          <p className="text-sm mt-1">Please try refreshing the page</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Resources</h3>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <Gauge value={data.cpu_percent} label="CPU" color="blue" />
        <Gauge
          value={data.memory_percent}
          label="Memory"
          subLabel={`${formatBytes(data.memory_used_mb)} / ${formatBytes(data.memory_total_mb)}`}
          color="green"
        />
        <Gauge
          value={data.disk_percent}
          label="Disk"
          subLabel={`${data.disk_used_gb.toFixed(1)} / ${data.disk_total_gb.toFixed(0)} GB`}
          color="purple"
        />
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Load Average</h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded p-2">
            <p className="text-lg font-semibold text-gray-900">{data.load_average[0].toFixed(2)}</p>
            <p className="text-xs text-gray-500">1 min</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-lg font-semibold text-gray-900">{data.load_average[1].toFixed(2)}</p>
            <p className="text-xs text-gray-500">5 min</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-lg font-semibold text-gray-900">{data.load_average[2].toFixed(2)}</p>
            <p className="text-xs text-gray-500">15 min</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t text-xs text-gray-400 text-right">
        Last updated: {formatLastUpdated(dataUpdatedAt)}
      </div>
    </Card>
  );
}
