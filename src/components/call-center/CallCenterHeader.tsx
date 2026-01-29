"use client";

/**
 * Call Center Header Component
 *
 * Shared header for all call center pages with:
 * - Page title and description
 * - Entity selector (always visible, persisted across tabs)
 * - Stats cards with date filter (always visible)
 * - Context-aware info card:
 *   - Workspace: Agent info (name, phone, status, queue)
 *   - Settings: Configuration status for managers
 * - Tab navigation
 */

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  useVoiceSettings,
  useMyQueues,
  useCallCenterStats,
  useMyAgentStatus,
  useAgentStatusWithAutoConnect,
} from "@/src/hooks/useCallCenter";
import { useCallCenterContext } from "@/src/hooks/useAfricasTalkingClient";
import { useAuth } from "@/src/lib/auth";
import { TabNavigation, TabItem, Button, Card, Badge, Spinner, Select } from "@/src/components/ui";
import { AgentStatusSelector } from "./AgentStatusSelector";
import { AgentStatusEnum } from "@/src/types/voice";
import Link from "next/link";

// Stats period filter options
type StatsPeriod = "today" | "yesterday" | "7days" | "30days";

const STATS_PERIOD_OPTIONS: { value: StatsPeriod; label: string; days: number }[] = [
  { value: "today", label: "Today", days: 0 },
  { value: "yesterday", label: "Yesterday", days: 1 },
  { value: "7days", label: "Last 7 Days", days: 7 },
  { value: "30days", label: "Last 30 Days", days: 30 },
];

// Tab configuration for call center section
const callCenterTabs: TabItem[] = [
  { label: "Workspace", href: "/dashboard/call-center", exact: true },
  { label: "Callbacks", href: "/dashboard/call-center/callbacks" },
  { label: "History", href: "/dashboard/call-center/history" },
  { label: "Queues", href: "/dashboard/call-center/queues" },
  { label: "Settings", href: "/dashboard/call-center/settings" },
];

export function CallCenterHeader() {
  // Use global entity selection from auth context
  const { selectedEntityId: rawEntityId, user } = useAuth();
  const selectedEntityId = rawEntityId || "";
  const pathname = usePathname();

  // Determine if we're on the workspace page (agent view) vs settings (manager view)
  const isWorkspacePage = pathname === "/dashboard/call-center";
  const isSettingsPage = pathname === "/dashboard/call-center/settings";

  // Stats period filter state
  const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>("today");
  const selectedPeriodConfig = STATS_PERIOD_OPTIONS.find((p) => p.value === statsPeriod)!;

  // Fetch voice settings, stats, and queue assignment
  const { data: voiceSettings, isLoading: isLoadingSettings } = useVoiceSettings(selectedEntityId);
  const { data: stats, isLoading: isLoadingStats } = useCallCenterStats(
    selectedEntityId,
    selectedPeriodConfig.days
  );
  const { data: myQueues } = useMyQueues(selectedEntityId);

  // Agent status for workspace view
  const { data: agentStatus, isLoading: isAgentStatusLoading } = useMyAgentStatus(
    selectedEntityId || undefined
  );

  // Call center context for WebRTC
  const { isInitialized, isReady, initialize, disconnect, callState } = useCallCenterContext();

  // Unified status change handler with auto-connect
  const {
    handleStatusChange,
    isPending: isStatusChangePending,
    connectionFailureMessage,
    dismissConnectionFailure,
    acwCountdown,
  } = useAgentStatusWithAutoConnect(selectedEntityId || undefined);

  // Determine configuration status
  const configStatus = useMemo(() => {
    if (!voiceSettings) {
      return { isConfigured: false, missing: ["Voice settings not created"] };
    }

    const missing: string[] = [];
    if (!voiceSettings.api_username) missing.push("API Username");
    if (!voiceSettings.is_configured) missing.push("API credentials incomplete");
    if (!voiceSettings.is_enabled) missing.push("Voice service not enabled");
    if (!voiceSettings.webrtc_enabled) missing.push("WebRTC not enabled");
    if (!voiceSettings.phone_numbers || voiceSettings.phone_numbers.length === 0) {
      missing.push("No phone numbers configured");
    }

    return {
      isConfigured:
        voiceSettings.is_configured && voiceSettings.is_enabled && voiceSettings.webrtc_enabled,
      missing,
    };
  }, [voiceSettings]);

  const isAssignedToQueue = myQueues && myQueues.length > 0;
  const currentStatus = agentStatus?.status ?? AgentStatusEnum.OFFLINE;

  // Format duration helper
  const formatDuration = (seconds: number | undefined | null): string => {
    if (seconds == null || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get primary phone number
  const primaryPhone = voiceSettings?.phone_numbers?.[0] || null;

  return (
    <div className="space-y-4">
      {/* Stats Cards with Period Filter - Always visible */}
      {selectedEntityId && (
        <div className="space-y-3">
          {/* Period Filter */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary">Call Statistics</h3>
            <div className="flex items-center gap-2">
              <Select
                value={statsPeriod}
                onChange={(e) => setStatsPeriod(e.target.value as StatsPeriod)}
                className="w-40"
              >
                {STATS_PERIOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Stats Grid */}
          {isLoadingStats ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Card padding="md">
                <div className="text-sm text-text-secondary">Total Calls</div>
                <div className="text-2xl font-bold text-text-primary">{stats.total_calls}</div>
              </Card>
              <Card padding="md">
                <div className="text-sm text-text-secondary">Completed</div>
                <div className="text-2xl font-bold text-status-success">
                  {stats.completed_calls}
                </div>
              </Card>
              <Card padding="md">
                <div className="text-sm text-text-secondary">Missed</div>
                <div className="text-2xl font-bold text-status-error">{stats.missed_calls}</div>
              </Card>
              <Card padding="md">
                <div className="text-sm text-text-secondary">Answer Rate</div>
                <div className="text-2xl font-bold text-text-primary">
                  {stats.total_calls > 0
                    ? ((stats.completed_calls / stats.total_calls) * 100).toFixed(1)
                    : 0}
                  %
                </div>
              </Card>
              <Card padding="md">
                <div className="text-sm text-text-secondary">Avg Duration</div>
                <div className="text-2xl font-bold text-text-primary">
                  {formatDuration(stats.average_call_duration_seconds)}
                </div>
              </Card>
            </div>
          ) : (
            <div className="text-center py-4 text-text-secondary">No stats available</div>
          )}
        </div>
      )}

      {/* Context-aware info card */}
      {selectedEntityId && isWorkspacePage && (
        /* Agent Info Card - Shown on Workspace page */
        <Card padding="md" className="!overflow-visible">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Agent Name */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    {user?.name || user?.email || "Agent"}
                  </div>
                  {primaryPhone && (
                    <div className="text-xs text-text-secondary">{primaryPhone}</div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-border-light hidden sm:block" />

              {/* Agent Status */}
              {isAgentStatusLoading ? (
                <Spinner size="sm" />
              ) : (
                <AgentStatusSelector
                  currentStatus={currentStatus}
                  onStatusChange={handleStatusChange}
                  isLoading={isStatusChangePending}
                  acwCountdown={acwCountdown}
                  size="md"
                />
              )}

              {/* Divider */}
              <div className="h-8 w-px bg-border-light hidden sm:block" />

              {/* Queue Assignment */}
              <div>
                <span className="text-sm text-text-secondary">Queue:</span>{" "}
                {isAssignedToQueue ? (
                  <Badge variant="success" size="sm">
                    {myQueues?.[0]?.name || `${myQueues?.length} queue(s)`}
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm">
                    Not Assigned
                  </Badge>
                )}
              </div>
            </div>

            {/* Phone Connection Toggle */}
            <button
              onClick={() => {
                if (isReady) {
                  disconnect();
                } else if (!isInitialized || callState === "error") {
                  initialize();
                }
              }}
              disabled={callState === "initializing"}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
                ${
                  isReady
                    ? "bg-green-50 border-green-200 hover:bg-green-100"
                    : callState === "initializing"
                      ? "bg-yellow-50 border-yellow-200 cursor-wait"
                      : callState === "error"
                        ? "bg-red-50 border-red-200 hover:bg-red-100"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }
              `}
              title={isReady ? "Click to disconnect" : "Click to connect phone"}
            >
              {callState === "initializing" ? (
                <>
                  <Spinner size="sm" />
                  <span className="text-sm font-medium text-yellow-700">Connecting...</span>
                </>
              ) : isReady ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse" />
                  <span className="text-sm font-medium text-green-700">Connected</span>
                </>
              ) : callState === "error" ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-status-error" />
                  <span className="text-sm font-medium text-red-700">Retry Connection</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Connect Phone</span>
                </>
              )}
            </button>
          </div>

          {/* Connection Failure Alert */}
          {connectionFailureMessage && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <svg
                className="w-5 h-5 text-status-error flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  Could not set status to Available
                </p>
                <p className="text-sm text-red-700 mt-0.5">{connectionFailureMessage}</p>
              </div>
              <button
                onClick={dismissConnectionFailure}
                className="text-red-500 hover:text-red-700 p-1"
                title="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </Card>
      )}

      {/* Settings Summary Card - Shown on Settings page and other management pages */}
      {selectedEntityId && !isWorkspacePage && (
        <Card padding="md">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <span className="text-sm text-text-secondary">Status:</span>{" "}
                {isLoadingSettings ? (
                  <Spinner size="sm" />
                ) : configStatus.isConfigured ? (
                  <Badge variant="success">Configured</Badge>
                ) : (
                  <Badge variant="warning">Not Configured</Badge>
                )}
              </div>
              {voiceSettings && configStatus.isConfigured ? (
                <>
                  <div>
                    <span className="text-sm text-text-secondary">Provider:</span>{" "}
                    <span className="font-medium">{voiceSettings.provider}</span>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Phone:</span>{" "}
                    <span className="font-medium">
                      {voiceSettings.phone_numbers?.[0] || "Not set"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Mode:</span>{" "}
                    {voiceSettings.use_sandbox ? (
                      <Badge variant="warning" size="sm">
                        Sandbox
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        Production
                      </Badge>
                    )}
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Queue:</span>{" "}
                    {isAssignedToQueue ? (
                      <Badge variant="success" size="sm">
                        Assigned ({myQueues?.length})
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm">
                        Not Assigned
                      </Badge>
                    )}
                  </div>
                </>
              ) : voiceSettings ? (
                <div className="text-sm text-text-secondary">
                  <span className="text-status-warning font-medium">Missing: </span>
                  {configStatus.missing.join(", ")}
                </div>
              ) : (
                <div className="text-sm text-text-secondary">
                  No settings configured for this entity yet.
                </div>
              )}
            </div>
            {isSettingsPage ? null : (
              <Link href="/dashboard/call-center/settings">
                <Button variant="outline" size="sm">
                  {configStatus.isConfigured ? "Edit Settings" : "Configure Voice"}
                </Button>
              </Link>
            )}
          </div>
        </Card>
      )}

      {/* No Entity Selected */}
      {!selectedEntityId && (
        <Card padding="lg" className="text-center">
          <svg
            className="w-12 h-12 mx-auto text-text-disabled mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <p className="text-text-secondary">
            Select an entity from the header to view call center
          </p>
        </Card>
      )}

      {/* Tab Navigation */}
      <TabNavigation tabs={callCenterTabs} ariaLabel="Call center navigation" />
    </div>
  );
}
