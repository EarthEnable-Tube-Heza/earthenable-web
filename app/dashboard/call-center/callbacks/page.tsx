"use client";

/**
 * Callbacks Management Page
 *
 * Manage scheduled callbacks with filtering and actions.
 */

import { useState, useCallback } from "react";
import {
  useCallbacks,
  useCreateCallback,
  useUpdateCallback,
  useCancelCallback,
  useCallCenterEntity,
} from "@/src/hooks/useCallCenter";
import { CallCenterHeader } from "@/src/components/call-center";
import { CallbacksList } from "@/src/components/call-center/CallbacksList";
import { ScheduleCallbackModal } from "@/src/components/call-center/ScheduleCallbackModal";
import {
  CallCallback,
  CallbackStatus,
  CallbackPriority,
  CallbackCreate,
  CallbackUpdate,
} from "@/src/types/voice";
import { Card } from "@/src/components/ui";
import { MultiSelect } from "@/src/components/ui/MultiSelect";

const PAGE_SIZE = 20;

export default function CallbacksPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCallback, setEditingCallback] = useState<CallCallback | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);

  // Use persistent entity selection (shared with header)
  const { selectedEntityId } = useCallCenterEntity();

  // Build filters object
  const filters = {
    entity_id: selectedEntityId,
    status: statusFilter.length > 0 ? statusFilter.join(",") : undefined,
    priority: priorityFilter.length > 0 ? priorityFilter.join(",") : undefined,
    skip: currentPage * PAGE_SIZE,
    limit: PAGE_SIZE,
  };

  // Fetch callbacks
  const { data: callbacksResponse, isLoading, error, refetch } = useCallbacks(filters);

  // Mutations
  const createMutation = useCreateCallback();
  const updateMutation = useUpdateCallback();
  const cancelMutation = useCancelCallback();

  // Handle new callback
  const handleNewCallback = useCallback(() => {
    setEditingCallback(null);
    setIsModalOpen(true);
  }, []);

  // Handle edit
  const handleEdit = useCallback((callback: CallCallback) => {
    setEditingCallback(callback);
    setIsModalOpen(true);
  }, []);

  // Handle call now (mark as completed after calling)
  const handleCallNow = useCallback(
    (callback: CallCallback) => {
      // In a real implementation, this would initiate a call
      // For now, we'll mark it as completed
      updateMutation.mutate(
        { callbackId: callback.id, data: { status: CallbackStatus.COMPLETED } },
        { onSuccess: () => refetch() }
      );
    },
    [updateMutation, refetch]
  );

  // Handle cancel callback
  const handleCancel = useCallback(
    (callback: CallCallback) => {
      cancelMutation.mutate(callback.id, { onSuccess: () => refetch() });
    },
    [cancelMutation, refetch]
  );

  // Handle form submit
  const handleSubmit = useCallback(
    (data: CallbackCreate | CallbackUpdate) => {
      if (editingCallback) {
        updateMutation.mutate(
          { callbackId: editingCallback.id, data: data as CallbackUpdate },
          {
            onSuccess: () => {
              setIsModalOpen(false);
              refetch();
            },
          }
        );
      } else {
        createMutation.mutate(data as CallbackCreate, {
          onSuccess: () => {
            setIsModalOpen(false);
            refetch();
          },
        });
      }
    },
    [editingCallback, createMutation, updateMutation, refetch]
  );

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setStatusFilter([]);
    setPriorityFilter([]);
    setCurrentPage(0);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = statusFilter.length > 0 || priorityFilter.length > 0;

  // Count by status
  const pendingCount =
    callbacksResponse?.items.filter((c) => c.status === CallbackStatus.PENDING).length || 0;

  return (
    <div className="space-y-6">
      {/* Shared Header with Entity Selector */}
      <CallCenterHeader description="Manage scheduled callbacks and follow-ups" />

      {/* Stats Cards with Action */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Pending</p>
              <p className="text-2xl font-heading font-bold text-status-warning">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-status-warning/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-status-warning"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>
        <Card variant="bordered" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total</p>
              <p className="text-2xl font-heading font-bold text-text-primary">
                {callbacksResponse?.total || 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-background-light flex items-center justify-center">
              <svg
                className="w-5 h-5 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </Card>
        {/* Schedule Callback Action Card */}
        <Card
          variant="bordered"
          padding="md"
          className="flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
          onClick={handleNewCallback}
        >
          <div className="flex items-center gap-2 text-primary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="font-medium">Schedule Callback</span>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-medium p-4 sm:p-6">
        {/* Filter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <MultiSelect
            label="Status"
            placeholder="All Statuses"
            options={[
              { value: CallbackStatus.PENDING, label: "Pending" },
              { value: CallbackStatus.IN_PROGRESS, label: "In Progress" },
              { value: CallbackStatus.COMPLETED, label: "Completed" },
              { value: CallbackStatus.CANCELLED, label: "Cancelled" },
            ]}
            value={statusFilter}
            onChange={(values) => {
              setStatusFilter(values);
              setCurrentPage(0);
            }}
            size="sm"
          />
          <MultiSelect
            label="Priority"
            placeholder="All Priorities"
            options={[
              { value: CallbackPriority.LOW, label: "Low" },
              { value: CallbackPriority.NORMAL, label: "Normal" },
              { value: CallbackPriority.HIGH, label: "High" },
              { value: CallbackPriority.URGENT, label: "Urgent" },
            ]}
            value={priorityFilter}
            onChange={(values) => {
              setPriorityFilter(values);
              setCurrentPage(0);
            }}
            size="sm"
          />
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-border-light">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                Active Filters:
              </span>
              {statusFilter.map((status) => {
                const label =
                  {
                    [CallbackStatus.PENDING]: "Pending",
                    [CallbackStatus.IN_PROGRESS]: "In Progress",
                    [CallbackStatus.COMPLETED]: "Completed",
                    [CallbackStatus.CANCELLED]: "Cancelled",
                  }[status] || status;
                return (
                  <span
                    key={`status-${status}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                  >
                    Status: {label}
                    <button
                      onClick={() => {
                        setStatusFilter(statusFilter.filter((s) => s !== status));
                        setCurrentPage(0);
                      }}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
              {priorityFilter.map((priority) => {
                const label =
                  {
                    [CallbackPriority.LOW]: "Low",
                    [CallbackPriority.NORMAL]: "Normal",
                    [CallbackPriority.HIGH]: "High",
                    [CallbackPriority.URGENT]: "Urgent",
                  }[priority] || priority;
                return (
                  <span
                    key={`priority-${priority}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700"
                  >
                    Priority: {label}
                    <button
                      onClick={() => {
                        setPriorityFilter(priorityFilter.filter((p) => p !== priority));
                        setCurrentPage(0);
                      }}
                      className="ml-1 hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
              <button
                onClick={handleClearFilters}
                className="text-xs text-status-error hover:text-status-error/80 font-medium ml-2"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Callbacks List */}
      <CallbacksList
        callbacks={callbacksResponse?.items || []}
        isLoading={isLoading}
        error={error as Error | null}
        totalCount={callbacksResponse?.total || 0}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onDial={handleCallNow}
        onCancel={handleCancel}
        onRetry={refetch}
      />

      {/* Schedule/Edit Modal */}
      <ScheduleCallbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        callback={editingCallback}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
