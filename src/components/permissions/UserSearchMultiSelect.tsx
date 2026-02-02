"use client";

/**
 * User Search Multi-Select Component
 *
 * A searchable dropdown that allows selecting multiple users.
 * Uses server-side search to handle large user lists efficiently.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { Spinner } from "@/src/components/ui";
import type { UserListItem } from "@/src/types/user";

interface UserSearchMultiSelectProps {
  selectedUsers: UserListItem[];
  onSelectionChange: (users: UserListItem[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxSelections?: number;
}

export function UserSearchMultiSelect({
  selectedUsers,
  onSelectionChange,
  placeholder = "Search users by name or email...",
  disabled = false,
  maxSelections = 100,
}: UserSearchMultiSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search users query
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["user-search", debouncedSearch],
    queryFn: () => apiClient.searchUsersForRoleAssignment(debouncedSearch, 20),
    enabled: debouncedSearch.length >= 2,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Filter out already selected users
  const availableUsers =
    searchResults?.items.filter(
      (user) => !selectedUsers.some((selected) => selected.id === user.id)
    ) || [];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectUser = useCallback(
    (user: UserListItem) => {
      if (selectedUsers.length >= maxSelections) {
        return;
      }
      onSelectionChange([...selectedUsers, user]);
      setSearchTerm("");
      setDebouncedSearch("");
      inputRef.current?.focus();
    },
    [selectedUsers, onSelectionChange, maxSelections]
  );

  const handleRemoveUser = useCallback(
    (userId: string) => {
      onSelectionChange(selectedUsers.filter((u) => u.id !== userId));
    },
    [selectedUsers, onSelectionChange]
  );

  const handleClearAll = useCallback(() => {
    onSelectionChange([]);
    setSearchTerm("");
    setDebouncedSearch("");
  }, [onSelectionChange]);

  return (
    <div ref={containerRef} className="relative">
      {/* Selected Users Display */}
      {selectedUsers.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-secondary">
              Selected ({selectedUsers.length})
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-status-error hover:text-status-error/80 transition-colors"
              disabled={disabled}
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-background-light rounded-lg">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full text-sm border border-border-light"
              >
                <span className="text-text-primary truncate max-w-[150px]">
                  {user.name || user.email}
                </span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveUser(user.id)}
                    className="text-text-tertiary hover:text-status-error transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-text-tertiary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled || selectedUsers.length >= maxSelections}
          className="w-full pl-10 pr-4 py-2.5 border border-border-default rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:bg-background-light disabled:cursor-not-allowed"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && searchTerm.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-border-light max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <Spinner size="sm" centered />
              <p className="text-sm text-text-secondary mt-2">Searching...</p>
            </div>
          ) : availableUsers.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-text-secondary">
                {searchResults?.items.length === 0
                  ? `No users found matching "${searchTerm}"`
                  : "All matching users are already selected"}
              </p>
            </div>
          ) : (
            <ul className="py-1">
              {availableUsers.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className="w-full px-4 py-2.5 text-left hover:bg-background-light transition-colors"
                  >
                    <div className="font-medium text-sm text-text-primary">
                      {user.name || "No name"}
                    </div>
                    <div className="text-xs text-text-secondary">{user.email}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Helper text */}
      {searchTerm.length > 0 && searchTerm.length < 2 && (
        <p className="text-xs text-text-tertiary mt-1">Type at least 2 characters to search</p>
      )}

      {selectedUsers.length >= maxSelections && (
        <p className="text-xs text-status-warning mt-1">
          Maximum {maxSelections} users can be selected at once
        </p>
      )}
    </div>
  );
}
