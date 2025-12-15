"use client";

/**
 * NewAssignmentModal Component
 *
 * Modal for creating a new employee assignment.
 * This ends the current assignment and creates a new one.
 */

import { useState } from "react";
import { apiClient } from "@/src/lib/api/apiClient";
import { Button, Alert } from "@/src/components/ui";
import {
  EmployeeFormFields,
  EmployeeFormData,
  createEmptyEmployeeFormData,
} from "./EmployeeFormFields";
import { EntityListResponse, EmployeeDetail, CreateEmployeeRequest, Level } from "@/src/types";

interface NewAssignmentModalProps {
  userId: string;
  userName: string;
  currentEmployee: EmployeeDetail;
  entities: EntityListResponse[];
  onClose: (success: boolean) => void;
}

export function NewAssignmentModal({
  userId,
  userName,
  currentEmployee,
  entities,
  onClose,
}: NewAssignmentModalProps) {
  const [formData, setFormData] = useState<EmployeeFormData>(createEmptyEmployeeFormData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});
  const [confirmed, setConfirmed] = useState(false);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

    if (!formData.entity_id) {
      newErrors.entity_id = "Entity is required";
    }
    if (!formData.role.trim()) {
      newErrors.role = "Role is required";
    }
    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!confirmed) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: CreateEmployeeRequest = {
        entity_id: formData.entity_id,
        role: formData.role,
        start_date: formData.start_date,
        department_id: formData.department_id || undefined,
        sub_department_id: formData.sub_department_id || undefined,
        branch_id: formData.branch_id || undefined,
        job_role_id: formData.job_role_id || undefined,
        approver_id: formData.approver_id || undefined,
        level: (formData.level as Level) || undefined,
        employee_number: formData.employee_number || undefined,
        job_title: formData.job_title || undefined,
        notes: formData.notes || undefined,
      };

      await apiClient.createEmployee(userId, request);
      onClose(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create new assignment");
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-light">
          <h2 className="text-2xl font-heading text-text-primary">New Assignment</h2>
          <p className="text-sm text-text-secondary mt-1">{userName}</p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {error && (
            <Alert variant="error" dismissible onDismiss={() => setError(null)} className="mb-4">
              {error}
            </Alert>
          )}

          {/* Warning about current assignment */}
          <Alert variant="warning" className="mb-4">
            <div className="font-semibold mb-2">This will end the current assignment</div>
            <div className="text-sm space-y-1">
              <p>
                <strong>Entity:</strong> {currentEmployee.entity_name} (
                {currentEmployee.entity_code})
              </p>
              <p>
                <strong>Role:</strong> {currentEmployee.role}
              </p>
              <p>
                <strong>Started:</strong> {formatDate(currentEmployee.start_date)}
              </p>
              {currentEmployee.department_name && (
                <p>
                  <strong>Department:</strong> {currentEmployee.department_name}
                </p>
              )}
            </div>
          </Alert>

          {/* Confirmation checkbox */}
          <label className="flex items-start gap-3 mb-6 p-3 border border-border-light rounded-md cursor-pointer hover:bg-background-light">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-4 h-4 text-primary accent-primary"
              disabled={loading}
            />
            <span className="text-sm text-text-primary">
              I understand that creating a new assignment will automatically end the current
              assignment as of the new start date.
            </span>
          </label>

          <EmployeeFormFields
            data={formData}
            onChange={setFormData}
            entities={entities}
            mode="new_assignment"
            disabled={loading || !confirmed}
            errors={errors}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-light flex justify-end gap-3">
          <Button variant="ghost" onClick={() => onClose(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading} disabled={!confirmed}>
            {loading ? "Creating..." : "Create New Assignment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
