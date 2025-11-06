'use client';

/**
 * Task Subjects Page (Admin only)
 *
 * Displays and manages TaskSubjects with their FormYoula form mappings.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/src/lib/api';
import { TaskSubjectForm } from '@/src/types/form';
import { cn } from '@/src/lib/theme';
import { EditFormMappingModal } from '@/src/components/EditFormMappingModal';
import { Select } from '@/src/components/ui/Select';

export default function TaskSubjectsPage() {
  const [page, setPage] = useState(0);
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [selectedMapping, setSelectedMapping] = useState<TaskSubjectForm | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 50;

  // Fetch form mappings with filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['form-mappings', page, countryFilter],
    queryFn: () =>
      apiClient.getFormMappings({
        skip: page * limit,
        limit,
        country_code: countryFilter || undefined,
      }),
  });

  const mappings = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Get unique countries for filter
  const countries = ['RW', 'KE', 'ZM', 'IN'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-text-primary">
          Task Subjects
        </h1>
        <p className="text-text-secondary mt-2">
          Manage task subjects and their FormYoula form mappings
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-status-info/10 border border-status-info rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-status-info text-xl">ℹ️</span>
          <div>
            <p className="text-status-info font-medium mb-1">About Task Subjects</p>
            <p className="text-status-info/80 text-sm">
              Task subjects are evaluation types used across different countries.
              Each subject can have different FormYoula forms for different countries, with default forms used when no country-specific mapping exists.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-text-primary">
            Filter by Country:
          </label>
          <Select
            value={countryFilter}
            onChange={(e) => {
              setCountryFilter(e.target.value);
              setPage(0);
            }}
            fullWidth={false}
          >
            <option value="">All Countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </Select>
          {countryFilter && (
            <button
              onClick={() => {
                setCountryFilter('');
                setPage(0);
              }}
              className="text-sm text-status-error hover:text-status-error/80"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Task Subjects Table */}
      <div className="bg-white rounded-lg shadow-medium overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-text-secondary mt-2">Loading task subjects...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-status-error">
              Error loading task subjects. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        ) : mappings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-secondary">No task subjects found.</p>
          </div>
        ) : (
          <>
            {/* Horizontal scroll container for mobile */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
              <thead className="bg-background-light border-b border-border-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    TaskSubject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    FormYoula Form ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {mappings.map((mapping) => (
                  <tr
                    key={mapping.id}
                    className="hover:bg-background-light transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-text-primary">
                        {mapping.task_subject_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                        {mapping.country_code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm font-mono text-text-primary bg-background-light px-2 py-1 rounded">
                        {mapping.formyoula_form_id}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      {mapping.is_default ? (
                        <span className="px-2 py-1 text-xs font-medium bg-status-warning/10 text-status-warning rounded-full">
                          Default
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-status-info/10 text-status-info rounded-full">
                          Specific
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedMapping(mapping);
                          setIsModalOpen(true);
                        }}
                        className="text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        Edit Form ID
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-text-secondary">
                  Showing {page * limit + 1} to{' '}
                  {Math.min((page + 1) * limit, total)} of {total} task subjects
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium',
                      page === 0
                        ? 'bg-background-light text-text-disabled cursor-not-allowed'
                        : 'bg-white border border-border-light text-text-primary hover:bg-background-light'
                    )}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium',
                      page >= totalPages - 1
                        ? 'bg-background-light text-text-disabled cursor-not-allowed'
                        : 'bg-white border border-border-light text-text-primary hover:bg-background-light'
                    )}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Form Mapping Modal */}
      <EditFormMappingModal
        mapping={selectedMapping}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMapping(null);
        }}
      />
    </div>
  );
}
