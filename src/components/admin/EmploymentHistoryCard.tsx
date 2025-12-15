"use client";

/**
 * EmploymentHistoryCard Component
 *
 * Displays the employment history timeline for a user.
 */

import { useState, useEffect } from "react";
import { apiClient } from "@/src/lib/api/apiClient";
import { Card, Badge, Spinner } from "@/src/components/ui";
import { EmployeeDetail, formatRoleLabel } from "@/src/types";

interface EmploymentHistoryCardProps {
  userId: string;
}

export function EmploymentHistoryCard({ userId }: EmploymentHistoryCardProps) {
  const [history, setHistory] = useState<EmployeeDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getEmployeeHistory(userId);
        // Sort by start date descending (most recent first)
        data.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
        setHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load employment history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate duration between dates
  const calculateDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

    if (months < 1) {
      const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return `${days} day${days !== 1 ? "s" : ""}`;
    } else if (months < 12) {
      return `${months} month${months !== 1 ? "s" : ""}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? "s" : ""}`;
      }
      return `${years} year${years !== 1 ? "s" : ""}, ${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="p-6 text-center">
          <Spinner size="md" />
          <p className="text-sm text-text-secondary mt-2">Loading employment history...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-6 text-center text-status-error">
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center text-text-secondary">
          <p>No employment history found.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="px-6 py-4 border-b border-border-light">
        <h3 className="text-lg font-heading text-text-primary">Employment History</h3>
        <p className="text-sm text-text-secondary mt-1">
          {history.length} assignment{history.length !== 1 ? "s" : ""} on record
        </p>
      </div>

      <div className="divide-y divide-border-light">
        {history.map((record, index) => (
          <div key={record.id} className="relative">
            {/* Timeline connector */}
            {index < history.length - 1 && (
              <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-border-light" />
            )}

            <button
              onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
              className="w-full text-left p-4 hover:bg-background-light transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Timeline dot */}
                <div className="relative z-10">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      record.is_current
                        ? "bg-status-success border-status-success"
                        : "bg-white border-border-medium"
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-text-primary">{record.entity_name}</span>
                    <Badge variant={record.is_current ? "success" : "default"} size="sm">
                      {record.is_current ? "Current" : "Past"}
                    </Badge>
                  </div>

                  <div className="text-sm text-text-secondary mt-1">
                    {formatRoleLabel(record.role)}
                    {record.job_title && ` - ${record.job_title}`}
                  </div>

                  <div className="text-sm text-text-secondary mt-1">
                    {formatDate(record.start_date)}
                    {record.end_date ? ` - ${formatDate(record.end_date)}` : " - Present"}
                    <span className="text-text-disabled ml-2">
                      ({calculateDuration(record.start_date, record.end_date || undefined)})
                    </span>
                  </div>

                  {/* Department/Branch badge */}
                  {(record.department_name || record.branch_name) && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {record.department_name && (
                        <Badge variant="info" size="sm" outline>
                          {record.department_name}
                        </Badge>
                      )}
                      {record.branch_name && (
                        <Badge variant="default" size="sm" outline>
                          {record.branch_name}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Expand icon */}
                <div className="text-text-secondary">
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      expandedId === record.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </button>

            {/* Expanded details */}
            {expandedId === record.id && (
              <div className="px-4 pb-4 ml-8 pl-4 border-l-2 border-border-light">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">Entity Code:</span>
                    <span className="ml-2 text-text-primary">{record.entity_code}</span>
                  </div>

                  {record.employee_number && (
                    <div>
                      <span className="text-text-secondary">Employee #:</span>
                      <span className="ml-2 text-text-primary">{record.employee_number}</span>
                    </div>
                  )}

                  {record.level && (
                    <div>
                      <span className="text-text-secondary">Level:</span>
                      <span className="ml-2 text-text-primary capitalize">
                        {record.level.replace(/_/g, " ")}
                      </span>
                    </div>
                  )}

                  {record.job_role_name && (
                    <div>
                      <span className="text-text-secondary">Job Role:</span>
                      <span className="ml-2 text-text-primary">{record.job_role_name}</span>
                    </div>
                  )}

                  {record.sub_department_name && (
                    <div>
                      <span className="text-text-secondary">Sub-Department:</span>
                      <span className="ml-2 text-text-primary">{record.sub_department_name}</span>
                    </div>
                  )}

                  {record.branch_location && (
                    <div>
                      <span className="text-text-secondary">Branch Location:</span>
                      <span className="ml-2 text-text-primary">{record.branch_location}</span>
                    </div>
                  )}

                  {record.approver_name && (
                    <div className="col-span-2">
                      <span className="text-text-secondary">Approver:</span>
                      <span className="ml-2 text-text-primary">
                        {record.approver_name}
                        {record.approver_email && (
                          <span className="text-text-secondary ml-1">
                            ({record.approver_email})
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {record.supervisor_name && (
                    <div className="col-span-2">
                      <span className="text-text-secondary">Supervisor:</span>
                      <span className="ml-2 text-text-primary">
                        {record.supervisor_name}
                        {record.supervisor_email && (
                          <span className="text-text-secondary ml-1">
                            ({record.supervisor_email})
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {record.notes && (
                    <div className="col-span-2">
                      <span className="text-text-secondary">Notes:</span>
                      <p className="mt-1 text-text-primary bg-background-light p-2 rounded">
                        {record.notes}
                      </p>
                    </div>
                  )}

                  <div className="col-span-2 pt-2 border-t border-border-light text-text-disabled text-xs">
                    Created: {formatDate(record.created_at)} | Updated:{" "}
                    {formatDate(record.updated_at)}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
