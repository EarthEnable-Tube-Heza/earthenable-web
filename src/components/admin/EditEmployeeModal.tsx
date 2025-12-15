"use client";

/**
 * EditEmployeeModal Component
 *
 * Modal for editing an existing employee record.
 */

import { useState } from "react";
import { apiClient } from "@/src/lib/api/apiClient";
import { Button, Alert } from "@/src/components/ui";
import {
  EmployeeFormFields,
  EmployeeFormData,
  employeeDetailToFormData,
} from "./EmployeeFormFields";
import { EntityListResponse, EmployeeDetail, UpdateEmployeeRequest, Level } from "@/src/types";

interface EditEmployeeModalProps {
  userId: string;
  userName: string;
  employee: EmployeeDetail;
  entities: EntityListResponse[];
  onClose: (success: boolean) => void;
}

export function EditEmployeeModal({
  userId,
  userName,
  employee,
  entities,
  onClose,
}: EditEmployeeModalProps) {
  const [formData, setFormData] = useState<EmployeeFormData>(employeeDetailToFormData(employee));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

    if (!formData.role.trim()) {
      newErrors.role = "Role is required";
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
      const request: UpdateEmployeeRequest = {
        department_id: formData.department_id || undefined,
        sub_department_id: formData.sub_department_id || undefined,
        branch_id: formData.branch_id || undefined,
        job_role_id: formData.job_role_id || undefined,
        approver_id: formData.approver_id || undefined,
        role: formData.role,
        level: (formData.level as Level) || undefined,
        employee_number: formData.employee_number || undefined,
        job_title: formData.job_title || undefined,
        end_date: formData.end_date || undefined,
        notes: formData.notes || undefined,
      };

      await apiClient.updateEmployee(userId, request);
      onClose(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update employee record");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-light">
          <h2 className="text-2xl font-heading text-text-primary">Edit Employee Record</h2>
          <p className="text-sm text-text-secondary mt-1">{userName}</p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {error && (
            <Alert variant="error" dismissible onDismiss={() => setError(null)} className="mb-4">
              {error}
            </Alert>
          )}

          <div className="mb-4 p-3 bg-background-light rounded-md">
            <p className="text-sm text-text-secondary">
              <strong>Note:</strong> Entity and start date cannot be changed. To change entity, use
              &quot;New Assignment&quot; which will end this record and create a new one.
            </p>
          </div>

          <EmployeeFormFields
            data={formData}
            onChange={setFormData}
            entities={entities}
            mode="edit"
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
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
