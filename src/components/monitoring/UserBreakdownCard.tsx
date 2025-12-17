"use client";

/**
 * UserBreakdownCard Component
 *
 * Displays user breakdown by role and designation.
 */

import { Card, Spinner } from "@/src/components/ui";
import { useUserActivityStats } from "@/src/hooks/useMonitoring";

const roleColors: Record<string, string> = {
  admin: "bg-purple-500",
  manager: "bg-blue-500",
  qa_agent: "bg-green-500",
  user: "bg-gray-500",
  pending_assignment: "bg-yellow-500",
  senior_automation_engineer: "bg-indigo-500",
};

export function UserBreakdownCard() {
  const { data, isLoading, error } = useUserActivityStats();

  const formatRoleName = (role: string): string => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getRoleColor = (role: string): string => {
    return roleColors[role.toLowerCase()] || "bg-gray-400";
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
          <p className="font-medium">Failed to load user breakdown</p>
          <p className="text-sm mt-1">Please try refreshing the page</p>
        </div>
      </Card>
    );
  }

  const roleEntries = Object.entries(data.users_by_role).sort(([, a], [, b]) => b - a);
  const totalUsers = roleEntries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>

      <div className="mb-4">
        <div className="flex h-3 rounded-full overflow-hidden">
          {roleEntries.map(([role, count]) => (
            <div
              key={role}
              className={`${getRoleColor(role)}`}
              style={{ width: `${(count / totalUsers) * 100}%` }}
              title={`${formatRoleName(role)}: ${count}`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1 text-center">Total: {totalUsers} users</p>
      </div>

      <div className="space-y-3">
        {roleEntries.map(([role, count]) => (
          <div key={role} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${getRoleColor(role)}`} />
              <span className="text-sm">{formatRoleName(role)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{count}</span>
              <span className="text-xs text-gray-400">
                ({((count / totalUsers) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(data.users_by_designation).length > 0 &&
        JSON.stringify(data.users_by_designation) !== JSON.stringify(data.users_by_role) && (
          <div className="border-t mt-4 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">By Designation</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {Object.entries(data.users_by_designation)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([designation, count]) => (
                  <div key={designation} className="flex items-center justify-between text-sm">
                    <span className="truncate">{formatRoleName(designation)}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
    </Card>
  );
}
