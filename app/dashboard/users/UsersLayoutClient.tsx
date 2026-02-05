"use client";

/**
 * Users Section Layout (Client Component)
 *
 * Provides tab-based navigation for user management functionality:
 * - All Users: User list with search and filters
 * - Entity Access: Manage user entity access permissions
 * - Permissions: Manage granular permissions
 * - Role Mappings: Configure role-permission mappings
 */

import { SectionLayout, TabItem } from "@/src/components/ui";

const tabs: TabItem[] = [
  {
    label: "All Users",
    href: "/dashboard/users",
    exact: true,
  },
  {
    label: "Entity Access",
    href: "/dashboard/users/entity-access",
    exact: false,
  },
  {
    label: "Permissions",
    href: "/dashboard/users/permissions",
    exact: false,
  },
  {
    label: "Role Mappings",
    href: "/dashboard/users/role-permissions",
    exact: false,
  },
];

export default function UsersLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SectionLayout
      title="User Management"
      description="Manage users, roles, and permissions"
      tabs={tabs}
      tabsAriaLabel="User management tabs"
      pathLabels={{
        users: "Users",
        "entity-access": "Entity Access",
        permissions: "Permissions",
        "role-permissions": "Role Mappings",
      }}
    >
      {children}
    </SectionLayout>
  );
}
