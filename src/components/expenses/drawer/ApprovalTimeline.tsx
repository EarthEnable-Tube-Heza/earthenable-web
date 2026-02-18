"use client";

/**
 * ApprovalTimeline — Extracted from [id]/page.tsx
 *
 * Visual timeline with colored circles, connector lines, step status badges.
 */

import { Badge } from "@/src/components/ui";
import { Check, X, Clock } from "@/src/lib/icons";
import { ApprovalStep } from "@/src/lib/api/expenseClient";

interface ApprovalTimelineProps {
  approvals: ApprovalStep[];
  currentStep?: number;
  totalSteps: number;
}

function ApprovalStepItem({
  step,
  isCurrentStep,
  index,
  total,
}: {
  step: ApprovalStep;
  isCurrentStep: boolean;
  index: number;
  total: number;
}) {
  const getStatusIcon = () => {
    switch (step.status) {
      case "approved":
        return <Check className="w-4 h-4 text-white" />;
      case "rejected":
        return <X className="w-4 h-4 text-white" />;
      default:
        return <Clock className="w-4 h-4 text-white" />;
    }
  };

  const getStatusColor = () => {
    switch (step.status) {
      case "approved":
        return "bg-status-success";
      case "rejected":
        return "bg-status-error";
      default:
        return isCurrentStep ? "bg-primary" : "bg-gray-300";
    }
  };

  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor()}`}
        >
          {getStatusIcon()}
        </div>
        {index < total - 1 && (
          <div
            className={`w-0.5 h-12 ${step.status === "approved" ? "bg-status-success" : "bg-gray-200"}`}
          />
        )}
      </div>
      <div className="flex-1 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">Step {step.stepOrder}</span>
          {step.chain && (
            <Badge variant={step.chain === "finance" ? "info" : "default"} size="sm">
              {step.chain.toUpperCase()}
            </Badge>
          )}
          <Badge
            variant={
              step.status === "approved"
                ? "success"
                : step.status === "rejected"
                  ? "error"
                  : "warning"
            }
            size="sm"
          >
            {step.status}
          </Badge>
          {isCurrentStep && step.status === "pending" && (
            <Badge variant="info" size="sm">
              Current
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600">
          {step.approverName || "Unknown"}
          {step.approverRole && <span className="text-gray-400"> ({step.approverRole})</span>}
        </p>
        {step.comments && (
          <p className="text-sm text-gray-500 mt-1 italic">&quot;{step.comments}&quot;</p>
        )}
        {step.approvedAt && (
          <p className="text-xs text-gray-400 mt-1">{new Date(step.approvedAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}

export function ApprovalTimeline({ approvals, currentStep, totalSteps }: ApprovalTimelineProps) {
  if (!approvals || approvals.length === 0) return null;

  const requestSteps = approvals.filter((a) => !a.chain || a.chain === "request");
  const financeSteps = approvals.filter((a) => a.chain === "finance");
  const hasFinanceChain = financeSteps.length > 0;

  return (
    <div>
      <h3 className="text-base font-semibold mb-4">
        Approval Progress ({approvals.filter((a) => a.status === "approved").length}/{totalSteps}{" "}
        approved)
      </h3>

      {/* Request Chain */}
      {requestSteps.length > 0 && (
        <div className="mb-6">
          {hasFinanceChain && (
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="default" size="sm">
                REQUEST CHAIN
              </Badge>
              <div className="flex-1 border-b border-gray-200" />
            </div>
          )}
          <div className="mt-2">
            {requestSteps.map((step, index) => (
              <ApprovalStepItem
                key={step.id}
                step={step}
                isCurrentStep={step.stepOrder === currentStep}
                index={index}
                total={requestSteps.length}
              />
            ))}
          </div>
        </div>
      )}

      {/* Finance Chain */}
      {financeSteps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="info" size="sm">
              FINANCE CHAIN
            </Badge>
            <div className="flex-1 border-b border-blue-200" />
          </div>
          <div className="mt-2">
            {financeSteps.map((step, index) => (
              <ApprovalStepItem
                key={step.id}
                step={step}
                isCurrentStep={step.stepOrder === currentStep}
                index={index}
                total={financeSteps.length}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
