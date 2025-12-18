"use client";

/**
 * Task Subjects Page (Admin only)
 *
 * Displays and manages TaskSubjects with their FormYoula form mappings.
 * Shows ALL task subjects, including those without mappings, to help users
 * see what already exists and avoid creating duplicates.
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { TaskSubject, TaskSubjectForm } from "@/src/types/form";
import { cn } from "@/src/lib/theme";
import { EditFormMappingModal } from "@/src/components/EditFormMappingModal";
import { CreateTaskSubjectModal } from "@/src/components/CreateTaskSubjectModal";
import { CreateFormMappingModal } from "@/src/components/CreateFormMappingModal";
import { Select } from "@/src/components/ui/Select";
import { EARTHENABLE_COUNTRIES } from "@/src/lib/constants";

// Combined view of task subject with its mappings
interface TaskSubjectWithMappings {
  taskSubject: TaskSubject;
  mappings: TaskSubjectForm[];
}

export default function TaskSubjectsPage() {
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [selectedMapping, setSelectedMapping] = useState<TaskSubjectForm | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateSubjectModalOpen, setIsCreateSubjectModalOpen] = useState(false);
  const [isCreateMappingModalOpen, setIsCreateMappingModalOpen] = useState(false);

  // Fetch ALL task subjects
  const {
    data: taskSubjectsData,
    isLoading: loadingSubjects,
    error: subjectsError,
  } = useQuery({
    queryKey: ["task-subjects-all"],
    queryFn: () => apiClient.getTaskSubjects({ limit: 100 }), // Max allowed by API
  });

  // Fetch ALL form mappings (no pagination to combine with subjects)
  const {
    data: mappingsData,
    isLoading: loadingMappings,
    error: mappingsError,
    refetch,
  } = useQuery({
    queryKey: ["form-mappings-all", countryFilter],
    queryFn: () =>
      apiClient.getFormMappings({
        limit: 100, // Max allowed by API
        country_code: countryFilter || undefined,
      }),
  });

  const isLoading = loadingSubjects || loadingMappings;
  const error = subjectsError || mappingsError;

  // Memoize the extracted arrays to avoid dependency issues
  const taskSubjects = useMemo(() => taskSubjectsData?.items || [], [taskSubjectsData?.items]);
  const mappings = useMemo(() => mappingsData?.items || [], [mappingsData?.items]);

  // Combine task subjects with their mappings
  const taskSubjectsWithMappings = useMemo((): TaskSubjectWithMappings[] => {
    // Create a map of task subject ID to mappings
    const mappingsBySubject = new Map<string, TaskSubjectForm[]>();
    mappings.forEach((mapping) => {
      const existing = mappingsBySubject.get(mapping.task_subject_id) || [];
      existing.push(mapping);
      mappingsBySubject.set(mapping.task_subject_id, existing);
    });

    // Combine with task subjects
    return taskSubjects
      .map((subject) => ({
        taskSubject: subject,
        mappings: mappingsBySubject.get(subject.id) || [],
      }))
      .sort((a, b) => {
        // Sort: subjects without default mapping first, then alphabetically
        const aHasDefault = a.mappings.some((m) => m.is_default);
        const bHasDefault = b.mappings.some((m) => m.is_default);
        if (!aHasDefault && bHasDefault) return -1;
        if (aHasDefault && !bHasDefault) return 1;
        return a.taskSubject.name.localeCompare(b.taskSubject.name);
      });
  }, [taskSubjects, mappings]);

  // Count statistics - only count subjects missing a DEFAULT mapping
  const subjectsWithoutDefault = taskSubjectsWithMappings.filter(
    (s) => !s.mappings.some((m) => m.is_default)
  ).length;

  // Get country options from constants
  const countryOptions = EARTHENABLE_COUNTRIES.map((c) => c.code);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary">Task Subjects</h1>
          <p className="text-text-secondary mt-2">
            Manage task subjects and their FormYoula form mappings
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreateSubjectModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium text-sm whitespace-nowrap"
          >
            + New Task Subject
          </button>
          <button
            onClick={() => setIsCreateMappingModalOpen(true)}
            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors font-medium text-sm whitespace-nowrap"
          >
            + New Form Mapping
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-status-info/10 border border-status-info rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-status-info text-xl">ℹ️</span>
          <div>
            <p className="text-status-info font-medium mb-1">About Task Subjects</p>
            <p className="text-status-info/80 text-sm">
              Task subjects are evaluation types used across different countries. Each subject can
              have different FormYoula forms for different countries, with default forms used when
              no country-specific mapping exists.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics & Filters */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Statistics */}
          <div className="flex items-center gap-6">
            <div className="text-sm">
              <span className="text-text-secondary">Total Subjects:</span>{" "}
              <span className="font-semibold text-text-primary">{taskSubjects.length}</span>
            </div>
            {subjectsWithoutDefault > 0 && (
              <div className="text-sm">
                <span className="text-status-warning">⚠️ Missing Default:</span>{" "}
                <span className="font-semibold text-status-warning">{subjectsWithoutDefault}</span>
              </div>
            )}
          </div>

          {/* Filter */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-text-primary">Filter by Country:</label>
            <Select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
              }}
              fullWidth={false}
            >
              <option value="">All Countries</option>
              {countryOptions.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
            {countryFilter && (
              <button
                onClick={() => {
                  setCountryFilter("");
                }}
                className="text-sm text-status-error hover:text-status-error/80"
              >
                Clear filter
              </button>
            )}
          </div>
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
            <p className="text-status-error">Error loading task subjects. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        ) : taskSubjectsWithMappings.length === 0 ? (
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
                      Task Subject
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
                  {taskSubjectsWithMappings.map(({ taskSubject, mappings: subjectMappings }) => {
                    const hasDefault = subjectMappings.some((m) => m.is_default);

                    // If subject has mappings, show each mapping as a row
                    // If no mappings at all, show single row indicating no default
                    return subjectMappings.length > 0 ? (
                      subjectMappings.map((mapping, index) => (
                        <tr
                          key={mapping.id}
                          className={cn(
                            "hover:bg-background-light transition-colors",
                            !hasDefault && index === 0 && "bg-status-warning/5"
                          )}
                        >
                          <td className="px-6 py-4">
                            {index === 0 && (
                              <div className="text-sm font-medium text-text-primary">
                                {taskSubject.name}
                                {!taskSubject.is_active && (
                                  <span className="ml-2 px-2 py-0.5 text-xs bg-text-disabled/20 text-text-disabled rounded">
                                    Inactive
                                  </span>
                                )}
                                {!hasDefault && (
                                  <span className="ml-2 px-2 py-0.5 text-xs bg-status-error/10 text-status-error rounded">
                                    No Default
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                              {mapping.country_code || "ALL"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-sm font-mono text-text-primary bg-background-light px-2 py-1 rounded">
                              {mapping.formyoula_form_id}
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            {mapping.is_default ? (
                              <span className="px-2 py-1 text-xs font-medium bg-status-success/10 text-status-success rounded-full">
                                Default
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium bg-status-info/10 text-status-info rounded-full">
                                Country
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
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      // No mappings at all - show row indicating missing default
                      <tr
                        key={taskSubject.id}
                        className="hover:bg-background-light transition-colors bg-status-warning/5"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-text-primary">
                            {taskSubject.name}
                            {!taskSubject.is_active && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-text-disabled/20 text-text-disabled rounded">
                                Inactive
                              </span>
                            )}
                            <span className="ml-2 px-2 py-0.5 text-xs bg-status-error/10 text-status-error rounded">
                              No Default
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-text-disabled text-sm">—</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-text-disabled text-sm italic">
                            No mapping configured
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-status-error/10 text-status-error rounded-full">
                            Missing
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setIsCreateMappingModalOpen(true)}
                            className="text-status-success hover:text-status-success/80 text-sm font-medium"
                          >
                            + Add
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="px-6 py-4 border-t border-border-light">
              <div className="text-sm text-text-secondary">
                Showing {taskSubjectsWithMappings.length} task subjects with {mappings.length} form
                mappings
              </div>
            </div>
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

      {/* Create Task Subject Modal */}
      <CreateTaskSubjectModal
        isOpen={isCreateSubjectModalOpen}
        onClose={() => setIsCreateSubjectModalOpen(false)}
      />

      {/* Create Form Mapping Modal */}
      <CreateFormMappingModal
        isOpen={isCreateMappingModalOpen}
        onClose={() => setIsCreateMappingModalOpen(false)}
      />
    </div>
  );
}
