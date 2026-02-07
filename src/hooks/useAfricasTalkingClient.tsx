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
  /** Callback when client disconnects (offline/closed events) */
  onClientDisconnected?: () => void;
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
  disconnect: () => void;
  retryConnection: () => void;
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
    onClientDisconnected,
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

  // Reconnect refs
  const MAX_RECONNECT_ATTEMPTS = 3;
  const INIT_TIMEOUT_MS = 15000; // 15 seconds to receive "ready" event
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef(false);
  const hasNotifiedDisconnectRef = useRef(false);
  const onClientDisconnectedRef = useRef(onClientDisconnected);

  // Keep onClientDisconnected ref in sync
  onClientDisconnectedRef.current = onClientDisconnected;

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
    if (isInitializingRef.current || (isInitialized && !error) || !entityId) return;

    isInitializingRef.current = true;
    setCallState("initializing");
    setError(null);

    try {
      // Clean up old broken client before re-initializing
      if (clientRef.current) {
        try {
          // @ts-expect-error - client disconnect method
          clientRef.current.disconnect?.();
        } catch {
          // Ignore cleanup errors
        }
        clientRef.current = null;
        setClient(null);
      }

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
        // Clear initialization timeout — we connected successfully
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
          initTimeoutRef.current = null;
        }
        setIsReady(true);
        setCallState("ready");
        // Reset reconnect state on successful connection
        reconnectAttemptsRef.current = 0;
        hasNotifiedDisconnectRef.current = false;
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
        console.log("[AT Client] Offline - token expired, will attempt reconnect");
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
          initTimeoutRef.current = null;
        }
        setIsReady(false);
        setIsInitialized(false);
        setCallState("error");
        setError("Session expired. Reconnecting...");
        // Don't notify backend yet - auto-reconnect may succeed
      });

      // Event: closed - connection to AT servers broken
      atClient.on("closed", () => {
        console.log("[AT Client] Closed - connection broken, will attempt reconnect");
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
          initTimeoutRef.current = null;
        }
        setIsReady(false);
        setIsInitialized(false);
        setCallState("error");
        setError("Connection lost. Reconnecting...");
        // Don't notify backend yet - auto-reconnect may succeed
      });

      clientRef.current = atClient;
      setClient(atClient);
      setIsInitialized(true);

      // Start initialization timeout — if "ready" event doesn't fire within
      // INIT_TIMEOUT_MS, the AT client silently failed to register (e.g.,
      // WebSocket connected but SIP registration never completed). Treat
      // this as a connection error so auto-reconnect can kick in.
      // Note: The "ready" handler clears initTimeoutRef, so if this callback
      // executes it means "ready" never fired.
      initTimeoutRef.current = setTimeout(() => {
        initTimeoutRef.current = null;
        console.warn(
          "[AT Client] Initialization timeout — no 'ready' event received within " +
            `${INIT_TIMEOUT_MS}ms. Treating as connection error.`
        );
        try {
          atClient.disconnect?.();
        } catch {
          // Ignore cleanup errors
        }
        clientRef.current = null;
        setClient(null);
        setIsInitialized(false);
        setIsReady(false);
        setCallState("error");
        setError("Phone service connection timed out. Retrying...");
      }, INIT_TIMEOUT_MS);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize call client";
      console.error("[AT Client] Initialization error:", errorMessage);
      setError(errorMessage);
      setCallState("error");
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      isInitializingRef.current = false;
    }
  }, [
    entityId,
    isInitialized,
    error,
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
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
      if (clientRef.current) {
        // @ts-expect-error - client disconnect method
        clientRef.current.disconnect?.();
      }
    };
  }, [stopDurationTimer]);

  // ==================== Disconnect ====================

  const disconnect = useCallback(() => {
    stopDurationTimer();
    // Cancel any pending reconnect or init timeout
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }
    reconnectAttemptsRef.current = 0;
    hasNotifiedDisconnectRef.current = false;
    if (clientRef.current) {
      // @ts-expect-error - client disconnect method
      clientRef.current.disconnect?.();
      clientRef.current = null;
    }
    setClient(null);
    setIsInitialized(false);
    setIsReady(false);
    setCallState("idle");
    setActiveCall(null);
    setIncomingCall(null);
    setError(null);
    onClientDisconnectedRef.current?.();
  }, [stopDurationTimer]);

  // ==================== Auto-Reconnect ====================

  useEffect(() => {
    // Only attempt reconnect when in error state and not initialized
    if (callState !== "error" || isInitialized) return;

    if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.pow(2, reconnectAttemptsRef.current + 1) * 1000; // 2s, 4s, 8s
      console.log(
        `[AT Client] Auto-reconnect attempt ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`
      );

      reconnectTimerRef.current = setTimeout(() => {
        reconnectAttemptsRef.current += 1;
        initialize();
      }, delay);
    } else if (!hasNotifiedDisconnectRef.current) {
      // All attempts exhausted - notify backend and show final error
      console.log("[AT Client] All reconnect attempts exhausted, notifying backend");
      hasNotifiedDisconnectRef.current = true;
      setError("Connection lost. Check your internet connection.");
      onClientDisconnectedRef.current?.();
    }

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [callState, isInitialized, initialize]);

  // ==================== Retry Connection (Manual) ====================

  const retryConnection = useCallback(() => {
    // Reset reconnect counters so auto-reconnect gets another full set of attempts
    reconnectAttemptsRef.current = 0;
    hasNotifiedDisconnectRef.current = false;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    // Clear error state and re-initialize
    setIsInitialized(false);
    setError(null);
    setCallState("idle");
    // Trigger initialize on next tick after state updates
    setTimeout(() => initialize(), 0);
  }, [initialize]);

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
    disconnect,
    retryConnection,
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
import { config } from "@/src/lib/config";

type CallCenterContextValue = UseAfricasTalkingClientReturn;

const CallCenterContext = createContext<CallCenterContextValue | null>(null);

export function CallCenterProvider({
  children,
  options,
}: {
  children: ReactNode;
  options?: Omit<UseAfricasTalkingClientOptions, "entityId">;
}) {
  // Get entityId, accessToken, and activity source registration from auth context
  const { selectedEntityId, accessToken, registerActivitySource } = useAuth();

  // Send offline status to backend when WebRTC client disconnects or browser closes
  const handleClientDisconnected = useCallback(() => {
    if (!selectedEntityId || !accessToken) return;

    const url = `${config.api.baseUrl}/api/${config.api.version}/voice/agent/status?entity_id=${selectedEntityId}`;
    // Use fetch with keepalive to ensure request completes even during page unload
    fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ status: "offline" }),
      keepalive: true,
    }).catch(() => {
      // Best-effort — ignore errors during disconnect
    });
  }, [selectedEntityId, accessToken]);

  // Set agent offline on browser close/navigate
  useEffect(() => {
    const handleBeforeUnload = () => {
      handleClientDisconnected();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [handleClientDisconnected]);

  const value = useAfricasTalkingClient({
    ...options,
    entityId: selectedEntityId ?? undefined,
    onClientDisconnected: handleClientDisconnected,
  });

  // Register call center as an activity source for token refresh.
  // When the WebRTC client is connected (agent waiting for calls) or
  // a call is active, the agent should not be logged out due to inactivity.
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    const unregister = registerActivitySource(() => {
      // Agent is "active" if their WebRTC client is connected (ready to
      // receive calls) OR they're currently on a call.
      return valueRef.current.isReady || valueRef.current.isCallActive;
    });
    return unregister;
  }, [registerActivitySource]);

  return <CallCenterContext.Provider value={value}>{children}</CallCenterContext.Provider>;
}

export function useCallCenterContext() {
  const context = useContext(CallCenterContext);
  if (!context) {
    throw new Error("useCallCenterContext must be used within a CallCenterProvider");
  }
  return context;
}
