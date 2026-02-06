"use client";

/**
 * Call Center Workspace View
 *
 * Full-page agent workspace with larger dialpad, call history sidebar,
 * and queue information. Designed for agents who stay on calls all day.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/src/lib/theme";
import { useAuth } from "@/src/lib/auth";
import { useCallCenterContext } from "@/src/hooks/useAfricasTalkingClient";
import {
  useMyAgentStatus,
  useAgentStatusWithAutoConnect,
  useMyCallbacks,
  useMyActiveCall,
  useTransferCall,
  useVoiceSettings,
  useQueuedCalls,
} from "@/src/hooks/useCallCenter";
import { AgentStatusEnum } from "@/src/types/voice";
import { Dialpad } from "./Dialpad";
import { CallControls } from "./CallControls";
import { ActiveCallDisplay } from "./ActiveCallDisplay";
import { AgentStatusSelector } from "./AgentStatusSelector";
import { ACWCountdown } from "./ACWCountdown";
import { RecentCallHistory } from "./RecentCallHistory";
import { QueueAgentsPanel } from "./QueueAgentsPanel";
import { QueuedCallsPanel } from "./QueuedCallsPanel";
import { Card, Spinner, Badge } from "@/src/components/ui";

interface WorkspaceViewProps {
  /** Additional class name */
  className?: string;
}

export function WorkspaceView({ className }: WorkspaceViewProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showKeypad, setShowKeypad] = useState(false);

  // Get selected entity from auth context
  const { selectedEntityId } = useAuth();

  // Call center context for WebRTC
  const {
    isInitialized,
    isReady,
    callState,
    activeCall,
    incomingCall,
    error,
    initialize,
    makeCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleHold,
    sendDtmf,
    isMuted,
    isOnHold,
    isCallActive,
    canMakeCall,
  } = useCallCenterContext();

  // Agent status from API
  const { data: agentStatus, isLoading: isStatusLoading } = useMyAgentStatus(
    selectedEntityId ?? undefined
  );

  // Unified status change handler with auto-connect
  const {
    handleStatusChange,
    isPending: isStatusChangePending,
    connectionFailureMessage,
    dismissConnectionFailure,
    showAcwCountdown,
    acwTimeoutSeconds,
    handleAcwComplete,
  } = useAgentStatusWithAutoConnect(selectedEntityId ?? undefined);

  // My callbacks
  const { data: myCallbacks } = useMyCallbacks(selectedEntityId ?? undefined);
  const pendingCallbacks = myCallbacks?.filter((cb) => cb.status === "pending") || [];

  // Queued calls (for badge count)
  const { data: queuedCallsData } = useQueuedCalls(selectedEntityId ?? undefined);
  const queuedCallsCount = queuedCallsData?.items?.length || 0;

  // Voice settings (for AT username)
  const { data: voiceSettings } = useVoiceSettings(selectedEntityId ?? undefined);

  // Active call from API (needed for transfer - gives us the call log ID)
  const { data: activeCallLog } = useMyActiveCall(selectedEntityId ?? undefined);

  // Transfer call mutation
  const transferCallMutation = useTransferCall();

  // Transfer mode state
  const [isTransferMode, setIsTransferMode] = useState(false);
  const agentsPanelRef = useRef<HTMLDivElement>(null);

  // Get current status (fallback to offline if no status)
  const currentStatus = agentStatus?.status ?? AgentStatusEnum.OFFLINE;

  // Handle making a call
  const handleMakeCall = useCallback(async () => {
    if (phoneNumber && canMakeCall) {
      await makeCall(phoneNumber);
      setPhoneNumber("");
    }
  }, [phoneNumber, canMakeCall, makeCall]);

  // Handle DTMF during call
  const handleDtmf = useCallback(
    (digit: string) => {
      if (isCallActive) {
        sendDtmf(digit);
      }
    },
    [isCallActive, sendDtmf]
  );

  // Quick dial from callback
  const handleQuickDial = useCallback(
    (number: string) => {
      if (canMakeCall) {
        setPhoneNumber(number);
      }
    },
    [canMakeCall]
  );

  // Call another agent directly (agent-to-agent call via AT)
  const handleCallAgent = useCallback(
    async (agent: { user_id: string; user_name?: string; user_email?: string }) => {
      if (!canMakeCall || !voiceSettings?.api_username) return;

      // For Africa's Talking, agent-to-agent calls use the format:
      // {api_username}.agent_{user_id_no_dashes_first16}
      // e.g., "earthenable.agent_6512429d40fd4302"
      // The client name must match the format used when requesting the WebRTC capability token
      const clientName = `agent_${agent.user_id.replace(/-/g, "").slice(0, 16)}`;
      const agentPhoneNumber = `${voiceSettings.api_username}.${clientName}`;

      try {
        await makeCall(agentPhoneNumber, agent.user_name);
      } catch (err) {
        console.error("Failed to call agent:", err);
      }
    },
    [canMakeCall, makeCall, voiceSettings?.api_username]
  );

  // Handle transfer button click in CallControls
  const handleTransferClick = useCallback(() => {
    setIsTransferMode((prev) => !prev);
    // Scroll agents panel into view
    if (!isTransferMode) {
      setTimeout(() => {
        agentsPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }, [isTransferMode]);

  // Handle transfer to a specific agent
  const handleTransferToAgent = useCallback(
    async (agent: { user_id: string; user_name?: string; user_email?: string }) => {
      if (!activeCallLog?.id || !voiceSettings?.api_username) return;

      // Build AT WebRTC client name for the target agent
      const clientName = `agent_${agent.user_id.replace(/-/g, "").slice(0, 16)}`;
      const targetAddress = `${voiceSettings.api_username}.${clientName}`;

      try {
        await transferCallMutation.mutateAsync({
          callId: activeCallLog.id,
          target: targetAddress,
        });
        setIsTransferMode(false);
      } catch (err) {
        console.error("Transfer failed:", err);
      }
    },
    [activeCallLog?.id, voiceSettings?.api_username, transferCallMutation]
  );

  // Reset transfer mode when call ends
  useEffect(() => {
    if (!isCallActive && isTransferMode) {
      setIsTransferMode(false);
    }
  }, [isCallActive, isTransferMode]);

  // Determine display state
  const hasActiveCall = isCallActive || callState === "ended";
  const hasIncomingCall = !!incomingCall;

  return (
    <div
      className={cn(
        "h-full grid gap-6",
        // Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop
        "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
        className
      )}
    >
      {/* Column 1: Main Softphone Area */}
      <div className="md:col-span-1">
        <Card variant="bordered" padding="lg" className="h-full flex flex-col">
          {/* Header with Status */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-semibold text-text-primary">Softphone</h2>
            <div className="flex items-center gap-3">
              {/* ACW Countdown - separate component for independent re-renders */}
              {showAcwCountdown && (
                <ACWCountdown
                  timeoutSeconds={acwTimeoutSeconds}
                  onComplete={handleAcwComplete}
                  size="md"
                />
              )}
              <AgentStatusSelector
                currentStatus={currentStatus}
                onStatusChange={handleStatusChange}
                isLoading={isStatusLoading || isStatusChangePending}
                size="md"
              />
            </div>
          </div>

          {/* Connection Failure Alert */}
          {connectionFailureMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
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

          {/* Initialize Button / Error State */}
          {(!isInitialized && callState === "idle") || callState === "error" ? (
            <div className="flex flex-col items-center justify-center flex-1 min-h-[300px]">
              <svg
                className="w-16 h-16 text-text-disabled mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>

              {error ? (
                <>
                  <p className="text-status-error font-medium mb-2">Connection Failed</p>
                  <p className="text-text-secondary text-sm text-center mb-4 max-w-xs">{error}</p>
                  <button
                    onClick={initialize}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Retry Connection
                  </button>
                  <p className="text-xs text-text-disabled mt-4 text-center max-w-xs">
                    You can still browse settings, history, and callbacks while the phone is
                    disconnected.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-text-secondary mb-4">Phone service not initialized</p>
                  <button
                    onClick={initialize}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Connect Phone
                  </button>
                </>
              )}
            </div>
          ) : null}

          {/* Initializing State */}
          {callState === "initializing" && (
            <div className="flex flex-col items-center justify-center flex-1 min-h-[300px]">
              <Spinner size="lg" />
              <p className="mt-4 text-text-secondary">Connecting to phone service...</p>
            </div>
          )}

          {/* Incoming Call */}
          {hasIncomingCall && (
            <div className="flex flex-col items-center py-8">
              <div className="w-24 h-24 rounded-full bg-status-warning/20 flex items-center justify-center mb-6 animate-pulse">
                <svg
                  className="w-12 h-12 text-status-warning"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-heading font-semibold text-text-primary">
                {incomingCall.callerName || incomingCall.callerNumber}
              </h3>
              {incomingCall.callerName && (
                <p className="text-lg text-text-secondary">{incomingCall.callerNumber}</p>
              )}
              <p className="text-lg text-status-warning mt-2">Incoming call...</p>

              {/* Answer/Reject Buttons */}
              <div className="flex gap-6 mt-8">
                <button
                  onClick={rejectCall}
                  className="w-16 h-16 rounded-full bg-status-error text-white flex items-center justify-center hover:bg-status-error/90 transition-colors"
                  title="Reject"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <button
                  onClick={answerCall}
                  className="w-16 h-16 rounded-full bg-status-success text-white flex items-center justify-center hover:bg-status-success/90 transition-colors"
                  title="Answer"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Active Call Display */}
          {hasActiveCall && activeCall && !hasIncomingCall && (
            <div className="flex flex-col">
              <ActiveCallDisplay
                phoneNumber={activeCall.phoneNumber}
                contactName={activeCall.contactName}
                direction={activeCall.direction}
                duration={activeCall.duration}
                status={
                  callState === "dialing"
                    ? "dialing"
                    : callState === "ringing"
                      ? "ringing"
                      : callState === "on_hold"
                        ? "on_hold"
                        : callState === "ended"
                          ? "ended"
                          : "connected"
                }
              />

              {/* DTMF Keypad (during call) */}
              {showKeypad && callState === "connected" && (
                <div className="border-t border-border-light pt-6 mt-4">
                  <Dialpad
                    value=""
                    onChange={() => {}}
                    onDigitPress={handleDtmf}
                    showCallButton={false}
                    size="md"
                  />
                </div>
              )}

              {/* Call Controls */}
              {callState !== "ended" && (
                <div className="mt-6 border-t border-border-light pt-6">
                  <CallControls
                    isMuted={isMuted}
                    isOnHold={isOnHold}
                    onToggleMute={toggleMute}
                    onToggleHold={toggleHold}
                    onEndCall={endCall}
                    onTransfer={handleTransferClick}
                    isTransferActive={isTransferMode}
                    onShowKeypad={() => setShowKeypad(!showKeypad)}
                    isConnected={callState === "connected" || callState === "on_hold"}
                    size="lg"
                  />
                </div>
              )}
            </div>
          )}

          {/* Dialpad (Idle State) */}
          {isReady && !hasActiveCall && !hasIncomingCall && (
            <>
              <Dialpad
                value={phoneNumber}
                onChange={setPhoneNumber}
                onCall={handleMakeCall}
                callDisabled={!canMakeCall || currentStatus !== AgentStatusEnum.AVAILABLE}
                size="md"
              />

              {/* Status Warning */}
              {currentStatus !== AgentStatusEnum.AVAILABLE && (
                <p className="mt-6 text-sm text-text-secondary text-center">
                  Set your status to{" "}
                  <span className="font-medium text-status-success">Available</span> to make calls
                </p>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Column 2: Queue & Callbacks (separate cards) */}
      <div className="flex flex-col gap-4">
        {/* Customer Queue */}
        <Card variant="bordered" padding="md" className="flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-heading font-semibold text-text-secondary">
              Customer Queue
            </h3>
            {queuedCallsCount > 0 && (
              <Badge variant="warning" size="sm">
                {queuedCallsCount} waiting
              </Badge>
            )}
          </div>
          <QueuedCallsPanel
            entityId={selectedEntityId ?? undefined}
            className="flex-1 overflow-y-auto max-h-48"
          />
        </Card>

        {/* Pending Callbacks */}
        <Card variant="bordered" padding="md" className="flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-heading font-semibold text-text-secondary">My Callbacks</h3>
            {pendingCallbacks.length > 0 && (
              <Badge variant="info" size="sm">
                {pendingCallbacks.length} pending
              </Badge>
            )}
          </div>

          {pendingCallbacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 min-h-[100px] py-4">
              <svg
                className="w-8 h-8 text-text-disabled mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs text-text-disabled">No pending callbacks</p>
            </div>
          ) : (
            <div className="space-y-2 flex-1 overflow-y-auto max-h-48">
              {pendingCallbacks.slice(0, 5).map((callback) => (
                <div
                  key={callback.id}
                  className="p-3 rounded-lg bg-background-light hover:bg-border-light transition-colors cursor-pointer"
                  onClick={() => handleQuickDial(callback.phone_number)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-text-primary text-sm">
                      {callback.contact_name || callback.phone_number}
                    </span>
                    <Badge
                      variant={
                        callback.priority === "urgent"
                          ? "error"
                          : callback.priority === "high"
                            ? "warning"
                            : "default"
                      }
                      size="sm"
                    >
                      {callback.priority}
                    </Badge>
                  </div>
                  {callback.contact_name && (
                    <p className="text-xs text-text-secondary">{callback.phone_number}</p>
                  )}
                  <p className="text-xs text-text-disabled mt-1">
                    Scheduled: {new Date(callback.scheduled_at).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Column 3: Queue Agents & Recent Calls */}
      <div className="flex flex-col gap-6 md:col-span-2 xl:col-span-1">
        {/* Queue Agents for Transfer */}
        <Card
          ref={agentsPanelRef}
          variant="bordered"
          padding="md"
          className={cn(isTransferMode && "ring-2 ring-primary ring-offset-2")}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-heading font-semibold text-text-secondary">Queue Agents</h3>
            {isTransferMode && (
              <Badge variant="warning" size="sm">
                Select agent to transfer
              </Badge>
            )}
          </div>
          {isTransferMode && transferCallMutation.isPending && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-primary/5 rounded-lg">
              <Spinner size="sm" />
              <span className="text-sm text-text-secondary">Transferring call...</span>
            </div>
          )}
          {isTransferMode && transferCallMutation.isError && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">Transfer failed. Please try again.</p>
            </div>
          )}
          <QueueAgentsPanel
            entityId={selectedEntityId ?? undefined}
            onAgentClick={
              isTransferMode && isCallActive ? (agent) => handleTransferToAgent(agent) : undefined
            }
            onCallAgent={handleCallAgent}
            canCallAgent={
              canMakeCall &&
              currentStatus === AgentStatusEnum.AVAILABLE &&
              !!voiceSettings?.api_username &&
              !isTransferMode
            }
          />
        </Card>

        {/* Recent Call History */}
        <Card variant="bordered" padding="md" className="flex-1 flex flex-col">
          <h3 className="text-sm font-heading font-semibold text-text-secondary mb-3">
            Recent Calls
          </h3>
          <RecentCallHistory
            entityId={selectedEntityId ?? undefined}
            limit={5}
            onCallClick={(call) => {
              // Quick dial the number from call history
              if (canMakeCall) {
                const number =
                  call.direction === "inbound" ? call.caller_number : call.callee_number;
                setPhoneNumber(number);
              }
            }}
            className="flex-1"
          />
        </Card>
      </div>
    </div>
  );
}
