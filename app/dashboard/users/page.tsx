"use client";

/**
 * Users Management Page (Admin only)
 *
 * Tabbed layout with:
 *   - Users tab: Paginated list with search, filtering, and entity access management
 *   - Job Roles tab: CRUD for entity-specific job roles (admin only)
 *   - Seniority Levels tab: CRUD for seniority levels (admin only)
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/src/lib/api";
import { useSetPageHeader } from "@/src/contexts/PageHeaderContext";
import { KnownRoles, formatRoleLabel } from "@/src/types/user";
import { UserWithEntityAccess, EntityListResponse } from "@/src/types";
import { cn, PAGE_SPACING } from "@/src/lib/theme";
import { LabeledSelect, MultiSelect, Badge, ConfirmDialog, Toast } from "@/src/components/ui";
import { GrantEntityAccessModal } from "@/src/components/admin/GrantEntityAccessModal";
import { useIsAdmin } from "@/src/lib/auth/hooks";
import { JobRolesTab } from "@/src/components/expenses/tabs/JobRolesTab";
import { SeniorityLevelsTab } from "@/src/components/admin/tabs/SeniorityLevelsTab";

type UserTabId = "users" | "job-roles" | "seniority-levels";

const USER_TABS: { id: UserTabId; label: string; adminOnly: boolean }[] = [
  { id: "users", label: "Users", adminOnly: false },
  { id: "job-roles", label: "Job Roles", adminOnly: true },
  { id: "seniority-levels", label: "Seniority Levels", adminOnly: true },
];

/* ───────────────────── Users Content (extracted) ───────────────────── */

function UsersContent() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState(""); // What user is typing
  const [searchQuery, setSearchQuery] = useState(""); // What's actually searched
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<boolean | "">("");
  const limit = 20;

  // Entity management state
  const [entities, setEntities] = useState<EntityListResponse[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithEntityAccess | null>(null);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [revokeConfirm, setRevokeConfirm] = useState<{
    userId: string;
    entityId: string;
    entityCode: string;
  } | null>(null);
  const [toast, setToast] = useState<{
    visible: boolean;
    type: "success" | "error";
    message: string;
  }>({ visible: false, type: "success", message: "" });

  // Initialize filters from URL query parameters
  useEffect(() => {
    const roleParam = searchParams.get("role");
    const statusParam = searchParams.get("status");
    const searchParam = searchParams.get("search");

    if (roleParam) {
      setRoleFilter(roleParam.split(","));
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

  // Fetch users with entity access data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users-entity-access", page, searchQuery, statusFilter],
    queryFn: () =>
      apiClient.getUsersWithEntityAccess({
        skip: page * limit,
        limit,
        search: searchQuery || undefined,
        is_active: statusFilter === "" ? undefined : statusFilter,
      }),
  });

  // Fetch user stats to get all unique roles
  const { data: statsData } = useQuery({
    queryKey: ["user-stats"],
    queryFn: () => apiClient.getUserStats(),
  });

  // Fetch entities for grant modal
  const fetchEntities = useCallback(async () => {
    if (entities.length > 0) return;
    try {
      const data = await apiClient.getEntitiesForAdmin(false);
      setEntities(data);
    } catch (err) {
      console.error("Error fetching entities:", err);
    }
  }, [entities.length]);

  // Extract unique roles from stats and sort them
  const uniqueRoles = useMemo(() => {
    if (!statsData?.by_role) return [];
    return Object.keys(statsData.by_role)
      .map((role) => {
        const normalizedRole = role.startsWith("UserRole.")
          ? role.replace("UserRole.", "").toLowerCase()
          : role.toLowerCase();
        return normalizedRole;
      })
      .filter((role, index, arr) => arr.indexOf(role) === index)
      .sort((a, b) => formatRoleLabel(a).localeCompare(formatRoleLabel(b)));
  }, [statsData]);

  // Apply client-side role filter (entity-access API doesn't support role param)
  const users = useMemo(() => {
    const allUsers = data?.items || [];
    if (roleFilter.length === 0) return allUsers;
    return allUsers.filter((user) => roleFilter.includes(user.role.toLowerCase()));
  }, [data?.items, roleFilter]);

  const total = roleFilter.length > 0 ? users.length : data?.total || 0;
  const totalPages = roleFilter.length > 0 ? 1 : Math.ceil((data?.total || 0) / limit);

  // Handle search submission
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setPage(0);
  };

  const hasUnsearchedInput = searchInput !== searchQuery;

  // Entity management handlers
  const handleManageEntities = async (user: UserWithEntityAccess) => {
    setSelectedUser(user);
    await fetchEntities();
    setShowGrantModal(true);
  };

  const handleRevokeAccess = (userId: string, entityId: string, entityCode: string) => {
    setRevokeConfirm({ userId, entityId, entityCode });
  };

  const confirmRevokeAccess = async () => {
    if (!revokeConfirm) return;
    try {
      await apiClient.revokeEntityAccess(revokeConfirm.userId, revokeConfirm.entityId);
      await refetch();
      setToast({ visible: true, type: "success", message: "Entity access revoked successfully" });
    } catch (err) {
      setToast({
        visible: true,
        type: "error",
        message: err instanceof Error ? err.message : "Failed to revoke access",
      });
    } finally {
      setRevokeConfirm(null);
    }
  };

  const handleGrantModalClose = async (success: boolean) => {
    setShowGrantModal(false);
    setSelectedUser(null);
    if (success) {
      await refetch();
      setToast({ visible: true, type: "success", message: "Entity access granted successfully" });
    }
  };

  return (
    <>
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
          <MultiSelect
            label="Role"
            placeholder="All Roles"
            options={uniqueRoles.map((role) => ({ value: role, label: formatRoleLabel(role) }))}
            value={roleFilter}
            onChange={(values) => {
              setRoleFilter(values);
              setPage(0);
            }}
            size="sm"
          />

          {/* Status Filter */}
          <LabeledSelect
            label="Status"
            value={statusFilter === "" ? "" : statusFilter ? "true" : "false"}
            onChange={(e) => {
              const value = e.target.value;
              setStatusFilter(value === "" ? "" : value === "true");
              setPage(0);
            }}
            options={[
              { value: "", label: "All" },
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ]}
            fullWidth
          />
        </div>

        {/* Active Filters Indicator */}
        {(searchQuery || roleFilter.length > 0 || statusFilter !== "") && (
          <div className="mt-4 pt-4 border-t border-border-light">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                  Active Filters:
                </span>

                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    Search: {searchQuery}
                    <button
                      onClick={() => {
                        setSearchInput("");
                        setSearchQuery("");
                        setPage(0);
                      }}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                      aria-label="Remove search filter"
                    >
                      ×
                    </button>
                  </span>
                )}

                {roleFilter.map((role) => (
                  <span
                    key={`role-${role}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                  >
                    Role: {formatRoleLabel(role)}
                    <button
                      onClick={() => {
                        setRoleFilter(roleFilter.filter((r) => r !== role));
                        setPage(0);
                      }}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${formatRoleLabel(role)} filter`}
                    >
                      ×
                    </button>
                  </span>
                ))}

                {statusFilter !== "" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Status: {statusFilter ? "Active" : "Inactive"}
                    <button
                      onClick={() => {
                        setStatusFilter("");
                        setPage(0);
                      }}
                      className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                      aria-label="Remove status filter"
                    >
                      ×
                    </button>
                  </span>
                )}

                <button
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                    setRoleFilter([]);
                    setStatusFilter("");
                    setPage(0);
                  }}
                  className="text-xs text-status-error hover:text-status-error/80 font-medium ml-2"
                >
                  Clear all
                </button>
              </div>

              <p className="text-sm text-text-secondary">
                Found {total} user{total !== 1 ? "s" : ""}
              </p>
            </div>
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
            {(searchQuery || roleFilter.length > 0 || statusFilter !== "") && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                  setRoleFilter([]);
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
              <table className="w-full min-w-[900px]">
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
                      Entities
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
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {user.entity_access.filter((a) => a.is_active).length === 0 ? (
                            <span className="text-sm text-text-tertiary italic">No entities</span>
                          ) : (
                            user.entity_access
                              .filter((a) => a.is_active)
                              .map((access) => (
                                <div key={access.id} className="relative group">
                                  <Badge
                                    variant={access.is_parent ? "warning" : "default"}
                                    size="sm"
                                  >
                                    {access.entity_code}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRevokeAccess(
                                          user.id,
                                          access.entity_id,
                                          access.entity_code
                                        );
                                      }}
                                      className="ml-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:text-status-error"
                                      title={`Revoke ${access.entity_code} access`}
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                </div>
                              ))
                          )}
                        </div>
                        <div className="mt-1 text-xs text-text-tertiary">
                          {user.accessible_entity_count}{" "}
                          {user.accessible_entity_count === 1 ? "entity" : "entities"}
                          {user.default_entity_name && <> · Default: {user.default_entity_name}</>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/dashboard/users/${user.id}`}
                            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleManageEntities(user)}
                            className="text-sm font-medium text-secondary hover:text-secondary/80 transition-colors"
                          >
                            Manage Entities
                          </button>
                        </div>
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
                  Showing {page * limit + 1} to {Math.min((page + 1) * limit, data?.total || 0)} of{" "}
                  {data?.total || 0} users
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

      {/* Grant Entity Access Modal */}
      {showGrantModal && selectedUser && (
        <GrantEntityAccessModal
          user={selectedUser}
          entities={entities}
          onClose={handleGrantModalClose}
        />
      )}

      {/* Revoke Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!revokeConfirm}
        title="Revoke Entity Access"
        message={`Are you sure you want to revoke access to ${revokeConfirm?.entityCode || "this entity"}? This action cannot be undone.`}
        confirmLabel="Revoke Access"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={confirmRevokeAccess}
        onCancel={() => setRevokeConfirm(null)}
      />

      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />
    </>
  );
}

/* ───────────────────── Main Page Component ───────────────────── */

export default function UsersPage() {
  const isAdmin = useIsAdmin();
  const [activeTab, setActiveTab] = useState<UserTabId>("users");

  useSetPageHeader({
    title: "Users",
    pathLabels: { users: "Users" },
  });

  const visibleTabs = USER_TABS.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <div className={PAGE_SPACING}>
      {/* Tab Navigation — only render if more than one tab visible */}
      {visibleTabs.length > 1 && (
        <div className="bg-white rounded-lg shadow-medium overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex min-w-full" role="tablist">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${
                      activeTab === tab.id
                        ? "border-primary text-primary bg-primary/5"
                        : "border-transparent text-text-secondary hover:text-text-primary hover:bg-gray-50"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "users" && <UsersContent />}
      {activeTab === "job-roles" && isAdmin && <JobRolesTab />}
      {activeTab === "seniority-levels" && isAdmin && <SeniorityLevelsTab />}
    </div>
  );
}
