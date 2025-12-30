"use client";

/**
 * Send Notification Modal
 *
 * Modal for sending custom notifications to one or more users.
 */

import { useState, useMemo } from "react";
import { Dialog } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { useSendNotification } from "@/src/hooks/useNotifications";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";
import { Toast, ToastType } from "../ui/Toast";
import {
  NotificationType,
  NotificationTypeValue,
  NotificationTypeLabels,
  SendNotificationRequest,
} from "@/src/types/notification";
import { cn } from "@/src/lib/theme";

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedUserIds?: string[];
}

export function SendNotificationModal({
  isOpen,
  onClose,
  preselectedUserIds = [],
}: SendNotificationModalProps) {
  // Form state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(preselectedUserIds);
  const [userSearch, setUserSearch] = useState("");
  const [notificationType, setNotificationType] = useState<NotificationTypeValue>(
    NotificationType.TASK_UPDATE
  );
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sendImmediately, setSendImmediately] = useState(true);

  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    message: string;
  }>({ visible: false, type: "success", message: "" });

  // Fetch users for selection
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users-for-notification", userSearch],
    queryFn: () =>
      apiClient.getUsers({
        search: userSearch || undefined,
        limit: 50,
        is_active: true,
      }),
    enabled: isOpen,
  });

  const sendMutation = useSendNotification();

  // Filter out already selected users from dropdown
  const availableUsers = useMemo(() => {
    if (!usersData?.items) return [];
    return usersData.items.filter((user) => !selectedUserIds.includes(user.id));
  }, [usersData, selectedUserIds]);

  // Get selected user details
  const selectedUsers = useMemo(() => {
    if (!usersData?.items) return [];
    return usersData.items.filter((user) => selectedUserIds.includes(user.id));
  }, [usersData, selectedUserIds]);

  const handleAddUser = (userId: string) => {
    if (!selectedUserIds.includes(userId)) {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
  };

  const handleSubmit = async () => {
    if (selectedUserIds.length === 0) {
      setToast({
        visible: true,
        type: "error",
        message: "Please select at least one user",
      });
      return;
    }

    if (!title.trim()) {
      setToast({
        visible: true,
        type: "error",
        message: "Please enter a title",
      });
      return;
    }

    if (!body.trim()) {
      setToast({
        visible: true,
        type: "error",
        message: "Please enter a message body",
      });
      return;
    }

    const request: SendNotificationRequest = {
      user_ids: selectedUserIds,
      notification_type: notificationType,
      title: title.trim(),
      body: body.trim(),
      send_immediately: sendImmediately,
    };

    try {
      const result = await sendMutation.mutateAsync(request);
      setToast({
        visible: true,
        type: result.success ? "success" : "warning",
        message: result.message,
      });

      if (result.success) {
        // Reset form after success
        setSelectedUserIds([]);
        setTitle("");
        setBody("");
        setNotificationType(NotificationType.TASK_UPDATE);

        // Close modal after short delay
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      setToast({
        visible: true,
        type: "error",
        message: err instanceof Error ? err.message : "Failed to send notification",
      });
    }
  };

  const handleClose = () => {
    // Reset form state on close
    setSelectedUserIds(preselectedUserIds);
    setUserSearch("");
    setTitle("");
    setBody("");
    setNotificationType(NotificationType.TASK_UPDATE);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-light flex items-start justify-between">
            <div>
              <Dialog.Title className="text-xl font-heading font-bold text-text-primary">
                Send Notification
              </Dialog.Title>
              <p className="text-sm text-text-secondary mt-0.5">
                Send a custom push notification to selected users
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-text-secondary hover:text-text-primary transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Recipients <span className="text-status-error">*</span>
              </label>

              {/* Selected Users */}
              {selectedUserIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedUsers.map((user) => (
                    <Badge key={user.id} variant="default" className="flex items-center gap-1 pr-1">
                      <span>{user.name || user.email}</span>
                      <button
                        onClick={() => handleRemoveUser(user.id)}
                        className="ml-1 p-0.5 rounded-full hover:bg-black/10"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* User Search */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  }
                />

                {/* User dropdown */}
                {userSearch && availableUsers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-border-light rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {availableUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          handleAddUser(user.id);
                          setUserSearch("");
                        }}
                        className={cn(
                          "w-full px-4 py-2 text-left hover:bg-background-light",
                          "flex items-center gap-3"
                        )}
                      >
                        {user.picture ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.picture}
                            alt={user.name || "User"}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {(user.name || user.email || "U")[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-text-primary">
                            {user.name || "Unknown"}
                          </div>
                          <div className="text-xs text-text-secondary">{user.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {userSearch && availableUsers.length === 0 && !isLoadingUsers && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-border-light rounded-lg shadow-lg p-4 text-center text-sm text-text-secondary">
                    No users found
                  </div>
                )}
              </div>

              <p className="text-xs text-text-secondary mt-1">
                {selectedUserIds.length} user(s) selected
              </p>
            </div>

            {/* Notification Type */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Notification Type
              </label>
              <Select
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value as NotificationTypeValue)}
              >
                {Object.entries(NotificationTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Title */}
            <div>
              <Input
                label="Title"
                type="text"
                placeholder="Notification title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={255}
              />
              <p className="text-xs text-text-secondary mt-1">{title.length}/255 characters</p>
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Message <span className="text-status-error">*</span>
              </label>
              <textarea
                className={cn(
                  "w-full px-3 py-2 rounded-lg border border-border-light",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  "text-sm text-text-primary placeholder:text-text-secondary"
                )}
                rows={4}
                placeholder="Enter notification message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            {/* Send Immediately Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="sendImmediately"
                checked={sendImmediately}
                onChange={(e) => setSendImmediately(e.target.checked)}
                className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary"
              />
              <label htmlFor="sendImmediately" className="text-sm text-text-primary">
                Send immediately (if unchecked, notification will be queued)
              </label>
            </div>

            {/* Preview */}
            {title && body && (
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Preview</h3>
                <div className="bg-background-light rounded-lg p-4 border border-border-light">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">{title}</div>
                      <div className="text-sm text-text-secondary mt-0.5">{body}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border-light bg-background-light">
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={sendMutation.isPending}
                disabled={sendMutation.isPending || selectedUserIds.length === 0 || !title || !body}
              >
                Send Notification
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </div>

      {/* Toast notifications */}
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </Dialog>
  );
}
