"use client";

/**
 * Expenses Management Page (Admin Only)
 *
 * Comprehensive expense management with tabs for:
 * - My Expenses
 * - All Expenses (Admin)
 * - New Request
 * - Budgets
 * - Entities (Admin)
 * - Departments (Admin)
 * - Categories (Admin)
 * - Per Diem Rates (Admin)
 */

import { useState } from "react";
import { Card } from "@/src/components/ui";
import { MyExpensesTab } from "@/src/components/expenses/tabs/MyExpensesTab";
import { AllExpensesTab } from "@/src/components/expenses/tabs/AllExpensesTab";
import { NewRequestTab } from "@/src/components/expenses/tabs/NewRequestTab";
import { BudgetsTab } from "@/src/components/expenses/tabs/BudgetsTab";
import { EntitiesTab } from "@/src/components/expenses/tabs/EntitiesTab";
import { DepartmentsTab } from "@/src/components/expenses/tabs/DepartmentsTab";
import { CategoriesTab } from "@/src/components/expenses/tabs/CategoriesTab";
import { PerDiemRatesTab } from "@/src/components/expenses/tabs/PerDiemRatesTab";

type Tab =
  | "my-expenses"
  | "all-expenses"
  | "new-request"
  | "budgets"
  | "entities"
  | "departments"
  | "categories"
  | "per-diem-rates";

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("my-expenses");

  const tabs = [
    { id: "my-expenses" as Tab, label: "My Expenses", adminOnly: false },
    { id: "all-expenses" as Tab, label: "All Expenses", adminOnly: true },
    { id: "new-request" as Tab, label: "New Request", adminOnly: false },
    { id: "budgets" as Tab, label: "Budgets", adminOnly: true },
    { id: "entities" as Tab, label: "Entities", adminOnly: true },
    { id: "departments" as Tab, label: "Departments", adminOnly: true },
    { id: "categories" as Tab, label: "Categories", adminOnly: true },
    { id: "per-diem-rates" as Tab, label: "Per Diem Rates", adminOnly: true },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "my-expenses":
        return <MyExpensesTab />;
      case "all-expenses":
        return <AllExpensesTab />;
      case "new-request":
        return <NewRequestTab />;
      case "budgets":
        return <BudgetsTab />;
      case "entities":
        return <EntitiesTab />;
      case "departments":
        return <DepartmentsTab />;
      case "categories":
        return <CategoriesTab />;
      case "per-diem-rates":
        return <PerDiemRatesTab />;
      default:
        return <MyExpensesTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Expense Management</h1>
          <p className="text-text-secondary">
            Manage expenses, budgets, and administrative settings
          </p>
        </div>

        {/* Tabs Navigation */}
        <Card variant="bordered" padding="none" className="mb-6">
          <div className="flex flex-wrap border-b border-border-light">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-6 py-4 font-medium text-sm transition-colors relative
                  ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary bg-background-light"
                      : "text-text-secondary hover:text-text-primary hover:bg-background-light"
                  }
                `}
              >
                {tab.label}
                {tab.adminOnly && (
                  <span className="ml-2 text-xs bg-error text-white px-2 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Tab Content */}
        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
}
