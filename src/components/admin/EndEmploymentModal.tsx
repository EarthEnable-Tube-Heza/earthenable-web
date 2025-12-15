"use client";

/**
 * EndEmploymentModal Component
 *
 * Modal for ending an employee's current assignment without creating a new one.
 */

import { useState } from "react";
import { apiClient } from "@/src/lib/api/apiClient";
import { Button, Alert } from "@/src/components/ui";
import {
  EmployeeFormFields,
  EmployeeFormData,
  createEmptyEmployeeFormData,
} from "./EmployeeFormFields";
import { EmployeeDetail, EndEmployeeRequest, EntityListResponse } from "@/src/types";

interface EndEmploymentModalProps {
  userId: string;
  userName: string;
  employee: EmployeeDetail;
  onClose: (success: boolean) => void;
}

export function EndEmploymentModal({
  userId,
  userName,
  employee,
  onClose,
}: EndEmploymentModalProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    ...createEmptyEmployeeFormData(),
    end_date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});
  const [confirmed, setConfirmed] = useState(false);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
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
      const request: EndEmployeeRequest = {
        end_date: formData.end_date,
        notes: formData.notes || undefined,
      };

      await apiClient.endEmployee(userId, request);
      onClose(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end employment");
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

  // We need to pass entities even though "end" mode doesn't use them
  const emptyEntities: EntityListResponse[] = [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-light">
          <h2 className="text-2xl font-heading text-text-primary">End Employment</h2>
          <p className="text-sm text-text-secondary mt-1">{userName}</p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {error && (
            <Alert variant="error" dismissible onDismiss={() => setError(null)} className="mb-4">
              {error}
            </Alert>
          )}

          {/* Current assignment info */}
          <div className="mb-4 p-4 bg-background-light rounded-md">
            <h3 className="font-semibold text-text-primary mb-2">Current Assignment</h3>
            <div className="text-sm space-y-1 text-text-secondary">
              <p>
                <strong>Entity:</strong> {employee.entity_name} ({employee.entity_code})
              </p>
              <p>
                <strong>Role:</strong> {employee.role}
              </p>
              <p>
                <strong>Started:</strong> {formatDate(employee.start_date)}
              </p>
              {employee.department_name && (
                <p>
                  <strong>Department:</strong> {employee.department_name}
                </p>
              )}
              {employee.job_title && (
                <p>
                  <strong>Job Title:</strong> {employee.job_title}
                </p>
              )}
            </div>
          </div>

          {/* Warning */}
          <Alert variant="warning" className="mb-4">
            <strong>Warning:</strong> This will end the employee&apos;s current assignment. They
            will no longer have an active employee record until a new one is created.
          </Alert>

          {/* Confirmation checkbox */}
          <label className="flex items-start gap-3 mb-6 p-3 border border-status-error rounded-md cursor-pointer hover:bg-red-50">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-4 h-4 text-status-error accent-status-error"
              disabled={loading}
            />
            <span className="text-sm text-text-primary">
              I confirm that I want to end this employee&apos;s employment.
            </span>
          </label>

          <EmployeeFormFields
            data={formData}
            onChange={setFormData}
            entities={emptyEntities}
            mode="end"
            disabled={loading || !confirmed}
            errors={errors}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-light flex justify-end gap-3">
          <Button variant="ghost" onClick={() => onClose(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSubmit} loading={loading} disabled={!confirmed}>
            {loading ? "Ending..." : "End Employment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
