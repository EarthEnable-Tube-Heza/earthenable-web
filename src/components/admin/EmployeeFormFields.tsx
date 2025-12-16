"use client";

/**
 * EmployeeFormFields Component
 *
 * Reusable form fields for employee management with cascading dropdowns.
 * Entity selection triggers fetching of departments, branches, and job roles.
 */

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { apiClient } from "@/src/lib/api/apiClient";
import { Input, Select } from "@/src/components/ui";
import {
  EntityListResponse,
  DepartmentResponse,
  BranchResponse,
  JobRoleResponse,
  Level,
  LEVEL_OPTIONS,
  UserListItem,
} from "@/src/types";

export interface EmployeeFormData {
  entity_id: string;
  department_id: string;
  sub_department_id: string;
  branch_id: string;
  job_role_id: string;
  approver_id: string;
  role: string;
  level: Level | "";
  employee_number: string;
  job_title: string;
  start_date: string;
  end_date: string;
  notes: string;
}

interface EmployeeFormFieldsProps {
  data: EmployeeFormData;
  onChange: (data: EmployeeFormData) => void;
  entities: EntityListResponse[];
  mode: "create" | "edit" | "new_assignment" | "end";
  disabled?: boolean;
  errors?: Partial<Record<keyof EmployeeFormData, string>>;
}

export function EmployeeFormFields({
  data,
  onChange,
  entities,
  mode,
  disabled = false,
  errors = {},
}: EmployeeFormFieldsProps) {
  // Entity sub-resources
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRoleResponse[]>([]);
  const [loadingSubResources, setLoadingSubResources] = useState(false);

  // Approver search
  const [approverSearch, setApproverSearch] = useState("");
  const [approverResults, setApproverResults] = useState<UserListItem[]>([]);
  const [loadingApprovers, setLoadingApprovers] = useState(false);
  const [showApproverDropdown, setShowApproverDropdown] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState<UserListItem | null>(null);

  // Fetch entity sub-resources when entity changes
  const fetchEntitySubResources = useCallback(async (entityId: string) => {
    if (!entityId) {
      setDepartments([]);
      setBranches([]);
      setJobRoles([]);
      return;
    }

    setLoadingSubResources(true);
    try {
      const [depts, branchList, roles] = await Promise.all([
        apiClient.getEntityDepartments(entityId),
        apiClient.getEntityBranches(entityId),
        apiClient.getEntityJobRoles(entityId),
      ]);
      setDepartments(depts);
      setBranches(branchList);
      setJobRoles(roles);
    } catch (err) {
      console.error("Failed to fetch entity sub-resources:", err);
      setDepartments([]);
      setBranches([]);
      setJobRoles([]);
    } finally {
      setLoadingSubResources(false);
    }
  }, []);

  // Fetch sub-resources on entity change
  useEffect(() => {
    if (data.entity_id) {
      fetchEntitySubResources(data.entity_id);
    } else {
      setDepartments([]);
      setBranches([]);
      setJobRoles([]);
    }
  }, [data.entity_id, fetchEntitySubResources]);

  // Debounced approver search
  useEffect(() => {
    if (!approverSearch || approverSearch.length < 2) {
      setApproverResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingApprovers(true);
      try {
        const response = await apiClient.getUsers({
          search: approverSearch,
          limit: 10,
          skip: 0,
          is_active: true,
        });
        setApproverResults(response.items);
      } catch (err) {
        console.error("Failed to search approvers:", err);
        setApproverResults([]);
      } finally {
        setLoadingApprovers(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [approverSearch]);

  // Handle field changes
  const handleChange = (field: keyof EmployeeFormData, value: string) => {
    const newData = { ...data, [field]: value };

    // Clear dependent fields when entity changes
    if (field === "entity_id") {
      newData.department_id = "";
      newData.sub_department_id = "";
      newData.branch_id = "";
      newData.job_role_id = "";
    }

    // Clear sub-department when department changes
    if (field === "department_id") {
      newData.sub_department_id = "";
    }

    onChange(newData);
  };

  // Handle approver selection
  const handleApproverSelect = (user: UserListItem) => {
    setSelectedApprover(user);
    setApproverSearch("");
    setShowApproverDropdown(false);
    handleChange("approver_id", user.id);
  };

  // Clear approver
  const clearApprover = () => {
    setSelectedApprover(null);
    handleChange("approver_id", "");
  };

  // Get sub-departments for selected department
  const subDepartments = departments.filter(
    (d) => d.id !== data.department_id && data.department_id !== ""
  );

  // For "end" mode, only show end date and notes
  if (mode === "end") {
    return (
      <div className="space-y-4">
        <Input
          label="End Date"
          type="date"
          value={data.end_date}
          onChange={(e) => handleChange("end_date", e.target.value)}
          required
          disabled={disabled}
          error={errors.end_date}
        />

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={data.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Add any notes about ending this employment..."
            rows={3}
            disabled={disabled}
            className="w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-background-light disabled:text-text-disabled"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Entity Selection */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          Entity <span className="text-status-error">*</span>
        </label>
        <Select
          value={data.entity_id}
          onChange={(e) => handleChange("entity_id", e.target.value)}
          disabled={disabled || mode === "edit"}
          error={!!errors.entity_id}
        >
          <option value="">Select entity...</option>
          {entities.map((entity) => (
            <option key={entity.id} value={entity.id}>
              {entity.code} - {entity.name}
            </option>
          ))}
        </Select>
        {errors.entity_id && <p className="text-sm text-status-error mt-1">{errors.entity_id}</p>}
      </div>

      {/* Loading indicator for sub-resources */}
      {loadingSubResources && (
        <div className="text-sm text-text-secondary italic">
          Loading departments, branches, and job roles...
        </div>
      )}

      {/* Department & Sub-Department Row */}
      {data.entity_id && !loadingSubResources && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Department</label>
            <Select
              value={data.department_id}
              onChange={(e) => handleChange("department_id", e.target.value)}
              disabled={disabled}
              error={!!errors.department_id}
            >
              <option value="">Select department...</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.code} - {dept.name}
                </option>
              ))}
            </Select>
            {errors.department_id && (
              <p className="text-sm text-status-error mt-1">{errors.department_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Sub-Department
            </label>
            <Select
              value={data.sub_department_id}
              onChange={(e) => handleChange("sub_department_id", e.target.value)}
              disabled={disabled || !data.department_id}
              error={!!errors.sub_department_id}
            >
              <option value="">Select sub-department...</option>
              {subDepartments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.code} - {dept.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}

      {/* Branch & Job Role Row */}
      {data.entity_id && !loadingSubResources && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Branch</label>
            <Select
              value={data.branch_id}
              onChange={(e) => handleChange("branch_id", e.target.value)}
              disabled={disabled}
              error={!!errors.branch_id}
            >
              <option value="">Select branch...</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.code} - {branch.name}
                  {branch.location && ` (${branch.location})`}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Job Role</label>
            <Select
              value={data.job_role_id}
              onChange={(e) => handleChange("job_role_id", e.target.value)}
              disabled={disabled}
              error={!!errors.job_role_id}
            >
              <option value="">Select job role...</option>
              {jobRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.code} - {role.name} ({role.level})
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}

      {/* Role & Level Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Role"
          value={data.role}
          onChange={(e) => handleChange("role", e.target.value)}
          placeholder="e.g., qa_agent, manager"
          required
          disabled={disabled}
          error={errors.role}
        />

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Level</label>
          <Select
            value={data.level}
            onChange={(e) => handleChange("level", e.target.value)}
            disabled={disabled}
            error={!!errors.level}
          >
            <option value="">Select level...</option>
            {LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Employee Number & Job Title Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Employee Number"
          value={data.employee_number}
          onChange={(e) => handleChange("employee_number", e.target.value)}
          placeholder="e.g., EMP001"
          disabled={disabled}
          error={errors.employee_number}
        />

        <Input
          label="Job Title"
          value={data.job_title}
          onChange={(e) => handleChange("job_title", e.target.value)}
          placeholder="e.g., Senior QA Agent"
          disabled={disabled}
          error={errors.job_title}
        />
      </div>

      {/* Approver Search */}
      <div className="relative">
        <label className="block text-sm font-medium text-text-primary mb-1">Approver</label>
        {selectedApprover ? (
          <div className="flex items-center gap-2 p-3 border border-border-light rounded-md bg-background-light">
            {selectedApprover.picture && (
              <Image
                src={selectedApprover.picture}
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 rounded-full"
                unoptimized
              />
            )}
            <div className="flex-1">
              <div className="font-medium text-text-primary">
                {selectedApprover.name || selectedApprover.email}
              </div>
              {selectedApprover.name && (
                <div className="text-sm text-text-secondary">{selectedApprover.email}</div>
              )}
            </div>
            <button
              type="button"
              onClick={clearApprover}
              disabled={disabled}
              className="text-text-secondary hover:text-text-primary p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="relative">
            <Input
              value={approverSearch}
              onChange={(e) => {
                setApproverSearch(e.target.value);
                setShowApproverDropdown(true);
              }}
              onFocus={() => setShowApproverDropdown(true)}
              placeholder="Search for approver by name or email..."
              disabled={disabled}
            />
            {showApproverDropdown && (approverResults.length > 0 || loadingApprovers) && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-border-light rounded-md shadow-lg max-h-60 overflow-y-auto">
                {loadingApprovers ? (
                  <div className="p-3 text-center text-text-secondary">Searching...</div>
                ) : (
                  approverResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleApproverSelect(user)}
                      className="w-full flex items-center gap-2 p-3 hover:bg-background-light text-left"
                    >
                      {user.picture && (
                        <Image
                          src={user.picture}
                          alt=""
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full"
                          unoptimized
                        />
                      )}
                      <div>
                        <div className="font-medium text-text-primary">
                          {user.name || user.email}
                        </div>
                        {user.name && (
                          <div className="text-sm text-text-secondary">{user.email}</div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Start Date & End Date Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          value={data.start_date}
          onChange={(e) => handleChange("start_date", e.target.value)}
          required={mode === "create" || mode === "new_assignment"}
          disabled={disabled || mode === "edit"}
          error={errors.start_date}
        />

        {mode === "edit" && (
          <Input
            label="End Date"
            type="date"
            value={data.end_date}
            onChange={(e) => handleChange("end_date", e.target.value)}
            disabled={disabled}
            error={errors.end_date}
          />
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Notes</label>
        <textarea
          value={data.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Add any notes about this employee record..."
          rows={3}
          disabled={disabled}
          className="w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-background-light disabled:text-text-disabled"
        />
      </div>
    </div>
  );
}

/**
 * Create initial empty form data
 */
export function createEmptyEmployeeFormData(): EmployeeFormData {
  return {
    entity_id: "",
    department_id: "",
    sub_department_id: "",
    branch_id: "",
    job_role_id: "",
    approver_id: "",
    role: "",
    level: "",
    employee_number: "",
    job_title: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    notes: "",
  };
}

/**
 * Convert EmployeeDetail to form data
 */
export function employeeDetailToFormData(employee: {
  entity_id: string;
  department_id?: string;
  sub_department_id?: string;
  branch_id?: string;
  job_role_id?: string;
  approver_id?: string;
  role: string;
  level?: string;
  employee_number?: string;
  job_title?: string;
  start_date: string;
  end_date?: string;
  notes?: string;
}): EmployeeFormData {
  return {
    entity_id: employee.entity_id,
    department_id: employee.department_id || "",
    sub_department_id: employee.sub_department_id || "",
    branch_id: employee.branch_id || "",
    job_role_id: employee.job_role_id || "",
    approver_id: employee.approver_id || "",
    role: employee.role,
    level: (employee.level as Level) || "",
    employee_number: employee.employee_number || "",
    job_title: employee.job_title || "",
    start_date: employee.start_date.split("T")[0],
    end_date: employee.end_date?.split("T")[0] || "",
    notes: employee.notes || "",
  };
}
