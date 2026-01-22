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
import { Card, Button, Select } from "@/src/components/ui";
import { useAuth } from "@/src/lib/auth";

const PAGE_SIZE = 20;

export default function CallbacksPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCallback, setEditingCallback] = useState<CallCallback | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<CallbackStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<CallbackPriority | "">("");

  // Get current user and entity
  const { user } = useAuth();
  const entityId = user?.entity_id || "";

  // Build filters object
  const filters = {
    entity_id: entityId,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    skip: (currentPage - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  };

  // Fetch callbacks
  const { data: callbacksResponse, isLoading, refetch } = useCallbacks(filters);

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
      <Card variant="bordered" padding="md">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-40">
            <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CallbackStatus | "")}
            >
              <option value="">All</option>
              <option value={CallbackStatus.PENDING}>Pending</option>
              <option value={CallbackStatus.IN_PROGRESS}>In Progress</option>
              <option value={CallbackStatus.COMPLETED}>Completed</option>
              <option value={CallbackStatus.CANCELLED}>Cancelled</option>
            </Select>
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-text-secondary mb-1">Priority</label>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as CallbackPriority | "")}
            >
              <option value="">All</option>
              <option value={CallbackPriority.LOW}>Low</option>
              <option value={CallbackPriority.NORMAL}>Normal</option>
              <option value={CallbackPriority.HIGH}>High</option>
              <option value={CallbackPriority.URGENT}>Urgent</option>
            </Select>
          </div>
          {(statusFilter || priorityFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter("");
                setPriorityFilter("");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Callbacks List */}
      <CallbacksList
        callbacks={callbacksResponse?.items || []}
        isLoading={isLoading}
        totalCount={callbacksResponse?.total || 0}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onDial={handleCallNow}
        onCancel={handleCancel}
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
