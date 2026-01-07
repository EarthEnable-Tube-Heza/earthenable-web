"use client";

/**
 * SMS Log Detail Modal
 *
 * Modal for viewing detailed information about an SMS log entry.
 */

import { Dialog } from "@headlessui/react";
import { useSmsLog } from "@/src/hooks/useSms";
import { getSmsStatusLabel, getSmsStatusColors } from "@/src/types";
import { Spinner } from "../ui/Spinner";

interface SmsLogDetailModalProps {
  logId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SmsLogDetailModal({ logId, isOpen, onClose }: SmsLogDetailModalProps) {
  const { data: log, isLoading } = useSmsLog(logId || undefined);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatCost = (cost: number | null | undefined, currency: string | null | undefined) => {
    if (cost === null || cost === undefined) return "—";
    return `${currency || "KES"} ${cost.toFixed(2)}`;
  };

  const statusColors = log
    ? getSmsStatusColors(log.status)
    : { bg: "bg-gray-100", text: "text-gray-800" };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-light flex items-start justify-between">
            <div>
              <Dialog.Title className="text-xl font-heading font-bold text-text-primary">
                SMS Log Details
              </Dialog.Title>
              {log && (
                <p className="text-sm text-text-secondary mt-0.5">
                  Message ID: {log.id.substring(0, 8)}...
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : !log ? (
              <div className="text-center py-12">
                <p className="text-text-secondary">Log not found.</p>
              </div>
            ) : (
              <>
                {/* Status Banner */}
                <div className={`p-4 rounded-lg ${statusColors.bg}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-lg font-semibold ${statusColors.text}`}>
                        {getSmsStatusLabel(log.status)}
                      </span>
                      {log.failure_reason && (
                        <p className="text-sm text-red-700 mt-1">Reason: {log.failure_reason}</p>
                      )}
                    </div>
                    {log.cost !== null && log.cost !== undefined && (
                      <div className="text-right">
                        <span className="text-sm text-text-secondary">Cost</span>
                        <p className="text-lg font-semibold text-text-primary">
                          {formatCost(log.cost, log.currency)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recipient Information */}
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-3">Recipient</h3>
                  <div className="bg-background-light rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Phone</span>
                      <span className="text-sm font-medium text-text-primary">
                        {log.recipient_phone}
                      </span>
                    </div>
                    {log.recipient_name && (
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">Name</span>
                        <span className="text-sm font-medium text-text-primary">
                          {log.recipient_name}
                        </span>
                      </div>
                    )}
                    {log.recipient_type && (
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">Type</span>
                        <span className="text-sm font-medium text-text-primary capitalize">
                          {log.recipient_type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-3">Message</h3>
                  <div className="bg-background-light rounded-lg p-4">
                    <p className="text-sm text-text-primary whitespace-pre-wrap">
                      {log.message_body}
                    </p>
                    <div className="flex gap-4 mt-3 pt-3 border-t border-border-light">
                      <div className="text-xs text-text-secondary">
                        <span className="font-medium">{log.character_count}</span> characters
                      </div>
                      <div className="text-xs text-text-secondary">
                        <span className="font-medium">{log.segment_count}</span> segment(s)
                      </div>
                      <div className="text-xs text-text-secondary">
                        Encoding: <span className="font-medium">{log.encoding.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template Information */}
                {log.template_code && (
                  <div>
                    <h3 className="text-sm font-medium text-text-primary mb-3">Template</h3>
                    <div className="bg-background-light rounded-lg p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
                        {log.template_code}
                      </span>
                    </div>
                  </div>
                )}

                {/* Context Information */}
                {(log.context_type || log.context_id) && (
                  <div>
                    <h3 className="text-sm font-medium text-text-primary mb-3">Context</h3>
                    <div className="bg-background-light rounded-lg p-4 space-y-2">
                      {log.context_type && (
                        <div className="flex justify-between">
                          <span className="text-sm text-text-secondary">Type</span>
                          <span className="text-sm font-medium text-text-primary capitalize">
                            {log.context_type}
                          </span>
                        </div>
                      )}
                      {log.context_id && (
                        <div className="flex justify-between">
                          <span className="text-sm text-text-secondary">ID</span>
                          <span className="text-sm font-mono text-text-primary">
                            {log.context_id}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Provider Information */}
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-3">Provider Details</h3>
                  <div className="bg-background-light rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Provider</span>
                      <span className="text-sm font-medium text-text-primary capitalize">
                        {log.provider}
                      </span>
                    </div>
                    {log.provider_message_id && (
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">Provider Message ID</span>
                        <span className="text-sm font-mono text-text-primary">
                          {log.provider_message_id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-3">Timeline</h3>
                  <div className="bg-background-light rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary">Created</span>
                      <span className="text-sm font-medium text-text-primary">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                    {log.sent_at && (
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">Sent</span>
                        <span className="text-sm font-medium text-text-primary">
                          {formatDate(log.sent_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border-light bg-background-light">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-text-primary bg-white border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
