"use client";

/**
 * SMS Template Modal
 *
 * Modal for creating/editing SMS templates.
 */

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import {
  useSmsTemplate,
  useCreateSmsTemplate,
  useUpdateSmsTemplate,
  useDeleteSmsTemplate,
  usePreviewSmsTemplate,
} from "@/src/hooks/useSms";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Spinner } from "../ui/Spinner";
import { Badge } from "../ui/Badge";
import { Toast, ToastType } from "../ui/Toast";
import { SMS_TEMPLATE_CODES, SMS_TEMPLATE_CATEGORIES, SMS_LANGUAGES } from "@/src/types/sms";
import { cn } from "@/src/lib/theme";

interface SmsTemplateModalProps {
  entityId: string;
  templateId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SmsTemplateModal({ entityId, templateId, isOpen, onClose }: SmsTemplateModalProps) {
  const isEditing = !!templateId;

  const { data: existingTemplate, isLoading } = useSmsTemplate(templateId || undefined);
  const createMutation = useCreateSmsTemplate();
  const updateMutation = useUpdateSmsTemplate();
  const deleteMutation = useDeleteSmsTemplate();
  const previewMutation = usePreviewSmsTemplate();

  // Form state
  const [code, setCode] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [language, setLanguage] = useState("en");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [variables, setVariables] = useState<string[]>([]);
  const [newVariable, setNewVariable] = useState("");
  const [category, setCategory] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Preview state
  const [previewVars, setPreviewVars] = useState<Record<string, string>>({});
  const [previewResult, setPreviewResult] = useState<{
    message: string;
    chars: number;
    segments: number;
    encoding: string;
  } | null>(null);

  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    message: string;
  }>({ visible: false, type: "success", message: "" });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (existingTemplate && isEditing) {
      setCode(existingTemplate.code);
      setLanguage(existingTemplate.language);
      setName(existingTemplate.name);
      setDescription(existingTemplate.description || "");
      setTemplateBody(existingTemplate.template_body);
      setVariables(existingTemplate.variables);
      setCategory(existingTemplate.category || "");
      setIsActive(existingTemplate.is_active);
    } else if (!isEditing) {
      // Reset form for new template
      setCode("");
      setCustomCode("");
      setLanguage("en");
      setName("");
      setDescription("");
      setTemplateBody("");
      setVariables([]);
      setCategory("");
      setIsActive(true);
    }
  }, [existingTemplate, isEditing, isOpen]);

  // Update preview vars when variables change
  useEffect(() => {
    setPreviewVars((prev) => {
      const newPreviewVars: Record<string, string> = {};
      variables.forEach((v) => {
        newPreviewVars[v] = prev[v] || `[${v}]`;
      });
      return newPreviewVars;
    });
  }, [variables]);

  const handleAddVariable = () => {
    if (newVariable && !variables.includes(newVariable)) {
      setVariables([...variables, newVariable]);
      setNewVariable("");
    }
  };

  const handleRemoveVariable = (v: string) => {
    setVariables(variables.filter((x) => x !== v));
  };

  const handlePreview = async () => {
    if (!templateId) {
      setToast({
        visible: true,
        type: "error",
        message: "Save the template first to preview",
      });
      return;
    }

    try {
      const result = await previewMutation.mutateAsync({
        templateId,
        data: { variables: previewVars },
      });
      setPreviewResult({
        message: result.rendered_message,
        chars: result.character_count,
        segments: result.segment_count,
        encoding: result.encoding,
      });
    } catch (err) {
      setToast({
        visible: true,
        type: "error",
        message: err instanceof Error ? err.message : "Preview failed",
      });
    }
  };

  const handleSubmit = async () => {
    const finalCode = code === "custom" ? customCode : code;

    if (!finalCode) {
      setToast({ visible: true, type: "error", message: "Please enter a template code" });
      return;
    }
    if (!name) {
      setToast({ visible: true, type: "error", message: "Please enter a template name" });
      return;
    }
    if (!templateBody) {
      setToast({ visible: true, type: "error", message: "Please enter the template body" });
      return;
    }

    try {
      if (isEditing && templateId) {
        await updateMutation.mutateAsync({
          templateId,
          data: {
            name,
            description: description || undefined,
            template_body: templateBody,
            variables,
            category: category || undefined,
            is_active: isActive,
          },
        });
        setToast({
          visible: true,
          type: "success",
          message: "Template updated successfully",
        });
      } else {
        await createMutation.mutateAsync({
          entity_id: entityId,
          code: finalCode,
          language,
          name,
          description: description || undefined,
          template_body: templateBody,
          variables,
          category: category || undefined,
          is_active: isActive,
        });
        setToast({
          visible: true,
          type: "success",
          message: "Template created successfully",
        });
      }
      setTimeout(onClose, 1500);
    } catch (err) {
      setToast({
        visible: true,
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save template",
      });
    }
  };

  const handleDelete = async () => {
    if (!templateId) return;

    try {
      await deleteMutation.mutateAsync(templateId);
      setToast({
        visible: true,
        type: "success",
        message: "Template deleted successfully",
      });
      setTimeout(onClose, 1500);
    } catch (err) {
      setToast({
        visible: true,
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete template",
      });
    }
    setShowDeleteConfirm(false);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-light flex items-start justify-between">
            <div>
              <Dialog.Title className="text-xl font-heading font-bold text-text-primary">
                {isEditing ? "Edit Template" : "Create Template"}
              </Dialog.Title>
              <p className="text-sm text-text-secondary mt-0.5">
                {isEditing
                  ? "Modify the SMS template"
                  : "Create a new SMS template with Jinja2 syntax"}
              </p>
            </div>
            <button
              onClick={onClose}
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
            {isLoading && isEditing ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
                {/* Template Identification */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Template Code
                    </label>
                    {isEditing ? (
                      <Input type="text" value={code} disabled />
                    ) : (
                      <Select value={code} onChange={(e) => setCode(e.target.value)}>
                        <option value="">Select code...</option>
                        <option value={SMS_TEMPLATE_CODES.PROJECT_PROGRESS}>
                          project_progress
                        </option>
                        <option value={SMS_TEMPLATE_CODES.PAYMENT_RECEIPT}>payment_receipt</option>
                        <option value={SMS_TEMPLATE_CODES.MASON_EVALUATION_PASS}>
                          mason_evaluation_pass
                        </option>
                        <option value={SMS_TEMPLATE_CODES.MASON_EVALUATION_FAIL}>
                          mason_evaluation_fail
                        </option>
                        <option value="custom">Custom...</option>
                      </Select>
                    )}
                  </div>
                  {code === "custom" && !isEditing && (
                    <Input
                      label="Custom Code"
                      type="text"
                      value={customCode}
                      onChange={(e) =>
                        setCustomCode(e.target.value.toLowerCase().replace(/\s/g, "_"))
                      }
                      placeholder="my_template_code"
                    />
                  )}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Language
                    </label>
                    <Select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      disabled={isEditing}
                    >
                      <option value={SMS_LANGUAGES.ENGLISH}>English</option>
                      <option value={SMS_LANGUAGES.KINYARWANDA}>Kinyarwanda</option>
                      <option value={SMS_LANGUAGES.SWAHILI}>Swahili</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Category
                    </label>
                    <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="">Select category...</option>
                      <option value={SMS_TEMPLATE_CATEGORIES.CUSTOMER}>Customer</option>
                      <option value={SMS_TEMPLATE_CATEGORIES.MASON}>Mason</option>
                      <option value={SMS_TEMPLATE_CATEGORIES.EMPLOYEE}>Employee</option>
                      <option value={SMS_TEMPLATE_CATEGORIES.ADMIN}>Admin</option>
                    </Select>
                  </div>
                </div>

                {/* Name & Description */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Template Name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Project Progress Update"
                    required
                  />
                  <Input
                    label="Description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description"
                  />
                </div>

                {/* Variables */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Template Variables
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {variables.map((v) => (
                      <Badge key={v} variant="default" className="flex items-center gap-1 pr-1">
                        <code className="text-xs">{`{{ ${v} }}`}</code>
                        <button
                          onClick={() => handleRemoveVariable(v)}
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
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newVariable}
                      onChange={(e) => setNewVariable(e.target.value.replace(/\s/g, "_"))}
                      placeholder="variable_name"
                      className="flex-1"
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), handleAddVariable())
                      }
                    />
                    <Button variant="outline" size="sm" onClick={handleAddVariable}>
                      Add Variable
                    </Button>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    Use variables in template body as {`{{ variable_name }}`}
                  </p>
                </div>

                {/* Template Body */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Template Body <span className="text-status-error">*</span>
                  </label>
                  <textarea
                    className={cn(
                      "w-full px-3 py-2 rounded-lg border border-border-light",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50",
                      "text-sm text-text-primary placeholder:text-text-secondary",
                      "font-mono"
                    )}
                    rows={4}
                    value={templateBody}
                    onChange={(e) => setTemplateBody(e.target.value)}
                    placeholder="Hi {{ customer_name }}, your project {{ project_id }} has reached {{ status }}."
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    GSM-7: 160 chars/1 segment, 153/segment after. Unicode: 70 chars/1 segment.
                  </p>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-sm text-text-primary">
                    Template is active
                  </label>
                </div>

                {/* Preview Section */}
                {isEditing && (
                  <div className="border-t border-border-light pt-4">
                    <h3 className="text-sm font-medium text-text-primary mb-3">Preview</h3>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      {variables.map((v) => (
                        <Input
                          key={v}
                          label={v}
                          type="text"
                          value={previewVars[v] || ""}
                          onChange={(e) => setPreviewVars({ ...previewVars, [v]: e.target.value })}
                          placeholder={`Enter ${v}...`}
                        />
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreview}
                      loading={previewMutation.isPending}
                    >
                      Generate Preview
                    </Button>

                    {previewResult && (
                      <div className="mt-3 p-3 bg-background-light rounded-lg">
                        <div className="text-sm text-text-primary mb-2">
                          {previewResult.message}
                        </div>
                        <div className="flex gap-4 text-xs text-text-secondary">
                          <span>Characters: {previewResult.chars}</span>
                          <span>Segments: {previewResult.segments}</span>
                          <span>Encoding: {previewResult.encoding}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border-light bg-background-light">
            <div className="flex justify-between">
              <div>
                {isEditing && (
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  loading={isPending}
                  disabled={isPending}
                >
                  {isEditing ? "Update Template" : "Create Template"}
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        className="relative z-[60]"
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <Dialog.Title className="text-lg font-medium text-text-primary">
              Delete Template?
            </Dialog.Title>
            <p className="mt-2 text-sm text-text-secondary">
              Are you sure you want to delete this template? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={deleteMutation.isPending}>
                Delete
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </Dialog>
  );
}
