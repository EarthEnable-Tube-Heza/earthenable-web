/**
 * Africa's Talking WebRTC Client Hook
 *
 * React hook for managing browser-based voice calls using Africa's Talking WebRTC client.
 * This hook handles initialization, call state management, and provides call control methods.
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/src/lib/api";
import { CallDirection } from "@/src/types";

// ==================== Types ====================

export type CallState =
  | "idle"
  | "initializing"
  | "ready"
  | "dialing"
  | "ringing"
  | "connected"
  | "on_hold"
  | "ended"
  | "error";

export interface ActiveCallInfo {
  callId?: string;
  sessionId?: string;
  phoneNumber: string;
  contactName?: string;
  direction: CallDirection;
  startedAt: Date;
  connectedAt?: Date;
  duration: number; // seconds since connected
  isOnHold: boolean;
  isMuted: boolean;
}

export interface IncomingCallInfo {
  sessionId: string;
  callerNumber: string;
  callerName?: string;
}

export interface UseAfricasTalkingClientOptions {
  /** Entity ID for WebRTC config */
  entityId?: string;
  /** Auto-initialize on mount (default: true) */
  autoInitialize?: boolean;
  /** Callback when incoming call is received */
  onIncomingCall?: (call: IncomingCallInfo) => void;
  /** Callback when call is connected */
  onCallConnected?: (call: ActiveCallInfo) => void;
  /** Callback when call ends */
  onCallEnded?: (call: ActiveCallInfo, reason?: string) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
}

export interface UseAfricasTalkingClientReturn {
  // State
  client: unknown | null;
  isInitialized: boolean;
  isReady: boolean;
  callState: CallState;
  activeCall: ActiveCallInfo | null;
  incomingCall: IncomingCallInfo | null;
  error: string | null;

  // Call control methods
  initialize: () => Promise<void>;
  makeCall: (phoneNumber: string, contactName?: string) => Promise<void>;
  answerCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  holdCall: () => void;
  resumeCall: () => void;
  muteCall: () => void;
  unmuteCall: () => void;
  toggleMute: () => void;
  toggleHold: () => void;
  sendDtmf: (digit: string) => void;

  // Status helpers
  isMuted: boolean;
  isOnHold: boolean;
  isCallActive: boolean;
  canMakeCall: boolean;
}

// ==================== Hook Implementation ====================

export function useAfricasTalkingClient(
  options: UseAfricasTalkingClientOptions = {}
): UseAfricasTalkingClientReturn {
  const {
    entityId,
    autoInitialize = true,
    onIncomingCall,
    onCallConnected,
    onCallEnded,
    onError,
  } = options;

  // State
  const [client, setClient] = useState<unknown | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [callState, setCallState] = useState<CallState>("idle");
  const [activeCall, setActiveCall] = useState<ActiveCallInfo | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCallInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs for callbacks and timer
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const clientRef = useRef<unknown | null>(null);

  // ==================== Duration Timer ====================

  const startDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }

    durationIntervalRef.current = setInterval(() => {
      setActiveCall((prev) => {
        if (!prev || !prev.connectedAt) return prev;
        const duration = Math.floor((Date.now() - prev.connectedAt.getTime()) / 1000);
        return { ...prev, duration };
      });
    }, 1000);
  }, []);

  const stopDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  // ==================== Initialize Client ====================

  const initialize = useCallback(async () => {
    if (isInitialized || !entityId) return;

    setCallState("initializing");
    setError(null);

    try {
      // Get WebRTC config (capability token) from backend
      const config = await apiClient.getWebRTCConfig(entityId);

      // Dynamically import Africa's Talking client
      // @ts-expect-error - africastalking-client may not have types
      const Africastalking = await import("africastalking-client");

      // Initialize the client with the capability token
      // The library exports Africastalking.Client constructor
      const ClientConstructor = Africastalking.default?.Client || Africastalking.Client;
      if (!ClientConstructor) {
        throw new Error("Africa's Talking Client constructor not found");
      }

      const atClient = new ClientConstructor(config.token);

      // Set up event handlers per AT documentation
      // https://developers.africastalking.com/docs/voice/webrtc

      atClient.on("ready", () => {
        console.log("[AT Client] Ready - client can make/receive calls");
        setIsReady(true);
        setCallState("ready");
      });

      atClient.on("notready", () => {
        console.log("[AT Client] Not ready - client cannot make/receive calls");
        setIsReady(false);
        setCallState("idle");
      });

      atClient.on("calling", () => {
        console.log("[AT Client] Calling - outbound call initiated");
        setCallState("dialing");
      });

      // Event: incomingcall (lowercase per AT docs)
      // Params: { from: string } - the caller's identity
      atClient.on("incomingcall", (params: { from: string }) => {
        console.log("[AT Client] Incoming call from:", params.from);
        const incoming: IncomingCallInfo = {
          sessionId: "", // Session ID comes from webhook
          callerNumber: params.from,
        };
        setIncomingCall(incoming);
        setCallState("ringing");
        onIncomingCall?.(incoming);
      });

      // Event: callaccepted (per AT docs - call successfully bridged)
      atClient.on("callaccepted", () => {
        console.log("[AT Client] Call accepted - bridge established");
        setCallState("connected");
        setIncomingCall(null);

        setActiveCall((prev) => {
          if (!prev) return null;
          const connectedCall = { ...prev, connectedAt: new Date() };
          onCallConnected?.(connectedCall);
          return connectedCall;
        });

        startDurationTimer();
      });

      // Event: hangup (per AT docs - call ended)
      // Params: { code: string, reason: string }
      atClient.on("hangup", (hangupCause?: { code?: string; reason?: string }) => {
        console.log("[AT Client] Hangup:", hangupCause);
        stopDurationTimer();

        setActiveCall((prev) => {
          if (prev) {
            const reason = hangupCause ? `${hangupCause.code} - ${hangupCause.reason}` : undefined;
            onCallEnded?.(prev, reason);
          }
          return null;
        });

        setCallState("ended");
        setIncomingCall(null);

        // Reset to ready state after a short delay
        setTimeout(() => {
          setCallState("ready");
        }, 2000);
      });

      // Event: offline - token expired
      atClient.on("offline", () => {
        console.log("[AT Client] Offline - token expired");
        setIsReady(false);
        setIsInitialized(false);
        setCallState("idle");
        setError("Session expired. Please refresh to reconnect.");
      });

      // Event: closed - connection to AT servers broken
      atClient.on("closed", () => {
        console.log("[AT Client] Closed - connection to servers broken");
        setIsReady(false);
        setCallState("error");
        setError("Connection lost. Check your internet connection.");
      });

      clientRef.current = atClient;
      setClient(atClient);
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize call client";
      console.error("[AT Client] Initialization error:", errorMessage);
      setError(errorMessage);
      setCallState("error");
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [
    entityId,
    isInitialized,
    onIncomingCall,
    onCallConnected,
    onCallEnded,
    onError,
    startDurationTimer,
    stopDurationTimer,
  ]);

  // ==================== Auto-initialize ====================

  useEffect(() => {
    if (autoInitialize && !isInitialized && entityId) {
      initialize();
    }
  }, [autoInitialize, isInitialized, entityId, initialize]);

  // ==================== Cleanup ====================

  useEffect(() => {
    return () => {
      stopDurationTimer();
      if (clientRef.current) {
        // @ts-expect-error - client disconnect method
        clientRef.current.disconnect?.();
      }
    };
  }, [stopDurationTimer]);

  // ==================== Call Control Methods ====================

  const makeCall = useCallback(
    async (phoneNumber: string, contactName?: string) => {
      if (!clientRef.current || !isReady) {
        setError("Client not ready");
        return;
      }

      setError(null);
      setCallState("dialing");

      const callInfo: ActiveCallInfo = {
        phoneNumber,
        contactName,
        direction: CallDirection.OUTBOUND,
        startedAt: new Date(),
        duration: 0,
        isOnHold: false,
        isMuted: false,
      };

      setActiveCall(callInfo);

      try {
        // @ts-expect-error - client call method
        await clientRef.current.call(phoneNumber);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to make call";
        setError(errorMessage);
        setCallState("error");
        setActiveCall(null);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      }
    },
    [isReady, onError]
  );

  const answerCall = useCallback(() => {
    if (!clientRef.current || !incomingCall) return;

    const callInfo: ActiveCallInfo = {
      sessionId: incomingCall.sessionId,
      phoneNumber: incomingCall.callerNumber,
      contactName: incomingCall.callerName,
      direction: CallDirection.INBOUND,
      startedAt: new Date(),
      duration: 0,
      isOnHold: false,
      isMuted: false,
    };

    setActiveCall(callInfo);

    // @ts-expect-error - client answer method
    clientRef.current.answer?.();
  }, [incomingCall]);

  const rejectCall = useCallback(() => {
    if (!clientRef.current) return;
    // AT docs don't have reject() - use hangup() to decline incoming call
    // @ts-expect-error - client hangup method
    clientRef.current.hangup?.();
    setIncomingCall(null);
    setCallState("ready");
  }, []);

  const endCall = useCallback(() => {
    if (!clientRef.current) return;
    // @ts-expect-error - client hangup method
    clientRef.current.hangup?.();
  }, []);

  const holdCall = useCallback(() => {
    if (!clientRef.current || !activeCall) return;
    // @ts-expect-error - client hold method
    clientRef.current.hold?.();
    setActiveCall((prev) => (prev ? { ...prev, isOnHold: true } : null));
    setCallState("on_hold");
  }, [activeCall]);

  const resumeCall = useCallback(() => {
    if (!clientRef.current || !activeCall) return;
    // @ts-expect-error - client unhold method (per AT docs)
    clientRef.current.unhold?.();
    setActiveCall((prev) => (prev ? { ...prev, isOnHold: false } : null));
    setCallState("connected");
  }, [activeCall]);

  const muteCall = useCallback(() => {
    if (!clientRef.current) return;
    // @ts-expect-error - client mute method
    clientRef.current.mute?.();
    setActiveCall((prev) => (prev ? { ...prev, isMuted: true } : null));
  }, []);

  const unmuteCall = useCallback(() => {
    if (!clientRef.current) return;
    // @ts-expect-error - client unmute method
    clientRef.current.unmute?.();
    setActiveCall((prev) => (prev ? { ...prev, isMuted: false } : null));
  }, []);

  const toggleMute = useCallback(() => {
    if (activeCall?.isMuted) {
      unmuteCall();
    } else {
      muteCall();
    }
  }, [activeCall?.isMuted, muteCall, unmuteCall]);

  const toggleHold = useCallback(() => {
    if (activeCall?.isOnHold) {
      resumeCall();
    } else {
      holdCall();
    }
  }, [activeCall?.isOnHold, holdCall, resumeCall]);

  const sendDtmf = useCallback((digit: string) => {
    if (!clientRef.current) return;
    // @ts-expect-error - client dtmf method (per AT docs)
    clientRef.current.dtmf?.(digit);
  }, []);

  // ==================== Computed Values ====================

  const isMuted = activeCall?.isMuted ?? false;
  const isOnHold = activeCall?.isOnHold ?? false;
  const isCallActive = ["dialing", "ringing", "connected", "on_hold"].includes(callState);
  const canMakeCall = isReady && !isCallActive && callState !== "initializing";

  // ==================== Return ====================

  return {
    // State
    client,
    isInitialized,
    isReady,
    callState,
    activeCall,
    incomingCall,
    error,

    // Call control methods
    initialize,
    makeCall,
    answerCall,
    rejectCall,
    endCall,
    holdCall,
    resumeCall,
    muteCall,
    unmuteCall,
    toggleMute,
    toggleHold,
    sendDtmf,

    // Status helpers
    isMuted,
    isOnHold,
    isCallActive,
    canMakeCall,
  };
}

// ==================== Context for Global Access ====================

import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/src/lib/auth";

type CallCenterContextValue = UseAfricasTalkingClientReturn;

const CallCenterContext = createContext<CallCenterContextValue | null>(null);

export function CallCenterProvider({
  children,
  options,
}: {
  children: ReactNode;
  options?: Omit<UseAfricasTalkingClientOptions, "entityId">;
}) {
  // Get entityId from auth context
  const { selectedEntityId } = useAuth();

  const value = useAfricasTalkingClient({
    ...options,
    entityId: selectedEntityId ?? undefined,
  });

  return <CallCenterContext.Provider value={value}>{children}</CallCenterContext.Provider>;
}

export function useCallCenterContext() {
  const context = useContext(CallCenterContext);
  if (!context) {
    throw new Error("useCallCenterContext must be used within a CallCenterProvider");
  }
  return context;
}
