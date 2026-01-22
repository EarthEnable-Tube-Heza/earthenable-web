"use client";

/**
 * Call Center Dashboard Page
 *
 * Main workspace for call center agents with full softphone functionality.
 * Similar to SMS page with entity selector, stats, and configuration status.
 */

import { useState, useMemo } from "react";
import { useVoiceSettings, useCallCenterStats, useMyQueues } from "@/src/hooks/useCallCenter";
import { useEntities } from "@/src/hooks/useExpenses";
import { useAuth } from "@/src/lib/auth";
import { WorkspaceView } from "@/src/components/call-center/WorkspaceView";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Select } from "@/src/components/ui/Select";
import { Spinner } from "@/src/components/ui/Spinner";
import { Tooltip } from "@/src/components/ui/Tooltip";
import Link from "next/link";

export default function CallCenterPage() {
  const { user } = useAuth();
  const [selectedEntityId, setSelectedEntityId] = useState<string>(user?.entity_id || "");

  // Fetch entities
  const { data: entitiesData } = useEntities();
  const entities = entitiesData?.entities || [];

  // Set default entity if not selected
  if (!selectedEntityId && entities.length > 0) {
    setSelectedEntityId(entities[0].id);
  }

  // Fetch data based on selected entity
  const { data: voiceSettings, isLoading: isLoadingSettings } = useVoiceSettings(selectedEntityId);
  const { data: stats } = useCallCenterStats(selectedEntityId);
  const { data: myQueues } = useMyQueues(selectedEntityId);

  // Determine configuration status
  const configStatus = useMemo(() => {
    if (!voiceSettings) {
      return {
        isConfigured: false,
        missing: ["Voice settings not created"],
      };
    }

    const missing: string[] = [];

    if (!voiceSettings.api_username) missing.push("API Username");
    // Note: api_key is not returned in the response (write-only), so check is_configured
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

  // Check if user is assigned to any queue
  const isAssignedToQueue = myQueues && myQueues.length > 0;

  return (
    <div className="space-y-6">
      {/* Entity Selector & Actions */}
      <div className="flex items-center justify-end gap-3">
        <Select
          value={selectedEntityId}
          onChange={(e) => setSelectedEntityId(e.target.value)}
          className="w-48"
        >
          <option value="">Select Entity</option>
          {entities.map((entity) => (
            <option key={entity.id} value={entity.id}>
              {entity.name} ({entity.code})
            </option>
          ))}
        </Select>
        <Tooltip
          content={
            !selectedEntityId
              ? "Please select an entity first"
              : !configStatus.isConfigured
                ? "Voice is not configured. Go to Settings tab to configure."
                : !isAssignedToQueue
                  ? "You are not assigned to any call queue."
                  : null
          }
          position="bottom"
        >
          <Button
            variant="primary"
            disabled={!selectedEntityId || !configStatus.isConfigured || !isAssignedToQueue}
            onClick={() => {
              // Scroll to softphone section
              document.getElementById("softphone-section")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Open Softphone
          </Button>
        </Tooltip>
      </div>

      {/* Stats Cards */}
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
              {formatDuration(stats.average_duration_seconds)}
            </div>
          </Card>
        </div>
      )}

      {/* Settings Summary Card */}
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

      {/* Agent Queue Assignment Warning */}
      {selectedEntityId && configStatus.isConfigured && !isAssignedToQueue && (
        <Card padding="md" className="border-status-warning bg-status-warning/5">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-status-warning flex-shrink-0"
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
            <div>
              <p className="font-medium text-text-primary">Not Assigned to Queue</p>
              <p className="text-sm text-text-secondary">
                You need to be assigned to a call queue to use the softphone. Contact your
                administrator.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Softphone Section */}
      {selectedEntityId && (
        <div id="softphone-section">
          <WorkspaceView />
        </div>
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
          <p className="text-text-secondary">Select an entity to view call center</p>
        </Card>
      )}
    </div>
  );
}

/**
 * Format duration in seconds to mm:ss
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
