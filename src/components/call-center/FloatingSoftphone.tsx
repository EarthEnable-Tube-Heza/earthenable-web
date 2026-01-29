"use client";

/**
 * Floating Softphone Component
 *
 * A floating panel that provides softphone functionality from anywhere in the dashboard.
 * - Minimized state: Small pill showing status + active call indicator
 * - Expanded state: Full dialpad + call controls
 */

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/src/lib/theme";
import { useAuth } from "@/src/lib/auth";
import { useCallCenterContext } from "@/src/hooks/useAfricasTalkingClient";
import { useMyAgentStatus, useAgentStatusWithAutoConnect } from "@/src/hooks/useCallCenter";
import { AgentStatusEnum, AGENT_STATUS_CONFIG } from "@/src/types/voice";
import { Dialpad } from "./Dialpad";
import { CallControls } from "./CallControls";
import { ActiveCallDisplay } from "./ActiveCallDisplay";
import { AgentStatusSelector } from "./AgentStatusSelector";
import { Spinner } from "@/src/components/ui";

interface FloatingSoftphoneProps {
  /** Additional class name */
  className?: string;
}

export function FloatingSoftphone({ className }: FloatingSoftphoneProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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
    acwCountdown,
  } = useAgentStatusWithAutoConnect(selectedEntityId ?? undefined);

  // Get current status (fallback to offline if no status)
  const currentStatus = agentStatus?.status ?? AgentStatusEnum.OFFLINE;
  const statusConfig = AGENT_STATUS_CONFIG[currentStatus];

  // Initialize client if not ready when expanded
  useEffect(() => {
    if (isExpanded && !isInitialized) {
      initialize();
    }
  }, [isExpanded, isInitialized, initialize]);

  // Auto-expand when there's an incoming call
  useEffect(() => {
    if (incomingCall) {
      setIsExpanded(true);
    }
  }, [incomingCall]);

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

  // Toggle keypad during call
  const handleToggleKeypad = useCallback(() => {
    setShowKeypad((prev) => !prev);
  }, []);

  // Determine display state
  const hasActiveCall = isCallActive || callState === "ended";
  const hasIncomingCall = !!incomingCall;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50",
        "transition-all duration-300 ease-in-out",
        className
      )}
    >
      {/* Minimized State */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-full shadow-lg",
            "bg-white border border-border-light",
            "hover:shadow-xl transition-shadow",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            hasActiveCall && "ring-2 ring-status-success ring-offset-2",
            hasIncomingCall && "ring-2 ring-status-warning ring-offset-2 animate-pulse"
          )}
        >
          {/* Status indicator - green when connected, yellow for incoming, otherwise agent status */}
          <span
            className={cn(
              "w-3 h-3 rounded-full",
              hasActiveCall && callState === "connected"
                ? "bg-status-success"
                : hasIncomingCall
                  ? "bg-status-warning"
                  : hasActiveCall && (callState === "dialing" || callState === "ringing")
                    ? "bg-status-warning"
                    : statusConfig?.dotColor || "bg-gray-400"
            )}
          />

          {/* Phone icon */}
          <svg
            className={cn(
              "w-5 h-5",
              hasActiveCall && callState === "connected"
                ? "text-status-success"
                : hasIncomingCall
                  ? "text-status-warning"
                  : "text-text-primary"
            )}
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

          {/* Active call indicator */}
          {hasActiveCall && (
            <span className="text-sm font-medium text-status-success">
              {activeCall?.duration
                ? `${Math.floor(activeCall.duration / 60)}:${(activeCall.duration % 60).toString().padStart(2, "0")}`
                : callState === "connected"
                  ? "Connected"
                  : callState === "dialing"
                    ? "Dialing..."
                    : callState === "ringing"
                      ? "Ringing..."
                      : "Call"}
            </span>
          )}

          {/* Incoming call indicator */}
          {hasIncomingCall && (
            <span className="text-sm font-medium text-status-warning">Incoming</span>
          )}
        </button>
      )}

      {/* Expanded State */}
      {isExpanded && (
        <div
          className={cn(
            "w-80 bg-white rounded-2xl shadow-2xl border border-border-light",
            "overflow-hidden"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-background-light border-b border-border-light">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary"
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
              <span className="font-heading font-semibold text-text-primary">Softphone</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Agent Status Selector */}
              <AgentStatusSelector
                currentStatus={currentStatus}
                onStatusChange={handleStatusChange}
                isLoading={isStatusLoading || isStatusChangePending}
                acwCountdown={acwCountdown}
                size="sm"
              />

              {/* Minimize Button */}
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded hover:bg-border-light transition-colors"
                title="Minimize"
              >
                <svg
                  className="w-5 h-5 text-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Connection Failure Alert */}
            {connectionFailureMessage && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-status-error flex-shrink-0 mt-0.5"
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
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-red-800">Could not set Available</p>
                  <p className="text-xs text-red-700 truncate">{connectionFailureMessage}</p>
                </div>
                <button
                  onClick={dismissConnectionFailure}
                  className="text-red-500 hover:text-red-700 p-0.5 flex-shrink-0"
                  title="Dismiss"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* Error State - Show retry button */}
            {callState === "error" && (
              <div className="flex flex-col items-center justify-center py-8">
                <svg
                  className="w-12 h-12 text-status-error mb-4"
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
                <p className="text-status-error font-medium mb-2">Connection Failed</p>
                <p className="text-text-secondary text-xs text-center mb-4 px-4">{error}</p>
                <button
                  onClick={initialize}
                  className="px-4 py-2 bg-primary text-white text-sm rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* Initializing State */}
            {callState === "initializing" && (
              <div className="flex flex-col items-center justify-center py-8">
                <Spinner size="lg" />
                <p className="mt-4 text-text-secondary">Initializing...</p>
              </div>
            )}

            {/* Not Ready State */}
            {isInitialized && !isReady && callState === "idle" && (
              <div className="flex flex-col items-center justify-center py-8">
                <svg
                  className="w-12 h-12 text-status-warning mb-4"
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
                <p className="text-text-secondary text-center">
                  Phone service not ready.
                  <br />
                  Please check your connection.
                </p>
              </div>
            )}

            {/* Incoming Call */}
            {hasIncomingCall && (
              <div className="flex flex-col items-center py-4">
                <div className="w-16 h-16 rounded-full bg-status-warning/20 flex items-center justify-center mb-4 animate-pulse">
                  <svg
                    className="w-8 h-8 text-status-warning"
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
                <h3 className="text-lg font-heading font-semibold text-text-primary">
                  {incomingCall.callerName || incomingCall.callerNumber}
                </h3>
                {incomingCall.callerName && (
                  <p className="text-sm text-text-secondary">{incomingCall.callerNumber}</p>
                )}
                <p className="text-sm text-status-warning mt-1">Incoming call...</p>

                {/* Answer/Reject Buttons */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={rejectCall}
                    className="w-14 h-14 rounded-full bg-status-error text-white flex items-center justify-center hover:bg-status-error/90 transition-colors"
                    title="Reject"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="w-14 h-14 rounded-full bg-status-success text-white flex items-center justify-center hover:bg-status-success/90 transition-colors"
                    title="Answer"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="border-t border-border-light pt-4 mt-2">
                    <Dialpad
                      value=""
                      onChange={() => {}}
                      onDigitPress={handleDtmf}
                      showCallButton={false}
                      size="sm"
                    />
                  </div>
                )}

                {/* Call Controls */}
                {callState !== "ended" && (
                  <div className="mt-4 border-t border-border-light pt-4">
                    <CallControls
                      isMuted={isMuted}
                      isOnHold={isOnHold}
                      onToggleMute={toggleMute}
                      onToggleHold={toggleHold}
                      onEndCall={endCall}
                      onShowKeypad={handleToggleKeypad}
                      isConnected={callState === "connected" || callState === "on_hold"}
                      size="md"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Dialpad (Idle State) */}
            {isReady && !hasActiveCall && !hasIncomingCall && (
              <Dialpad
                value={phoneNumber}
                onChange={setPhoneNumber}
                onCall={handleMakeCall}
                callDisabled={!canMakeCall || currentStatus !== AgentStatusEnum.AVAILABLE}
                size="sm"
              />
            )}

            {/* Status Warning */}
            {isReady &&
              currentStatus !== AgentStatusEnum.AVAILABLE &&
              !hasActiveCall &&
              !hasIncomingCall && (
                <p className="mt-4 text-xs text-text-secondary text-center">
                  Set your status to Available to make calls
                </p>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
