"use client";

/**
 * HierarchicalFeatureUsageCard Component
 *
 * Displays feature usage statistics organized by Category > Screen > Action
 * with expandable sections and visual indicators.
 */

import { useState } from "react";
import { Card, Spinner } from "@/src/components/ui";
import { useHierarchicalFeatureUsage } from "@/src/hooks/useMonitoring";
import { CategoryUsage, ScreenUsage, ActionUsage } from "@/src/types/monitoring";

interface HierarchicalFeatureUsageCardProps {
  days?: number;
}

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, string> = {
  lock: "🔐",
  clipboard: "📋",
  document: "📄",
  phone: "📞",
  compass: "🧭",
  map: "🗺️",
  filter: "🔍",
  refresh: "🔄",
  settings: "⚙️",
  help: "❓",
};

function ActionRow({ action }: { action: ActionUsage }) {
  return (
    <div className="flex items-center justify-between py-1 px-3 text-sm text-gray-600 hover:bg-gray-50 rounded">
      <span className="font-mono text-xs">{action.action}</span>
      <div className="flex items-center gap-4 text-xs">
        <span>{action.usage_count.toLocaleString()} uses</span>
        <span className="text-gray-400">{action.unique_users} users</span>
      </div>
    </div>
  );
}

function ScreenSection({
  screen,
  isExpanded,
  onToggle,
}: {
  screen: ScreenUsage;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-l-2 border-gray-200 ml-4 pl-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-400">{isExpanded ? "▼" : "▶"}</span>
          <span className="font-medium text-gray-700">{screen.display_name}</span>
          <span className="text-xs text-gray-400 font-mono">({screen.screen})</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium">{screen.total_usage.toLocaleString()}</span>
          <span className="text-gray-400 text-xs">{screen.unique_users} users</span>
        </div>
      </button>
      {isExpanded && screen.actions.length > 0 && (
        <div className="ml-4 mb-2">
          {screen.actions.map((action) => (
            <ActionRow key={action.action} action={action} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategorySection({
  category,
  isExpanded,
  onToggle,
}: {
  category: CategoryUsage;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [expandedScreens, setExpandedScreens] = useState<Set<string>>(new Set());

  const toggleScreen = (screen: string) => {
    const newSet = new Set(expandedScreens);
    if (newSet.has(screen)) {
      newSet.delete(screen);
    } else {
      newSet.add(screen);
    }
    setExpandedScreens(newSet);
  };

  const icon = CATEGORY_ICONS[category.icon] || CATEGORY_ICONS.help;

  return (
    <div className="border rounded-lg mb-2 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-left"
        style={{ borderLeft: `4px solid ${category.color}` }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <div>
            <span className="font-semibold text-gray-900">{category.display_name}</span>
            <span className="text-xs text-gray-400 ml-2 font-mono">({category.category})</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-bold text-gray-900">{category.total_usage.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{category.unique_users} users</p>
          </div>
          <span className="text-gray-400">{isExpanded ? "▼" : "▶"}</span>
        </div>
      </button>
      {isExpanded && category.screens.length > 0 && (
        <div className="px-2 pb-2 bg-gray-50">
          {category.screens.map((screen) => (
            <ScreenSection
              key={screen.screen}
              screen={screen}
              isExpanded={expandedScreens.has(screen.screen)}
              onToggle={() => toggleScreen(screen.screen)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HierarchicalFeatureUsageCard({ days = 7 }: HierarchicalFeatureUsageCardProps) {
  const { data, isLoading, error, dataUpdatedAt } = useHierarchicalFeatureUsage(days);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setExpandedCategories(newSet);
  };

  const expandAll = () => {
    if (data) {
      setExpandedCategories(new Set(data.categories.map((c) => c.category)));
    }
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
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
          <p className="font-medium">Failed to load feature usage</p>
          <p className="text-sm mt-1">Please try refreshing the page</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Feature Usage by Category</h3>
          <p className="text-sm text-gray-500">
            {data.total_activities.toLocaleString()} activities in last {data.period_days} days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
          >
            Collapse All
          </button>
        </div>
      </div>

      {data.categories.length > 0 ? (
        <div className="max-h-[500px] overflow-y-auto">
          {data.categories.map((category) => (
            <CategorySection
              key={category.category}
              category={category}
              isExpanded={expandedCategories.has(category.category)}
              onToggle={() => toggleCategory(category.category)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No feature usage data available</p>
          <p className="text-sm mt-1">Activity will appear as users interact with the app</p>
        </div>
      )}

      <div className="mt-4 pt-2 border-t text-xs text-gray-400 text-right">
        Last updated: {formatLastUpdated(dataUpdatedAt)}
      </div>
    </Card>
  );
}
