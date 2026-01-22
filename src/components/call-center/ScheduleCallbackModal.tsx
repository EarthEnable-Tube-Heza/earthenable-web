"use client";

/**
 * Schedule Callback Modal Component
 *
 * Modal for creating or editing scheduled callbacks.
 */

import { useState, useEffect } from "react";
import { cn } from "@/src/lib/theme";
import { CallbackPriority, CallCallback, CallbackCreate, CallbackUpdate } from "@/src/types/voice";
import { Button, Input, Textarea, Select } from "@/src/components/ui";

interface ScheduleCallbackModalProps {
  /** Existing callback for editing (null for new) */
  callback: CallCallback | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when form is submitted */
  onSubmit: (data: CallbackCreate | CallbackUpdate) => void;
  /** Whether the form is submitting */
  isSubmitting?: boolean;
  /** Entity ID for new callbacks */
  entityId?: string;
}

export function ScheduleCallbackModal({
  callback,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  entityId,
}: ScheduleCallbackModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [priority, setPriority] = useState<CallbackPriority>(CallbackPriority.NORMAL);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!callback;

  // Initialize form when modal opens or callback changes
  useEffect(() => {
    if (isOpen) {
      if (callback) {
        setPhoneNumber(callback.phone_number);
        setContactName(callback.contact_name || "");
        // Format datetime for input
        const date = new Date(callback.scheduled_at);
        const localDatetime = date.toISOString().slice(0, 16);
        setScheduledAt(localDatetime);
        setPriority(callback.priority);
        setNotes(callback.notes || "");
      } else {
        // Default to 30 minutes from now
        const defaultTime = new Date(Date.now() + 30 * 60 * 1000);
        setScheduledAt(defaultTime.toISOString().slice(0, 16));
        setPhoneNumber("");
        setContactName("");
        setPriority(CallbackPriority.NORMAL);
        setNotes("");
      }
      setErrors({});
    }
  }, [isOpen, callback]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[0-9]{10,15}$/.test(phoneNumber.replace(/\s/g, ""))) {
      newErrors.phoneNumber = "Invalid phone number format";
    }

    if (!scheduledAt) {
      newErrors.scheduledAt = "Scheduled time is required";
    } else {
      const scheduledDate = new Date(scheduledAt);
      if (scheduledDate < new Date()) {
        newErrors.scheduledAt = "Scheduled time must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const scheduledDate = new Date(scheduledAt);

    if (isEditing) {
      const updateData: CallbackUpdate = {
        phone_number: phoneNumber,
        contact_name: contactName || undefined,
        scheduled_at: scheduledDate.toISOString(),
        priority,
        notes: notes || undefined,
      };
      onSubmit(updateData);
    } else {
      if (!entityId) {
        setErrors({ general: "Entity ID is required" });
        return;
      }
      const createData: CallbackCreate = {
        entity_id: entityId,
        phone_number: phoneNumber,
        contact_name: contactName || undefined,
        scheduled_at: scheduledDate.toISOString(),
        priority,
        notes: notes || undefined,
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
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-light">
            <h2 className="text-lg font-heading font-semibold text-text-primary">
              {isEditing ? "Edit Callback" : "Schedule Callback"}
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
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {errors.general && (
              <div className="p-3 rounded-lg bg-status-error/10 text-status-error text-sm">
                {errors.general}
              </div>
            )}

            <Input
              label="Phone Number"
              placeholder="+254..."
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              error={errors.phoneNumber}
              required
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              }
            />

            <Input
              label="Contact Name"
              placeholder="John Doe (optional)"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
            />

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Scheduled Time <span className="text-status-error">*</span>
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 rounded-lg border bg-white font-body",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  errors.scheduledAt ? "border-status-error" : "border-border-light"
                )}
              />
              {errors.scheduledAt && (
                <p className="mt-1 text-sm text-status-error">{errors.scheduledAt}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Priority</label>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value as CallbackPriority)}
              >
                <option value={CallbackPriority.LOW}>Low</option>
                <option value={CallbackPriority.NORMAL}>Normal</option>
                <option value={CallbackPriority.HIGH}>High</option>
                <option value={CallbackPriority.URGENT}>Urgent</option>
              </Select>
            </div>

            <Textarea
              label="Notes"
              placeholder="Add any notes about this callback..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={isSubmitting}>
                {isEditing ? "Save Changes" : "Schedule Callback"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
