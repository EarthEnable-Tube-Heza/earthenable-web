# Expense Management API Integration Guide

This guide outlines the complete integration of the expense management UI with the backend API.

## Current Status

✅ **Completed:**

- Backend API with 10 expense endpoints
- Test data seeded (entities, branches, departments, categories, budgets, per diem rates)
- UI components created (all tabs functional with mock data)
- lucide-react icons installed
- API client created (`src/lib/api/expenseClient.ts`)
- Icons utility created (`src/lib/icons.tsx`)

⏳ **Remaining:**

- Replace emojis with icons in all components
- Integrate components with API using React Query
- Add error handling and loading states
- Connect to actual user context (entity_id, department_id)

## Architecture Overview

```
User Interface (React Components)
        ↓
React Query Hooks (useExpenses, useCreateExpense, etc.)
        ↓
API Client (src/lib/api/expenseClient.ts)
        ↓
Backend API (FastAPI + PostgreSQL)
```

## Step 1: Icon Replacements

Replace all emojis with lucide-react icons for consistent cross-platform rendering:

### Icon Mapping

| Current Emoji | Component       | lucide-react Icon |
| ------------- | --------------- | ----------------- |
| 📊            | ExpenseStats    | `BarChart`        |
| 📝            | ExpenseStats    | `FileText`        |
| ⏳            | ExpenseStats    | `Clock`           |
| ✅            | ExpenseStats    | `CheckCircle`     |
| ❌            | ExpenseStats    | `XCircle`         |
| 💸            | ExpenseStats    | `DollarSign`      |
| 💰            | MyExpensesTab   | `Wallet`          |
| 📅            | MyExpensesTab   | `Calendar`        |
| 🏷️            | MyExpensesTab   | `Tag`             |
| 🔍            | Search buttons  | `Search`          |
| ➕            | Create buttons  | `Plus`            |
| 💡            | Info cards      | `Info`            |
| 💼            | BudgetsTab      | `Briefcase`       |
| 🎯            | PerDiemRatesTab | `Target`          |
| 👤            | User references | `User`            |

### Example: Update ExpenseStats

```typescript
import { BarChart, FileText, Clock, CheckCircle, XCircle, DollarSign } from '@/src/lib/icons';

const statCards = [
  {
    label: 'Total Expenses',
    value: stats.total_count,
    icon: <BarChart className="w-6 h-6" />,  // Instead of '📊'
    // ...
  },
  // ...
];
```

## Step 2: Create React Query Hooks

Create `src/hooks/useExpenses.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as expenseAPI from "@/src/lib/api/expenseClient";
import { useAuth } from "@/src/lib/auth";

/**
 * Hook to fetch expense summary
 */
export function useExpenseSummary() {
  const { user } = useAuth();
  const entityId = user?.entity_id || "";

  return useQuery({
    queryKey: ["expense-summary", entityId],
    queryFn: () => expenseAPI.getExpenseSummary(entityId),
    enabled: !!entityId,
  });
}

/**
 * Hook to list expenses
 */
export function useExpenses(params: { statusFilter?: string; departmentId?: string }) {
  const { user } = useAuth();
  const entityId = user?.entity_id || "";

  return useQuery({
    queryKey: ["expenses", entityId, params],
    queryFn: () =>
      expenseAPI.listExpenses({
        entityId,
        submitterId: user?.id,
        ...params,
      }),
    enabled: !!entityId && !!user?.id,
  });
}

/**
 * Hook to create expense
 */
export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: expenseAPI.createExpense,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
    },
  });
}

/**
 * Hook to submit expense
 */
export function useSubmitExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseAPI.submitExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
    },
  });
}

/**
 * Hook to calculate per diem
 */
export function useCalculatePerDiem() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: { designation: string; days: number }) =>
      expenseAPI.calculatePerDiem({
        entityId: user?.entity_id || "",
        ...data,
      }),
  });
}

/**
 * Hook to get departments
 */
export function useDepartments() {
  const { user } = useAuth();
  const entityId = user?.entity_id || "";

  return useQuery({
    queryKey: ["departments", entityId],
    queryFn: () => expenseAPI.getDepartments(entityId),
    enabled: !!entityId,
  });
}

/**
 * Hook to get categories
 */
export function useExpenseCategories() {
  const { user } = useAuth();
  const entityId = user?.entity_id || "";

  return useQuery({
    queryKey: ["expense-categories", entityId],
    queryFn: () => expenseAPI.getExpenseCategories(entityId),
    enabled: !!entityId,
  });
}
```

## Step 3: Update ExpenseStats Component

Replace mock data with API integration:

```typescript
import { useExpenseSummary } from '@/src/hooks/useExpenses';
import { BarChart, FileText, Clock, CheckCircle, XCircle, DollarSign } from '@/src/lib/icons';

export function ExpenseStats() {
  const { data: stats, isLoading, error } = useExpenseSummary();

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" variant="primary" />
        </div>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card variant="bordered">
        <div className="text-center py-4 text-text-secondary">
          Unable to load expense statistics
        </div>
      </Card>
    );
  }

  // ... rest of component with icon replacements
}
```

## Step 4: Update MyExpensesTab Component

```typescript
import { useState } from "react";
import { useExpenses, useSubmitExpense } from "@/src/hooks/useExpenses";
import { Search, Calendar, Tag, Wallet } from "@/src/lib/icons";

export function MyExpensesTab() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, isLoading } = useExpenses({
    statusFilter: statusFilter === "all" ? undefined : statusFilter,
  });
  const submitMutation = useSubmitExpense();

  const expenses = data?.expenses || [];

  const handleSubmit = async (expenseId: string) => {
    try {
      await submitMutation.mutateAsync(expenseId);
      alert("Expense submitted successfully!");
    } catch (error) {
      alert("Failed to submit expense");
    }
  };

  // ... rest of component
}
```

## Step 5: Update NewRequestTab Component

```typescript
import { useState } from "react";
import {
  useCreateExpense,
  useCalculatePerDiem,
  useDepartments,
  useExpenseCategories,
} from "@/src/hooks/useExpenses";
import { Plus, Save, XCircle, Info } from "@/src/lib/icons";
import { useAuth } from "@/src/lib/auth";

export function NewRequestTab() {
  const { user } = useAuth();
  const { data: departments } = useDepartments();
  const { data: categories } = useExpenseCategories();
  const createMutation = useCreateExpense();
  const perDiemMutation = useCalculatePerDiem();

  const [formData, setFormData] = useState({
    expenseType: "expense",
    title: "",
    description: "",
    amount: "",
    currency: "RWF",
    expenseDate: new Date().toISOString().split("T")[0],
    categoryId: "",
    departmentId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        entityId: user?.entity_id || "",
        departmentId: formData.departmentId,
        categoryId: formData.categoryId,
        expenseType: formData.expenseType as any,
        title: formData.title,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        expenseDate: formData.expenseDate,
        description: formData.description,
      });

      alert("Expense created successfully!");
      // Reset form
    } catch (error) {
      alert("Failed to create expense");
    }
  };

  const calculatePerDiem = async () => {
    try {
      const result = await perDiemMutation.mutateAsync({
        designation: perDiemDesignation,
        days: parseInt(perDiemDays),
      });
      setPerDiemCalculation(result);
      setFormData((prev) => ({
        ...prev,
        amount: String(result.total_amount),
      }));
    } catch (error) {
      alert("Failed to calculate per diem");
    }
  };

  // ... rest of component with real departments and categories
}
```

## Step 6: Update Backend Endpoints (if needed)

The backend may need additional endpoints for fetching departments and categories. Add to `src/api/v1/endpoints/admin.py`:

```python
@router.get("/entities/{entity_id}/departments")
async def get_entity_departments(
    entity_id: str,
    user_context: Annotated[UserContext, Depends(get_current_user_context)],
    repository: Annotated[DepartmentRepository, Depends(get_department_repository)],
):
    """Get all departments for an entity."""
    departments = await repository.get_by_entity(entity_id)
    return {"departments": [
        {"id": d.id, "name": d.name, "code": d.code}
        for d in departments
    ]}

@router.get("/entities/{entity_id}/expense-categories")
async def get_entity_expense_categories(
    entity_id: str,
    user_context: Annotated[UserContext, Depends(get_current_user_context)],
    db: AsyncSession = Depends(get_db),
):
    """Get all expense categories for an entity."""
    result = await db.execute(
        select(ExpenseCategory).where(ExpenseCategory.entity_id == entity_id)
    )
    categories = result.scalars().all()
    return {"categories": [
        {"id": c.id, "name": c.name, "code": c.code}
        for c in categories
    ]}
```

## Step 7: Add Error Boundaries

Create `src/components/ErrorBoundary.tsx`:

```typescript
import React from 'react';
import { AlertTriangle } from '@/src/lib/icons';
import { Card } from '@/src/components/ui';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card variant="bordered">
          <div className="flex items-start gap-3 p-6">
            <AlertTriangle className="w-6 h-6 text-status-error flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-text-primary mb-2">
                Something went wrong
              </h3>
              <p className="text-sm text-text-secondary">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
```

## Step 8: Testing Checklist

- [ ] User can view expense statistics
- [ ] User can create a new expense (regular, per diem, advance)
- [ ] Per diem calculator works correctly
- [ ] User can view their own expenses
- [ ] User can submit a draft expense
- [ ] Admin can view all expenses
- [ ] Admin can approve/reject expenses
- [ ] Budget tracking works
- [ ] Per diem rate management works
- [ ] Icons render consistently across devices
- [ ] Error handling works properly
- [ ] Loading states display correctly

## Step 9: Environment Setup

Ensure users have necessary data in their profile:

```typescript
// User interface should include:
interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  entity_id?: string; // Required for expenses
  department_id?: string; // Optional, for filtering
}
```

## Quick Start Commands

```bash
# Install dependencies (already done)
npm install lucide-react

# Run servers
cd earthenable-api && source venv/bin/activate && uvicorn src.main:app --reload
cd earthenable-web && npm run dev

# Seed test data (already done)
PGPASSWORD='tube-heza-pavoma' psql -h localhost -U earthenable -d earthenable_test -f scripts/seed_expense_data.sql

# Test API endpoints
curl http://localhost:8000/docs
```

## Next Steps

1. Replace emojis with icons in all components
2. Create React Query hooks
3. Update ExpenseStats with real data
4. Update MyExpensesTab with real data
5. Update NewRequestTab with real departments/categories
6. Add error handling
7. Test end-to-end workflow
8. Deploy to staging

## Notes

- All API endpoints require authentication (JWT token)
- Users must have `entity_id` in their profile
- Budget compliance checking happens server-side
- Per diem rates are entity-specific
- Approval workflow is automatic (creates approval chain)
