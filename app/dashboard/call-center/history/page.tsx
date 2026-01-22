"use client";

/**
 * Call History Page
 *
 * Displays paginated call logs with filtering and search capabilities.
 */

import { useState, useCallback } from "react";
import { useCallLogs } from "@/src/hooks/useCallCenter";
import { CallCenterHeader } from "@/src/components/call-center";
import { CallHistoryTable } from "@/src/components/call-center/CallHistoryTable";
import { CallDetailModal } from "@/src/components/call-center/CallDetailModal";
import { CallLog, CallDirection, CallStatus } from "@/src/types/voice";
import { Card, Input, Button, Select } from "@/src/components/ui";

const PAGE_SIZE = 20;

export default function CallHistoryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [phoneSearch, setPhoneSearch] = useState("");
  const [directionFilter, setDirectionFilter] = useState<CallDirection | "">("");
  const [statusFilter, setStatusFilter] = useState<CallStatus | "">("");

  // Build filters object
  const filters = {
    phone_number: phoneSearch || undefined,
    direction: directionFilter || undefined,
    status: statusFilter || undefined,
    skip: (currentPage - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  };

  // Fetch call logs
  const { data: callLogsResponse, isLoading, refetch } = useCallLogs(filters);

  // Handle call selection
  const handleSelectCall = useCallback((call: CallLog) => {
    setSelectedCall(call);
    setIsModalOpen(true);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle filter changes
  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    refetch();
  }, [refetch]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setPhoneSearch("");
    setDirectionFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Shared Header with Entity Selector */}
      <CallCenterHeader description="View and search call logs and recordings" />

      {/* Filters */}
      <Card variant="bordered" padding="md" className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Search Phone Number"
              placeholder="+254..."
              value={phoneSearch}
              onChange={(e) => setPhoneSearch(e.target.value)}
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
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-text-secondary mb-1">Direction</label>
            <Select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value as CallDirection | "")}
            >
              <option value="">All</option>
              <option value={CallDirection.INBOUND}>Inbound</option>
              <option value={CallDirection.OUTBOUND}>Outbound</option>
            </Select>
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CallStatus | "")}
            >
              <option value="">All</option>
              <option value={CallStatus.COMPLETED}>Completed</option>
              <option value={CallStatus.MISSED}>Missed</option>
              <option value={CallStatus.BUSY}>Busy</option>
              <option value={CallStatus.NO_ANSWER}>No Answer</option>
              <option value={CallStatus.FAILED}>Failed</option>
            </Select>
          </div>
          <Button variant="primary" size="sm" onClick={handleSearch}>
            Search
          </Button>
          {(phoneSearch || directionFilter || statusFilter) && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Call History Table */}
      <CallHistoryTable
        calls={callLogsResponse?.items || []}
        isLoading={isLoading}
        totalCount={callLogsResponse?.total || 0}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        onSelectCall={handleSelectCall}
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
