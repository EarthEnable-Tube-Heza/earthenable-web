"use client";

/**
 * Voice Settings Form Component
 *
 * Form for configuring voice/call center settings for an entity.
 */

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/src/lib/theme";
import { VoiceSettings, VoiceSettingsUpdate } from "@/src/types/voice";
import { Button, Input, Card, Badge, Spinner } from "@/src/components/ui";

interface VoiceSettingsFormProps {
  /** Current settings */
  settings: VoiceSettings | null;
  /** Whether settings are loading */
  isLoading?: boolean;
  /** Callback when settings are saved */
  onSave: (data: VoiceSettingsUpdate) => void;
  /** Whether saving is in progress */
  isSaving?: boolean;
  /** Callback to test connection */
  onTest?: () => void;
  /** Whether test is in progress */
  isTesting?: boolean;
  /** Additional class name */
  className?: string;
}

export function VoiceSettingsForm({
  settings,
  isLoading = false,
  onSave,
  isSaving = false,
  onTest,
  isTesting = false,
  className,
}: VoiceSettingsFormProps) {
  // Form state
  const [apiKey, setApiKey] = useState("");
  const [apiUsername, setApiUsername] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState("");
  const [recordingEnabled, setRecordingEnabled] = useState(true);
  const [recordingStorageUrl, setRecordingStorageUrl] = useState("");
  const [callbackBaseUrl, setCallbackBaseUrl] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [useSandbox, setUseSandbox] = useState(true);
  const [webrtcEnabled, setWebrtcEnabled] = useState(true);
  const [dailyCallLimit, setDailyCallLimit] = useState(100);
  const [monthlyCallLimit, setMonthlyCallLimit] = useState(1000);
  const [costPerMinute, setCostPerMinute] = useState(0.05);
  const [currency, setCurrency] = useState("USD");

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      setApiUsername(settings.api_username || "");
      setPhoneNumbers(settings.phone_numbers?.join(", ") || "");
      setRecordingEnabled(settings.recording_enabled);
      setRecordingStorageUrl(settings.recording_storage_url || "");
      setCallbackBaseUrl(settings.callback_base_url || "");
      setIsEnabled(settings.is_enabled);
      setUseSandbox(settings.use_sandbox);
      setWebrtcEnabled(settings.webrtc_enabled);
      setDailyCallLimit(settings.daily_call_limit);
      setMonthlyCallLimit(settings.monthly_call_limit);
      setCostPerMinute(settings.cost_per_minute);
      setCurrency(settings.currency);
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
        callback_base_url: callbackBaseUrl || undefined,
        is_enabled: isEnabled,
        use_sandbox: useSandbox,
        webrtc_enabled: webrtcEnabled,
        daily_call_limit: dailyCallLimit,
        monthly_call_limit: monthlyCallLimit,
        cost_per_minute: costPerMinute,
        currency: currency,
      };

      onSave(updateData);
    },
    [
      apiKey,
      apiUsername,
      phoneNumbers,
      recordingEnabled,
      recordingStorageUrl,
      callbackBaseUrl,
      isEnabled,
      useSandbox,
      webrtcEnabled,
      dailyCallLimit,
      monthlyCallLimit,
      costPerMinute,
      currency,
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
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
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

      {/* Webhook Settings */}
      <Card variant="bordered" padding="md">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">Webhooks</h3>

        <Input
          label="Callback Base URL"
          placeholder="https://api.yourdomain.com/api/v1/voice/webhooks"
          value={callbackBaseUrl}
          onChange={(e) => setCallbackBaseUrl(e.target.value)}
        />
        <p className="text-xs text-text-disabled mt-1">
          Base URL for Africa&apos;s Talking voice callbacks
        </p>
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
  );
}
