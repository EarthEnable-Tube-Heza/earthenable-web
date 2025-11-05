'use client';

/**
 * Users List Page (Admin only)
 *
 * Displays paginated list of users with search and filtering.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/src/lib/api';
import { UserRole, UserRoleLabels } from '@/src/types/user';
import { cn } from '@/src/lib/theme';

export default function UsersPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('');
  const limit = 20;

  // Fetch users with filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', page, search, roleFilter, statusFilter],
    queryFn: () =>
      apiClient.getUsers({
        skip: page * limit,
        limit,
        search: search || undefined,
        role: roleFilter || undefined,
        is_active: statusFilter === '' ? undefined : statusFilter,
      }),
  });

  const users = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-text-primary">
          User Management
        </h1>
        <p className="text-text-secondary mt-2">
          Manage users, roles, and permissions
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0); // Reset to first page on search
              }}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as UserRole | '');
                setPage(0);
              }}
              className="w-full px-4 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Roles</option>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.MANAGER}>Manager</option>
              <option value={UserRole.QA_AGENT}>QA Agent</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Status
            </label>
            <select
              value={statusFilter === '' ? '' : statusFilter ? 'true' : 'false'}
              onChange={(e) => {
                const value = e.target.value;
                setStatusFilter(value === '' ? '' : value === 'true');
                setPage(0);
              }}
              className="w-full px-4 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
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
            <p className="text-status-error">
              Error loading users. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-secondary">No users found.</p>
          </div>
        ) : (
          <>
            <table className="w-full">
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
                  <tr
                    key={user.id}
                    className="hover:bg-background-light transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold">
                          {user.name?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-text-primary">
                            {user.name || user.email}
                          </div>
                          <div className="text-sm text-text-secondary">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          user.role === UserRole.ADMIN
                            ? 'bg-status-error/10 text-status-error'
                            : user.role === UserRole.MANAGER
                            ? 'bg-primary/10 text-primary'
                            : 'bg-status-info/10 text-status-info'
                        )}
                      >
                        {UserRoleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          user.is_active
                            ? 'bg-status-success/10 text-status-success'
                            : 'bg-text-disabled/10 text-text-disabled'
                        )}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          // TODO: Open user detail modal
                          console.log('View user:', user.id);
                        }}
                        className="text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border-light flex items-center justify-between">
                <div className="text-sm text-text-secondary">
                  Showing {page * limit + 1} to{' '}
                  {Math.min((page + 1) * limit, total)} of {total} users
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium',
                      page === 0
                        ? 'bg-background-light text-text-disabled cursor-not-allowed'
                        : 'bg-white border border-border-light text-text-primary hover:bg-background-light'
                    )}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium',
                      page >= totalPages - 1
                        ? 'bg-background-light text-text-disabled cursor-not-allowed'
                        : 'bg-white border border-border-light text-text-primary hover:bg-background-light'
                    )}
                  >
                    Next
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
