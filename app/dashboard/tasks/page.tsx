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
import { cn } from "@/src/lib/theme";
import { Badge } from "@/src/components/ui/Badge";
import { Select } from "@/src/components/ui/Select";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { TaskDetailModal } from "@/src/components/TaskDetailModal";

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("");
  const [dueTimeFilter, setDueTimeFilter] = useState<DueTimeFilter>("all");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  // Location filters (cascading)
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [districtFilter, setDistrictFilter] = useState<string>("");
  const [sectorFilter, setSectorFilter] = useState<string>("");
  const [cellFilter, setCellFilter] = useState<string>("");
  const [villageFilter, setVillageFilter] = useState<string>("");
  // Open cases filter
  const [openCasesFilter, setOpenCasesFilter] = useState<string>("");
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedTaskForReassign, setSelectedTaskForReassign] = useState<TaskListItem | null>(null);
  const [bulkReassignUserId, setBulkReassignUserId] = useState<string>("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showAllSubjects, setShowAllSubjects] = useState(false);
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
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        assignee_id: assigneeFilter || undefined,
        due_time: dueTimeFilter !== "all" ? dueTimeFilter : undefined,
        type: typeFilter || undefined,
        subject_id: subjectFilter || undefined,
        country: countryFilter || undefined,
        district: districtFilter || undefined,
        sector: sectorFilter || undefined,
        cell: cellFilter || undefined,
        village: villageFilter || undefined,
        has_open_cases: openCasesFilter === "true" ? true : undefined,
      }),
  });

  // Fetch task statistics with filters
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
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        assignee_id: assigneeFilter || undefined,
        type: typeFilter || undefined,
        subject_id: subjectFilter || undefined,
        country: countryFilter || undefined,
        district: districtFilter || undefined,
        sector: sectorFilter || undefined,
        cell: cellFilter || undefined,
        village: villageFilter || undefined,
        has_open_cases: openCasesFilter === "true" ? true : undefined,
      }),
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

  // Fetch location values for cascading dropdowns
  const { data: locationValues } = useQuery({
    queryKey: ["location-values", countryFilter, districtFilter, sectorFilter, cellFilter],
    queryFn: () =>
      apiClient.getLocationValues({
        country: countryFilter || undefined,
        district: districtFilter || undefined,
        sector: sectorFilter || undefined,
        cell: cellFilter || undefined,
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

  const tasks = tasksData?.items || [];
  const total = tasksData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Get unique statuses and priorities from stats
  const statuses = useMemo(() => {
    if (!stats?.by_status) return [];
    return Object.keys(stats.by_status).filter((s) => s !== "Unknown");
  }, [stats]);

  const priorities = useMemo(() => {
    if (!stats?.by_priority) return [];
    return Object.keys(stats.by_priority).filter((p) => p !== "Unknown");
  }, [stats]);

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
    <div className="space-y-6">
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
            statusFilter ||
            priorityFilter ||
            assigneeFilter ||
            typeFilter ||
            subjectFilter ||
            countryFilter ||
            districtFilter ||
            sectorFilter ||
            cellFilter ||
            villageFilter ||
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
      <div className="bg-white rounded-lg shadow-medium p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Search tasks..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            fullWidth={false}
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>

          {/* Priority Filter */}
          <Select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(0);
            }}
            fullWidth={false}
          >
            <option value="">All Priorities</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </Select>

          {/* Assignee Filter */}
          <Select
            value={assigneeFilter}
            onChange={(e) => {
              setAssigneeFilter(e.target.value);
              setPage(0);
            }}
            fullWidth={false}
          >
            <option value="">All Assignees</option>
            {assignableUsers?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </Select>

          {/* Due Time Filter */}
          <Select
            value={dueTimeFilter}
            onChange={(e) => {
              setDueTimeFilter(e.target.value as DueTimeFilter);
              setPage(0);
            }}
            fullWidth={false}
          >
            {dueTimeFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          {/* Task Type Filter */}
          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(0);
            }}
            fullWidth={false}
          >
            <option value="">All Types</option>
            <option value="Call">Call</option>
            <option value="Meeting">Meeting/Evaluation</option>
          </Select>

          {/* Task Subject Filter */}
          <Select
            value={subjectFilter}
            onChange={(e) => {
              setSubjectFilter(e.target.value);
              setPage(0);
            }}
            fullWidth={false}
          >
            <option value="">All Subjects</option>
            {taskSubjectsData?.items?.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </Select>

          {/* Open Cases Filter */}
          <Select
            value={openCasesFilter}
            onChange={(e) => {
              setOpenCasesFilter(e.target.value);
              setPage(0);
            }}
            fullWidth={false}
          >
            <option value="">All Tasks</option>
            <option value="true">With Open Cases</option>
          </Select>
        </div>

        {/* Location Filters Row */}
        <div className="flex flex-col lg:flex-row gap-4 mt-4 pt-4 border-t border-border-light">
          <span className="text-sm font-medium text-text-secondary self-center">Location:</span>

          {/* Country Filter */}
          <Select
            value={countryFilter}
            onChange={(e) => {
              setCountryFilter(e.target.value);
              // Reset child filters when parent changes
              setDistrictFilter("");
              setSectorFilter("");
              setCellFilter("");
              setVillageFilter("");
              setPage(0);
            }}
            fullWidth={false}
          >
            <option value="">All Countries</option>
            {locationValues?.countries?.map((country: string) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </Select>

          {/* District Filter */}
          <Select
            value={districtFilter}
            onChange={(e) => {
              setDistrictFilter(e.target.value);
              // Reset child filters when parent changes
              setSectorFilter("");
              setCellFilter("");
              setVillageFilter("");
              setPage(0);
            }}
            fullWidth={false}
            disabled={!countryFilter}
          >
            <option value="">All Districts</option>
            {locationValues?.districts?.map((district: string) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </Select>

          {/* Sector Filter */}
          <Select
            value={sectorFilter}
            onChange={(e) => {
              setSectorFilter(e.target.value);
              // Reset child filters when parent changes
              setCellFilter("");
              setVillageFilter("");
              setPage(0);
            }}
            fullWidth={false}
            disabled={!districtFilter}
          >
            <option value="">All Sectors</option>
            {locationValues?.sectors?.map((sector: string) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </Select>

          {/* Cell Filter */}
          <Select
            value={cellFilter}
            onChange={(e) => {
              setCellFilter(e.target.value);
              // Reset child filter when parent changes
              setVillageFilter("");
              setPage(0);
            }}
            fullWidth={false}
            disabled={!sectorFilter}
          >
            <option value="">All Cells</option>
            {locationValues?.cells?.map((cell: string) => (
              <option key={cell} value={cell}>
                {cell}
              </option>
            ))}
          </Select>

          {/* Village Filter */}
          <Select
            value={villageFilter}
            onChange={(e) => {
              setVillageFilter(e.target.value);
              setPage(0);
            }}
            fullWidth={false}
            disabled={!cellFilter}
          >
            <option value="">All Villages</option>
            {locationValues?.villages?.map((village: string) => (
              <option key={village} value={village}>
                {village}
              </option>
            ))}
          </Select>
        </div>

        {/* Clear filters */}
        {(search ||
          statusFilter ||
          priorityFilter ||
          assigneeFilter ||
          dueTimeFilter !== "all" ||
          typeFilter ||
          subjectFilter ||
          countryFilter ||
          districtFilter ||
          sectorFilter ||
          cellFilter ||
          villageFilter ||
          openCasesFilter) && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-text-secondary">Active filters:</span>
            {search && (
              <Badge variant="default" size="sm">
                Search: {search}
              </Badge>
            )}
            {statusFilter && (
              <Badge variant="default" size="sm">
                Status: {statusFilter}
              </Badge>
            )}
            {priorityFilter && (
              <Badge variant="default" size="sm">
                Priority: {priorityFilter}
              </Badge>
            )}
            {assigneeFilter && (
              <Badge variant="default" size="sm">
                Assignee:{" "}
                {assignableUsers?.find((u) => u.id === assigneeFilter)?.name || "Selected"}
              </Badge>
            )}
            {dueTimeFilter !== "all" && (
              <Badge variant="default" size="sm">
                Due: {dueTimeFilterOptions.find((o) => o.value === dueTimeFilter)?.label}
              </Badge>
            )}
            {typeFilter && (
              <Badge variant="default" size="sm">
                Type: {typeFilter === "Meeting" ? "Meeting/Evaluation" : typeFilter}
              </Badge>
            )}
            {subjectFilter && (
              <Badge variant="default" size="sm">
                Subject:{" "}
                {taskSubjectsData?.items?.find((s) => s.id === subjectFilter)?.name || "Selected"}
              </Badge>
            )}
            {openCasesFilter && (
              <Badge variant="default" size="sm">
                Open Cases: Yes
              </Badge>
            )}
            {countryFilter && (
              <Badge variant="default" size="sm">
                Country: {countryFilter}
              </Badge>
            )}
            {districtFilter && (
              <Badge variant="default" size="sm">
                District: {districtFilter}
              </Badge>
            )}
            {sectorFilter && (
              <Badge variant="default" size="sm">
                Sector: {sectorFilter}
              </Badge>
            )}
            {cellFilter && (
              <Badge variant="default" size="sm">
                Cell: {cellFilter}
              </Badge>
            )}
            {villageFilter && (
              <Badge variant="default" size="sm">
                Village: {villageFilter}
              </Badge>
            )}
            <button
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setStatusFilter("");
                setPriorityFilter("");
                setAssigneeFilter("");
                setDueTimeFilter("all");
                setTypeFilter("");
                setSubjectFilter("");
                setOpenCasesFilter("");
                setCountryFilter("");
                setDistrictFilter("");
                setSectorFilter("");
                setCellFilter("");
                setVillageFilter("");
                setPage(0);
              }}
              className="text-sm text-status-error hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedTasks.size > 0 && (
        <div className="bg-primary/10 border border-primary rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-primary">
            {selectedTasks.size} task(s) selected
          </span>
          <div className="flex items-center gap-3">
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
              Reassign Selected
            </Button>
            <Button variant="ghost" onClick={() => setSelectedTasks(new Set())}>
              Clear Selection
            </Button>
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
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedTaskId(task.id)}
                            className="text-status-info hover:text-status-info/80 text-sm font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTaskForReassign(task);
                              setShowReassignModal(true);
                            }}
                            className="text-primary hover:text-primary/80 text-sm font-medium"
                          >
                            Reassign
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
