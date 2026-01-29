"use client";

/**
 * Queue Form Modal Component
 *
 * Modal for creating or editing call queues.
 * Follows the ScheduleCallbackModal pattern.
 */

import { useState, useEffect } from "react";
import { cn } from "@/src/lib/theme";
import {
  CallQueue,
  CallQueueCreate,
  CallQueueUpdate,
  RingStrategy,
  OverflowAction,
  RING_STRATEGY_OPTIONS,
  OVERFLOW_ACTION_OPTIONS,
} from "@/src/types/voice";
import { Button, Input, Textarea, Select } from "@/src/components/ui";

interface QueueFormModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Existing queue for editing (undefined = create mode) */
  queue?: CallQueue;
  /** Entity ID for new queues */
  entityId: string;
  /** Existing queues for overflow_queue_id dropdown */
  existingQueues: CallQueue[];
  /** Callback when form is submitted */
  onSubmit: (data: CallQueueCreate | CallQueueUpdate) => void;
  /** Whether the form is submitting */
  isSubmitting?: boolean;
}

export function QueueFormModal({
  isOpen,
  onClose,
  queue,
  entityId,
  existingQueues,
  onSubmit,
  isSubmitting = false,
}: QueueFormModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [ringStrategy, setRingStrategy] = useState<RingStrategy>(RingStrategy.ROUND_ROBIN);
  const [ringTimeoutSeconds, setRingTimeoutSeconds] = useState(30);
  const [maxWaitTimeSeconds, setMaxWaitTimeSeconds] = useState(300);
  const [overflowAction, setOverflowAction] = useState<OverflowAction>(OverflowAction.VOICEMAIL);
  const [overflowQueueId, setOverflowQueueId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!queue;

  // Filter out current queue from overflow options
  const overflowQueueOptions = existingQueues.filter((q) => q.id !== queue?.id);

  // Initialize form when modal opens or queue changes
  useEffect(() => {
    if (isOpen) {
      if (queue) {
        setName(queue.name);
        setCode(queue.code);
        setDescription(queue.description || "");
        setRingStrategy(queue.ring_strategy);
        setRingTimeoutSeconds(30); // Not in CallQueue type, use default
        setMaxWaitTimeSeconds(queue.max_wait_time_seconds);
        setOverflowAction(queue.overflow_action);
        setOverflowQueueId(queue.overflow_queue_id || "");
        setIsActive(queue.is_active);
      } else {
        // Reset to defaults for new queue
        setName("");
        setCode("");
        setDescription("");
        setRingStrategy(RingStrategy.ROUND_ROBIN);
        setRingTimeoutSeconds(30);
        setMaxWaitTimeSeconds(300);
        setOverflowAction(OverflowAction.VOICEMAIL);
        setOverflowQueueId("");
        setIsActive(true);
      }
      setErrors({});
    }
  }, [isOpen, queue]);

  // Auto-generate code from name
  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEditing && !code) {
      // Auto-generate code from name (uppercase, replace spaces with underscores)
      const autoCode = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "")
        .slice(0, 20);
      setCode(autoCode);
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Queue name is required";
    }

    if (!code.trim()) {
      newErrors.code = "Queue code is required";
    } else if (!/^[A-Z0-9_]+$/.test(code)) {
      newErrors.code = "Code must be uppercase letters, numbers, and underscores only";
    }

    if (maxWaitTimeSeconds < 0) {
      newErrors.maxWaitTimeSeconds = "Max wait time cannot be negative";
    }

    if (ringTimeoutSeconds < 0) {
      newErrors.ringTimeoutSeconds = "Ring timeout cannot be negative";
    }

    if (overflowAction === OverflowAction.TRANSFER_QUEUE && !overflowQueueId) {
      newErrors.overflowQueueId = "Please select an overflow queue";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (isEditing) {
      const updateData: CallQueueUpdate = {
        name,
        description: description || undefined,
        ring_strategy: ringStrategy,
        max_wait_time_seconds: maxWaitTimeSeconds,
        overflow_action: overflowAction,
        overflow_queue_id:
          overflowAction === OverflowAction.TRANSFER_QUEUE ? overflowQueueId : undefined,
        is_active: isActive,
      };
      onSubmit(updateData);
    } else {
      const createData: CallQueueCreate = {
        entity_id: entityId,
        name,
        code,
        description: description || undefined,
        ring_strategy: ringStrategy,
        max_wait_time_seconds: maxWaitTimeSeconds,
        overflow_action: overflowAction,
        overflow_queue_id:
          overflowAction === OverflowAction.TRANSFER_QUEUE ? overflowQueueId : undefined,
        is_active: isActive,
      };
      onSubmit(createData);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-light">
            <h2 className="text-lg font-heading font-semibold text-text-primary">
              {isEditing ? "Edit Queue" : "Create Queue"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-background-light transition-colors"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {errors.general && (
              <div className="p-3 rounded-lg bg-status-error/10 text-status-error text-sm">
                {errors.general}
              </div>
            )}

            <Input
              label="Queue Name"
              placeholder="e.g., Sales Support"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              error={errors.name}
              required
            />

            <Input
              label="Queue Code"
              placeholder="e.g., SALES_SUPPORT"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              error={errors.code}
              required
              disabled={isEditing}
              helperText={isEditing ? "Code cannot be changed after creation" : undefined}
            />

            <Textarea
              label="Description"
              placeholder="Brief description of this queue (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Ring Strategy
                </label>
                <Select
                  value={ringStrategy}
                  onChange={(e) => setRingStrategy(e.target.value as RingStrategy)}
                >
                  {RING_STRATEGY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Ring Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={ringTimeoutSeconds}
                  onChange={(e) => setRingTimeoutSeconds(parseInt(e.target.value) || 0)}
                  min={0}
                  max={120}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg border bg-white font-body",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    errors.ringTimeoutSeconds ? "border-status-error" : "border-border-light"
                  )}
                />
                {errors.ringTimeoutSeconds && (
                  <p className="mt-1 text-sm text-status-error">{errors.ringTimeoutSeconds}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Max Wait Time (seconds)
              </label>
              <input
                type="number"
                value={maxWaitTimeSeconds}
                onChange={(e) => setMaxWaitTimeSeconds(parseInt(e.target.value) || 0)}
                min={0}
                max={3600}
                className={cn(
                  "w-full px-3 py-2 rounded-lg border bg-white font-body",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  errors.maxWaitTimeSeconds ? "border-status-error" : "border-border-light"
                )}
              />
              {errors.maxWaitTimeSeconds && (
                <p className="mt-1 text-sm text-status-error">{errors.maxWaitTimeSeconds}</p>
              )}
              <p className="mt-1 text-xs text-text-secondary">
                Maximum time a caller waits before overflow action triggers
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Overflow Action
              </label>
              <Select
                value={overflowAction}
                onChange={(e) => setOverflowAction(e.target.value as OverflowAction)}
              >
                {OVERFLOW_ACTION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {overflowAction === OverflowAction.TRANSFER_QUEUE && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Overflow Queue <span className="text-status-error">*</span>
                </label>
                <Select
                  value={overflowQueueId}
                  onChange={(e) => setOverflowQueueId(e.target.value)}
                >
                  <option value="">Select a queue...</option>
                  {overflowQueueOptions.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.name} ({q.code})
                    </option>
                  ))}
                </Select>
                {errors.overflowQueueId && (
                  <p className="mt-1 text-sm text-status-error">{errors.overflowQueueId}</p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-border-light text-primary focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-sm text-text-primary">
                Queue is active
              </label>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={isSubmitting}>
                {isEditing ? "Save Changes" : "Create Queue"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
