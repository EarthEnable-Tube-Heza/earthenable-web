"use client";

/**
 * Queue Management Page
 *
 * Manage call queues with CRUD operations and agent management.
 * Requires call_center.manage or system.admin permission.
 */

import { useState, useCallback } from "react";
import {
  useCallQueues,
  useCreateCallQueue,
  useUpdateCallQueue,
  useDeleteCallQueue,
} from "@/src/hooks/useCallCenter";
import { useAuth } from "@/src/lib/auth";
import { useSetPageHeader } from "@/src/contexts/PageHeaderContext";
import { PagePermissionGuard } from "@/src/components/auth";
import { PageTitle } from "@/src/components/dashboard/PageTitle";
import { PAGE_SPACING } from "@/src/lib/theme";
import {
  CallCenterHeader,
  QueueTable,
  QueueFormModal,
  QueueAgentsModal,
} from "@/src/components/call-center";
import { CallQueue, CallQueueCreate, CallQueueUpdate } from "@/src/types/voice";
import { Card, ConfirmDialog, Toast, ToastType } from "@/src/components/ui";

export default function QueuesPage() {
  return (
    <PagePermissionGuard
      permissions={["call_center.manage", "system.admin"]}
      pageTitle="Queue Management"
      showUnauthorizedPage
    >
      <QueuesContent />
    </PagePermissionGuard>
  );
}

function QueuesContent() {
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAgentsModalOpen, setIsAgentsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<CallQueue | null>(null);
  const [queueToDelete, setQueueToDelete] = useState<CallQueue | null>(null);

  // Toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    message: string;
  }>({ visible: false, type: "success", message: "" });

  // Use global entity selection from auth context
  const { selectedEntityId: rawEntityId } = useAuth();
  const selectedEntityId = rawEntityId || "";

  // Fetch queues
  const {
    data: queues,
    isLoading,
    error,
    refetch,
  } = useCallQueues({ entity_id: selectedEntityId || undefined });

  // Mutations
  const createMutation = useCreateCallQueue();
  const updateMutation = useUpdateCallQueue();
  const deleteMutation = useDeleteCallQueue();

  // Show toast helper
  const showToast = (type: ToastType, message: string) => {
    setToast({ visible: true, type, message });
  };

  // Handle new queue
  const handleNewQueue = useCallback(() => {
    setSelectedQueue(null);
    setIsFormModalOpen(true);
  }, []);

  // Handle edit queue
  const handleEdit = useCallback((queue: CallQueue) => {
    setSelectedQueue(queue);
    setIsFormModalOpen(true);
  }, []);

  // Handle manage agents
  const handleManageAgents = useCallback((queue: CallQueue) => {
    setSelectedQueue(queue);
    setIsAgentsModalOpen(true);
  }, []);

  // Handle delete queue
  const handleDelete = useCallback((queue: CallQueue) => {
    setQueueToDelete(queue);
    setIsDeleteDialogOpen(true);
  }, []);

  // Confirm delete
  const confirmDelete = useCallback(() => {
    if (!queueToDelete) return;

    deleteMutation.mutate(queueToDelete.id, {
      onSuccess: () => {
        showToast("success", `Queue "${queueToDelete.name}" deleted successfully`);
        setIsDeleteDialogOpen(false);
        setQueueToDelete(null);
        refetch();
      },
      onError: (err) => {
        showToast("error", `Failed to delete queue: ${err.message}`);
      },
    });
  }, [queueToDelete, deleteMutation, refetch]);

  // Handle form submit
  const handleFormSubmit = useCallback(
    (data: CallQueueCreate | CallQueueUpdate) => {
      if (selectedQueue) {
        // Update existing queue
        updateMutation.mutate(
          { queueId: selectedQueue.id, data: data as CallQueueUpdate },
          {
            onSuccess: () => {
              showToast("success", "Queue updated successfully");
              setIsFormModalOpen(false);
              setSelectedQueue(null);
              refetch();
            },
            onError: (err) => {
              showToast("error", `Failed to update queue: ${err.message}`);
            },
          }
        );
      } else {
        // Create new queue
        createMutation.mutate(data as CallQueueCreate, {
          onSuccess: () => {
            showToast("success", "Queue created successfully");
            setIsFormModalOpen(false);
            refetch();
          },
          onError: (err) => {
            showToast("error", `Failed to create queue: ${err.message}`);
          },
        });
      }
    },
    [selectedQueue, createMutation, updateMutation, refetch]
  );

  useSetPageHeader({
    title: "Queue Management",
    pathLabels: { "call-center": "Call Center", queues: "Queues" },
  });

  // Count active queues
  const activeQueuesCount = queues?.filter((q) => q.is_active).length || 0;
  const totalQueuesCount = queues?.length || 0;

  return (
    <div className={PAGE_SPACING}>
      {/* Page Title */}
      <PageTitle
        title="Queue Management"
        description="Create and manage call queues and their agents"
      />

      {/* Shared Header */}
      <CallCenterHeader />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="bordered" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Queues</p>
              <p className="text-2xl font-heading font-bold text-text-primary">
                {totalQueuesCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          </div>
        </Card>
        <Card variant="bordered" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Active Queues</p>
              <p className="text-2xl font-heading font-bold text-status-success">
                {activeQueuesCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-status-success/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-status-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>
        <Card variant="bordered" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Inactive Queues</p>
              <p className="text-2xl font-heading font-bold text-text-secondary">
                {totalQueuesCount - activeQueuesCount}
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
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>
          </div>
        </Card>
        {/* Create Queue Action Card */}
        <Card
          variant="bordered"
          padding="md"
          className="flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
          onClick={handleNewQueue}
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
            <span className="font-medium">Create Queue</span>
          </div>
        </Card>
      </div>

      {/* No Entity Selected Warning */}
      {!selectedEntityId && (
        <Card padding="lg" className="text-center">
          <svg
            className="w-12 h-12 mx-auto text-text-disabled mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <p className="text-text-secondary">Select an entity from the header to manage queues</p>
        </Card>
      )}

      {/* Queue Table */}
      {selectedEntityId && (
        <QueueTable
          queues={queues || []}
          isLoading={isLoading}
          error={error as Error | null}
          onEdit={handleEdit}
          onManageAgents={handleManageAgents}
          onDelete={handleDelete}
          onRetry={refetch}
        />
      )}

      {/* Create/Edit Queue Modal */}
      <QueueFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedQueue(null);
        }}
        queue={selectedQueue || undefined}
        entityId={selectedEntityId}
        existingQueues={queues || []}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Manage Agents Modal */}
      {selectedQueue && (
        <QueueAgentsModal
          isOpen={isAgentsModalOpen}
          onClose={() => {
            setIsAgentsModalOpen(false);
            setSelectedQueue(null);
          }}
          queue={selectedQueue}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setQueueToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Queue"
        message={`Are you sure you want to delete the queue "${queueToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />

      {/* Toast Notifications */}
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast({ ...toast, visible: false })}
        position="top"
      />
    </div>
  );
}
