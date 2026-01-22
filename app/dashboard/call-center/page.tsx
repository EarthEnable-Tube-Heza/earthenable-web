"use client";

/**
 * Call Center Dashboard Page
 *
 * Main workspace for call center agents with full softphone functionality.
 * Uses shared CallCenterHeader for stats, settings summary, and entity selection.
 */

import { useState, useMemo, useEffect } from "react";
import { useVoiceSettings, useMyQueues } from "@/src/hooks/useCallCenter";
import { useEntities } from "@/src/hooks/useExpenses";
import { useAuth } from "@/src/lib/auth";
import { WorkspaceView, CallCenterHeader } from "@/src/components/call-center";
import { Card } from "@/src/components/ui";

export default function CallCenterPage() {
  const { user } = useAuth();
  const [selectedEntityId, setSelectedEntityId] = useState<string>(user?.entity_id || "");

  // Fetch entities for default selection
  const { data: entitiesData } = useEntities();

  // Set default entity if not selected
  useEffect(() => {
    const entities = entitiesData?.entities || [];
    if (!selectedEntityId && entities.length > 0) {
      setSelectedEntityId(entities[0].id);
    }
  }, [selectedEntityId, entitiesData]);

  // Fetch data for queue warning
  const { data: voiceSettings } = useVoiceSettings(selectedEntityId);
  const { data: myQueues } = useMyQueues(selectedEntityId);

  // Determine configuration status
  const configStatus = useMemo(() => {
    if (!voiceSettings) {
      return { isConfigured: false };
    }
    return {
      isConfigured:
        voiceSettings.is_configured && voiceSettings.is_enabled && voiceSettings.webrtc_enabled,
    };
  }, [voiceSettings]);

  // Check if user is assigned to any queue
  const isAssignedToQueue = myQueues && myQueues.length > 0;

  return (
    <div className="space-y-6">
      {/* Shared Header with Entity Selector, Stats, Settings Summary, and Tabs */}
      <CallCenterHeader
        description="Manage calls, view statistics, and access softphone"
        selectedEntityId={selectedEntityId}
        onEntityChange={setSelectedEntityId}
      />

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
    </div>
  );
}
