"use client";

/**
 * Voice Settings Form Component
 *
 * Form for configuring voice/call center settings for an entity.
 */

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/src/lib/theme";
import { VoiceSettings, VoiceSettingsUpdate } from "@/src/types/voice";
import {
  Button,
  Input,
  Card,
  Badge,
  Spinner,
  LabeledSelect,
  ResultModal,
} from "@/src/components/ui";
import type { ResultModalVariant } from "@/src/components/ui/ResultModal";

interface ResultModalState {
  isOpen: boolean;
  variant: ResultModalVariant;
  title: string;
  message: string;
  secondaryMessage?: string;
  actionLabel?: string;
}

interface VoiceSettingsFormProps {
  /** Current settings */
  settings: VoiceSettings | null;
  /** Selected entity ID for callback URL generation */
  entityId?: string;
  /** Whether settings are loading */
  isLoading?: boolean;
  /** Callback when settings are saved */
  onSave: (data: VoiceSettingsUpdate) => void;
  /** Whether saving is in progress */
  isSaving?: boolean;
  /** Whether save was successful (triggers result modal) */
  isSaveSuccess?: boolean;
  /** Whether save failed (triggers result modal) */
  isSaveError?: boolean;
  /** Error message when save fails */
  saveError?: string;
  /** Callback to reset save state after modal is dismissed */
  onResetSaveState?: () => void;
  /** Callback to test connection */
  onTest?: () => void;
  /** Whether test is in progress */
  isTesting?: boolean;
  /** Additional class name */
  className?: string;
}

export function VoiceSettingsForm({
  settings,
  entityId,
  isLoading = false,
  onSave,
  isSaving = false,
  isSaveSuccess = false,
  isSaveError = false,
  saveError,
  onResetSaveState,
  onTest,
  isTesting = false,
  className,
}: VoiceSettingsFormProps) {
  // Generate the actual callback URL based on API base URL and entity ID
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.earthenable.org";
  const webhookBaseUrl = entityId
    ? `${apiBaseUrl}/api/v1/voice/webhooks/${entityId}`
    : `${apiBaseUrl}/api/v1/voice/webhooks/{entity_id}`;
  // Form state
  const [apiKey, setApiKey] = useState("");
  const [apiUsername, setApiUsername] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState("");
  const [recordingEnabled, setRecordingEnabled] = useState(true);
  const [recordingStorageUrl, setRecordingStorageUrl] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [useSandbox, setUseSandbox] = useState(true);
  const [webrtcEnabled, setWebrtcEnabled] = useState(true);
  const [dailyCallLimit, setDailyCallLimit] = useState(100);
  const [monthlyCallLimit, setMonthlyCallLimit] = useState(1000);
  const [costPerMinute, setCostPerMinute] = useState(0.05);
  const [currency, setCurrency] = useState("USD");
  const [acwTimeoutSeconds, setAcwTimeoutSeconds] = useState(0);

  // Result modal state
  const [resultModal, setResultModal] = useState<ResultModalState>({
    isOpen: false,
    variant: "info",
    title: "",
    message: "",
  });

  // ACW timeout options
  const acwTimeoutOptions = [
    { value: "0", label: "No auto-transition (manual only)" },
    { value: "30", label: "30 seconds" },
    { value: "60", label: "1 minute" },
    { value: "120", label: "2 minutes" },
    { value: "180", label: "3 minutes" },
    { value: "300", label: "5 minutes" },
    { value: "600", label: "10 minutes" },
    { value: "900", label: "15 minutes" },
  ];

  // Show result modal on save success/error
  useEffect(() => {
    if (isSaveSuccess) {
      setResultModal({
        isOpen: true,
        variant: "success",
        title: "Settings Saved",
        message: "Your voice settings have been saved successfully.",
        secondaryMessage: "Changes will take effect immediately for all agents.",
        actionLabel: "Done",
      });
    } else if (isSaveError) {
      setResultModal({
        isOpen: true,
        variant: "error",
        title: "Save Failed",
        message: saveError || "Failed to save voice settings.",
        secondaryMessage:
          "Please check your input and try again. If the problem persists, contact support.",
        actionLabel: "OK",
      });
    }
  }, [isSaveSuccess, isSaveError, saveError]);

  const closeResultModal = () => {
    setResultModal((prev) => ({ ...prev, isOpen: false }));
    onResetSaveState?.();
  };

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      setApiUsername(settings.api_username || "");
      setPhoneNumbers(settings.phone_numbers?.join(", ") || "");
      setRecordingEnabled(settings.recording_enabled);
      setRecordingStorageUrl(settings.recording_storage_url || "");
      setIsEnabled(settings.is_enabled);
      setUseSandbox(settings.use_sandbox);
      setWebrtcEnabled(settings.webrtc_enabled);
      setDailyCallLimit(settings.daily_call_limit);
      setMonthlyCallLimit(settings.monthly_call_limit);
      setCostPerMinute(settings.cost_per_minute);
      setCurrency(settings.currency);
      setAcwTimeoutSeconds(settings.acw_timeout_seconds ?? 0);
    }
  }, [settings]);

  // Handle save
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const updateData: VoiceSettingsUpdate = {
        api_key: apiKey || undefined,
        api_username: apiUsername || undefined,
        phone_numbers: phoneNumbers
          ? phoneNumbers
              .split(",")
              .map((n) => n.trim())
              .filter(Boolean)
          : undefined,
        recording_enabled: recordingEnabled,
        recording_storage_url: recordingStorageUrl || undefined,
        callback_base_url: webhookBaseUrl,
        is_enabled: isEnabled,
        use_sandbox: useSandbox,
        webrtc_enabled: webrtcEnabled,
        daily_call_limit: dailyCallLimit,
        monthly_call_limit: monthlyCallLimit,
        cost_per_minute: costPerMinute,
        currency: currency,
        acw_timeout_seconds: acwTimeoutSeconds,
      };

      onSave(updateData);
    },
    [
      apiKey,
      apiUsername,
      phoneNumbers,
      recordingEnabled,
      recordingStorageUrl,
      webhookBaseUrl,
      isEnabled,
      useSandbox,
      webrtcEnabled,
      dailyCallLimit,
      monthlyCallLimit,
      costPerMinute,
      currency,
      acwTimeoutSeconds,
      onSave,
    ]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" label="Loading settings..." />
      </div>
    );
  }

  return (
    <>
      {/* Result Modal for save feedback */}
      <ResultModal
        isOpen={resultModal.isOpen}
        variant={resultModal.variant}
        title={resultModal.title}
        message={resultModal.message}
        secondaryMessage={resultModal.secondaryMessage}
        actionLabel={resultModal.actionLabel || "OK"}
        onAction={closeResultModal}
      />

      <form onSubmit={handleSubmit} className={cn("space-y-6 pb-32", className)}>
        {/* Status Card */}
        <Card variant="bordered" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-heading font-semibold text-text-primary">Voice Status</h3>
              <p className="text-sm text-text-secondary mt-1">
                {settings?.is_configured
                  ? "Voice service is configured"
                  : "Voice service needs configuration"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={settings?.is_configured ? "success" : "warning"} size="sm">
                {settings?.is_configured ? "Configured" : "Not Configured"}
              </Badge>
              <Badge variant={settings?.is_enabled ? "success" : "default"} size="sm">
                {settings?.is_enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>

          {/* Usage Stats */}
          {settings && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border-light">
              <div>
                <p className="text-xs text-text-secondary">Daily Calls</p>
                <p className="text-lg font-heading font-bold text-text-primary">
                  {settings.daily_calls_made} / {settings.daily_call_limit}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">Monthly Calls</p>
                <p className="text-lg font-heading font-bold text-text-primary">
                  {settings.monthly_calls_made} / {settings.monthly_call_limit}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">Daily Remaining</p>
                <p className="text-lg font-heading font-bold text-status-success">
                  {settings.daily_remaining}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">Monthly Remaining</p>
                <p className="text-lg font-heading font-bold text-status-success">
                  {settings.monthly_remaining}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* API Credentials */}
        <Card variant="bordered" padding="md">
          <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
            Africa&apos;s Talking Credentials
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="API Username"
              placeholder="sandbox or your username"
              value={apiUsername}
              onChange={(e) => setApiUsername(e.target.value)}
            />
            <Input
              label="API Key"
              type="password"
              placeholder="Enter API key (leave blank to keep existing)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <Input
              label="Phone Numbers"
              placeholder="+254..., +254... (comma separated)"
              value={phoneNumbers}
              onChange={(e) => setPhoneNumbers(e.target.value)}
            />
            <p className="text-xs text-text-disabled mt-1">
              Your provisioned Africa&apos;s Talking phone numbers, comma separated
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useSandbox}
                onChange={(e) => setUseSandbox(e.target.checked)}
                className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-primary">Use Sandbox Environment</span>
            </label>
            <Badge variant={useSandbox ? "warning" : "success"} size="sm">
              {useSandbox ? "Sandbox" : "Production"}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={webrtcEnabled}
                onChange={(e) => setWebrtcEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-primary">Enable WebRTC (Browser Calls)</span>
            </label>
            <Badge variant={webrtcEnabled ? "success" : "default"} size="sm">
              {webrtcEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <p className="text-xs text-text-disabled mt-2">
            WebRTC must be enabled for agents to make/receive calls from the browser softphone
          </p>

          {onTest && (
            <div className="mt-4">
              <Button type="button" variant="outline" onClick={onTest} loading={isTesting}>
                Test Connection
              </Button>
            </div>
          )}
        </Card>

        {/* Recording Settings */}
        <Card variant="bordered" padding="md">
          <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
            Call Recording
          </h3>

          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={recordingEnabled}
                onChange={(e) => setRecordingEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-primary">Enable call recording</span>
            </label>

            {recordingEnabled && (
              <Input
                label="Recording Storage URL"
                placeholder="https://s3.amazonaws.com/bucket/recordings/"
                value={recordingStorageUrl}
                onChange={(e) => setRecordingStorageUrl(e.target.value)}
              />
            )}
          </div>
        </Card>

        {/* Agent Settings */}
        <Card variant="bordered" padding="md">
          <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
            Agent Settings
          </h3>

          <div className="space-y-4">
            <div className="max-w-md">
              <LabeledSelect
                label="After Call Work (ACW) Timeout"
                value={String(acwTimeoutSeconds)}
                onChange={(e) => setAcwTimeoutSeconds(parseInt(e.target.value))}
                options={acwTimeoutOptions}
                fullWidth={false}
              />
              <p className="text-xs text-text-disabled mt-2">
                When a call ends, agents enter &quot;After Call Work&quot; status. This setting
                controls how long before the agent is automatically set to &quot;Available&quot;.
                Set to &quot;No auto-transition&quot; to require agents to manually change their
                status.
              </p>
            </div>

            {acwTimeoutSeconds > 0 && (
              <div className="p-3 bg-status-info/10 border border-status-info/20 rounded-lg">
                <p className="text-sm text-status-info">
                  Agents will automatically transition from &quot;After Call Work&quot; to
                  &quot;Available&quot; after{" "}
                  {acwTimeoutSeconds >= 60
                    ? `${Math.floor(acwTimeoutSeconds / 60)} minute${acwTimeoutSeconds >= 120 ? "s" : ""}`
                    : `${acwTimeoutSeconds} seconds`}{" "}
                  if they don&apos;t manually change their status.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Webhook Settings */}
        <Card variant="bordered" padding="md">
          <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">Webhooks</h3>

          <div className="space-y-4">
            {/* Generated Callback Base URL */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Callback Base URL
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-background-light border border-border-light rounded-lg text-sm font-mono text-text-primary break-all">
                  {webhookBaseUrl}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(webhookBaseUrl);
                  }}
                  title="Copy to clipboard"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </Button>
              </div>
              <p className="text-xs text-text-disabled mt-1">
                This URL is automatically generated based on the selected entity
              </p>
            </div>

            {/* Individual Webhook Endpoints */}
            <div className="pt-4 border-t border-border-light">
              <p className="text-sm font-medium text-text-secondary mb-3">
                Configure these URLs in your Africa&apos;s Talking dashboard:
              </p>
              <div className="space-y-2">
                {[
                  { name: "Call Start (callUrl)", path: "/call-start" },
                  { name: "Call Notification (callbackUrl)", path: "/call-notification" },
                  { name: "Recording Ready", path: "/recording-ready" },
                  { name: "DTMF Input", path: "/dtmf" },
                ].map((endpoint) => (
                  <div key={endpoint.path} className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary w-48 flex-shrink-0">
                      {endpoint.name}:
                    </span>
                    <code className="flex-1 px-2 py-1 bg-background-light border border-border-light rounded text-xs font-mono text-text-primary break-all">
                      {webhookBaseUrl}
                      {endpoint.path}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${webhookBaseUrl}${endpoint.path}`);
                      }}
                      className="p-1 text-text-secondary hover:text-primary transition-colors"
                      title="Copy"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Limits & Costs */}
        <Card variant="bordered" padding="md">
          <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
            Limits & Costs
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Daily Call Limit"
              type="number"
              min={0}
              value={dailyCallLimit}
              onChange={(e) => setDailyCallLimit(parseInt(e.target.value) || 0)}
            />
            <Input
              label="Monthly Call Limit"
              type="number"
              min={0}
              value={monthlyCallLimit}
              onChange={(e) => setMonthlyCallLimit(parseInt(e.target.value) || 0)}
            />
            <Input
              label="Cost Per Minute"
              type="number"
              step="0.01"
              min={0}
              value={costPerMinute}
              onChange={(e) => setCostPerMinute(parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Currency"
              placeholder="USD"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>
        </Card>

        {/* Enable/Disable */}
        <Card variant="bordered" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-heading font-semibold text-text-primary">
                Enable Voice Service
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                {isEnabled
                  ? "Voice service is active and accepting calls"
                  : "Voice service is disabled - no calls can be made or received"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border-light peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-light after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" loading={isSaving}>
            Save Settings
          </Button>
        </div>
      </form>
    </>
  );
}
