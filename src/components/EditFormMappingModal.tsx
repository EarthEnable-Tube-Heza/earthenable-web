'use client';

/**
 * Edit Form Mapping Modal
 *
 * Modal for editing FormYoula form ID for a TaskSubject mapping (admin only).
 */

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { TaskSubjectForm } from '../types/form';

interface EditFormMappingModalProps {
  mapping: TaskSubjectForm | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditFormMappingModal({ mapping, isOpen, onClose }: EditFormMappingModalProps) {
  const queryClient = useQueryClient();
  const [formId, setFormId] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Update form ID when mapping changes
  useEffect(() => {
    if (mapping) {
      setFormId(mapping.formyoula_form_id);
      setError(null);
    }
  }, [mapping]);

  // Update mapping mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, formyoula_form_id }: { id: string; formyoula_form_id: string }) =>
      apiClient.updateFormMapping(id, { formyoula_form_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-mappings'] });
      onClose();
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Failed to update form mapping');
    },
  });

  /**
   * Handle save
   */
  const handleSave = () => {
    if (!mapping) return;

    // Validate form ID
    if (!formId.trim()) {
      setError('Form ID cannot be empty');
      return;
    }

    setError(null);
    updateMutation.mutate({ id: mapping.id, formyoula_form_id: formId.trim() });
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    if (mapping) {
      setFormId(mapping.formyoula_form_id);
    }
    setError(null);
    onClose();
  };

  if (!mapping) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={handleCancel}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-large w-full max-w-md">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
            <Dialog.Title className="text-xl font-heading font-bold text-text-primary">
              Edit Form Mapping
            </Dialog.Title>
            <button
              onClick={handleCancel}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg
                className="w-6 h-6"
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

          {/* Content */}
          <div className="px-6 py-6 space-y-4">
            {/* Mapping Info */}
            <div className="bg-background-light p-4 rounded-lg space-y-2">
              <div>
                <span className="text-xs text-text-secondary">TaskSubject:</span>
                <p className="text-sm font-medium text-text-primary">
                  {mapping.task_subject_name}
                </p>
              </div>
              <div>
                <span className="text-xs text-text-secondary">Country:</span>
                <p className="text-sm font-medium text-text-primary">
                  {mapping.country_code}
                </p>
              </div>
              <div>
                <span className="text-xs text-text-secondary">Type:</span>
                <p className="text-sm">
                  {mapping.is_default ? (
                    <span className="px-2 py-1 text-xs font-medium bg-status-warning/10 text-status-warning rounded-full">
                      Default
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-status-info/10 text-status-info rounded-full">
                      Country-Specific
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Form ID Input */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                FormYoula Form ID
              </label>
              <input
                type="text"
                value={formId}
                onChange={(e) => {
                  setFormId(e.target.value);
                  setError(null);
                }}
                placeholder="Enter FormYoula form ID"
                className="w-full px-4 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                disabled={updateMutation.isPending}
              />
              <p className="text-xs text-text-secondary mt-1">
                The FormYoula form ID that should open for this TaskSubject in {mapping.country_code}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-status-error/10 border border-status-error rounded-md">
                <p className="text-status-error text-sm">{error}</p>
              </div>
            )}

            {/* Info Note */}
            <div className="bg-status-info/10 border border-status-info rounded-lg p-3">
              <p className="text-status-info text-xs">
                <strong>Note:</strong> This will update the FormYoula form ID for this specific
                TaskSubject-Country combination. Changes will affect the mobile app immediately.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border-light flex items-center justify-end gap-3">
            <button
              onClick={handleCancel}
              disabled={updateMutation.isPending}
              className="px-4 py-2 border border-border-light rounded-md text-text-primary hover:bg-background-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending || !formId.trim() || formId === mapping.formyoula_form_id}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
