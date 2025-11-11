"use client";

/**
 * Expense Management Page
 *
 * Comprehensive expense management interface with:
 * - High-level stats overview
 * - Horizontal tabs for different functionality
 * - Payment request creation
 * - Expense list with search/filters
 * - Budget management
 * - Per diem rates management
 */

import { useState } from "react";
import { Card } from "@/src/components/ui";
import { ExpenseStats } from "@/src/components/expenses/ExpenseStats";
import { MyExpensesTab } from "@/src/components/expenses/tabs/MyExpensesTab";
import { NewRequestTab } from "@/src/components/expenses/tabs/NewRequestTab";
import { AllExpensesTab } from "@/src/components/expenses/tabs/AllExpensesTab";
import { BudgetsTab } from "@/src/components/expenses/tabs/BudgetsTab";
import { PerDiemRatesTab } from "@/src/components/expenses/tabs/PerDiemRatesTab";
import { EntitiesTab } from "@/src/components/expenses/tabs/EntitiesTab";
import { DepartmentsTab } from "@/src/components/expenses/tabs/DepartmentsTab";
import { BranchesTab } from "@/src/components/expenses/tabs/BranchesTab";
import { CategoriesTab } from "@/src/components/expenses/tabs/CategoriesTab";
import { JobRolesTab } from "@/src/components/expenses/tabs/JobRolesTab";
import { useIsAdmin } from "@/src/lib/auth";

type TabId =
  | "my-expenses"
  | "new-request"
  | "all-expenses"
  | "budgets"
  | "per-diem"
  | "entities"
  | "departments"
  | "branches"
  | "categories"
  | "job-roles";

interface Tab {
  id: TabId;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const tabs: Tab[] = [
  {
    id: "my-expenses",
    label: "My Expenses",
    icon: "📋",
  },
  {
    id: "new-request",
    label: "New Request",
    icon: "➕",
  },
  {
    id: "all-expenses",
    label: "All Expenses",
    icon: "📊",
    adminOnly: true,
  },
  {
    id: "budgets",
    label: "Budgets",
    icon: "💼",
    adminOnly: true,
  },
  {
    id: "entities",
    label: "Entities",
    icon: "🏢",
    adminOnly: true,
  },
  {
    id: "departments",
    label: "Departments",
    icon: "👥",
    adminOnly: true,
  },
  {
    id: "branches",
    label: "Branches",
    icon: "📍",
    adminOnly: true,
  },
  {
    id: "categories",
    label: "Categories",
    icon: "🏷️",
    adminOnly: true,
  },
  {
    id: "per-diem",
    label: "Per Diem Rates",
    icon: "🎯",
    adminOnly: true,
  },
  {
    id: "job-roles",
    label: "Job Roles",
    icon: "💼",
    adminOnly: true,
  },
];

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("my-expenses");
  const isAdmin = useIsAdmin();

  // Filter tabs based on user role
  const filteredTabs = tabs.filter((tab) => {
    if (tab.adminOnly) {
      return isAdmin;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary font-heading">Expense Management</h1>
        <p className="text-text-secondary mt-1">Manage expenses, budgets, and payment requests</p>
      </div>

      {/* Stats Overview */}
      <ExpenseStats />

      {/* Tab Navigation */}
      <Card padding="none">
        <div className="border-b border-border-light overflow-x-auto">
          <nav className="flex min-w-full" role="tablist">
            {filteredTabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-text-secondary hover:text-text-primary hover:bg-background-light"
                  }
                `}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "my-expenses" && <MyExpensesTab />}
          {activeTab === "new-request" && <NewRequestTab />}
          {activeTab === "all-expenses" && <AllExpensesTab />}
          {activeTab === "budgets" && <BudgetsTab />}
          {activeTab === "entities" && <EntitiesTab />}
          {activeTab === "departments" && <DepartmentsTab />}
          {activeTab === "branches" && <BranchesTab />}
          {activeTab === "categories" && <CategoriesTab />}
          {activeTab === "per-diem" && <PerDiemRatesTab />}
          {activeTab === "job-roles" && <JobRolesTab />}
        </div>
      </Card>
    </div>
  );
}
