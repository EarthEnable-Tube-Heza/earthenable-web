"use client";

/**
 * Expense Management Page — Refactored
 *
 * Layout:
 *   1. Page title + "New Request" button (opens create drawer)
 *   2. Stats cards (click to filter)
 *   3. Expense list section (toggle: My Expenses / All Expenses for admin)
 *      - Pending approvals summary (admin)
 *      - Search + filters
 *      - ExpenseListPanel table
 *   4. Admin config section (admin only)
 *      - Tabs: Budgets, Entities, Departments, Branches, etc.
 *   5. ExpenseDrawer — rendered at page level, driven by useDrawerState
 */

import { Suspense, useState, useMemo, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  LabeledSelect,
  Input,
  Spinner,
  ConfirmDialog,
  Toast,
} from "@/src/components/ui";
import { useSetPageHeader } from "@/src/contexts/PageHeaderContext";
import { PageTitle } from "@/src/components/dashboard/PageTitle";
import { PAGE_SPACING } from "@/src/lib/theme";
import { ExpenseStats, ExpenseStatusFilter } from "@/src/components/expenses/ExpenseStats";
import { ExpenseListPanel } from "@/src/components/expenses/ExpenseListPanel";
import { ExpenseDrawer } from "@/src/components/expenses/ExpenseDrawer";
import { useDrawerState } from "@/src/hooks/useDrawerState";
import { useIsAdmin, useAuth } from "@/src/lib/auth";
import {
  useExpenses,
  useDepartments,
  useExpenseCategories,
  usePendingApprovals,
  useApprovalHistory,
  useApproveExpense,
  useRejectExpense,
} from "@/src/hooks/useExpenses";
// Types used internally by hooks — no direct imports needed
import { Search, RefreshCw, Bell, CheckCircle, XCircle, Plus } from "@/src/lib/icons";

import { PendingApprovalsTab } from "@/src/components/expenses/tabs/PendingApprovalsTab";
import { ApprovalHistoryTab } from "@/src/components/expenses/tabs/ApprovalHistoryTab";

// Admin config tab imports (unchanged)
import { BudgetsTab } from "@/src/components/expenses/tabs/BudgetsTab";
import { PerDiemRatesTab } from "@/src/components/expenses/tabs/PerDiemRatesTab";
import { EntitiesTab } from "@/src/components/expenses/tabs/EntitiesTab";
import { DepartmentsTab } from "@/src/components/expenses/tabs/DepartmentsTab";
import { BranchesTab } from "@/src/components/expenses/tabs/BranchesTab";
import { CategoriesTab } from "@/src/components/expenses/tabs/CategoriesTab";
import { ExpenseTypesTab } from "@/src/components/expenses/tabs/ExpenseTypesTab";
import { JobRolesTab } from "@/src/components/expenses/tabs/JobRolesTab";
import { WorkflowsTab } from "@/src/components/expenses/tabs/WorkflowsTab";
import { QuickBooksTab } from "@/src/components/expenses/tabs/QuickBooksTab";
import { PaymentAccountsTab } from "@/src/components/expenses/tabs/PaymentAccountsTab";

type ListMode = "my" | "approvals" | "history" | "all";
type AdminTabId =
  | "budgets"
  | "entities"
  | "departments"
  | "branches"
  | "categories"
  | "expense-types"
  | "payment-accounts"
  | "per-diem"
  | "job-roles"
  | "workflows"
  | "quickbooks";

const ADMIN_TABS: { id: AdminTabId; label: string }[] = [
  { id: "budgets", label: "Budgets" },
  { id: "entities", label: "Entities" },
  { id: "departments", label: "Departments" },
  { id: "branches", label: "Branches" },
  { id: "categories", label: "Categories" },
  { id: "expense-types", label: "Expense Types" },
  { id: "payment-accounts", label: "Payment Accounts" },
  { id: "per-diem", label: "Per Diem Rates" },
  { id: "job-roles", label: "Job Roles" },
  { id: "workflows", label: "Workflows" },
  { id: "quickbooks", label: "QuickBooks" },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function ExpensesPageContent() {
  const isAdmin = useIsAdmin();
  const { user, selectedEntityId } = useAuth();
  const entityId = selectedEntityId || user?.entity_id || "";

  // Drawer state (URL-synced)
  const drawerState = useDrawerState();

  // Page-level toast — survives drawer unmount
  const [toast, setToast] = useState<{
    visible: boolean;
    type: "success" | "error";
    message: string;
  }>({ visible: false, type: "success", message: "" });

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ visible: true, type, message });
  }, []);

  // List mode toggle
  const [listMode, setListMode] = useState<ListMode>("my");

  // Status filter (from stat card clicks)
  const [statusFilter, setStatusFilter] = useState<ExpenseStatusFilter>("all");

  // Search + advanced filters (for admin "all" mode)
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    expenseType: "all",
    departmentId: "",
    categoryId: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Admin config tab
  const [adminTab, setAdminTab] = useState<AdminTabId>("budgets");

  // Bulk approve/reject
  const [bulkAction, setBulkAction] = useState<{
    type: "approve" | "reject" | null;
    isOpen: boolean;
  }>({
    type: null,
    isOpen: false,
  });
  const [bulkRejectReason, setBulkRejectReason] = useState("");

  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();

  // Data fetching
  const isAllMode = listMode === "all" && isAdmin;
  const {
    data: expensesData,
    isLoading: expensesLoading,
    refetch,
  } = useExpenses({
    statusFilter: statusFilter === "all" ? undefined : statusFilter,
    departmentId: filters.departmentId || undefined,
    allSubmitters: isAllMode,
  });

  // Don't filter pending approvals by entity — approvals are assigned to a user
  // and should be visible regardless of which entity is selected in the header
  const { data: pendingData, isLoading: pendingLoading } = usePendingApprovals();
  const { data: historyData } = useApprovalHistory();
  const { data: departmentsData } = useDepartments(entityId);
  const { data: categoriesData } = useExpenseCategories(entityId);

  const expenses = useMemo(() => expensesData?.expenses || [], [expensesData?.expenses]);
  const pendingApprovals = pendingData?.approvals || [];
  const approvalHistory = historyData?.approvals || [];
  const departments = departmentsData?.departments || [];
  const categories = categoriesData?.categories || [];

  // Client-side filtering
  const filteredExpenses = useMemo(() => {
    let result = expenses;

    if (filters.expenseType !== "all") {
      result = result.filter(
        (e) => (e.expense_type_code || e.expenseTypeCode) === filters.expenseType
      );
    }
    if (filters.categoryId) {
      result = result.filter((e) => e.category_id === filters.categoryId);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.description?.toLowerCase().includes(query) ||
          (e.submitter_name || e.submitterName || "").toLowerCase().includes(query) ||
          (e.department_name || e.departmentName || "").toLowerCase().includes(query) ||
          (e.category_name || e.categoryName || "").toLowerCase().includes(query)
      );
    }

    return result;
  }, [expenses, filters, searchQuery]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [statusFilter, searchQuery, filters, listMode]);

  // Stat card click
  const handleStatusClick = (status: ExpenseStatusFilter) => {
    setStatusFilter(status);
    if (isAdmin) {
      setListMode("all");
    }
  };

  // Row click → open view drawer
  const handleRowClick = (expenseId: string) => {
    drawerState.openDrawer("view", expenseId);
  };

  // Reset filters
  const handleReset = () => {
    setStatusFilter("all");
    setSearchQuery("");
    setFilters({ expenseType: "all", departmentId: "", categoryId: "" });
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  // Bulk action helpers
  const selectedApprovable = useMemo(() => {
    return filteredExpenses.filter((e) => selectedIds.has(e.id) && e.status === "submitted");
  }, [filteredExpenses, selectedIds]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const selectedDrafts = useMemo(() => {
    return filteredExpenses.filter((e) => selectedIds.has(e.id) && e.status === "draft");
  }, [filteredExpenses, selectedIds]);

  const executeBulkApprove = async () => {
    setBulkAction({ type: null, isOpen: false });
    for (const expense of selectedApprovable) {
      try {
        await approveMutation.mutateAsync({ expenseId: expense.id, comments: "" });
      } catch {
        /* continue */
      }
    }
    setSelectedIds(new Set());
    refetch();
  };

  const executeBulkReject = async () => {
    if (!bulkRejectReason.trim()) return;
    setBulkAction({ type: null, isOpen: false });
    for (const expense of selectedApprovable) {
      try {
        await rejectMutation.mutateAsync({ expenseId: expense.id, reason: bulkRejectReason });
      } catch {
        /* continue */
      }
    }
    setSelectedIds(new Set());
    setBulkRejectReason("");
    refetch();
  };

  useSetPageHeader({
    title: "Expense Management",
    pathLabels: { expenses: "Expenses" },
  });

  return (
    <div className={PAGE_SPACING}>
      {/* Page Title + CTA */}
      <PageTitle
        title="Expense Management"
        description="Manage expenses, budgets, and payment requests"
        actions={
          <Button variant="primary" size="sm" onClick={() => drawerState.openDrawer("create")}>
            <Plus className="w-4 h-4 mr-1" />
            New Request
          </Button>
        }
      />

      {/* Stats Overview */}
      <ExpenseStats onStatusClick={handleStatusClick} />

      {/* Expense List Section */}
      <Card padding="none">
        {/* List mode toggle + filters */}
        <div className="p-6 space-y-4">
          {/* Toggle: My Expenses / All Expenses */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setListMode("my")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  listMode === "my"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                }`}
              >
                My Expenses
              </button>
              {pendingApprovals.length > 0 && (
                <button
                  onClick={() => setListMode("approvals")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                    listMode === "approvals"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                  }`}
                >
                  Pending Approvals
                  <span
                    className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full ${
                      listMode === "approvals" ? "bg-white text-primary" : "bg-primary text-white"
                    }`}
                  >
                    {pendingApprovals.length}
                  </span>
                </button>
              )}
              {approvalHistory.length > 0 && (
                <button
                  onClick={() => setListMode("history")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    listMode === "history"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                  }`}
                >
                  Approval History
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => setListMode("all")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    listMode === "all"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                  }`}
                >
                  All Expenses
                </button>
              )}
            </div>
            {(listMode === "my" || listMode === "all") && (
              <div className="flex gap-2">
                <LabeledSelect
                  value={pageSize.toString()}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  options={PAGE_SIZE_OPTIONS.map((s) => ({
                    value: s.toString(),
                    label: `${s} per page`,
                  }))}
                />
              </div>
            )}
          </div>

          {/* Pending approvals banner (when on my/all tabs) */}
          {(listMode === "my" || listMode === "all") && pendingApprovals.length > 0 && (
            <button
              onClick={() => setListMode("approvals")}
              className="w-full bg-primary/5 border border-primary/30 rounded-lg px-4 py-3 flex items-center justify-between hover:bg-primary/10 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-text-primary">
                  You have {pendingApprovals.length} expense
                  {pendingApprovals.length !== 1 ? "s" : ""} pending your approval
                </span>
              </div>
              <span className="text-sm text-primary font-medium">Review &rarr;</span>
            </button>
          )}

          {/* Pending Approvals Tab Content */}
          {listMode === "approvals" && (
            <PendingApprovalsTab
              onRowClick={handleRowClick}
              activeExpenseId={drawerState.expenseId}
            />
          )}

          {/* Approval History Tab Content */}
          {listMode === "history" && (
            <ApprovalHistoryTab
              onRowClick={handleRowClick}
              activeExpenseId={drawerState.expenseId}
            />
          )}

          {/* Search and filters (My / All modes) */}
          {(listMode === "my" || listMode === "all") && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                  <Input
                    placeholder="Search expenses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <LabeledSelect
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ExpenseStatusFilter)}
                  options={[
                    { value: "all", label: "All Statuses" },
                    { value: "draft", label: "Draft" },
                    { value: "submitted", label: "Pending Approval" },
                    { value: "approved", label: "Approved" },
                    { value: "rejected", label: "Rejected" },
                    { value: "paid", label: "Paid" },
                  ]}
                />
                {isAllMode && (
                  <LabeledSelect
                    value={filters.departmentId}
                    onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
                    options={[
                      { value: "", label: "All Departments" },
                      ...departments.map((d) => ({ value: d.id, label: d.name })),
                    ]}
                  />
                )}
              </div>

              {/* Additional admin filters row */}
              {isAllMode && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <LabeledSelect
                    value={filters.expenseType}
                    onChange={(e) => setFilters({ ...filters, expenseType: e.target.value })}
                    options={[
                      { value: "all", label: "All Types" },
                      { value: "expense", label: "Regular Expense" },
                      { value: "per_diem", label: "Per Diem" },
                      { value: "advance", label: "Advance Payment" },
                    ]}
                  />
                  <LabeledSelect
                    value={filters.categoryId}
                    onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                    options={[
                      { value: "", label: "All Categories" },
                      ...categories.map((c) => ({ value: c.id, label: c.name })),
                    ]}
                  />
                  <div className="flex items-end">
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>
              )}

              {/* Bulk actions bar */}
              {selectedIds.size > 0 && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">
                    {selectedIds.size} expense(s) selected
                  </span>
                  <div className="flex gap-2">
                    {isAdmin && selectedApprovable.length > 0 && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setBulkAction({ type: "approve", isOpen: true })}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve ({selectedApprovable.length})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBulkAction({ type: "reject", isOpen: true })}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject ({selectedApprovable.length})
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Table (My / All modes) */}
        {listMode !== "approvals" && (
          <div className="px-6 pb-6">
            <ExpenseListPanel
              expenses={filteredExpenses}
              isLoading={expensesLoading || (isAdmin && pendingLoading)}
              isAdmin={isAllMode}
              onRowClick={handleRowClick}
              activeExpenseId={drawerState.expenseId}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              currentPage={currentPage}
              pageSize={pageSize}
              totalCount={filteredExpenses.length}
              onPageChange={setCurrentPage}
              onApproveClick={isAllMode ? (e) => drawerState.openDrawer("view", e.id) : undefined}
              onRejectClick={isAllMode ? (e) => drawerState.openDrawer("view", e.id) : undefined}
              emptyIcon={isAllMode ? "file" : "wallet"}
              emptyTitle={
                searchQuery || statusFilter !== "all"
                  ? "No matching expenses"
                  : isAllMode
                    ? "No expenses found"
                    : "No expenses yet"
              }
              emptyMessage={
                searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : isAllMode
                    ? "Check back later for new expenses."
                    : 'Click "New Request" to create your first expense.'
              }
            />
          </div>
        )}
      </Card>

      {/* Admin Configuration Section */}
      {isAdmin && (
        <Card padding="none">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex min-w-full" role="tablist">
              {ADMIN_TABS.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={adminTab === tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={`
                    px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${
                      adminTab === tab.id
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
          <div className="p-6">
            {adminTab === "budgets" && <BudgetsTab />}
            {adminTab === "entities" && <EntitiesTab />}
            {adminTab === "departments" && <DepartmentsTab />}
            {adminTab === "branches" && <BranchesTab />}
            {adminTab === "categories" && <CategoriesTab />}
            {adminTab === "expense-types" && <ExpenseTypesTab />}
            {adminTab === "payment-accounts" && <PaymentAccountsTab />}
            {adminTab === "per-diem" && <PerDiemRatesTab />}
            {adminTab === "job-roles" && <JobRolesTab />}
            {adminTab === "workflows" && <WorkflowsTab />}
            {adminTab === "quickbooks" && <QuickBooksTab />}
          </div>
        </Card>
      )}

      {/* Bulk action dialogs */}
      <ConfirmDialog
        isOpen={bulkAction.isOpen && bulkAction.type === "approve"}
        title="Approve Selected Expenses?"
        message={`Are you sure you want to approve ${selectedApprovable.length} expense(s)?`}
        confirmLabel="Approve All"
        confirmVariant="primary"
        onConfirm={executeBulkApprove}
        onCancel={() => setBulkAction({ type: null, isOpen: false })}
      />

      {/* Bulk reject modal */}
      {bulkAction.isOpen && bulkAction.type === "reject" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2 text-status-error">
              Reject {selectedApprovable.length} Expense(s)
            </h3>
            <p className="text-text-secondary mb-4 text-sm">
              Please provide a reason for rejecting these expenses.
            </p>
            <textarea
              value={bulkRejectReason}
              onChange={(e) => setBulkRejectReason(e.target.value)}
              placeholder="Rejection reason (required)"
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-24 resize-none text-sm"
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setBulkAction({ type: null, isOpen: false });
                  setBulkRejectReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={executeBulkReject}
                disabled={!bulkRejectReason.trim()}
              >
                Reject All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Drawer — driven by URL state */}
      <ExpenseDrawer
        isOpen={drawerState.isOpen}
        mode={drawerState.mode}
        expenseId={drawerState.expenseId}
        onClose={drawerState.closeDrawer}
        onSwitchMode={drawerState.switchMode}
        onShowToast={showToast}
      />

      {/* Page-level toast — persists after drawer unmounts */}
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
        position="top"
      />
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function ExpensesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" variant="primary" />
        </div>
      }
    >
      <ExpensesPageContent />
    </Suspense>
  );
}
