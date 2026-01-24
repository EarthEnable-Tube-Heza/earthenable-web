"use client";

/**
 * All Tasks Page (Admin only)
 *
 * Displays and manages all tasks with:
 * - Search and filters (status, priority, assignee)
 * - Task statistics overview
 * - CRUD operations
 * - Task reassignment
 * - Bulk reassignment
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import {
  TaskListItem,
  TaskAssignee,
  getStatusVariant,
  getPriorityVariant,
  DueTimeFilter,
  getDueDateStatus,
  getDueDateColorClasses,
  getDueDateLabel,
  dueTimeFilterOptions,
} from "@/src/types/task";
import { cn, PAGE_SPACING } from "@/src/lib/theme";
import { Badge } from "@/src/components/ui/Badge";
import { Select } from "@/src/components/ui/Select";
import { MultiSelect } from "@/src/components/ui/MultiSelect";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { TaskDetailModal } from "@/src/components/TaskDetailModal";
import { ConfirmDialog } from "@/src/components/ui/ConfirmDialog";
import { Toast, ToastType } from "@/src/components/ui/Toast";
import { Eye, UserRoundCog, Trash2, RefreshCw } from "lucide-react";

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const [dueTimeFilter, setDueTimeFilter] = useState<DueTimeFilter[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string[]>([]);
  // Location filters (multi-select)
  const [countryFilter, setCountryFilter] = useState<string[]>([]);
  const [districtFilter, setDistrictFilter] = useState<string[]>([]);
  const [sectorFilter, setSectorFilter] = useState<string[]>([]);
  const [cellFilter, setCellFilter] = useState<string[]>([]);
  const [villageFilter, setVillageFilter] = useState<string[]>([]);
  // Open cases filter
  const [openCasesFilter, setOpenCasesFilter] = useState<string>("");
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedTaskForReassign, setSelectedTaskForReassign] = useState<TaskListItem | null>(null);
  const [bulkReassignUserId, setBulkReassignUserId] = useState<string>("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskListItem | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  // Status change state
  const [taskToChangeStatus, setTaskToChangeStatus] = useState<TaskListItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [showBulkStatusConfirm, setShowBulkStatusConfirm] = useState(false);
  const [bulkNewStatus, setBulkNewStatus] = useState<string>("");
  // Toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    message: string;
  }>({ visible: false, type: "success", message: "" });
  const limit = 20;

  // Fetch tasks with filters
  const {
    data: tasksData,
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useQuery({
    queryKey: [
      "tasks",
      page,
      search,
      statusFilter,
      priorityFilter,
      assigneeFilter,
      dueTimeFilter,
      typeFilter,
      subjectFilter,
      countryFilter,
      districtFilter,
      sectorFilter,
      cellFilter,
      villageFilter,
      openCasesFilter,
    ],
    queryFn: () =>
      apiClient.getTasks({
        skip: page * limit,
        limit,
        search: search || undefined,
        status: statusFilter.length > 0 ? statusFilter : undefined,
        priority: priorityFilter.length > 0 ? priorityFilter : undefined,
        assignee_id: assigneeFilter.length > 0 ? assigneeFilter : undefined,
        due_time: dueTimeFilter.length > 0 ? dueTimeFilter : undefined,
        type: typeFilter.length > 0 ? typeFilter : undefined,
        subject_id: subjectFilter.length > 0 ? subjectFilter : undefined,
        country: countryFilter.length > 0 ? countryFilter : undefined,
        district: districtFilter.length > 0 ? districtFilter : undefined,
        sector: sectorFilter.length > 0 ? sectorFilter : undefined,
        cell: cellFilter.length > 0 ? cellFilter : undefined,
        village: villageFilter.length > 0 ? villageFilter : undefined,
        has_open_cases: openCasesFilter === "true" ? true : undefined,
      }),
  });

  // Fetch task statistics with filters (for display)
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [
      "task-stats",
      search,
      statusFilter,
      priorityFilter,
      assigneeFilter,
      typeFilter,
      subjectFilter,
      countryFilter,
      districtFilter,
      sectorFilter,
      cellFilter,
      villageFilter,
      openCasesFilter,
    ],
    queryFn: () =>
      apiClient.getTaskStats({
        search: search || undefined,
        status: statusFilter.length > 0 ? statusFilter : undefined,
        priority: priorityFilter.length > 0 ? priorityFilter : undefined,
        assignee_id: assigneeFilter.length > 0 ? assigneeFilter : undefined,
        type: typeFilter.length > 0 ? typeFilter : undefined,
        subject_id: subjectFilter.length > 0 ? subjectFilter : undefined,
        country: countryFilter.length > 0 ? countryFilter : undefined,
        district: districtFilter.length > 0 ? districtFilter : undefined,
        sector: sectorFilter.length > 0 ? sectorFilter : undefined,
        cell: cellFilter.length > 0 ? cellFilter : undefined,
        village: villageFilter.length > 0 ? villageFilter : undefined,
        has_open_cases: openCasesFilter === "true" ? true : undefined,
      }),
  });

  // Fetch unfiltered stats for filter options (separate from filtered stats display)
  const { data: filterOptionsStats } = useQuery({
    queryKey: ["task-stats-filter-options"],
    queryFn: () => apiClient.getTaskStats({}),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch assignable users
  const { data: assignableUsers } = useQuery({
    queryKey: ["assignable-users"],
    queryFn: () => apiClient.getAssignableUsers(),
  });

  // Fetch task subjects for filter dropdown
  const { data: taskSubjectsData } = useQuery({
    queryKey: ["task-subjects"],
    queryFn: () => apiClient.getTaskSubjects({ limit: 100, is_active: true }),
  });

  // Fetch location values for dropdowns (pass selected values to filter child options)
  const { data: locationValues } = useQuery({
    queryKey: ["location-values", countryFilter, districtFilter, sectorFilter, cellFilter],
    queryFn: () =>
      apiClient.getLocationValues({
        country: countryFilter.length > 0 ? countryFilter.join(",") : undefined,
        district: districtFilter.length > 0 ? districtFilter.join(",") : undefined,
        sector: sectorFilter.length > 0 ? sectorFilter.join(",") : undefined,
        cell: cellFilter.length > 0 ? cellFilter.join(",") : undefined,
      }),
  });

  // Reassign task mutation
  const reassignMutation = useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      apiClient.reassignTask(taskId, { employee_surveyor_id: userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      setShowReassignModal(false);
      setSelectedTaskForReassign(null);
    },
  });

  // Bulk reassign mutation
  const bulkReassignMutation = useMutation({
    mutationFn: ({ taskIds, userId }: { taskIds: string[]; userId: string }) =>
      apiClient.bulkReassignTasks({ task_ids: taskIds, employee_surveyor_id: userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      setSelectedTasks(new Set());
      setBulkReassignUserId("");
    },
  });

  // Delete single task mutation
  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => apiClient.deleteTask(taskId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      setTaskToDelete(null);
      setToast({
        visible: true,
        type: "success",
        message: `Task "${data.task_subject || "task"}" deleted successfully`,
      });
    },
    onError: (error: Error) => {
      setTaskToDelete(null);
      setToast({
        visible: true,
        type: "error",
        message: `Failed to delete task: ${error.message || "Unknown error"}`,
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (taskIds: string[]) => apiClient.bulkDeleteTasks(taskIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      setSelectedTasks(new Set());
      setShowBulkDeleteConfirm(false);
      setToast({
        visible: true,
        type: "success",
        message: `Successfully deleted ${data.deleted_count} task(s)`,
      });
    },
    onError: (error: Error) => {
      setShowBulkDeleteConfirm(false);
      setToast({
        visible: true,
        type: "error",
        message: `Failed to delete tasks: ${error.message || "Unknown error"}`,
      });
    },
  });

  // Single task status update mutation
  const statusUpdateMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      apiClient.updateTaskStatus(taskId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      setTaskToChangeStatus(null);
      setNewStatus("");
      setToast({
        visible: true,
        type: "success",
        message: `Task status updated to "${data.status}"`,
      });
    },
    onError: (error: Error) => {
      setTaskToChangeStatus(null);
      setNewStatus("");
      setToast({
        visible: true,
        type: "error",
        message: `Failed to update task status: ${error.message || "Unknown error"}`,
      });
    },
  });

  // Bulk status update mutation
  const bulkStatusUpdateMutation = useMutation({
    mutationFn: ({ taskIds, status }: { taskIds: string[]; status: string }) =>
      apiClient.bulkUpdateTaskStatus(taskIds, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      setSelectedTasks(new Set());
      setShowBulkStatusConfirm(false);
      setBulkNewStatus("");
      setToast({
        visible: true,
        type: "success",
        message: `Successfully updated ${data.updated_count} task(s) to "${data.new_status}"`,
      });
    },
    onError: (error: Error) => {
      setShowBulkStatusConfirm(false);
      setBulkNewStatus("");
      setToast({
        visible: true,
        type: "error",
        message: `Failed to update task status: ${error.message || "Unknown error"}`,
      });
    },
  });

  const tasks = tasksData?.items || [];
  const total = tasksData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Get unique statuses and priorities from unfiltered stats (for filter dropdown options)
  const statuses = useMemo(() => {
    if (!filterOptionsStats?.by_status) return [];
    return Object.keys(filterOptionsStats.by_status).filter((s) => s !== "Unknown");
  }, [filterOptionsStats]);

  const priorities = useMemo(() => {
    if (!filterOptionsStats?.by_priority) return [];
    return Object.keys(filterOptionsStats.by_priority).filter((p) => p !== "Unknown");
  }, [filterOptionsStats]);

  // Handle search
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  // Handle task selection
  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  // Select all on current page
  const selectAllOnPage = () => {
    const allIds = tasks.map((t) => t.id);
    const allSelected = allIds.every((id) => selectedTasks.has(id));
    if (allSelected) {
      // Deselect all
      const newSelected = new Set(selectedTasks);
      allIds.forEach((id) => newSelected.delete(id));
      setSelectedTasks(newSelected);
    } else {
      // Select all
      const newSelected = new Set(selectedTasks);
      allIds.forEach((id) => newSelected.add(id));
      setSelectedTasks(newSelected);
    }
  };

  // Handle bulk reassign
  const handleBulkReassign = () => {
    if (selectedTasks.size === 0 || !bulkReassignUserId) return;
    bulkReassignMutation.mutate({
      taskIds: Array.from(selectedTasks),
      userId: bulkReassignUserId,
    });
  };

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={PAGE_SPACING}>
      {/* Statistics Overview */}
      {!statsLoading && stats && (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <StatCard label="Total" value={stats.total_tasks} />
            <StatCard label="Open" value={stats.open_tasks} color="blue" />
            <StatCard label="Completed" value={stats.completed_tasks} color="green" />
            <StatCard label="Overdue" value={stats.overdue_tasks} color="red" />
            <StatCard label="Due Today" value={stats.due_today} color="orange" />
            <StatCard label="Open Cases" value={stats.tasks_with_open_cases} color="purple" />
            <StatCard label="Unassigned" value={stats.unassigned_tasks} color="gray" />
          </div>

          {/* Filter context indicator */}
          {(search ||
            statusFilter.length > 0 ||
            priorityFilter.length > 0 ||
            assigneeFilter.length > 0 ||
            typeFilter.length > 0 ||
            subjectFilter.length > 0 ||
            countryFilter.length > 0 ||
            districtFilter.length > 0 ||
            sectorFilter.length > 0 ||
            cellFilter.length > 0 ||
            villageFilter.length > 0 ||
            openCasesFilter) && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2">
              <p className="text-sm text-primary">
                Showing distribution for filtered tasks ({stats.total_tasks} tasks)
              </p>
            </div>
          )}

          {/* Detailed Breakdown - always visible */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Due Time Breakdown */}
            <div className="bg-white rounded-lg shadow-medium p-4">
              <h3 className="text-sm font-medium text-text-primary mb-3">Due Time Distribution</h3>
              <div className="space-y-3">
                <ProgressRow
                  label="Overdue"
                  value={stats.overdue_tasks}
                  total={stats.total_tasks}
                  color="red"
                />
                <ProgressRow
                  label="Due Today"
                  value={stats.due_today}
                  total={stats.total_tasks}
                  color="orange"
                />
                <ProgressRow
                  label="Due Tomorrow"
                  value={stats.due_tomorrow}
                  total={stats.total_tasks}
                  color="yellow"
                />
                <ProgressRow
                  label="This Week"
                  value={stats.due_this_week}
                  total={stats.total_tasks}
                  color="blue"
                />
                <ProgressRow
                  label="This Month"
                  value={stats.due_this_month}
                  total={stats.total_tasks}
                  color="teal"
                />
                <ProgressRow
                  label="No Due Date"
                  value={stats.no_due_date}
                  total={stats.total_tasks}
                  color="gray"
                />
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-lg shadow-medium p-4">
              <h3 className="text-sm font-medium text-text-primary mb-3">Status Distribution</h3>
              <div className="space-y-3">
                {Object.entries(stats.by_status)
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => (
                    <ProgressRow
                      key={status}
                      label={status}
                      value={count}
                      total={stats.total_tasks}
                      color={
                        status.toLowerCase().includes("completed")
                          ? "green"
                          : status.toLowerCase().includes("progress")
                            ? "blue"
                            : status.toLowerCase().includes("not started")
                              ? "yellow"
                              : "gray"
                      }
                    />
                  ))}
              </div>
            </div>

            {/* Subject Breakdown */}
            <div className="bg-white rounded-lg shadow-medium p-4">
              <h3 className="text-sm font-medium text-text-primary mb-3">
                Task Subject Distribution
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.by_subject)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, showAllSubjects ? undefined : 6)
                  .map(([subject, count]) => (
                    <ProgressRow
                      key={subject}
                      label={subject}
                      value={count}
                      total={stats.total_tasks}
                      color="primary"
                    />
                  ))}
                {Object.keys(stats.by_subject).length > 6 && (
                  <button
                    onClick={() => setShowAllSubjects(!showAllSubjects)}
                    className="text-xs text-primary hover:text-primary/80 font-medium mt-2 transition-colors"
                  >
                    {showAllSubjects
                      ? "Show less"
                      : `+${Object.keys(stats.by_subject).length - 6} more subjects`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-medium p-4 sm:p-6">
        {/* Search Row */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Search tasks..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Status Filter */}
          <MultiSelect
            label="Status"
            placeholder="All Statuses"
            options={statuses.map((status) => ({ value: status, label: status }))}
            value={statusFilter}
            onChange={(values) => {
              setStatusFilter(values);
              setPage(0);
            }}
            size="sm"
          />

          {/* Priority Filter */}
          <MultiSelect
            label="Priority"
            placeholder="All Priorities"
            options={priorities.map((priority) => ({ value: priority, label: priority }))}
            value={priorityFilter}
            onChange={(values) => {
              setPriorityFilter(values);
              setPage(0);
            }}
            size="sm"
          />

          {/* Assignee Filter */}
          <MultiSelect
            label="Assignee"
            placeholder="All Assignees"
            options={(assignableUsers || []).map((user) => ({
              value: user.id,
              label: user.name || user.email,
            }))}
            value={assigneeFilter}
            onChange={(values) => {
              setAssigneeFilter(values);
              setPage(0);
            }}
            size="sm"
          />

          {/* Due Time Filter */}
          <MultiSelect
            label="Due Time"
            placeholder="All Due Times"
            options={dueTimeFilterOptions
              .filter((opt) => opt.value !== "all")
              .map((option) => ({ value: option.value, label: option.label }))}
            value={dueTimeFilter}
            onChange={(values) => {
              setDueTimeFilter(values as DueTimeFilter[]);
              setPage(0);
            }}
            size="sm"
          />

          {/* Task Type Filter */}
          <MultiSelect
            label="Type"
            placeholder="All Types"
            options={[
              { value: "Call", label: "Call" },
              { value: "Meeting", label: "Meeting/Evaluation" },
            ]}
            value={typeFilter}
            onChange={(values) => {
              setTypeFilter(values);
              setPage(0);
            }}
            size="sm"
          />

          {/* Task Subject Filter */}
          <MultiSelect
            label="Subject"
            placeholder="All Subjects"
            options={(taskSubjectsData?.items || []).map((subject) => ({
              value: subject.id,
              label: subject.name,
            }))}
            value={subjectFilter}
            onChange={(values) => {
              setSubjectFilter(values);
              setPage(0);
            }}
            size="sm"
          />

          {/* Open Cases Filter - Single select */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Open Cases</label>
            <Select
              value={openCasesFilter}
              onChange={(e) => {
                setOpenCasesFilter(e.target.value);
                setPage(0);
              }}
              fullWidth
              size="sm"
            >
              <option value="">All Tasks</option>
              <option value="true">With Open Cases</option>
            </Select>
          </div>
        </div>

        {/* Location Filters Row */}
        <div className="mt-4 pt-4 border-t border-border-light">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-text-secondary">Location:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {/* Country Filter */}
            <MultiSelect
              label=""
              placeholder="All Countries"
              options={(locationValues?.countries || []).map((country: string) => ({
                value: country,
                label: country,
              }))}
              value={countryFilter}
              onChange={(values) => {
                setCountryFilter(values);
                setPage(0);
              }}
              size="sm"
            />

            {/* District Filter */}
            <MultiSelect
              label=""
              placeholder="All Districts"
              options={(locationValues?.districts || []).map((district: string) => ({
                value: district,
                label: district,
              }))}
              value={districtFilter}
              onChange={(values) => {
                setDistrictFilter(values);
                setPage(0);
              }}
              size="sm"
            />

            {/* Sector Filter */}
            <MultiSelect
              label=""
              placeholder="All Sectors"
              options={(locationValues?.sectors || []).map((sector: string) => ({
                value: sector,
                label: sector,
              }))}
              value={sectorFilter}
              onChange={(values) => {
                setSectorFilter(values);
                setPage(0);
              }}
              size="sm"
            />

            {/* Cell Filter */}
            <MultiSelect
              label=""
              placeholder="All Cells"
              options={(locationValues?.cells || []).map((cell: string) => ({
                value: cell,
                label: cell,
              }))}
              value={cellFilter}
              onChange={(values) => {
                setCellFilter(values);
                setPage(0);
              }}
              size="sm"
            />

            {/* Village Filter */}
            <MultiSelect
              label=""
              placeholder="All Villages"
              options={(locationValues?.villages || []).map((village: string) => ({
                value: village,
                label: village,
              }))}
              value={villageFilter}
              onChange={(values) => {
                setVillageFilter(values);
                setPage(0);
              }}
              size="sm"
            />
          </div>
        </div>

        {/* Active Filters Indicator */}
        {(search ||
          statusFilter.length > 0 ||
          priorityFilter.length > 0 ||
          assigneeFilter.length > 0 ||
          dueTimeFilter.length > 0 ||
          typeFilter.length > 0 ||
          subjectFilter.length > 0 ||
          countryFilter.length > 0 ||
          districtFilter.length > 0 ||
          sectorFilter.length > 0 ||
          cellFilter.length > 0 ||
          villageFilter.length > 0 ||
          openCasesFilter) && (
          <div className="mt-4 pt-4 border-t border-border-light">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                Active Filters:
              </span>

              {search && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  Search: {search}
                  <button
                    onClick={() => {
                      setSearch("");
                      setSearchInput("");
                      setPage(0);
                    }}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                    aria-label="Remove search filter"
                  >
                    ×
                  </button>
                </span>
              )}

              {/* Status filters - show each selected value */}
              {statusFilter.map((status) => (
                <span
                  key={`status-${status}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                >
                  Status: {status}
                  <button
                    onClick={() => {
                      setStatusFilter(statusFilter.filter((s) => s !== status));
                      setPage(0);
                    }}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${status} status filter`}
                  >
                    ×
                  </button>
                </span>
              ))}

              {/* Priority filters - show each selected value */}
              {priorityFilter.map((priority) => (
                <span
                  key={`priority-${priority}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700"
                >
                  Priority: {priority}
                  <button
                    onClick={() => {
                      setPriorityFilter(priorityFilter.filter((p) => p !== priority));
                      setPage(0);
                    }}
                    className="ml-1 hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${priority} priority filter`}
                  >
                    ×
                  </button>
                </span>
              ))}

              {/* Assignee filters - show each selected value */}
              {assigneeFilter.map((assigneeId) => (
                <span
                  key={`assignee-${assigneeId}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700"
                >
                  Assignee:{" "}
                  {assignableUsers?.find((u) => u.id === assigneeId)?.name ||
                    assignableUsers?.find((u) => u.id === assigneeId)?.email ||
                    "Selected"}
                  <button
                    onClick={() => {
                      setAssigneeFilter(assigneeFilter.filter((a) => a !== assigneeId));
                      setPage(0);
                    }}
                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                    aria-label="Remove assignee filter"
                  >
                    ×
                  </button>
                </span>
              ))}

              {/* Due Time filters - show each selected value */}
              {dueTimeFilter.map((dueTime) => (
                <span
                  key={`due-${dueTime}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"
                >
                  Due: {dueTimeFilterOptions.find((o) => o.value === dueTime)?.label}
                  <button
                    onClick={() => {
                      setDueTimeFilter(dueTimeFilter.filter((d) => d !== dueTime));
                      setPage(0);
                    }}
                    className="ml-1 hover:bg-red-200 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${dueTimeFilterOptions.find((o) => o.value === dueTime)?.label} filter`}
                  >
                    ×
                  </button>
                </span>
              ))}

              {/* Type filters - show each selected value */}
              {typeFilter.map((type) => (
                <span
                  key={`type-${type}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700"
                >
                  Type: {type === "Meeting" ? "Meeting/Evaluation" : type}
                  <button
                    onClick={() => {
                      setTypeFilter(typeFilter.filter((t) => t !== type));
                      setPage(0);
                    }}
                    className="ml-1 hover:bg-teal-200 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${type} type filter`}
                  >
                    ×
                  </button>
                </span>
              ))}

              {/* Subject filters - show each selected value */}
              {subjectFilter.map((subjectId) => (
                <span
                  key={`subject-${subjectId}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
                >
                  Subject:{" "}
                  {taskSubjectsData?.items?.find((s) => s.id === subjectId)?.name || "Selected"}
                  <button
                    onClick={() => {
                      setSubjectFilter(subjectFilter.filter((s) => s !== subjectId));
                      setPage(0);
                    }}
                    className="ml-1 hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                    aria-label="Remove subject filter"
                  >
                    ×
                  </button>
                </span>
              ))}

              {openCasesFilter && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  Open Cases: Yes
                  <button
                    onClick={() => {
                      setOpenCasesFilter("");
                      setPage(0);
                    }}
                    className="ml-1 hover:bg-amber-200 rounded-full p-0.5 transition-colors"
                    aria-label="Remove open cases filter"
                  >
                    ×
                  </button>
                </span>
              )}

              {/* Country filters */}
              {countryFilter.map((country) => (
                <span
                  key={`country-${country}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                >
                  Country: {country}
                  <button
                    onClick={() => {
                      setCountryFilter(countryFilter.filter((c) => c !== country));
                      setPage(0);
                    }}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${country} filter`}
                  >
                    ×
                  </button>
                </span>
              ))}

              {/* District filters */}
              {districtFilter.map((district) => (
                <span
                  key={`district-${district}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                >
                  District: {district}
                  <button
                    onClick={() => {
                      setDistrictFilter(districtFilter.filter((d) => d !== district));
                      setPage(0);
                    }}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${district} filter`}
                  >
                    ×
                  </button>
                </span>
              ))}

              {/* Sector filters */}
              {sectorFilter.map((sector) => (
                <span
                  key={`sector-${sector}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                >
                  Sector: {sector}
                  <button
                    onClick={() => {
                      setSectorFilter(sectorFilter.filter((s) => s !== sector));
                      setPage(0);
                    }}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${sector} filter`}
                  >
                    ×
                  </button>
                </span>
              ))}

              {/* Cell filters */}
              {cellFilter.map((cell) => (
                <span
                  key={`cell-${cell}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                >
                  Cell: {cell}
                  <button
                    onClick={() => {
                      setCellFilter(cellFilter.filter((c) => c !== cell));
                      setPage(0);
                    }}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${cell} filter`}
                  >
                    ×
                  </button>
                </span>
              ))}

              {/* Village filters */}
              {villageFilter.map((village) => (
                <span
                  key={`village-${village}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                >
                  Village: {village}
                  <button
                    onClick={() => {
                      setVillageFilter(villageFilter.filter((v) => v !== village));
                      setPage(0);
                    }}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${village} filter`}
                  >
                    ×
                  </button>
                </span>
              ))}

              <button
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setStatusFilter([]);
                  setPriorityFilter([]);
                  setAssigneeFilter([]);
                  setDueTimeFilter([]);
                  setTypeFilter([]);
                  setSubjectFilter([]);
                  setOpenCasesFilter("");
                  setCountryFilter([]);
                  setDistrictFilter([]);
                  setSectorFilter([]);
                  setCellFilter([]);
                  setVillageFilter([]);
                  setPage(0);
                }}
                className="text-xs text-status-error hover:text-status-error/80 font-medium ml-2"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedTasks.size > 0 && (
        <div className="bg-primary/10 border border-primary rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <span className="text-sm font-medium text-primary">
            {selectedTasks.size} task(s) selected
          </span>
          <div className="flex flex-wrap items-center gap-3">
            {/* Bulk Reassign */}
            <Select
              value={bulkReassignUserId}
              onChange={(e) => setBulkReassignUserId(e.target.value)}
              fullWidth={false}
            >
              <option value="">Select assignee...</option>
              {assignableUsers?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </Select>
            <Button
              onClick={handleBulkReassign}
              disabled={!bulkReassignUserId || bulkReassignMutation.isPending}
              loading={bulkReassignMutation.isPending}
            >
              Reassign
            </Button>

            {/* Bulk Status Update */}
            <div className="border-l border-primary/30 pl-3 flex items-center gap-2">
              <Select
                value={bulkNewStatus}
                onChange={(e) => setBulkNewStatus(e.target.value)}
                fullWidth={false}
              >
                <option value="">Select status...</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
              <Button
                variant="secondary"
                onClick={() => setShowBulkStatusConfirm(true)}
                disabled={!bulkNewStatus || bulkStatusUpdateMutation.isPending}
                loading={bulkStatusUpdateMutation.isPending}
              >
                Update Status
              </Button>
            </div>

            {/* Delete and Clear */}
            <div className="border-l border-primary/30 pl-3 flex items-center gap-2">
              <Button
                variant="danger"
                onClick={() => setShowBulkDeleteConfirm(true)}
                disabled={bulkDeleteMutation.isPending}
                loading={bulkDeleteMutation.isPending}
              >
                Delete
              </Button>
              <Button variant="ghost" onClick={() => setSelectedTasks(new Set())}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <div className="bg-white rounded-lg shadow-medium overflow-hidden">
        {tasksLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-text-secondary mt-2">Loading tasks...</p>
          </div>
        ) : tasksError ? (
          <div className="p-8 text-center">
            <p className="text-status-error">Error loading tasks. Please try again.</p>
            <Button onClick={() => refetchTasks()} className="mt-4">
              Retry
            </Button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-secondary">No tasks found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-background-light border-b border-border-light">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={tasks.length > 0 && tasks.every((t) => selectedTasks.has(t.id))}
                        onChange={selectAllOnPage}
                        className="rounded border-border-light"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Assignee
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-background-light transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedTasks.has(task.id)}
                          onChange={() => toggleTaskSelection(task.id)}
                          className="rounded border-border-light"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <button
                            onClick={() => setSelectedTaskId(task.id)}
                            className="text-sm font-medium text-text-primary line-clamp-1 hover:text-primary hover:underline text-left transition-colors"
                          >
                            {task.subject || "Untitled Task"}
                          </button>
                          {task.subject_ref && (
                            <div className="text-xs text-text-secondary mt-1">
                              {task.subject_ref.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={getStatusVariant(task.status)} size="sm">
                          {task.status || "Unknown"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={getPriorityVariant(task.priority)} size="sm">
                          {task.priority || "Unknown"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        {(() => {
                          const dueDateStatus = getDueDateStatus(task.due_date, task.status);
                          const colorClasses = getDueDateColorClasses(dueDateStatus);
                          const label = getDueDateLabel(dueDateStatus);
                          return (
                            <div className="flex flex-col gap-1">
                              <span
                                className={cn(
                                  "text-xs font-medium px-2 py-0.5 rounded-full inline-block w-fit",
                                  colorClasses
                                )}
                              >
                                {label}
                              </span>
                              <span className="text-xs text-text-secondary">
                                {formatDate(task.due_date)}
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4">
                        {task.employee_surveyor ? (
                          <div className="flex items-center gap-2">
                            {task.employee_surveyor.picture ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={task.employee_surveyor.picture}
                                alt=""
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                                {(task.employee_surveyor.name ||
                                  task.employee_surveyor.email)[0].toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm text-text-primary line-clamp-1">
                              {task.employee_surveyor.name || task.employee_surveyor.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-text-secondary italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-text-primary line-clamp-1">
                          {task.account?.name || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedTaskId(task.id)}
                            className="p-2 rounded-lg text-status-info hover:bg-status-info/10 transition-colors"
                            title="View task details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTaskForReassign(task);
                              setShowReassignModal(true);
                            }}
                            className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                            title="Reassign task"
                          >
                            <UserRoundCog className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setTaskToChangeStatus(task)}
                            className="p-2 rounded-lg text-status-success hover:bg-status-success/10 transition-colors"
                            title="Change status"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setTaskToDelete(task)}
                            className="p-2 rounded-lg text-status-error hover:bg-status-error/10 transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                  Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total}{" "}
                  tasks
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1 text-sm text-text-secondary">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(totalPages - 1)}
                    disabled={page >= totalPages - 1}
                  >
                    Last
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reassign Modal */}
      {showReassignModal && selectedTaskForReassign && (
        <ReassignModal
          task={selectedTaskForReassign}
          users={assignableUsers || []}
          onClose={() => {
            setShowReassignModal(false);
            setSelectedTaskForReassign(null);
          }}
          onReassign={(userId) => {
            reassignMutation.mutate({ taskId: selectedTaskForReassign.id, userId });
          }}
          isLoading={reassignMutation.isPending}
        />
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />

      {/* Single Task Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!taskToDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.subject || "this task"}"? This action cannot be undone and the task will be removed from all assigned mobile devices.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={() => {
          if (taskToDelete) {
            deleteMutation.mutate(taskToDelete.id);
          }
        }}
        onCancel={() => setTaskToDelete(null)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        title="Delete Selected Tasks"
        message={`Are you sure you want to delete ${selectedTasks.size} task(s)? This action cannot be undone and the tasks will be removed from all assigned mobile devices.`}
        confirmLabel={`Delete ${selectedTasks.size} Task(s)`}
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={() => {
          bulkDeleteMutation.mutate(Array.from(selectedTasks));
        }}
        onCancel={() => setShowBulkDeleteConfirm(false)}
      />

      {/* Status Change Modal */}
      {taskToChangeStatus && (
        <StatusChangeModal
          task={taskToChangeStatus}
          statuses={statuses}
          selectedStatus={newStatus}
          onStatusChange={setNewStatus}
          onClose={() => {
            setTaskToChangeStatus(null);
            setNewStatus("");
          }}
          onConfirm={() => {
            if (newStatus && taskToChangeStatus) {
              statusUpdateMutation.mutate({
                taskId: taskToChangeStatus.id,
                status: newStatus,
              });
            }
          }}
          isLoading={statusUpdateMutation.isPending}
        />
      )}

      {/* Bulk Status Update Confirmation */}
      <ConfirmDialog
        isOpen={showBulkStatusConfirm}
        title="Update Task Status"
        message={`Are you sure you want to change the status of ${selectedTasks.size} task(s) to "${bulkNewStatus}"?`}
        confirmLabel={`Update ${selectedTasks.size} Task(s)`}
        cancelLabel="Cancel"
        confirmVariant="primary"
        onConfirm={() => {
          bulkStatusUpdateMutation.mutate({
            taskIds: Array.from(selectedTasks),
            status: bulkNewStatus,
          });
        }}
        onCancel={() => setShowBulkStatusConfirm(false)}
      />

      {/* Toast notifications */}
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  color = "default",
}: {
  label: string;
  value: number;
  color?: "default" | "blue" | "green" | "red" | "orange" | "gray" | "purple";
}) {
  const colorClasses = {
    default: "text-text-primary",
    blue: "text-status-info",
    green: "text-status-success",
    red: "text-status-error",
    orange: "text-primary",
    gray: "text-text-secondary",
    purple: "text-secondary",
  };

  return (
    <div className="bg-white rounded-lg shadow-medium p-4">
      <div className="text-sm text-text-secondary">{label}</div>
      <div className={cn("text-2xl font-bold mt-1", colorClasses[color])}>{value}</div>
    </div>
  );
}

// Progress Row Component with progress bar for visual distribution
function ProgressRow({
  label,
  value,
  total,
  color = "gray",
}: {
  label: string;
  value: number;
  total: number;
  color?: "red" | "orange" | "yellow" | "green" | "blue" | "teal" | "gray" | "primary";
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  const barColorClasses = {
    red: "bg-status-error",
    orange: "bg-primary",
    yellow: "bg-accent",
    green: "bg-status-success",
    blue: "bg-status-info",
    teal: "bg-green",
    gray: "bg-text-secondary/50",
    primary: "bg-primary",
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary truncate max-w-[140px]" title={label}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">{value}</span>
          <span className="text-xs text-text-secondary w-10 text-right">({percentage}%)</span>
        </div>
      </div>
      <div className="h-2 bg-background-light rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", barColorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Reassign Modal Component
function ReassignModal({
  task,
  users,
  onClose,
  onReassign,
  isLoading,
}: {
  task: TaskListItem;
  users: TaskAssignee[];
  onClose: () => void;
  onReassign: (userId: string) => void;
  isLoading: boolean;
}) {
  const [selectedUserId, setSelectedUserId] = useState<string>(task.employee_surveyor?.id || "");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-border-light">
          <h2 className="text-xl font-heading font-bold text-text-primary">Reassign Task</h2>
          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
            {task.subject || "Untitled Task"}
          </p>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Select New Assignee
          </label>
          <Select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            fullWidth
          >
            <option value="">Select a user...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </Select>

          {task.employee_surveyor && (
            <p className="text-xs text-text-secondary mt-2">
              Currently assigned to: {task.employee_surveyor.name || task.employee_surveyor.email}
            </p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border-light flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={() => onReassign(selectedUserId)}
            disabled={!selectedUserId || isLoading}
            loading={isLoading}
          >
            Reassign
          </Button>
        </div>
      </div>
    </div>
  );
}

// Status Change Modal Component
function StatusChangeModal({
  task,
  statuses,
  selectedStatus,
  onStatusChange,
  onClose,
  onConfirm,
  isLoading,
}: {
  task: TaskListItem;
  statuses: string[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-border-light">
          <h2 className="text-xl font-heading font-bold text-text-primary">Change Task Status</h2>
          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
            {task.subject || "Untitled Task"}
          </p>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Select New Status
          </label>
          <Select value={selectedStatus} onChange={(e) => onStatusChange(e.target.value)} fullWidth>
            <option value="">Select a status...</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>

          <p className="text-xs text-text-secondary mt-2">
            Current status: <span className="font-medium">{task.status || "Unknown"}</span>
          </p>
        </div>

        <div className="px-6 py-4 border-t border-border-light flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!selectedStatus || selectedStatus === task.status || isLoading}
            loading={isLoading}
          >
            Update Status
          </Button>
        </div>
      </div>
    </div>
  );
}
