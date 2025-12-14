"use client";

/**
 * Task Detail Modal
 *
 * Modal for viewing complete task details with expandable sections
 * matching the mobile app's task detail bottom sheet.
 */

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import {
  ContactDetail,
  OpportunityDetail,
  CaseDetail,
  getContactFullName,
  getContactPhones,
  formatLocation,
  getStatusVariant,
  getPriorityVariant,
  getDueDateStatus,
  getDueDateColorClasses,
  getDueDateLabel,
  getCaseStatusClasses,
  getQADecisionClasses,
} from "../types/task";
import { cn } from "../lib/theme";
import { Badge } from "./ui/Badge";
import { Spinner } from "./ui/Spinner";

interface TaskDetailModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Expandable Section Component
 */
function ExpandableSection({
  title,
  subtitle,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border-light rounded-lg overflow-hidden bg-background-light/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3",
          "text-left transition-colors hover:bg-background-light",
          isOpen && "bg-background-light"
        )}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-primary">{icon}</span>}
          <div>
            <div className="font-medium text-text-primary">{title}</div>
            {subtitle && <div className="text-xs text-text-secondary">{subtitle}</div>}
          </div>
        </div>
        <svg
          className={cn(
            "w-5 h-5 text-text-secondary transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="px-4 py-3 border-t border-border-light bg-white">{children}</div>}
    </div>
  );
}

/**
 * Info Row Component
 */
function InfoRow({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value?: string | null;
  icon?: React.ReactNode;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-2 py-1.5">
      {icon && <span className="text-text-secondary mt-0.5">{icon}</span>}
      <div className="flex-1">
        <div className="text-xs text-text-secondary">{label}</div>
        <div className={cn("text-sm", href ? "text-primary hover:underline" : "text-text-primary")}>
          {value || "-"}
          {href && (
            <svg
              className="w-3 h-3 inline-block ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block hover:bg-background-light/50 rounded -mx-1 px-1 transition-colors"
      >
        {content}
      </a>
    );
  }

  return content;
}

/**
 * Contact Card Component
 */
function ContactCard({ contact }: { contact: ContactDetail }) {
  const phones = getContactPhones(contact);
  const fullName = getContactFullName(contact);

  return (
    <div className="border border-border-light rounded-lg p-3 bg-white">
      <div className="font-medium text-text-primary">{fullName}</div>
      {contact.title && <div className="text-xs text-text-secondary">{contact.title}</div>}
      {contact.email && (
        <div className="text-sm text-primary mt-1">
          <a href={`mailto:${contact.email}`} className="hover:underline">
            {contact.email}
          </a>
        </div>
      )}
      {phones.length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {phones.map((p, i) => (
            <div key={i} className="text-xs">
              <span className="text-text-secondary">{p.label}: </span>
              <a href={`tel:${p.number}`} className="text-primary hover:underline">
                {p.number}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Opportunity Card Component
 */
function OpportunityCard({
  opportunity,
  isRelated = false,
}: {
  opportunity: OpportunityDetail;
  isRelated?: boolean;
}) {
  const hasLocation = opportunity.display_latitude && opportunity.display_longitude;

  return (
    <div
      className={cn(
        "border border-border-light rounded-lg p-3",
        isRelated ? "bg-primary/5" : "bg-white"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium text-text-primary">{opportunity.name}</div>
          {opportunity.product_interest && (
            <div className="text-xs text-text-secondary mt-0.5">{opportunity.product_interest}</div>
          )}
        </div>
        {opportunity.stage && (
          <Badge variant="default" size="sm">
            {opportunity.stage}
          </Badge>
        )}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        {opportunity.project_construction_status && (
          <div>
            <span className="text-text-secondary">Construction: </span>
            <span className="text-text-primary">{opportunity.project_construction_status}</span>
          </div>
        )}
        {opportunity.payment_status && (
          <div>
            <span className="text-text-secondary">Payment: </span>
            <span className="text-text-primary">{opportunity.payment_status}</span>
          </div>
        )}
        {opportunity.total_square_meters && (
          <div>
            <span className="text-text-secondary">Area: </span>
            <span className="text-text-primary">{opportunity.total_square_meters} m²</span>
          </div>
        )}
        {opportunity.amount && (
          <div>
            <span className="text-text-secondary">Amount: </span>
            <span className="text-text-primary">${opportunity.amount.toLocaleString()}</span>
          </div>
        )}
      </div>

      {hasLocation && (
        <div className="mt-2">
          <a
            href={`https://www.google.com/maps?q=${opportunity.display_latitude},${opportunity.display_longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            View on Map
          </a>
        </div>
      )}

      {/* Mason Contact */}
      {opportunity.mason_contact && (
        <div className="mt-2 pt-2 border-t border-border-light">
          <div className="text-xs text-text-secondary">Mason</div>
          <div className="text-sm text-text-primary">
            {opportunity.mason_contact.name || opportunity.mason_contact.email}
          </div>
        </div>
      )}

      {/* QA Surveys */}
      {opportunity.quality_assurance_surveys &&
        opportunity.quality_assurance_surveys.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border-light">
            <div className="text-xs text-text-secondary mb-1">
              QA Surveys ({opportunity.quality_assurance_surveys.length})
            </div>
            <div className="space-y-1">
              {opportunity.quality_assurance_surveys.slice(0, 3).map((qa) => (
                <div key={qa.id} className="flex items-center justify-between text-xs">
                  <span className="text-text-primary">{qa.subject || qa.type || "Survey"}</span>
                  {qa.decision && (
                    <span
                      className={cn("px-2 py-0.5 rounded-full", getQADecisionClasses(qa.decision))}
                    >
                      {qa.decision}
                    </span>
                  )}
                </div>
              ))}
              {opportunity.quality_assurance_surveys.length > 3 && (
                <div className="text-xs text-text-secondary">
                  +{opportunity.quality_assurance_surveys.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}

      {/* Project Info */}
      {opportunity.project && (
        <div className="mt-2 pt-2 border-t border-border-light">
          <div className="text-xs text-text-secondary">Project</div>
          <div className="text-sm text-text-primary">
            {opportunity.project.project_number || "Project"}
            {opportunity.project.date_completed && (
              <span className="text-text-secondary ml-2">
                Completed: {new Date(opportunity.project.date_completed).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Case Card Component
 */
function CaseCard({ caseItem }: { caseItem: CaseDetail }) {
  const isOpen = !caseItem.is_closed;

  return (
    <div className="border border-border-light rounded-lg p-3 bg-white">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-text-primary">
            {caseItem.case_number || "Case"}
          </div>
          {caseItem.subject && (
            <div className="text-xs text-text-secondary mt-0.5">{caseItem.subject}</div>
          )}
        </div>
        <span className={cn("px-2 py-0.5 rounded-full text-xs", getCaseStatusClasses(!isOpen))}>
          {isOpen ? "Open" : "Closed"}
        </span>
      </div>
      {caseItem.type && (
        <div className="text-xs text-text-secondary mt-1">Type: {caseItem.type}</div>
      )}
      {caseItem.priority && (
        <div className="text-xs text-text-secondary">Priority: {caseItem.priority}</div>
      )}
    </div>
  );
}

/**
 * Task Detail Modal
 */
export function TaskDetailModal({ taskId, isOpen, onClose }: TaskDetailModalProps) {
  // Fetch complete task data
  const {
    data: task,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["task-complete", taskId],
    queryFn: () => apiClient.getTaskComplete(taskId!),
    enabled: !!taskId && isOpen,
  });

  // Format date helper
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get task type icon
  const getTaskTypeIcon = (type?: string) => {
    const lower = type?.toLowerCase() || "";
    if (lower === "call") {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      );
    }
    if (lower === "meeting") {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    );
  };

  // Calculate case counts
  const openCases = task?.account_detail?.cases?.filter((c) => !c.is_closed).length || 0;
  const closedCases = task?.account_detail?.cases?.filter((c) => c.is_closed).length || 0;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-light flex items-start justify-between">
            <div className="flex items-start gap-3">
              {task && <div className="text-primary mt-1">{getTaskTypeIcon(task.type)}</div>}
              <div>
                <Dialog.Title className="text-xl font-heading font-bold text-text-primary">
                  {task?.subject || "Task Details"}
                </Dialog.Title>
                {task?.subject_ref && (
                  <div className="text-sm text-text-secondary mt-0.5">{task.subject_ref.name}</div>
                )}
              </div>
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
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-status-error">Failed to load task details</p>
              </div>
            ) : task ? (
              <div className="space-y-6">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  {task.status && (
                    <Badge variant={getStatusVariant(task.status)} size="md">
                      {task.status}
                    </Badge>
                  )}
                  {task.priority && (
                    <Badge variant={getPriorityVariant(task.priority)} size="md">
                      {task.priority} Priority
                    </Badge>
                  )}
                  {task.type && (
                    <Badge variant="default" size="md">
                      {task.type}
                    </Badge>
                  )}
                  {(() => {
                    const dueDateStatus = getDueDateStatus(task.due_date, task.status);
                    return (
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-sm font-medium",
                          getDueDateColorClasses(dueDateStatus)
                        )}
                      >
                        {getDueDateLabel(dueDateStatus)}
                      </span>
                    );
                  })()}
                </div>

                {/* Basic Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-background-light rounded-lg p-4">
                  <InfoRow
                    label="Due Date"
                    value={formatDate(task.due_date)}
                    icon={
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    }
                  />
                  <InfoRow
                    label="Assignee"
                    value={
                      task.employee_surveyor?.name || task.employee_surveyor?.email || "Unassigned"
                    }
                    icon={
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    }
                    href={
                      task.employee_surveyor?.id
                        ? `/dashboard/users/${task.employee_surveyor.id}`
                        : undefined
                    }
                  />
                  <InfoRow
                    label="Times Called"
                    value={String(task.number_of_times_called || 0)}
                    icon={
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    }
                  />
                  <InfoRow label="Created" value={formatDate(task.created_at)} />
                  {task.completed_at && (
                    <InfoRow label="Completed" value={formatDate(task.completed_at)} />
                  )}
                  {openCases > 0 && (
                    <InfoRow
                      label="Open Cases"
                      value={`${openCases} open, ${closedCases} closed`}
                      icon={
                        <svg
                          className="w-4 h-4 text-status-warning"
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
                      }
                    />
                  )}
                </div>

                {/* Description */}
                {task.description && (
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-2">Description</h3>
                    <p className="text-text-primary text-sm whitespace-pre-wrap bg-background-light rounded-lg p-4">
                      {task.description}
                    </p>
                  </div>
                )}

                {/* Short Comment */}
                {task.short_comment && (
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-2">Notes</h3>
                    <p className="text-text-primary text-sm whitespace-pre-wrap bg-background-light rounded-lg p-4">
                      {task.short_comment}
                    </p>
                  </div>
                )}

                {/* Expandable Sections */}
                <div className="space-y-3">
                  {/* Account Details */}
                  {task.account_detail && (
                    <ExpandableSection
                      title="Account Details"
                      subtitle={task.account_detail.name}
                      defaultOpen
                      icon={
                        <svg
                          className="w-5 h-5"
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
                      }
                    >
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <InfoRow label="Account Name" value={task.account_detail.name} />
                          <InfoRow label="Phone" value={task.account_detail.phone} />
                          <InfoRow
                            label="Account ID"
                            value={task.account_detail.unique_account_id}
                          />
                          <InfoRow
                            label="Customer ID"
                            value={task.account_detail.unique_customer_id}
                          />
                        </div>
                        <InfoRow
                          label="Location"
                          value={formatLocation({
                            umudugudu_text: task.account_detail.umudugudu_text,
                            cell: task.account_detail.cell,
                            sector: task.account_detail.sector,
                            umudugudu_district: task.account_detail.umudugudu_district,
                            country: task.account_detail.umudugudu_country,
                          })}
                          icon={
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          }
                        />
                      </div>
                    </ExpandableSection>
                  )}

                  {/* Account Contacts */}
                  {task.account_detail?.contacts && task.account_detail.contacts.length > 0 && (
                    <ExpandableSection
                      title="Account Contacts"
                      subtitle={`${task.account_detail.contacts.length} contact(s)`}
                      icon={
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      }
                    >
                      <div className="space-y-2">
                        {task.account_detail.contacts.map((contact) => (
                          <ContactCard key={contact.id} contact={contact} />
                        ))}
                      </div>
                    </ExpandableSection>
                  )}

                  {/* Related Opportunity (task's direct opportunity) */}
                  {task.opportunity_detail && (
                    <ExpandableSection
                      title="Related Opportunity"
                      subtitle={task.opportunity_detail.name}
                      defaultOpen
                      icon={
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      }
                    >
                      <OpportunityCard opportunity={task.opportunity_detail} isRelated />
                    </ExpandableSection>
                  )}

                  {/* Other Opportunities */}
                  {task.account_detail?.opportunities &&
                    task.account_detail.opportunities.length > 0 && (
                      <ExpandableSection
                        title="Other Opportunities"
                        subtitle={`${task.account_detail.opportunities.filter((o) => o.id !== task.opportunity_id).length} opportunity(ies)`}
                        icon={
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                        }
                      >
                        <div className="space-y-2">
                          {task.account_detail.opportunities
                            .filter((o) => o.id !== task.opportunity_id)
                            .map((opportunity) => (
                              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                            ))}
                          {task.account_detail.opportunities.filter(
                            (o) => o.id !== task.opportunity_id
                          ).length === 0 && (
                            <p className="text-sm text-text-secondary italic">
                              No other opportunities
                            </p>
                          )}
                        </div>
                      </ExpandableSection>
                    )}

                  {/* Support Cases */}
                  {task.account_detail?.cases && task.account_detail.cases.length > 0 && (
                    <ExpandableSection
                      title="Support Cases"
                      subtitle={`${openCases} open, ${closedCases} closed`}
                      icon={
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                      }
                    >
                      <div className="space-y-2">
                        {task.account_detail.cases.map((caseItem) => (
                          <CaseCard key={caseItem.id} caseItem={caseItem} />
                        ))}
                      </div>
                    </ExpandableSection>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border-light bg-background-light">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-text-primary bg-white border border-border-light rounded-lg hover:bg-background-light transition-colors"
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
