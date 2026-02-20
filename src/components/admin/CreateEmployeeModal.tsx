"use client";

/**
 * CreateEmployeeModal Component
 *
 * Modal for creating an employee record for a user that doesn't have one.
 */

import { useState } from "react";
import { apiClient } from "@/src/lib/api/apiClient";
import { Button, Alert } from "@/src/components/ui";
import {
  EmployeeFormFields,
  EmployeeFormData,
  createEmptyEmployeeFormData,
} from "./EmployeeFormFields";
import { EntityListResponse, CreateEmployeeRequest } from "@/src/types";

interface CreateEmployeeModalProps {
  userId: string;
  userName: string;
  entities: EntityListResponse[];
  onClose: (success: boolean) => void;
}

export function CreateEmployeeModal({
  userId,
  userName,
  entities,
  onClose,
}: CreateEmployeeModalProps) {
  const [formData, setFormData] = useState<EmployeeFormData>(createEmptyEmployeeFormData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});

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
        employee_number: formData.employee_number || undefined,
        notes: formData.notes || undefined,
      };

      await apiClient.createEmployee(userId, request);
      onClose(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create employee record");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-light">
          <h2 className="text-2xl font-heading text-text-primary">Create Employee Record</h2>
          <p className="text-sm text-text-secondary mt-1">{userName}</p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {error && (
            <Alert variant="error" dismissible onDismiss={() => setError(null)} className="mb-4">
              {error}
            </Alert>
          )}

          <EmployeeFormFields
            data={formData}
            onChange={setFormData}
            entities={entities}
            mode="create"
            disabled={loading}
            errors={errors}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-light flex justify-end gap-3">
          <Button variant="ghost" onClick={() => onClose(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {loading ? "Creating..." : "Create Employee Record"}
          </Button>
        </div>
      </div>
    </div>
  );
}
