"use client";

/**
 * Create Form Mapping Modal
 *
 * Modal dialog for creating a new form mapping (TaskSubject → FormYoula form ID).
 */

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { CreateFormMapping } from "@/src/types/form";
import { Select } from "@/src/components/ui/Select";
import { EARTHENABLE_COUNTRIES } from "@/src/lib/constants";

interface CreateFormMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateFormMappingModal({ isOpen, onClose }: CreateFormMappingModalProps) {
  const queryClient = useQueryClient();
  const [taskSubjectId, setTaskSubjectId] = useState("");
  const [countryCode, setCountryCode] = useState<string>("");
  const [formyoulaFormId, setFormyoulaFormId] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch task subjects for dropdown
  const { data: taskSubjectsData } = useQuery({
    queryKey: ["task-subjects"],
    queryFn: () => apiClient.getTaskSubjects({ limit: 100 }),
  });

  const taskSubjects = taskSubjectsData?.items || [];

  const createMutation = useMutation({
    mutationFn: (data: CreateFormMapping) => apiClient.createFormMapping(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-mappings"] });
      handleClose();
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || "Failed to create form mapping");
    },
  });

  const handleClose = () => {
    setTaskSubjectId("");
    setCountryCode("");
    setFormyoulaFormId("");
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskSubjectId || !formyoulaFormId.trim()) {
      setError("Task Subject and FormYoula Form ID are required");
      return;
    }

    setError(null);

    const isDefault = countryCode === "" || countryCode === "default";

    createMutation.mutate({
      task_subject_id: taskSubjectId,
      country_code: isDefault ? null : countryCode,
      formyoula_form_id: formyoulaFormId.trim(),
      is_default: isDefault,
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
              Create Form Mapping
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
            {/* Task Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Task Subject <span className="text-status-error">*</span>
              </label>
              <Select
                value={taskSubjectId}
                onChange={(e) => {
                  setTaskSubjectId(e.target.value);
                  setError(null);
                }}
                disabled={createMutation.isPending}
                required
              >
                <option value="">Select a task subject...</option>
                {taskSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-text-secondary mt-1">
                The evaluation type this form is for
              </p>
            </div>

            {/* Country Selection */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Country</label>
              <Select
                value={countryCode}
                onChange={(e) => {
                  setCountryCode(e.target.value);
                  setError(null);
                }}
                disabled={createMutation.isPending}
              >
                <option value="default">Default (All Countries)</option>
                {EARTHENABLE_COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.code})
                  </option>
                ))}
              </Select>
              <p className="text-xs text-text-secondary mt-1">
                {countryCode === "" || countryCode === "default"
                  ? "This will be the fallback form for all countries"
                  : "This form will only be used in this specific country"}
              </p>
            </div>

            {/* FormYoula Form ID */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                FormYoula Form ID <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                value={formyoulaFormId}
                onChange={(e) => {
                  setFormyoulaFormId(e.target.value);
                  setError(null);
                }}
                placeholder="e.g., form-123-abc"
                className="w-full px-4 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                disabled={createMutation.isPending}
                required
              />
              <p className="text-xs text-text-secondary mt-1">
                The FormYoula form ID from your FormYoula account
              </p>
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
                <strong>Note:</strong> Each task subject can have one default form and one
                country-specific form per country. The mobile app will use the country-specific form
                if available, otherwise it falls back to the default form.
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
              disabled={createMutation.isPending || !taskSubjectId || !formyoulaFormId.trim()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? "Creating..." : "Create Form Mapping"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
