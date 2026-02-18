"use client";

/**
 * Labeled Select Component
 *
 * Wrapper around Select that adds label support like Input component
 */

import { Select, SelectProps } from "./Select";
import { forwardRef } from "react";
import { cn } from "@/src/lib/theme";

export interface LabeledSelectProps extends Omit<SelectProps, "error"> {
  /**
   * Label for the select
   */
  label?: string;

  /**
   * Options for the select
   */
  options: Array<{ value: string; label: string }>;

  /**
   * Error message to display (also triggers red border on Select)
   */
  error?: string;
}

export const LabeledSelect = forwardRef<HTMLSelectElement, LabeledSelectProps>(
  ({ label, options, className, id, required, fullWidth = true, error, ...props }, ref) => {
    // Generate unique ID for accessibility
    const selectId = id || `select-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    return (
      <div className={cn("flex flex-col gap-1", fullWidth && "w-full")}>
        {/* Label */}
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-text-primary">
            {label}
            {required && <span className="text-status-error ml-1">*</span>}
          </label>
        )}

        {/* Select dropdown */}
        <Select
          ref={ref}
          id={selectId}
          className={className}
          required={required}
          fullWidth={fullWidth}
          error={!!error}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        {/* Error message */}
        {error && <p className="text-sm text-status-error">{error}</p>}
      </div>
    );
  }
);

LabeledSelect.displayName = "LabeledSelect";
