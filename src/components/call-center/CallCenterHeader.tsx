"use client";

/**
 * Call Center Header Component
 *
 * Shared header for all call center pages with:
 * - Page title and description
 * - Entity selector (always visible, persisted across tabs)
 * - Open Softphone action button
 * - Stats cards (always visible)
 * - Settings summary (always visible)
 * - Tab navigation
 *
 * This ensures users always know which entity they're viewing
 * and see key metrics regardless of which tab they're on.
 */

import { useMemo } from "react";
import { useVoiceSettings, useMyQueues, useCallCenterStats } from "@/src/hooks/useCallCenter";
import { useAuth } from "@/src/lib/auth";
import { TabNavigation, TabItem, Button, Card, Badge, Spinner } from "@/src/components/ui";
import Link from "next/link";

// Tab configuration for call center section
const callCenterTabs: TabItem[] = [
  { label: "Workspace", href: "/dashboard/call-center", exact: true },
  { label: "Callbacks", href: "/dashboard/call-center/callbacks" },
  { label: "History", href: "/dashboard/call-center/history" },
  { label: "Settings", href: "/dashboard/call-center/settings" },
];

export function CallCenterHeader() {
  // Use global entity selection from auth context
  const { selectedEntityId: rawEntityId } = useAuth();
  const selectedEntityId = rawEntityId || "";

  // Fetch voice settings, stats, and queue assignment
  const { data: voiceSettings, isLoading: isLoadingSettings } = useVoiceSettings(selectedEntityId);
  const { data: stats } = useCallCenterStats(selectedEntityId);
  const { data: myQueues } = useMyQueues(selectedEntityId);

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

  // Format duration helper
  const formatDuration = (seconds: number | undefined | null): string => {
    if (seconds == null || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards - Always visible */}
      {selectedEntityId && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card padding="md">
            <div className="text-sm text-text-secondary">Total Calls ({stats.period_days}d)</div>
            <div className="text-2xl font-bold text-text-primary">{stats.total_calls}</div>
          </Card>
          <Card padding="md">
            <div className="text-sm text-text-secondary">Completed</div>
            <div className="text-2xl font-bold text-status-success">{stats.completed_calls}</div>
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
      )}

      {/* Settings Summary Card - Always visible */}
      {selectedEntityId && (
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
            <Link href="/dashboard/call-center/settings">
              <Button variant="outline" size="sm">
                {configStatus.isConfigured ? "Edit Settings" : "Configure Voice"}
              </Button>
            </Link>
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
