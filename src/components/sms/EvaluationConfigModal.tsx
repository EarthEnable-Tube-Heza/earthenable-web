"use client";

/**
 * Evaluation SMS Config Modal
 *
 * Modal for creating/editing evaluation SMS notification configs.
 */

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import {
  useEvaluationSmsConfig,
  useCreateEvaluationSmsConfig,
  useUpdateEvaluationSmsConfig,
  useDeleteEvaluationSmsConfig,
  useTaskSubjectsForSms,
  useSmsTemplates,
} from "@/src/hooks/useSms";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Spinner } from "../ui/Spinner";
import { Toast, ToastType } from "../ui/Toast";
import { RECIPIENT_TYPES, getRecipientTypeLabel, getLanguageLabel } from "@/src/types/sms";

interface EvaluationConfigModalProps {
  entityId: string;
  configId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EvaluationConfigModal({
  entityId,
  configId,
  isOpen,
  onClose,
}: EvaluationConfigModalProps) {
  const isEditing = !!configId;

  const { data: existingConfig, isLoading } = useEvaluationSmsConfig(configId || undefined);
  const { data: taskSubjects, isLoading: isLoadingSubjects } = useTaskSubjectsForSms();
  const { data: templates, isLoading: isLoadingTemplates } = useSmsTemplates(
    entityId ? { entity_id: entityId } : undefined
  );

  const createMutation = useCreateEvaluationSmsConfig();
  const updateMutation = useUpdateEvaluationSmsConfig();
  const deleteMutation = useDeleteEvaluationSmsConfig();

  // Form state
  const [taskSubjectId, setTaskSubjectId] = useState("");
  const [recipientType, setRecipientType] = useState<string>(RECIPIENT_TYPES.MASON);
  const [qaSubjectMapping, setQaSubjectMapping] = useState("");
  const [passTemplateId, setPassTemplateId] = useState("");
  const [failTemplateId, setFailTemplateId] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);

  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    message: string;
  }>({ visible: false, type: "success", message: "" });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (existingConfig && isEditing) {
      setTaskSubjectId(existingConfig.task_subject_id);
      setRecipientType(existingConfig.recipient_type);
      setQaSubjectMapping(existingConfig.qa_subject_mapping || "");
      setPassTemplateId(existingConfig.pass_template_id || "");
      setFailTemplateId(existingConfig.fail_template_id || "");
      setIsEnabled(existingConfig.is_enabled);
    } else if (!isEditing && isOpen) {
      // Reset form for new config
      setTaskSubjectId("");
      setRecipientType(RECIPIENT_TYPES.MASON);
      setQaSubjectMapping("");
      setPassTemplateId("");
      setFailTemplateId("");
      setIsEnabled(true);
    }
  }, [existingConfig, isEditing, isOpen]);

  const showToast = (type: ToastType, message: string) => {
    setToast({ visible: true, type, message });
  };

  const handleSave = async () => {
    if (!taskSubjectId) {
      showToast("error", "Please select a task subject");
      return;
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          configId: configId!,
          data: {
            recipient_type: recipientType,
            qa_subject_mapping: qaSubjectMapping || undefined,
            pass_template_id: passTemplateId || undefined,
            fail_template_id: failTemplateId || undefined,
            is_enabled: isEnabled,
          },
        });
        showToast("success", "Configuration updated successfully");
      } else {
        await createMutation.mutateAsync({
          entity_id: entityId,
          task_subject_id: taskSubjectId,
          recipient_type: recipientType,
          qa_subject_mapping: qaSubjectMapping || undefined,
          pass_template_id: passTemplateId || undefined,
          fail_template_id: failTemplateId || undefined,
          is_enabled: isEnabled,
        });
        showToast("success", "Configuration created successfully");
      }
      setTimeout(onClose, 500);
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Failed to save configuration");
    }
  };

  const handleDelete = async () => {
    if (!configId) return;

    try {
      await deleteMutation.mutateAsync(configId);
      showToast("success", "Configuration deleted successfully");
      setTimeout(onClose, 500);
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Failed to delete configuration");
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  // Group templates by code for easier selection
  const templateOptions =
    templates?.map((t) => ({
      id: t.id,
      label: `${t.name} (${getLanguageLabel(t.language)})`,
      code: t.code,
    })) || [];

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-lg shadow-xl">
            <div className="p-6">
              <Dialog.Title className="text-lg font-medium text-text-primary">
                {isEditing ? "Edit Automation" : "Create Automation"}
              </Dialog.Title>

              {isLoading || isLoadingSubjects || isLoadingTemplates ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {/* Task Subject */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Task Subject *
                    </label>
                    <Select
                      value={taskSubjectId}
                      onChange={(e) => setTaskSubjectId(e.target.value)}
                      disabled={isEditing}
                    >
                      <option value="">Select task subject</option>
                      {taskSubjects?.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </Select>
                    {isEditing && (
                      <p className="text-xs text-text-secondary mt-1">
                        Task subject cannot be changed after creation
                      </p>
                    )}
                  </div>

                  {/* Recipient Type */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Recipient Type *
                    </label>
                    <Select
                      value={recipientType}
                      onChange={(e) => setRecipientType(e.target.value)}
                    >
                      {Object.values(RECIPIENT_TYPES).map((type) => (
                        <option key={type} value={type}>
                          {getRecipientTypeLabel(type)}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* QA Subject Mapping */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      QA Subject Mapping
                    </label>
                    <Input
                      value={qaSubjectMapping}
                      onChange={(e) => setQaSubjectMapping(e.target.value)}
                      placeholder="e.g., Screed Evaluation"
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      Maps to QA survey subject field (leave empty for any)
                    </p>
                  </div>

                  {/* Pass Template */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Pass Template
                    </label>
                    <Select
                      value={passTemplateId}
                      onChange={(e) => setPassTemplateId(e.target.value)}
                    >
                      <option value="">Use default template</option>
                      {templateOptions.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Fail Template */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Fail Template
                    </label>
                    <Select
                      value={failTemplateId}
                      onChange={(e) => setFailTemplateId(e.target.value)}
                    >
                      <option value="">Use default template</option>
                      {templateOptions.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Enabled Toggle */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isEnabled"
                      checked={isEnabled}
                      onChange={(e) => setIsEnabled(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="isEnabled" className="text-sm font-medium text-text-secondary">
                      Enable this automation
                    </label>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex justify-between">
                <div>
                  {isEditing && (
                    <Button
                      variant="danger"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeleting || isSaving}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isSaving || !taskSubjectId}
                    loading={isSaving}
                  >
                    {isEditing ? "Save Changes" : "Create"}
                  </Button>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm w-full bg-white rounded-lg shadow-xl p-6">
            <Dialog.Title className="text-lg font-medium text-text-primary">
              Delete Automation
            </Dialog.Title>
            <p className="mt-2 text-sm text-text-secondary">
              Are you sure you want to delete this automation? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={isDeleting}>
                Delete
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Toast */}
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />
    </>
  );
}
