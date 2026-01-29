"use client";

/**
 * Call Center Settings Page
 *
 * Admin page for configuring voice/call center settings with debug information.
 */

import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useVoiceSettings,
  useCreateVoiceSettings,
  useUpdateVoiceSettings,
  voiceQueryKeys,
} from "@/src/hooks/useCallCenter";
import { useSetPageHeader } from "@/src/contexts/PageHeaderContext";
import { PageTitle } from "@/src/components/dashboard/PageTitle";
import { PAGE_SPACING } from "@/src/lib/theme";
import { apiClient } from "@/src/lib/api";
import { VoiceSettingsForm, CallCenterHeader } from "@/src/components/call-center";
import { VoiceSettingsCreate, VoiceSettingsUpdate } from "@/src/types/voice";
import { useAuth } from "@/src/lib/auth";
import { Alert, Card, Badge, Spinner } from "@/src/components/ui";

// Status check item component
function StatusCheckItem({
  label,
  status,
  message,
  detail,
}: {
  label: string;
  status: "success" | "error" | "warning" | "loading";
  message: string;
  detail?: string;
}) {
  const icons = {
    success: (
      <svg
        className="w-5 h-5 text-status-success"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg
        className="w-5 h-5 text-status-error"
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
    ),
    warning: (
      <svg
        className="w-5 h-5 text-status-warning"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    loading: <Spinner size="sm" />,
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border-light last:border-0">
      <div className="flex-shrink-0 mt-0.5">{icons[status]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-text-primary">{label}</p>
          <Badge
            variant={status === "success" ? "success" : status === "error" ? "error" : "warning"}
            size="sm"
          >
            {message}
          </Badge>
        </div>
        {detail && <p className="text-xs text-text-secondary mt-1">{detail}</p>}
      </div>
    </div>
  );
}

export default function CallCenterSettingsPage() {
  const { user, selectedEntityId: rawEntityId, entityInfo } = useAuth();
  // Use global entity selection from auth context
  const selectedEntityId = rawEntityId || "";
  const selectedEntity = entityInfo?.accessible_entities.find((e) => e.id === selectedEntityId);

  // Fetch voice settings
  const {
    data: settings,
    isLoading: isSettingsLoading,
    error: settingsError,
    refetch,
  } = useVoiceSettings(selectedEntityId);

  // Fetch agent status (no polling for settings page)
  const {
    data: agentStatus,
    isLoading: isAgentLoading,
    error: agentError,
  } = useQuery({
    queryKey: voiceQueryKeys.myStatus(),
    queryFn: () => apiClient.getMyAgentStatus(selectedEntityId!),
    enabled: !!selectedEntityId,
    refetchInterval: false, // No polling on settings page
    retry: 1,
  });

  // Fetch WebRTC config (no polling for settings page)
  const {
    data: webrtcConfig,
    isLoading: isWebRTCLoading,
    error: webrtcError,
  } = useQuery({
    queryKey: voiceQueryKeys.webrtcConfig(),
    queryFn: () => apiClient.getWebRTCConfig(selectedEntityId!),
    enabled: !!selectedEntityId,
    refetchInterval: false, // No polling on settings page
    retry: 1,
  });

  // Mutations
  const createMutation = useCreateVoiceSettings();
  const updateMutation = useUpdateVoiceSettings();

  // Save state for result modal
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Reset save state (called when modal is dismissed)
  const resetSaveState = useCallback(() => {
    setSaveSuccess(false);
    setSaveError(null);
  }, []);

  // Handle save
  const handleSave = useCallback(
    (data: VoiceSettingsUpdate) => {
      if (!selectedEntityId) return;

      // Reset previous state
      resetSaveState();

      if (settings) {
        updateMutation.mutate(
          { entityId: selectedEntityId, data },
          {
            onSuccess: () => {
              setSaveSuccess(true);
              refetch();
            },
            onError: (error) => {
              setSaveError(error instanceof Error ? error.message : "Unknown error");
            },
          }
        );
      } else {
        // Create new settings
        const createData: VoiceSettingsCreate = {
          entity_id: selectedEntityId,
          ...data,
        };
        createMutation.mutate(createData, {
          onSuccess: () => {
            setSaveSuccess(true);
            refetch();
          },
          onError: (error) => {
            setSaveError(error instanceof Error ? error.message : "Unknown error");
          },
        });
      }
    },
    [selectedEntityId, settings, updateMutation, createMutation, refetch, resetSaveState]
  );

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Compute status checks (memoized to prevent re-renders)
  // Must be before any early returns to follow React hooks rules
  const checks = useMemo(
    () => ({
      entitySelected: {
        status: selectedEntityId ? "success" : "error",
        message: selectedEntityId ? "Selected" : "Not Selected",
        detail: selectedEntityId
          ? `Entity: ${selectedEntity?.name || selectedEntityId}`
          : "You must select an entity to configure voice settings",
      },
      voiceSettings: {
        status: isSettingsLoading
          ? "loading"
          : settingsError
            ? "error"
            : settings
              ? "success"
              : "warning",
        message: isSettingsLoading
          ? "Loading..."
          : settingsError
            ? "Error"
            : settings
              ? "Found"
              : "Not Created",
        detail: settingsError
          ? `Error: ${settingsError instanceof Error ? settingsError.message : "Unknown error"}`
          : settings
            ? `Provider: ${settings.provider}, Enabled: ${settings.is_enabled}`
            : "Voice settings have not been created for this entity",
      },
      apiCredentials: {
        status: settings?.api_username ? "success" : "error",
        message: settings?.api_username ? "Configured" : "Missing",
        detail: settings?.api_username
          ? `Username: ${settings.api_username}`
          : "API username is required for Africa's Talking",
      },
      serviceEnabled: {
        status: settings?.is_enabled ? "success" : "warning",
        message: settings?.is_enabled ? "Enabled" : "Disabled",
        detail: settings?.is_enabled
          ? "Voice service is active"
          : "Voice service is disabled - enable it to make/receive calls",
      },
      webrtcEnabled: {
        status: settings?.webrtc_enabled ? "success" : "error",
        message: settings?.webrtc_enabled ? "Enabled" : "Disabled",
        detail: settings?.webrtc_enabled
          ? "WebRTC is enabled for browser-based calls"
          : "WebRTC must be enabled for the softphone to work",
      },
      webrtcConfig: {
        status: isWebRTCLoading
          ? "loading"
          : webrtcError
            ? "error"
            : webrtcConfig
              ? "success"
              : "warning",
        message: isWebRTCLoading
          ? "Loading..."
          : webrtcError
            ? "Error"
            : webrtcConfig
              ? "Available"
              : "Not Available",
        detail: webrtcError
          ? `Error: ${webrtcError instanceof Error ? webrtcError.message : "Unknown error"}`
          : webrtcConfig
            ? `Phone: ${webrtcConfig.phone_number}`
            : "WebRTC configuration not available from server",
      },
      agentStatus: {
        status: isAgentLoading
          ? "loading"
          : agentError
            ? "error"
            : agentStatus
              ? "success"
              : "warning",
        message: isAgentLoading
          ? "Loading..."
          : agentError
            ? "Error"
            : agentStatus
              ? agentStatus.status
              : "No Record",
        detail: agentError
          ? `Error: ${agentError instanceof Error ? agentError.message : "Unknown error"}`
          : agentStatus
            ? `Current status: ${agentStatus.status}`
            : "Agent status record not found - will be created on first status change",
      },
    }),
    [
      selectedEntityId,
      selectedEntity,
      isSettingsLoading,
      settingsError,
      settings,
      isWebRTCLoading,
      webrtcError,
      webrtcConfig,
      isAgentLoading,
      agentError,
      agentStatus,
    ]
  );

  useSetPageHeader({
    title: "Call Center Settings",
    pathLabels: { "call-center": "Call Center", settings: "Settings" },
  });

  // Early return for non-admin users (after all hooks)
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Alert variant="warning" title="Access Denied">
          You must be an admin to access call center settings.
        </Alert>
      </div>
    );
  }

  // Determine overall status
  const allGood =
    checks.entitySelected.status === "success" &&
    checks.voiceSettings.status === "success" &&
    checks.apiCredentials.status === "success" &&
    checks.serviceEnabled.status === "success" &&
    checks.webrtcEnabled.status === "success" &&
    checks.webrtcConfig.status === "success";

  return (
    <div className={PAGE_SPACING}>
      <PageTitle
        title="Call Center Settings"
        description="Configure voice service and Africa's Talking integration"
      />
      {/* Shared Header with Entity Selector */}
      <CallCenterHeader />

      {/* Debug Status Panel */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold text-text-primary">
            Setup Status Checklist
          </h2>
          <Badge variant={allGood ? "success" : "warning"} size="md">
            {allGood ? "Ready" : "Setup Required"}
          </Badge>
        </div>

        <div className="divide-y divide-border-light">
          <StatusCheckItem
            label="1. Entity Selected"
            status={checks.entitySelected.status as "success" | "error" | "warning" | "loading"}
            message={checks.entitySelected.message}
            detail={checks.entitySelected.detail}
          />
          <StatusCheckItem
            label="2. Voice Settings Record"
            status={checks.voiceSettings.status as "success" | "error" | "warning" | "loading"}
            message={checks.voiceSettings.message}
            detail={checks.voiceSettings.detail}
          />
          <StatusCheckItem
            label="3. API Credentials"
            status={checks.apiCredentials.status as "success" | "error" | "warning" | "loading"}
            message={checks.apiCredentials.message}
            detail={checks.apiCredentials.detail}
          />
          <StatusCheckItem
            label="4. Voice Service Enabled"
            status={checks.serviceEnabled.status as "success" | "error" | "warning" | "loading"}
            message={checks.serviceEnabled.message}
            detail={checks.serviceEnabled.detail}
          />
          <StatusCheckItem
            label="5. WebRTC Enabled"
            status={checks.webrtcEnabled.status as "success" | "error" | "warning" | "loading"}
            message={checks.webrtcEnabled.message}
            detail={checks.webrtcEnabled.detail}
          />
          <StatusCheckItem
            label="6. WebRTC Config from Server"
            status={checks.webrtcConfig.status as "success" | "error" | "warning" | "loading"}
            message={checks.webrtcConfig.message}
            detail={checks.webrtcConfig.detail}
          />
          <StatusCheckItem
            label="7. Agent Status Record"
            status={checks.agentStatus.status as "success" | "error" | "warning" | "loading"}
            message={checks.agentStatus.message}
            detail={checks.agentStatus.detail}
          />
        </div>

        {/* Debug Info */}
        <div className="mt-4 pt-4 border-t border-border-light">
          <details className="text-xs">
            <summary className="cursor-pointer text-text-secondary hover:text-text-primary">
              Show Debug Info
            </summary>
            <pre className="mt-2 p-3 bg-background-light rounded-lg overflow-auto text-text-secondary">
              {JSON.stringify(
                {
                  selectedEntityId,
                  selectedEntity: selectedEntity
                    ? {
                        id: selectedEntity.id,
                        name: selectedEntity.name,
                        code: selectedEntity.code,
                      }
                    : null,
                  availableEntities: (entityInfo?.accessible_entities || []).map((e) => ({
                    id: e.id,
                    name: e.name,
                  })),
                  settings: settings
                    ? {
                        id: settings.id,
                        entity_id: settings.entity_id,
                        provider: settings.provider,
                        api_username: settings.api_username,
                        is_enabled: settings.is_enabled,
                        webrtc_enabled: settings.webrtc_enabled,
                        is_configured: settings.is_configured,
                      }
                    : null,
                  agentStatus: agentStatus
                    ? {
                        id: agentStatus.id,
                        status: agentStatus.status,
                      }
                    : null,
                  webrtcConfig: webrtcConfig
                    ? {
                        client_name: webrtcConfig.client_name,
                        phone_number: webrtcConfig.phone_number,
                        has_token: !!webrtcConfig.token,
                      }
                    : null,
                  errors: {
                    settings: settingsError ? (settingsError as Error).message : null,
                    agent: agentError ? (agentError as Error).message : null,
                    webrtc: webrtcError ? (webrtcError as Error).message : null,
                  },
                },
                null,
                2
              )}
            </pre>
          </details>
        </div>
      </Card>

      {/* No Entity Selected Warning */}
      {!selectedEntityId && (
        <Alert variant="warning" title="No Entity Selected">
          Please select an entity from the header dropdown to configure voice settings.
        </Alert>
      )}

      {/* Settings Form */}
      {selectedEntityId && (
        <VoiceSettingsForm
          settings={settings || null}
          entityId={selectedEntityId}
          isLoading={isSettingsLoading}
          onSave={handleSave}
          isSaving={updateMutation.isPending || createMutation.isPending}
          isSaveSuccess={saveSuccess}
          isSaveError={!!saveError}
          saveError={saveError || undefined}
          onResetSaveState={resetSaveState}
        />
      )}
    </div>
  );
}
