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
  return <UserEntityAccessManager />;
}
