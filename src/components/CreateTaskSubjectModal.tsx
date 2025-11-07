"use client";

/**
 * Create Task Subject Modal
 *
 * Modal dialog for creating a new task subject (evaluation type).
 */

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { CreateTaskSubject } from "@/src/types/form";

interface CreateTaskSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTaskSubjectModal({ isOpen, onClose }: CreateTaskSubjectModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: CreateTaskSubject) => apiClient.createTaskSubject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-mappings"] });
      queryClient.invalidateQueries({ queryKey: ["task-subjects"] });
      handleClose();
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || "Failed to create task subject");
    },
  });

  const handleClose = () => {
    setName("");
    setDescription("");
    setIsActive(true);
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setError(null);
    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || null,
      is_active: isActive,
    });
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-large w-full max-w-md">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
            <Dialog.Title className="text-xl font-heading font-bold text-text-primary">
              Create Task Subject
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Name <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="e.g., Welcome Call, Final Evaluation"
                className="w-full px-4 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={createMutation.isPending}
                required
              />
              <p className="text-xs text-text-secondary mt-1">
                The name of the evaluation type (e.g., &quot;Welcome Call&quot;)
              </p>
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description of this evaluation type"
                rows={3}
                className="w-full px-4 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                disabled={createMutation.isPending}
              />
            </div>

            {/* Is Active Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-primary border-border-light rounded focus:ring-2 focus:ring-primary"
                disabled={createMutation.isPending}
              />
              <label htmlFor="is-active" className="text-sm text-text-primary">
                Active (can be used in the mobile app)
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-status-error/10 border border-status-error rounded-md">
                <p className="text-status-error text-sm">{error}</p>
              </div>
            )}

            {/* Info Message */}
            <div className="bg-status-info/10 border border-status-info rounded-lg p-3">
              <p className="text-status-info text-xs">
                <strong>Note:</strong> After creating the task subject, you&apos;ll need to add form
                mappings to specify which FormYoula forms to use for each country.
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border-light flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={createMutation.isPending}
              className="px-4 py-2 border border-border-light rounded-md text-text-primary hover:bg-background-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || !name.trim()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? "Creating..." : "Create Task Subject"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
