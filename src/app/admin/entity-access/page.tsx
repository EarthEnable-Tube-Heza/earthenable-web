"use client";

/**
 * User Entity Access Management Page
 *
 * Admin-only page for managing which entities users can access.
 * Allows admins to:
 * - View all users and their entity access
 * - Grant entity access to users (single or bulk)
 * - Revoke entity access from users
 * - Search and filter users
 */

import { UserEntityAccessManager } from "@/src/components/admin/UserEntityAccessManager";

export default function EntityAccessPage() {
  return (
    <div className="min-h-screen bg-background-primary p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading text-text-primary mb-4">User Entity Access</h1>
          <p className="text-lg text-text-secondary">
            Manage which entities users have access to. Users can only work with data from entities
            they have been granted access to.
          </p>
        </div>

        {/* Main Content */}
        <UserEntityAccessManager />
      </div>
    </div>
  );
}
