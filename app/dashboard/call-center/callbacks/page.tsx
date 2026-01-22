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
import { useCallCenterContext } from "@/src/hooks/useAfricasTalkingClient";
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

  // Call center context for dialing
  const { makeCall, canMakeCall } = useCallCenterContext();

  // Open modal for new callback
  const handleNewCallback = useCallback(() => {
    setEditingCallback(null);
    setIsModalOpen(true);
  }, []);

  // Open modal for editing
  const handleEdit = useCallback((callback: CallCallback) => {
    setEditingCallback(callback);
    setIsModalOpen(true);
  }, []);

  // Handle dial callback
  const handleDial = useCallback(
    async (callback: CallCallback) => {
      if (canMakeCall) {
        await makeCall(callback.phone_number, callback.contact_name);
      }
    },
    [canMakeCall, makeCall]
  );

  // Handle complete callback (mark as complete without calling)
  const handleComplete = useCallback(
    (callback: CallCallback) => {
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
      {/* Action Bar */}
      <div className="flex justify-end">
        <Button variant="primary" onClick={handleNewCallback}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Schedule Callback
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
      </div>

      {/* Filters */}
      <Card variant="bordered" padding="md" className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-40">
            <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as CallbackStatus | "");
                setCurrentPage(1);
              }}
            >
              <option value="">All</option>
              <option value={CallbackStatus.PENDING}>Pending</option>
              <option value={CallbackStatus.IN_PROGRESS}>In Progress</option>
              <option value={CallbackStatus.COMPLETED}>Completed</option>
              <option value={CallbackStatus.CANCELLED}>Cancelled</option>
              <option value={CallbackStatus.FAILED}>Failed</option>
            </Select>
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-text-secondary mb-1">Priority</label>
            <Select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value as CallbackPriority | "");
                setCurrentPage(1);
              }}
            >
              <option value="">All</option>
              <option value={CallbackPriority.URGENT}>Urgent</option>
              <option value={CallbackPriority.HIGH}>High</option>
              <option value={CallbackPriority.NORMAL}>Normal</option>
              <option value={CallbackPriority.LOW}>Low</option>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setStatusFilter("");
              setPriorityFilter("");
              setCurrentPage(1);
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Callbacks List */}
      <Card variant="bordered" padding="none">
        <CallbacksList
          callbacks={callbacksResponse?.items || []}
          isLoading={isLoading}
          totalCount={callbacksResponse?.total || 0}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
          onDial={canMakeCall ? handleDial : undefined}
          onEdit={handleEdit}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </Card>

      {/* Schedule Callback Modal */}
      <ScheduleCallbackModal
        callback={editingCallback}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        entityId={entityId}
      />
    </div>
  );
}
