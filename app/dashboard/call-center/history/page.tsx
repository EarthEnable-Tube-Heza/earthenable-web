"use client";

/**
 * Call History Page
 *
 * Displays paginated call logs with filtering and search capabilities.
 */

import { useState, useCallback } from "react";
import { useCallLogs, useCallCenterEntity } from "@/src/hooks/useCallCenter";
import { CallCenterHeader } from "@/src/components/call-center";
import { CallHistoryTable } from "@/src/components/call-center/CallHistoryTable";
import { CallDetailModal } from "@/src/components/call-center/CallDetailModal";
import { CallLog, CallDirection, CallStatus } from "@/src/types/voice";
import { Input, Button } from "@/src/components/ui";
import { MultiSelect } from "@/src/components/ui/MultiSelect";

const PAGE_SIZE = 20;

export default function CallHistoryPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [phoneSearch, setPhoneSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [directionFilter, setDirectionFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  // Use persistent entity selection (shared with header)
  const { selectedEntityId } = useCallCenterEntity();

  // Build filters object
  const filters = {
    entity_id: selectedEntityId,
    phone_number: phoneSearch || undefined,
    direction: directionFilter.length > 0 ? directionFilter.join(",") : undefined,
    status: statusFilter.length > 0 ? statusFilter.join(",") : undefined,
    skip: currentPage * PAGE_SIZE,
    limit: PAGE_SIZE,
  };

  // Fetch call logs
  const { data: callLogsResponse, isLoading, error, refetch } = useCallLogs(filters);

  // Handle call selection
  const handleSelectCall = useCallback((call: CallLog) => {
    setSelectedCall(call);
    setIsModalOpen(true);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle search
  const handleSearch = useCallback(() => {
    setPhoneSearch(searchInput);
    setCurrentPage(0);
  }, [searchInput]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setPhoneSearch("");
    setSearchInput("");
    setDirectionFilter([]);
    setStatusFilter([]);
    setCurrentPage(0);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = phoneSearch || directionFilter.length > 0 || statusFilter.length > 0;

  return (
    <div className="space-y-6">
      {/* Shared Header with Entity Selector */}
      <CallCenterHeader description="View and search call logs and recordings" />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-medium p-4 sm:p-6">
        {/* Search Row */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Search phone number..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <MultiSelect
            label="Direction"
            placeholder="All Directions"
            options={[
              { value: CallDirection.INBOUND, label: "Inbound" },
              { value: CallDirection.OUTBOUND, label: "Outbound" },
            ]}
            value={directionFilter}
            onChange={(values) => {
              setDirectionFilter(values);
              setCurrentPage(0);
            }}
            size="sm"
          />
          <MultiSelect
            label="Status"
            placeholder="All Statuses"
            options={[
              { value: CallStatus.COMPLETED, label: "Completed" },
              { value: CallStatus.MISSED, label: "Missed" },
              { value: CallStatus.BUSY, label: "Busy" },
              { value: CallStatus.NO_ANSWER, label: "No Answer" },
              { value: CallStatus.FAILED, label: "Failed" },
            ]}
            value={statusFilter}
            onChange={(values) => {
              setStatusFilter(values);
              setCurrentPage(0);
            }}
            size="sm"
          />
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-border-light">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                Active Filters:
              </span>
              {phoneSearch && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  Phone: {phoneSearch}
                  <button
                    onClick={() => {
                      setPhoneSearch("");
                      setSearchInput("");
                      setCurrentPage(0);
                    }}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                  >
                    ×
                  </button>
                </span>
              )}
              {directionFilter.map((direction) => {
                const label =
                  {
                    [CallDirection.INBOUND]: "Inbound",
                    [CallDirection.OUTBOUND]: "Outbound",
                  }[direction] || direction;
                return (
                  <span
                    key={`direction-${direction}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                  >
                    Direction: {label}
                    <button
                      onClick={() => {
                        setDirectionFilter(directionFilter.filter((d) => d !== direction));
                        setCurrentPage(0);
                      }}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
              {statusFilter.map((status) => {
                const label =
                  {
                    [CallStatus.COMPLETED]: "Completed",
                    [CallStatus.MISSED]: "Missed",
                    [CallStatus.BUSY]: "Busy",
                    [CallStatus.NO_ANSWER]: "No Answer",
                    [CallStatus.FAILED]: "Failed",
                  }[status] || status;
                return (
                  <span
                    key={`status-${status}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700"
                  >
                    Status: {label}
                    <button
                      onClick={() => {
                        setStatusFilter(statusFilter.filter((s) => s !== status));
                        setCurrentPage(0);
                      }}
                      className="ml-1 hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
              <button
                onClick={handleClearFilters}
                className="text-xs text-status-error hover:text-status-error/80 font-medium ml-2"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Call History Table */}
      <CallHistoryTable
        calls={callLogsResponse?.items || []}
        isLoading={isLoading}
        error={error as Error | null}
        totalCount={callLogsResponse?.total || 0}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        onSelectCall={handleSelectCall}
        onRetry={refetch}
      />

      {/* Call Detail Modal */}
      <CallDetailModal
        call={selectedCall}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCall(null);
        }}
      />
    </div>
  );
}
