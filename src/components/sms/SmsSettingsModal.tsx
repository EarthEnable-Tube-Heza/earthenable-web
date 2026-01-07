"use client";

/**
 * SMS Settings Modal
 *
 * Modal for configuring entity SMS settings.
 */

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import {
  useSmsSettings,
  useCreateSmsSettings,
  useUpdateSmsSettings,
  useTestSmsSettings,
} from "@/src/hooks/useSms";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Spinner } from "../ui/Spinner";
import { Toast, ToastType } from "../ui/Toast";

interface SmsSettingsModalProps {
  entityId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SmsSettingsModal({ entityId, isOpen, onClose }: SmsSettingsModalProps) {
  const { data: settings, isLoading } = useSmsSettings(entityId);
  const createMutation = useCreateSmsSettings();
  const updateMutation = useUpdateSmsSettings();
  const testMutation = useTestSmsSettings();

  // Form state
  const [apiUsername, setApiUsername] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [senderId, setSenderId] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [useSandbox, setUseSandbox] = useState(true);
  const [dailyLimit, setDailyLimit] = useState(1000);
  const [monthlyLimit, setMonthlyLimit] = useState(30000);
  const [costPerSms, setCostPerSms] = useState(0);
  const [currency, setCurrency] = useState("KES");
  const [budgetAlertThreshold, setBudgetAlertThreshold] = useState(80);

  // Test SMS state
  const [testPhone, setTestPhone] = useState("");

  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    message: string;
  }>({ visible: false, type: "success", message: "" });

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      setApiUsername(settings.api_username || "");
      setSenderId(settings.sender_id || "");
      setShortCode(settings.short_code || "");
      setIsEnabled(settings.is_enabled);
      setUseSandbox(settings.use_sandbox);
      setDailyLimit(settings.daily_limit);
      setMonthlyLimit(settings.monthly_limit);
      setCostPerSms(settings.cost_per_sms);
      setCurrency(settings.currency);
      setBudgetAlertThreshold(settings.budget_alert_threshold);
    }
  }, [settings]);

  const handleSubmit = async () => {
    try {
      if (settings) {
        // Update existing settings
        await updateMutation.mutateAsync({
          entityId,
          data: {
            api_username: apiUsername || undefined,
            api_key: apiKey || undefined,
            sender_id: senderId || undefined,
            short_code: shortCode || undefined,
            is_enabled: isEnabled,
            use_sandbox: useSandbox,
            daily_limit: dailyLimit,
            monthly_limit: monthlyLimit,
            cost_per_sms: costPerSms,
            currency,
            budget_alert_threshold: budgetAlertThreshold,
          },
        });
        setToast({
          visible: true,
          type: "success",
          message: "SMS settings updated successfully",
        });
      } else {
        // Create new settings
        await createMutation.mutateAsync({
          entity_id: entityId,
          api_username: apiUsername || undefined,
          api_key: apiKey || undefined,
          sender_id: senderId || undefined,
          short_code: shortCode || undefined,
          is_enabled: isEnabled,
          use_sandbox: useSandbox,
          daily_limit: dailyLimit,
          monthly_limit: monthlyLimit,
          cost_per_sms: costPerSms,
          currency,
          budget_alert_threshold: budgetAlertThreshold,
        });
        setToast({
          visible: true,
          type: "success",
          message: "SMS settings created successfully",
        });
      }
      setTimeout(onClose, 1500);
    } catch (err) {
      setToast({
        visible: true,
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save settings",
      });
    }
  };

  const handleTestSms = async () => {
    if (!testPhone) {
      setToast({
        visible: true,
        type: "error",
        message: "Please enter a phone number",
      });
      return;
    }

    try {
      const result = await testMutation.mutateAsync({
        entityId,
        data: { phone: testPhone },
      });
      setToast({
        visible: true,
        type: result.success ? "success" : "error",
        message: result.message,
      });
    } catch (err) {
      setToast({
        visible: true,
        type: "error",
        message: err instanceof Error ? err.message : "Test failed",
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-light flex items-start justify-between">
            <div>
              <Dialog.Title className="text-xl font-heading font-bold text-text-primary">
                SMS Settings
              </Dialog.Title>
              <p className="text-sm text-text-secondary mt-0.5">
                Configure Africa&apos;s Talking SMS for this entity
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
                {/* API Credentials */}
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-3">API Credentials</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="API Username"
                      type="text"
                      value={apiUsername}
                      onChange={(e) => setApiUsername(e.target.value)}
                      placeholder="sandbox or your username"
                    />
                    <Input
                      label="API Key"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Leave empty to keep existing"
                    />
                  </div>
                </div>

                {/* Sender Configuration */}
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-3">
                    Sender Configuration
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Sender ID"
                      type="text"
                      value={senderId}
                      onChange={(e) => setSenderId(e.target.value)}
                      placeholder="Max 11 characters"
                      maxLength={11}
                    />
                    <Input
                      label="Short Code"
                      type="text"
                      value={shortCode}
                      onChange={(e) => setShortCode(e.target.value)}
                      placeholder="Optional"
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* Feature Flags */}
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-3">Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isEnabled"
                        checked={isEnabled}
                        onChange={(e) => setIsEnabled(e.target.checked)}
                        className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary"
                      />
                      <label htmlFor="isEnabled" className="text-sm text-text-primary">
                        Enable SMS
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="useSandbox"
                        checked={useSandbox}
                        onChange={(e) => setUseSandbox(e.target.checked)}
                        className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary"
                      />
                      <label htmlFor="useSandbox" className="text-sm text-text-primary">
                        Use Sandbox (Testing)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Rate Limits */}
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-3">Rate Limits</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Daily Limit"
                      type="number"
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(parseInt(e.target.value) || 0)}
                      min={0}
                    />
                    <Input
                      label="Monthly Limit"
                      type="number"
                      value={monthlyLimit}
                      onChange={(e) => setMonthlyLimit(parseInt(e.target.value) || 0)}
                      min={0}
                    />
                  </div>
                </div>

                {/* Cost Tracking */}
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-3">Cost Tracking</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Cost per SMS"
                      type="number"
                      value={costPerSms}
                      onChange={(e) => setCostPerSms(parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min={0}
                    />
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Currency
                      </label>
                      <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        <option value="KES">KES (Kenya)</option>
                        <option value="RWF">RWF (Rwanda)</option>
                        <option value="UGX">UGX (Uganda)</option>
                        <option value="TZS">TZS (Tanzania)</option>
                        <option value="USD">USD</option>
                      </Select>
                    </div>
                    <Input
                      label="Budget Alert (%)"
                      type="number"
                      value={budgetAlertThreshold}
                      onChange={(e) => setBudgetAlertThreshold(parseFloat(e.target.value) || 0)}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                {/* Test SMS */}
                {settings?.is_configured && (
                  <div>
                    <h3 className="text-sm font-medium text-text-primary mb-3">Test SMS</h3>
                    <div className="flex gap-3">
                      <Input
                        type="text"
                        value={testPhone}
                        onChange={(e) => setTestPhone(e.target.value)}
                        placeholder="+254712345678"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={handleTestSms}
                        loading={testMutation.isPending}
                        disabled={testMutation.isPending}
                      >
                        Send Test
                      </Button>
                    </div>
                  </div>
                )}
              </>
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
                onClick={handleSubmit}
                loading={isPending}
                disabled={isPending}
              >
                {settings ? "Update Settings" : "Create Settings"}
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
