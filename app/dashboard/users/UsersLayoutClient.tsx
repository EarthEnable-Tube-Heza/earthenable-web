"use client";

/**
 * Users Section Layout (Client Component)
 *
 * Provides layout wrapper for user management functionality.
 */

import { SectionLayout } from "@/src/components/ui";

export default function UsersLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SectionLayout
      title="User Management"
      description="Manage users and entity access"
      pathLabels={{
        users: "Users",
      }}
    >
      {children}
    </SectionLayout>
  );
}
