"use client";

/**
 * NewAssignmentModal Component
 *
 * Modal for creating a new employee assignment.
 * This ends the current assignment and creates a new one.
 */

import { useState } from "react";
import { apiClient } from "@/src/lib/api/apiClient";
import { Button, Alert, ResultModal } from "@/src/components/ui";
import type { ResultModalVariant } from "@/src/components/ui/ResultModal";
import {
  EmployeeFormFields,
  EmployeeFormData,
  createEmptyEmployeeFormData,
} from "./EmployeeFormFields";
import { EntityListResponse, EmployeeDetail, CreateEmployeeRequest } from "@/src/types";

interface NewAssignmentModalProps {
  userId: string;
  userName: string;
  currentEmployee: EmployeeDetail;
  entities: EntityListResponse[];
  onClose: (success: boolean) => void;
}

interface ResultModalState {
  isOpen: boolean;
  variant: ResultModalVariant;
  title: string;
  message: string;
  secondaryMessage?: string;
  actionLabel?: string;
  isSuccess?: boolean;
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
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [resultModal, setResultModal] = useState<ResultModalState>({
    isOpen: false,
    variant: "info",
    title: "",
    message: "",
  });

  // Get the new entity name for display
  const getNewEntityName = () => {
    const entity = entities.find((e) => e.id === formData.entity_id);
    return entity?.name || "the selected entity";
  };

  const showResultModal = (
    variant: ResultModalVariant,
    title: string,
    message: string,
    secondaryMessage?: string,
    actionLabel?: string,
    isSuccess?: boolean
  ) => {
    setResultModal({
      isOpen: true,
      variant,
      title,
      message,
      secondaryMessage,
      actionLabel,
      isSuccess,
    });
  };

  const closeResultModal = () => {
    // Use functional update to get current state value (avoids stale closure)
    setResultModal((prev) => {
      // If it was a success, close the main modal after hiding result modal
      if (prev.isSuccess) {
        // Use setTimeout to allow the modal to close first
        setTimeout(() => onClose(true), 100);
      }
      return { ...prev, isOpen: false };
    });
  };

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

    if (Object.keys(newErrors).length > 0) {
      showResultModal(
        "warning",
        "Missing Required Fields",
        "Please fill in all required fields: Entity, Role, and Start Date.",
        "All fields marked as required must be completed before creating the assignment."
      );
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!confirmed) {
      showResultModal(
        "warning",
        "Confirmation Required",
        "Please confirm that you understand the current assignment will be ended.",
        "Check the confirmation box to proceed with creating the new assignment."
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

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

    // Use .then/.catch to prevent unhandled promise rejection from triggering error boundary
    apiClient
      .createEmployee(userId, request)
      .then(() => {
        setLoading(false);
        const newEntityName = getNewEntityName();
        showResultModal(
          "success",
          "Assignment Created Successfully",
          `${userName} has been assigned to ${newEntityName}.`,
          `The previous assignment to ${currentEmployee.entity_name} has been ended. The new assignment is now active.`,
          "Done",
          true
        );
      })
      .catch((err) => {
        setLoading(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosError = err as any;
        const statusCode = axiosError?.response?.status;
        const apiError = axiosError?.response?.data?.detail || "";
        const newEntityName = getNewEntityName();

        // Provide user-friendly error messages based on error type
        if (
          statusCode === 403 ||
          apiError.includes("Access denied") ||
          apiError.includes("permission")
        ) {
          showResultModal(
            "error",
            "Permission Denied",
            `You do not have permission to change assignments for ${userName}.`,
            "Only administrators can modify employee assignments. Please contact your system administrator if you believe this is a mistake.",
            "Understood"
          );
        } else if (statusCode === 404) {
          showResultModal(
            "error",
            "User Not Found",
            `The user ${userName} could not be found in the system.`,
            "The user may have been deleted or deactivated. Please refresh the page and try again.",
            "OK"
          );
        } else if (
          statusCode === 409 ||
          apiError.includes("conflict") ||
          apiError.includes("already")
        ) {
          showResultModal(
            "error",
            "Assignment Conflict",
            `There was a conflict creating the assignment to ${newEntityName}.`,
            "This may occur if the assignment was already changed by another administrator. Please refresh the page and try again.",
            "OK"
          );
        } else if (statusCode === 422 || apiError.includes("validation")) {
          showResultModal(
            "error",
            "Invalid Data",
            "The assignment data is invalid or incomplete.",
            `Please verify all fields are correct. Error details: ${apiError || "Validation failed"}`,
            "OK"
          );
        } else if (statusCode === 500) {
          showResultModal(
            "error",
            "Server Error",
            "We encountered an unexpected error while creating the assignment.",
            `Technical details: ${apiError || "Unknown error"}. Please try again in a few moments.`,
            "Try Again"
          );
        } else {
          showResultModal(
            "error",
            "Unable to Create Assignment",
            `We couldn't create the new assignment for ${userName}.`,
            "Please check your internet connection and try again. If the problem persists, contact your administrator.",
            "Try Again"
          );
        }
      });
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
    <>
      <ResultModal
        isOpen={resultModal.isOpen}
        variant={resultModal.variant}
        title={resultModal.title}
        message={resultModal.message}
        secondaryMessage={resultModal.secondaryMessage}
        actionLabel={resultModal.actionLabel || "OK"}
        onAction={closeResultModal}
      />

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-light">
            <h2 className="text-2xl font-heading text-text-primary">New Assignment</h2>
            <p className="text-sm text-text-secondary mt-1">{userName}</p>
          </div>

          {/* Content */}
          <div className="px-6 py-4 flex-1 overflow-y-auto">
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
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={loading}
              disabled={!confirmed}
            >
              {loading ? "Creating..." : "Create New Assignment"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
