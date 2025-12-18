"use client";

/**
 * MultiSelect Component
 *
 * Dropdown component that allows selecting multiple options with checkboxes.
 * Features:
 * - Selected options bubble to the top
 * - Type-ahead search filtering
 * - Full labels shown in dropdown, truncated in trigger
 * - Select All / Clear All actions
 * - Follows EarthEnable design system
 */

import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/src/lib/theme";
import { theme } from "@/src/lib/theme/constants";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  /**
   * Label for the select
   */
  label?: string;

  /**
   * Placeholder text when no options are selected
   */
  placeholder?: string;

  /**
   * Available options
   */
  options: MultiSelectOption[];

  /**
   * Currently selected values
   */
  value: string[];

  /**
   * Callback when selection changes
   */
  onChange: (values: string[]) => void;

  /**
   * Size variant
   */
  size?: "sm" | "default" | "lg";

  /**
   * Full width
   */
  fullWidth?: boolean;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Maximum number of items to show in the trigger before showing count
   */
  maxDisplayItems?: number;
}

/**
 * Custom dropdown arrow SVG (embedded as data URI)
 */
const DROPDOWN_ARROW_SVG = `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

export function MultiSelect({
  label,
  placeholder = "Select...",
  options,
  value,
  onChange,
  size = "default",
  fullWidth = true,
  disabled = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  maxDisplayItems = 1,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(term));
  }, [options, searchTerm]);

  // Sort options: selected first, then unselected (maintaining original order within each group)
  const sortedOptions = useMemo(() => {
    const selected = filteredOptions.filter((o) => value.includes(o.value));
    const unselected = filteredOptions.filter((o) => !value.includes(o.value));
    return [...selected, ...unselected];
  }, [filteredOptions, value]);

  // Toggle selection of an option
  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  // Select all options (or all filtered options if searching)
  const selectAll = () => {
    if (searchTerm.trim()) {
      // When searching, add filtered options to existing selection
      const filteredValues = filteredOptions.map((o) => o.value);
      const newValues = [...new Set([...value, ...filteredValues])];
      onChange(newValues);
    } else {
      // Select all options
      onChange(options.map((o) => o.value));
    }
  };

  // Clear all selections
  const clearAll = () => {
    onChange([]);
  };

  // Get display text for selected values (compact for trigger)
  const getDisplayText = () => {
    if (value.length === 0) return placeholder;

    if (value.length === 1) {
      const label = options.find((o) => o.value === value[0])?.label || value[0];
      // Truncate long single selections
      return label.length > 20 ? `${label.substring(0, 18)}...` : label;
    }

    // For multiple selections, show count
    return `${value.length} selected`;
  };

  const sizeStyles = {
    sm: {
      height: theme.formInputs.height.sm,
      paddingLeft: theme.formInputs.padding.x,
      paddingRight: theme.formInputs.padding.selectRight,
      paddingTop: "0.375rem",
      paddingBottom: "0.375rem",
    },
    default: {
      height: theme.formInputs.height.default,
      paddingLeft: theme.formInputs.padding.x,
      paddingRight: theme.formInputs.padding.selectRight,
      paddingTop: theme.formInputs.padding.y,
      paddingBottom: theme.formInputs.padding.y,
    },
    lg: {
      height: theme.formInputs.height.lg,
      paddingLeft: theme.formInputs.padding.x,
      paddingRight: theme.formInputs.padding.selectRight,
      paddingTop: "0.875rem",
      paddingBottom: "0.875rem",
    },
  };

  return (
    <div ref={containerRef} className={cn("relative", fullWidth && "w-full")}>
      {/* Label */}
      {label && <label className="block text-sm font-medium text-text-primary mb-1">{label}</label>}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          // Base styles
          "appearance-none bg-white border rounded-md text-left",
          "font-body text-base",
          "transition-colors duration-150",

          // Border - highlight when has selections
          value.length > 0 ? "border-primary/50" : "border-border-light",

          // Focus state
          "focus:outline-none focus:ring-2 focus:ring-primary",

          // Hover state
          !disabled && "hover:border-border-medium",

          // Disabled state
          disabled && "bg-background-light text-text-disabled cursor-not-allowed",

          // Text color
          value.length > 0 ? "text-text-primary" : "text-text-tertiary",

          // Width
          fullWidth ? "w-full" : "w-auto"
        )}
        style={{
          ...sizeStyles[size],
          backgroundImage: DROPDOWN_ARROW_SVG,
          backgroundRepeat: "no-repeat",
          backgroundSize: "16px 16px",
          backgroundPosition: `right ${theme.formInputs.padding.x} center`,
        }}
      >
        <span className="block truncate pr-4">
          {getDisplayText()}
          {value.length > 0 && (
            <span className="ml-1 text-xs text-primary font-medium">({value.length})</span>
          )}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] bg-white border border-border-light rounded-md shadow-lg max-h-80 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="sticky top-0 px-3 py-2 border-b border-border-light bg-white">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to filter..."
                className="w-full px-3 py-1.5 pr-8 text-sm border border-border-light rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Select All / Clear All */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border-light bg-background-light">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-primary hover:text-primary/80 font-medium"
            >
              Select All{searchTerm ? ` (${filteredOptions.length})` : ""}
            </button>
            {value.length > 0 && (
              <span className="text-xs text-text-secondary">
                {value.length} of {options.length}
              </span>
            )}
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-status-error hover:text-status-error/80 font-medium"
            >
              Clear
            </button>
          </div>

          {/* Options - selected first, then unselected */}
          <div className="py-1 overflow-auto flex-1">
            {sortedOptions.map((option, index) => {
              const isSelected = value.includes(option.value);
              const isFirstUnselected =
                index > 0 && value.includes(sortedOptions[index - 1].value) && !isSelected;

              return (
                <div key={option.value}>
                  {/* Divider between selected and unselected */}
                  {isFirstUnselected && value.length > 0 && (
                    <div className="border-t border-border-light my-1" />
                  )}
                  <label
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 cursor-pointer",
                      "hover:bg-background-light transition-colors",
                      isSelected && "bg-primary/5"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOption(option.value)}
                      className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary flex-shrink-0"
                    />
                    <span
                      className={cn(
                        "text-sm",
                        isSelected ? "text-text-primary font-medium" : "text-text-primary"
                      )}
                    >
                      {option.label}
                    </span>
                  </label>
                </div>
              );
            })}

            {options.length === 0 && (
              <div className="px-3 py-2 text-sm text-text-secondary">No options available</div>
            )}

            {options.length > 0 && sortedOptions.length === 0 && searchTerm && (
              <div className="px-3 py-2 text-sm text-text-secondary">
                No matches for &quot;{searchTerm}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

MultiSelect.displayName = "MultiSelect";
