"use client";

/**
 * Call Detail Modal Component
 *
 * Modal showing detailed information about a specific call,
 * including recording playback if available.
 */

import { useState, useRef, useEffect } from "react";
import { cn } from "@/src/lib/theme";
import {
  CallLog,
  CallDirection,
  CALL_STATUS_CONFIG,
  formatDuration,
  formatDurationLong,
} from "@/src/types/voice";
import { useCallRecordingUrl } from "@/src/hooks/useCallCenter";
import { Button, Badge, Spinner } from "@/src/components/ui";

interface CallDetailModalProps {
  /** The call to display */
  call: CallLog | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
}

export function CallDetailModal({ call, isOpen, onClose }: CallDetailModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch recording URL if call has recording
  // Only fetch when modal is open and call has a recording
  const shouldFetchRecording = isOpen && !!call?.recording_url;
  const {
    data: recordingData,
    isLoading: isLoadingRecording,
    error: recordingError,
  } = useCallRecordingUrl(shouldFetchRecording ? call?.id : undefined);

  // Reset audio state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isOpen]);

  if (!isOpen || !call) {
    return null;
  }

  const statusConfig = CALL_STATUS_CONFIG[call.status];
  const phoneNumber =
    call.direction === CallDirection.INBOUND ? call.caller_number : call.callee_number;

  // Toggle audio playback
  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-light">
            <h2 className="text-lg font-heading font-semibold text-text-primary">Call Details</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-background-light transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Call Info Header */}
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  call.direction === CallDirection.INBOUND
                    ? "bg-status-info/10"
                    : "bg-status-success/10"
                )}
              >
                {call.direction === CallDirection.INBOUND ? (
                  <svg
                    className="w-6 h-6 text-status-info"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-status-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-lg font-heading font-semibold text-text-primary">
                  {phoneNumber}
                </p>
                <p className="text-sm text-text-secondary capitalize">{call.direction} call</p>
              </div>
              <Badge
                variant={
                  call.status === "completed"
                    ? "success"
                    : call.status === "failed" || call.status === "missed"
                      ? "error"
                      : "default"
                }
                className="ml-auto"
              >
                {statusConfig?.label || call.status}
              </Badge>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-background-light rounded-lg">
              <div>
                <p className="text-xs text-text-secondary">Started</p>
                <p className="text-sm font-medium text-text-primary">
                  {formatDate(call.started_at)}
                </p>
              </div>
              {call.answered_at && (
                <div>
                  <p className="text-xs text-text-secondary">Answered</p>
                  <p className="text-sm font-medium text-text-primary">
                    {formatDate(call.answered_at)}
                  </p>
                </div>
              )}
              {call.ended_at && (
                <div>
                  <p className="text-xs text-text-secondary">Ended</p>
                  <p className="text-sm font-medium text-text-primary">
                    {formatDate(call.ended_at)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-text-secondary">Duration</p>
                <p className="text-sm font-medium text-text-primary">
                  {call.duration_seconds > 0 ? formatDurationLong(call.duration_seconds) : "-"}
                </p>
              </div>
              {call.wait_time_seconds > 0 && (
                <div>
                  <p className="text-xs text-text-secondary">Wait Time</p>
                  <p className="text-sm font-medium text-text-primary">
                    {formatDurationLong(call.wait_time_seconds)}
                  </p>
                </div>
              )}
              {call.agent_name && (
                <div>
                  <p className="text-xs text-text-secondary">Agent</p>
                  <p className="text-sm font-medium text-text-primary">{call.agent_name}</p>
                </div>
              )}
              {call.queue_name && (
                <div>
                  <p className="text-xs text-text-secondary">Queue</p>
                  <p className="text-sm font-medium text-text-primary">{call.queue_name}</p>
                </div>
              )}
              {call.hangup_cause && (
                <div>
                  <p className="text-xs text-text-secondary">Hangup Cause</p>
                  <p className="text-sm font-medium text-text-primary">{call.hangup_cause}</p>
                </div>
              )}
              {call.cost !== undefined && call.cost > 0 && (
                <div>
                  <p className="text-xs text-text-secondary">Cost</p>
                  <p className="text-sm font-medium text-text-primary">
                    {call.cost.toFixed(2)} {call.currency || "USD"}
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            {call.notes && (
              <div>
                <p className="text-xs text-text-secondary mb-1">Notes</p>
                <p className="text-sm text-text-primary bg-background-light p-3 rounded-lg">
                  {call.notes}
                </p>
              </div>
            )}

            {/* Recording Player */}
            {call.recording_url && (
              <div className="border border-border-light rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
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
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-text-primary">Call Recording</span>
                  </div>
                  {call.recording_duration_seconds && (
                    <span className="text-xs text-text-secondary">
                      {formatDuration(call.recording_duration_seconds)}
                    </span>
                  )}
                </div>

                {isLoadingRecording ? (
                  <div className="flex items-center justify-center py-4">
                    <Spinner size="sm" label="Loading recording..." />
                  </div>
                ) : recordingError ? (
                  <p className="text-sm text-status-error">Failed to load recording</p>
                ) : recordingData?.url ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayback}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                        isPlaying
                          ? "bg-primary text-white"
                          : "bg-background-light hover:bg-border-light text-text-primary"
                      )}
                    >
                      {isPlaying ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </button>
                    <audio
                      ref={audioRef}
                      src={recordingData.url}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                    <div className="flex-1">
                      <div className="h-2 bg-background-light rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-200"
                          style={{ width: isPlaying ? "50%" : "0%" }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">Recording not available</p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-border-light">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
