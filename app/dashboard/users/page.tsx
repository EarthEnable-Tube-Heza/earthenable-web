"use client";

/**
 * Users List Page (Admin only)
 *
 * Displays paginated list of users with search and filtering.
 * Search is triggered only when user clicks Search button or presses Enter.
 */

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/src/lib/api";
import { KnownRoles, formatRoleLabel } from "@/src/types/user";
import { cn } from "@/src/lib/theme";

export default function UsersPage() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState(""); // What user is typing
  const [searchQuery, setSearchQuery] = useState(""); // What's actually searched
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<boolean | "">("");
  const limit = 20;

  // Initialize filters from URL query parameters
  useEffect(() => {
    const roleParam = searchParams.get("role");
    const statusParam = searchParams.get("status");
    const searchParam = searchParams.get("search");

    if (roleParam) {
      setRoleFilter(roleParam);
    }

    if (statusParam === "active") {
      setStatusFilter(true);
    } else if (statusParam === "inactive") {
      setStatusFilter(false);
    }

    if (searchParam) {
      setSearchInput(searchParam);
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // Fetch users with pagination and filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users", page, searchQuery, roleFilter, statusFilter],
    queryFn: () =>
      apiClient.getUsers({
        skip: page * limit,
        limit,
        search: searchQuery || undefined,
        role: roleFilter || undefined,
        is_active: statusFilter === "" ? undefined : statusFilter,
      }),
  });

  // Fetch user stats to get all unique roles
  const { data: statsData } = useQuery({
    queryKey: ["user-stats"],
    queryFn: () => apiClient.getUserStats(),
  });

  // Extract unique roles from stats and sort them
  const uniqueRoles = useMemo(() => {
    if (!statsData?.by_role) return [];
    return Object.keys(statsData.by_role)
      .map((role) => {
        // Normalize role (handle "UserRole.ADMIN" format from backend)
        const normalizedRole = role.startsWith("UserRole.")
          ? role.replace("UserRole.", "").toLowerCase()
          : role.toLowerCase();
        return normalizedRole;
      })
      .filter((role, index, arr) => arr.indexOf(role) === index) // Remove duplicates
      .sort((a, b) => formatRoleLabel(a).localeCompare(formatRoleLabel(b)));
  }, [statsData]);

  const users = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Handle search submission
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(0);
  };

  // Handle Enter key in search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setPage(0);
  };

  // Check if search input differs from active query
  const hasUnsearchedInput = searchInput !== searchQuery;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-2">Search</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search by name or email..."
                  className={cn(
                    "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
                    hasUnsearchedInput ? "border-primary" : "border-border-light"
                  )}
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                    title="Clear search"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <button
                onClick={handleSearch}
                disabled={!searchInput && !searchQuery}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2",
                  hasUnsearchedInput
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-background-light text-text-secondary hover:bg-background-light/80"
                )}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Search
              </button>
            </div>
            {searchQuery && (
              <p className="text-xs text-text-secondary mt-1">
                Showing results for &ldquo;{searchQuery}&rdquo;
                {hasUnsearchedInput && (
                  <span className="text-primary ml-1">(press Search or Enter to update)</span>
                )}
              </p>
            )}
            {!searchQuery && hasUnsearchedInput && (
              <p className="text-xs text-primary mt-1">Press Search or Enter to search</p>
            )}
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
              className="w-full pl-4 pr-10 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white bg-no-repeat bg-[length:16px_16px] bg-[right_16px_center]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              }}
            >
              <option value="">All Roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {formatRoleLabel(role)}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
            <select
              value={statusFilter === "" ? "" : statusFilter ? "true" : "false"}
              onChange={(e) => {
                const value = e.target.value;
                setStatusFilter(value === "" ? "" : value === "true");
                setPage(0);
              }}
              className="w-full pl-4 pr-10 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white bg-no-repeat bg-[length:16px_16px] bg-[right_16px_center]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              }}
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Active filters summary */}
        {(searchQuery || roleFilter || statusFilter !== "") && (
          <div className="mt-4 pt-4 border-t border-border-light flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Found {total} user{total !== 1 ? "s" : ""}
              {searchQuery && <span> matching &ldquo;{searchQuery}&rdquo;</span>}
              {roleFilter && <span> with role {formatRoleLabel(roleFilter)}</span>}
              {statusFilter !== "" && <span> ({statusFilter ? "active" : "inactive"} only)</span>}
            </p>
            <button
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
                setRoleFilter("");
                setStatusFilter("");
                setPage(0);
              }}
              className="text-sm text-primary hover:text-primary/80"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-medium overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-text-secondary mt-2">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-status-error">Error loading users. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="w-12 h-12 mx-auto text-text-tertiary mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-text-secondary">No users found matching your criteria.</p>
            {(searchQuery || roleFilter || statusFilter !== "") && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                  setRoleFilter("");
                  setStatusFilter("");
                  setPage(0);
                }}
                className="mt-4 text-primary hover:text-primary/80 text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Horizontal scroll container for mobile */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-background-light border-b border-border-light">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-background-light transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.picture ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.picture}
                              alt={user.name || user.email}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold flex-shrink-0">
                              {user.name?.[0] || user.email[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-text-primary">
                              {user.name || user.email}
                            </div>
                            <div className="text-sm text-text-secondary">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            user.role === KnownRoles.ADMIN
                              ? "bg-status-error/10 text-status-error"
                              : user.role === KnownRoles.MANAGER || user.role.includes("manager")
                                ? "bg-primary/10 text-primary"
                                : user.role === KnownRoles.QA_AGENT || user.role.includes("qa")
                                  ? "bg-status-info/10 text-status-info"
                                  : "bg-green/10 text-green"
                          )}
                        >
                          {formatRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            user.is_active
                              ? "bg-status-success/10 text-status-success"
                              : "bg-text-disabled/10 text-text-disabled"
                          )}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/users/${user.id}`}
                          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-text-secondary">
                  Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total}{" "}
                  users
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium",
                      page === 0
                        ? "bg-background-light text-text-disabled cursor-not-allowed"
                        : "bg-white border border-border-light text-text-primary hover:bg-background-light"
                    )}
                  >
                    First
                  </button>
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium",
                      page === 0
                        ? "bg-background-light text-text-disabled cursor-not-allowed"
                        : "bg-white border border-border-light text-text-primary hover:bg-background-light"
                    )}
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm text-text-secondary">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium",
                      page >= totalPages - 1
                        ? "bg-background-light text-text-disabled cursor-not-allowed"
                        : "bg-white border border-border-light text-text-primary hover:bg-background-light"
                    )}
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setPage(totalPages - 1)}
                    disabled={page >= totalPages - 1}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium",
                      page >= totalPages - 1
                        ? "bg-background-light text-text-disabled cursor-not-allowed"
                        : "bg-white border border-border-light text-text-primary hover:bg-background-light"
                    )}
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
