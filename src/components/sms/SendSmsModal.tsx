"use client";

/**
 * Send SMS Modal
 *
 * Modal for sending SMS messages using templates or custom messages.
 */

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { useSmsTemplates, useSendSms, usePreviewSmsTemplate } from "@/src/hooks/useSms";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Spinner } from "../ui/Spinner";
import { Toast, ToastType } from "../ui/Toast";
import { SmsTemplate, getLanguageLabel } from "@/src/types";

interface SendSmsModalProps {
  entityId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type SendMode = "template" | "custom";

export function SendSmsModal({ entityId, isOpen, onClose, onSuccess }: SendSmsModalProps) {
  const { data: templates, isLoading: templatesLoading } = useSmsTemplates({
    entity_id: entityId,
    is_active: true,
  });
  const sendMutation = useSendSms();
  const previewMutation = usePreviewSmsTemplate();

  // Form state
  const [sendMode, setSendMode] = useState<SendMode>("template");
  const [phone, setPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientType, setRecipientType] = useState("customer");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [previewMessage, setPreviewMessage] = useState("");
  const [characterCount, setCharacterCount] = useState(0);
  const [segmentCount, setSegmentCount] = useState(0);

  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    message: string;
  }>({ visible: false, type: "success", message: "" });

  // Get selected template object
  const selectedTemplate = templates?.find((t: SmsTemplate) => t.id === selectedTemplateId);

  // Group templates by code for display
  const templatesByCode =
    templates?.reduce(
      (acc: Record<string, SmsTemplate[]>, template: SmsTemplate) => {
        if (!acc[template.code]) {
          acc[template.code] = [];
        }
        acc[template.code].push(template);
        return acc;
      },
      {} as Record<string, SmsTemplate[]>
    ) || {};

  // Reset variables when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const newVariables: Record<string, string> = {};
      selectedTemplate.variables.forEach((v) => {
        newVariables[v] = "";
      });
      setVariables(newVariables);
      setPreviewMessage("");
    }
  }, [selectedTemplate]);

  // Update character count for custom message
  useEffect(() => {
    if (sendMode === "custom") {
      setCharacterCount(customMessage.length);
      // Rough segment estimate (GSM-7)
      setSegmentCount(Math.ceil(customMessage.length / 160) || 0);
    }
  }, [customMessage, sendMode]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPhone("");
      setRecipientName("");
      setRecipientType("customer");
      setSelectedTemplateId("");
      setCustomMessage("");
      setVariables({});
      setPreviewMessage("");
      setCharacterCount(0);
      setSegmentCount(0);
    }
  }, [isOpen]);

  const handlePreview = async () => {
    if (!selectedTemplateId || !selectedTemplate) return;

    // Check if all variables are filled
    const missingVars = selectedTemplate.variables.filter((v) => !variables[v]);
    if (missingVars.length > 0) {
      setToast({
        visible: true,
        type: "warning",
        message: `Please fill in all variables: ${missingVars.join(", ")}`,
      });
      return;
    }

    try {
      const result = await previewMutation.mutateAsync({
        templateId: selectedTemplateId,
        data: { variables },
      });
      setPreviewMessage(result.rendered_message);
      setCharacterCount(result.character_count);
      setSegmentCount(result.segment_count);
    } catch (err) {
      setToast({
        visible: true,
        type: "error",
        message: err instanceof Error ? err.message : "Preview failed",
      });
    }
  };

  const handleSend = async () => {
    if (!phone) {
      setToast({
        visible: true,
        type: "error",
        message: "Please enter a phone number",
      });
      return;
    }

    if (sendMode === "template") {
      if (!selectedTemplateId || !selectedTemplate) {
        setToast({
          visible: true,
          type: "error",
          message: "Please select a template",
        });
        return;
      }

      // Check if all variables are filled
      const missingVars = selectedTemplate.variables.filter((v) => !variables[v]);
      if (missingVars.length > 0) {
        setToast({
          visible: true,
          type: "warning",
          message: `Please fill in all variables: ${missingVars.join(", ")}`,
        });
        return;
      }
    } else {
      if (!customMessage) {
        setToast({
          visible: true,
          type: "error",
          message: "Please enter a message",
        });
        return;
      }
    }

    try {
      const result = await sendMutation.mutateAsync({
        entity_id: entityId,
        phone,
        template_code: sendMode === "template" ? selectedTemplate?.code : undefined,
        message: sendMode === "custom" ? customMessage : undefined,
        variables: sendMode === "template" ? variables : undefined,
        language: sendMode === "template" ? selectedTemplate?.language : undefined,
        recipient_name: recipientName || undefined,
        recipient_type: recipientType,
      });

      setToast({
        visible: true,
        type: result.success ? "success" : "error",
        message: result.message,
      });

      if (result.success) {
        onSuccess?.();
        setTimeout(onClose, 1500);
      }
    } catch (err) {
      setToast({
        visible: true,
        type: "error",
        message: err instanceof Error ? err.message : "Failed to send SMS",
      });
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-light flex items-start justify-between">
            <div>
              <Dialog.Title className="text-xl font-heading font-bold text-text-primary">
                Send SMS
              </Dialog.Title>
              <p className="text-sm text-text-secondary mt-0.5">
                Send an SMS message to a recipient
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
            {/* Send Mode Toggle */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Message Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSendMode("template")}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                    sendMode === "template"
                      ? "bg-primary text-white"
                      : "bg-background-light text-text-secondary hover:bg-gray-200"
                  }`}
                >
                  Use Template
                </button>
                <button
                  type="button"
                  onClick={() => setSendMode("custom")}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                    sendMode === "custom"
                      ? "bg-primary text-white"
                      : "bg-background-light text-text-secondary hover:bg-gray-200"
                  }`}
                >
                  Custom Message
                </button>
              </div>
            </div>

            {/* Recipient Information */}
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-3">Recipient</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254712345678"
                  required
                />
                <Input
                  label="Name (Optional)"
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Recipient Type
                </label>
                <Select value={recipientType} onChange={(e) => setRecipientType(e.target.value)}>
                  <option value="customer">Customer</option>
                  <option value="mason">Mason</option>
                  <option value="employee">Employee</option>
                  <option value="other">Other</option>
                </Select>
              </div>
            </div>

            {/* Template Selection */}
            {sendMode === "template" && (
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-3">Template</h3>
                {templatesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="md" />
                  </div>
                ) : templates && templates.length > 0 ? (
                  <>
                    <Select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                    >
                      <option value="">Select a template...</option>
                      {Object.entries(templatesByCode).map(([code, codeTemplates]) => (
                        <optgroup key={code} label={code.replace(/_/g, " ").toUpperCase()}>
                          {(codeTemplates as SmsTemplate[]).map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.name} ({getLanguageLabel(template.language)})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </Select>

                    {/* Template Variables */}
                    {selectedTemplate && selectedTemplate.variables.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="text-sm font-medium text-text-secondary">Variables</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedTemplate.variables.map((variable) => (
                            <Input
                              key={variable}
                              label={variable.replace(/_/g, " ")}
                              type="text"
                              value={variables[variable] || ""}
                              onChange={(e) =>
                                setVariables((prev) => ({
                                  ...prev,
                                  [variable]: e.target.value,
                                }))
                              }
                              placeholder={`Enter ${variable}`}
                            />
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreview}
                          loading={previewMutation.isPending}
                        >
                          Preview Message
                        </Button>
                      </div>
                    )}

                    {/* Preview */}
                    {previewMessage && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-text-secondary mb-2">Preview</h4>
                        <div className="bg-background-light rounded-lg p-4">
                          <p className="text-sm text-text-primary whitespace-pre-wrap">
                            {previewMessage}
                          </p>
                          <div className="flex gap-4 mt-3 pt-3 border-t border-border-light">
                            <span className="text-xs text-text-secondary">
                              {characterCount} characters
                            </span>
                            <span className="text-xs text-text-secondary">
                              {segmentCount} segment(s)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      No active templates available. Please create a template first.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Custom Message */}
            {sendMode === "custom" && (
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-3">Message</h3>
                <div>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={5}
                    className="w-full px-3 py-2 text-sm border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs text-text-secondary">{characterCount} characters</span>
                    <span className="text-xs text-text-secondary">{segmentCount} segment(s)</span>
                    {characterCount > 0 && (
                      <span className="text-xs text-text-secondary">
                        {characterCount <= 160 ? "Single SMS" : `${segmentCount} SMS messages`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border-light bg-background-light">
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSend}
                loading={sendMutation.isPending}
                disabled={sendMutation.isPending}
              >
                Send SMS
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </div>

      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </Dialog>
  );
}
