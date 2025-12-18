"use client";

/**
 * User Detail Page
 *
 * Dedicated page for viewing and editing user details (admin only).
 * Accessible at /dashboard/users/[id]
 */

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { formatRoleLabel } from "@/src/types/user";
import { EntityListResponse } from "@/src/types";
import { Button, Card, Badge, PersonCard } from "@/src/components/ui";
import { UserDetailModal } from "@/src/components/UserDetailModal";
import { CreateEmployeeModal } from "@/src/components/admin/CreateEmployeeModal";
import { EditEmployeeModal } from "@/src/components/admin/EditEmployeeModal";
import { NewAssignmentModal } from "@/src/components/admin/NewAssignmentModal";
import { EndEmploymentModal } from "@/src/components/admin/EndEmploymentModal";
import { EmploymentHistoryCard } from "@/src/components/admin/EmploymentHistoryCard";
import { UserActivityTab } from "@/src/components/users/UserActivityTab";

/**
 * User Detail Page Component
 */
export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = params?.id as string;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Employee management modal states
  const [isCreateEmployeeOpen, setIsCreateEmployeeOpen] = useState(false);
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false);
  const [isNewAssignmentOpen, setIsNewAssignmentOpen] = useState(false);
  const [isEndEmploymentOpen, setIsEndEmploymentOpen] = useState(false);
  const [entities, setEntities] = useState<EntityListResponse[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(false);

  // Fetch entities when any employee modal opens
  useEffect(() => {
    const shouldFetch = isCreateEmployeeOpen || isEditEmployeeOpen || isNewAssignmentOpen;
    if (shouldFetch && entities.length === 0 && !loadingEntities) {
      setLoadingEntities(true);
      apiClient
        .getEntitiesForAdmin(false)
        .then(setEntities)
        .catch(console.error)
        .finally(() => setLoadingEntities(false));
    }
  }, [
    isCreateEmployeeOpen,
    isEditEmployeeOpen,
    isNewAssignmentOpen,
    entities.length,
    loadingEntities,
  ]);

  // Handle employee modal close
  const handleEmployeeModalClose = (success: boolean) => {
    setIsCreateEmployeeOpen(false);
    setIsEditEmployeeOpen(false);
    setIsNewAssignmentOpen(false);
    setIsEndEmploymentOpen(false);
    if (success) {
      // Refetch user data
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    }
  };

  // Fetch user details
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => apiClient.getUserById(userId),
    enabled: !!userId,
  });

  /**
   * Format date for display
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Get role badge variant
   */
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "error" as const;
      case "manager":
        return "warning" as const;
      case "qa_agent":
        return "info" as const;
      default:
        return "default" as const;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6">
          <div className="h-4 w-64 bg-secondary/10 rounded animate-pulse" />
        </div>

        {/* Page Title Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-48 bg-secondary/10 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-secondary/10 rounded animate-pulse" />
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card Skeleton */}
          <div className="lg:col-span-1">
            <Card padding="lg">
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 bg-secondary/10 rounded-full animate-pulse mb-4" />
                <div className="h-6 w-40 bg-secondary/10 rounded animate-pulse mb-2" />
                <div className="h-4 w-32 bg-secondary/10 rounded animate-pulse" />
              </div>
            </Card>
          </div>

          {/* Details Card Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <Card padding="lg">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="h-4 w-24 bg-secondary/10 rounded animate-pulse" />
                    <div className="h-4 w-48 bg-secondary/10 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error or 404 state
  if (error || !user) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-text-secondary" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/dashboard" className="hover:text-primary transition-colors">
                Dashboard
              </Link>
            </li>
            <li className="text-text-tertiary">/</li>
            <li>
              <Link href="/dashboard/users" className="hover:text-primary transition-colors">
                Users
              </Link>
            </li>
            <li className="text-text-tertiary">/</li>
            <li className="text-text-primary font-medium">Not Found</li>
          </ol>
        </nav>

        {/* 404 Error Card */}
        <Card variant="elevated" padding="lg" className="text-center">
          <div className="max-w-md mx-auto">
            <svg
              className="w-24 h-24 mx-auto mb-6 text-text-tertiary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
              User Not Found
            </h1>
            <p className="text-text-secondary mb-6">
              The user you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button variant="primary" onClick={() => router.push("/dashboard/users")}>
              Back to Users List
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Main content
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 text-sm text-text-secondary" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/dashboard" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
          </li>
          <li className="text-text-tertiary">/</li>
          <li>
            <Link href="/dashboard/users" className="hover:text-primary transition-colors">
              Users
            </Link>
          </li>
          <li className="text-text-tertiary">/</li>
          <li className="text-text-primary font-medium">{user.name || user.email}</li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">User Details</h1>
        <p className="text-text-secondary">View and manage user account information</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <Card padding="lg" className="sticky top-6">
            <div className="flex flex-col items-center text-center">
              {/* Profile Picture */}
              {user.picture ? (
                <Image
                  src={user.picture}
                  alt={user.name || user.email}
                  width={128}
                  height={128}
                  className="rounded-full mb-4 border-4 border-background-primary shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-4 border-background-primary shadow-lg">
                  <span className="text-4xl font-bold text-primary">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Name */}
              <h2 className="text-xl font-heading font-bold text-text-primary mb-1">
                {user.name || "No name set"}
              </h2>

              {/* Email */}
              <p className="text-sm text-text-secondary mb-4 break-all">{user.email}</p>

              {/* Role Badge */}
              <Badge variant={getRoleBadgeVariant(user.role)} size="lg" className="mb-4">
                {formatRoleLabel(user.role)}
              </Badge>

              {/* Status Badge */}
              <Badge variant={user.is_active ? "success" : "default"} outline={!user.is_active} dot>
                {user.is_active ? "Active" : "Inactive"}
              </Badge>

              {/* Action Buttons */}
              <div className="w-full space-y-3 mt-6 pt-6 border-t border-secondary/10">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Role & Status
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => router.push("/dashboard/users")}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Users
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information Card */}
          <Card padding="lg" header="Account Information" divided>
            <dl className="space-y-4">
              {/* Google ID */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <dt className="text-sm font-medium text-text-secondary w-full sm:w-32 flex-shrink-0">
                  Google ID
                </dt>
                <dd className="text-sm text-text-primary font-mono bg-background-secondary px-3 py-1.5 rounded break-all">
                  {user.google_id || "N/A"}
                </dd>
              </div>

              {/* User ID */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <dt className="text-sm font-medium text-text-secondary w-full sm:w-32 flex-shrink-0">
                  User ID
                </dt>
                <dd className="text-sm text-text-primary font-mono bg-background-secondary px-3 py-1.5 rounded break-all">
                  {user.id}
                </dd>
              </div>

              {/* Created Date */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <dt className="text-sm font-medium text-text-secondary w-full sm:w-32 flex-shrink-0">
                  Created
                </dt>
                <dd className="text-sm text-text-primary">{formatDate(user.created_at)}</dd>
              </div>

              {/* Last Login */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <dt className="text-sm font-medium text-text-secondary w-full sm:w-32 flex-shrink-0">
                  Last Login
                </dt>
                <dd className="text-sm text-text-primary">{formatDate(user.last_login)}</dd>
              </div>

              {/* Verification Status */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <dt className="text-sm font-medium text-text-secondary w-full sm:w-32 flex-shrink-0">
                  Verified
                </dt>
                <dd>
                  <Badge variant={user.is_verified ? "success" : "warning"} size="sm">
                    {user.is_verified ? "Verified" : "Unverified"}
                  </Badge>
                </dd>
              </div>
            </dl>
          </Card>

          {/* Activity Summary Card */}
          <Card padding="lg" header="Activity Summary" divided>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Tasks Count */}
              <div className="bg-background-secondary rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">{user.tasks_count || 0}</div>
                <div className="text-xs text-text-secondary font-medium uppercase tracking-wide">
                  Tasks
                </div>
              </div>

              {/* Cases Count */}
              <div className="bg-background-secondary rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-secondary mb-1">
                  {user.cases_count || 0}
                </div>
                <div className="text-xs text-text-secondary font-medium uppercase tracking-wide">
                  Cases
                </div>
              </div>

              {/* Surveys Count */}
              <div className="bg-background-secondary rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-accent mb-1">{user.surveys_count || 0}</div>
                <div className="text-xs text-text-secondary font-medium uppercase tracking-wide">
                  Surveys
                </div>
              </div>
            </div>

            {/* Activity Description */}
            <div className="mt-6 p-4 bg-primary/5 border-l-4 border-primary rounded">
              <p className="text-sm text-text-secondary">
                Activity metrics show the total number of tasks, cases, and surveys associated with
                this user account. These counts update automatically as the user interacts with the
                system.
              </p>
            </div>
          </Card>

          {/* App Activity Card - Shows recent user activity from mobile app */}
          <UserActivityTab userId={userId} />

          {/* Employee Details - Only shown if employee record exists */}
          {user.employee && (
            <>
              {/* Organization Card */}
              <Card padding="lg" divided>
                {/* Card Header with Actions */}
                <div className="flex items-center justify-between mb-4 -mt-2">
                  <h3 className="text-lg font-heading font-semibold text-text-primary">
                    Organization
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditEmployeeOpen(true)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsNewAssignmentOpen(true)}>
                      New Assignment
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEndEmploymentOpen(true)}
                      className="text-status-error hover:text-status-error"
                    >
                      End Employment
                    </Button>
                  </div>
                </div>
                <dl className="space-y-4">
                  {/* Entity */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                    <dt className="text-sm font-medium text-text-secondary w-full sm:w-32 flex-shrink-0">
                      Entity
                    </dt>
                    <dd className="text-sm text-text-primary">
                      {user.employee.entity_name
                        ? `${user.employee.entity_name}${user.employee.entity_code ? ` (${user.employee.entity_code})` : ""}`
                        : "N/A"}
                    </dd>
                  </div>

                  {/* Department */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                    <dt className="text-sm font-medium text-text-secondary w-full sm:w-32 flex-shrink-0">
                      Department
                    </dt>
                    <dd className="text-sm text-text-primary">
                      {user.employee.department_name || "N/A"}
                    </dd>
                  </div>

                  {/* Sub-Department (only if exists) */}
                  {user.employee.sub_department_name && (
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                      <dt className="text-sm font-medium text-text-secondary w-full sm:w-32 flex-shrink-0">
                        Sub-Dept
                      </dt>
                      <dd className="text-sm text-text-primary">
                        {user.employee.sub_department_name}
                      </dd>
                    </div>
                  )}

                  {/* Branch */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                    <dt className="text-sm font-medium text-text-secondary w-full sm:w-32 flex-shrink-0">
                      Branch
                    </dt>
                    <dd className="text-sm text-text-primary">
                      {user.employee.branch_name
                        ? `${user.employee.branch_name}${user.employee.branch_location ? ` - ${user.employee.branch_location}` : ""}`
                        : "N/A"}
                    </dd>
                  </div>
                </dl>
              </Card>

              {/* Position Details Card */}
              <Card padding="lg" header="Position Details" divided>
                <dl className="space-y-4">
                  {/* Job Title/Role */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                    <dt className="text-sm font-medium text-text-secondary w-full sm:w-32 flex-shrink-0">
                      Job Title
                    </dt>
                    <dd className="text-sm text-text-primary">
                      {user.employee.job_title || user.employee.job_role_name || "N/A"}
                    </dd>
                  </div>

                  {/* Role */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                    <dt className="text-sm font-medium text-text-secondary w-full sm:w-32 flex-shrink-0">
                      Role
                    </dt>
                    <dd className="text-sm text-text-primary">
                      {user.employee.role ? formatRoleLabel(user.employee.role) : "N/A"}
                    </dd>
                  </div>

                  {/* Level */}
                  {user.employee.level && (
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                      <dt className="text-sm font-medium text-text-secondary w-full sm:w-32 flex-shrink-0">
                        Level
                      </dt>
                      <dd className="text-sm text-text-primary capitalize">
                        {user.employee.level.replace(/_/g, " ")}
                      </dd>
                    </div>
                  )}

                  {/* Employee Number */}
                  {user.employee.employee_number && (
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                      <dt className="text-sm font-medium text-text-secondary w-full sm:w-32 flex-shrink-0">
                        Employee #
                      </dt>
                      <dd className="text-sm text-text-primary font-mono bg-background-secondary px-3 py-1.5 rounded">
                        {user.employee.employee_number}
                      </dd>
                    </div>
                  )}

                  {/* Start Date */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                    <dt className="text-sm font-medium text-text-secondary w-full sm:w-32 flex-shrink-0">
                      Start Date
                    </dt>
                    <dd className="text-sm text-text-primary">
                      {user.employee.start_date
                        ? new Date(user.employee.start_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </dd>
                  </div>

                  {/* End Date (only if exists) */}
                  {user.employee.end_date && (
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                      <dt className="text-sm font-medium text-text-secondary w-full sm:w-32 flex-shrink-0">
                        End Date
                      </dt>
                      <dd className="text-sm text-text-primary">
                        {new Date(user.employee.end_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </dd>
                    </div>
                  )}
                </dl>
              </Card>

              {/* Reporting Structure Card - Show if supervisor, approver, or direct reports exist */}
              {(user.employee.supervisor_id ||
                user.employee.approver_id ||
                (user.employee.direct_reports && user.employee.direct_reports.length > 0)) && (
                <Card padding="lg" header="Reporting Structure" divided>
                  {/* Reports To Section */}
                  <div className="mb-6">
                    <div className="text-xs text-text-tertiary uppercase tracking-wide mb-3">
                      Reports To
                    </div>
                    {user.employee.supervisor_id ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Supervisor */}
                        <PersonCard
                          id={user.employee.supervisor_id}
                          name={user.employee.supervisor_name}
                          email={user.employee.supervisor_email}
                          subtitle={`${formatRoleLabel(user.employee.supervisor_role)}${user.employee.supervisor_department_name ? ` · ${user.employee.supervisor_department_name}` : ""}`}
                          variant="info"
                        />

                        {/* Approver (only if different from supervisor) */}
                        {user.employee.approver_id &&
                          user.employee.approver_id !== user.employee.supervisor_id && (
                            <PersonCard
                              id={user.employee.approver_id}
                              name={user.employee.approver_name}
                              email={user.employee.approver_email}
                              subtitle={`Approver${user.employee.approver_email ? ` · ${user.employee.approver_email}` : ""}`}
                              variant="accent"
                            />
                          )}
                      </div>
                    ) : (
                      <p className="text-sm text-text-tertiary italic">
                        No supervisor assigned to this user.
                      </p>
                    )}
                  </div>

                  {/* Direct Reports Section */}
                  <div>
                    <div className="text-xs text-text-tertiary uppercase tracking-wide mb-3">
                      Direct Reports ({user.employee.direct_reports?.length || 0})
                    </div>
                    {user.employee.direct_reports && user.employee.direct_reports.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {user.employee.direct_reports.map((report) => (
                          <PersonCard
                            key={report.id}
                            id={report.id}
                            name={report.name}
                            email={report.email}
                            subtitle={`${formatRoleLabel(report.role)}${report.department_name ? ` · ${report.department_name}` : ""}`}
                            variant="success"
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-tertiary italic">
                        No direct reports assigned to this user.
                      </p>
                    )}
                  </div>
                </Card>
              )}

              {/* Notes Card - Only if notes exist */}
              {user.employee.notes && (
                <Card padding="lg" header="Notes" divided>
                  <p className="text-sm text-text-primary whitespace-pre-wrap">
                    {user.employee.notes}
                  </p>
                </Card>
              )}

              {/* Employment History */}
              <EmploymentHistoryCard userId={userId} />
            </>
          )}

          {/* No Employee Record Notice */}
          {!user.employee && (
            <Card padding="lg" className="text-center">
              <svg
                className="w-12 h-12 mx-auto text-text-tertiary mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              <p className="text-text-secondary mb-1">No employee record found for this user.</p>
              <p className="text-xs text-text-tertiary mb-4">
                Create an employee record to assign this user to an entity with organizational
                details.
              </p>
              <Button variant="primary" onClick={() => setIsCreateEmployeeOpen(true)}>
                Create Employee Record
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <UserDetailModal
        userId={userId}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Employee Management Modals */}
      {isCreateEmployeeOpen && (
        <CreateEmployeeModal
          userId={userId}
          userName={user.name || user.email}
          entities={entities}
          onClose={handleEmployeeModalClose}
        />
      )}

      {isEditEmployeeOpen && user.employee && (
        <EditEmployeeModal
          userId={userId}
          userName={user.name || user.email}
          employee={user.employee}
          entities={entities}
          onClose={handleEmployeeModalClose}
        />
      )}

      {isNewAssignmentOpen && user.employee && (
        <NewAssignmentModal
          userId={userId}
          userName={user.name || user.email}
          currentEmployee={user.employee}
          entities={entities}
          onClose={handleEmployeeModalClose}
        />
      )}

      {isEndEmploymentOpen && user.employee && (
        <EndEmploymentModal
          userId={userId}
          userName={user.name || user.email}
          employee={user.employee}
          onClose={handleEmployeeModalClose}
        />
      )}
    </div>
  );
}
