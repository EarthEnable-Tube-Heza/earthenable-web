/**
 * Expense Client Unit Tests
 *
 * Tests for the expense management API client covering:
 * - Expense category creation
 * - Department creation
 * - Budget operations
 * - Expense request creation
 * - Expense submission
 */

import * as expenseClient from "../expenseClient";
import { apiClient } from "../apiClient";

// Mock the apiClient module
jest.mock("../apiClient", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("ExpenseClient", () => {
  const mockEntityId = "entity-123";
  const mockDepartmentId = "dept-123";
  const mockCategoryId = "cat-123";
  const mockExpenseId = "expense-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Expense Category Management", () => {
    describe("getExpenseCategories", () => {
      it("should fetch expense categories for an entity", async () => {
        const mockCategories = {
          categories: [
            {
              id: mockCategoryId,
              entity_id: mockEntityId,
              name: "Transportation",
              code: "TRANS",
              description: "Transportation expenses",
              requires_receipt: true,
              is_active: true,
              gl_code: "6100",
              gl_class_id: "class-1",
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "cat-124",
              entity_id: mockEntityId,
              name: "Meals",
              code: "MEALS",
              description: "Meal expenses",
              requires_receipt: true,
              is_active: true,
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        };

        (apiClient.get as jest.Mock).mockResolvedValue(mockCategories);

        const result = await expenseClient.getExpenseCategories(mockEntityId);

        expect(apiClient.get).toHaveBeenCalledWith(
          `/admin/entities/${mockEntityId}/expense-categories`
        );
        expect(result).toEqual(mockCategories);
        expect(result.categories).toHaveLength(2);
        expect(result.categories[0].name).toBe("Transportation");
      });

      it("should handle API errors when fetching categories", async () => {
        const mockError = new Error("Network error");
        (apiClient.get as jest.Mock).mockRejectedValue(mockError);

        await expect(expenseClient.getExpenseCategories(mockEntityId)).rejects.toThrow(
          "Network error"
        );
      });
    });

    describe("createExpenseCategory", () => {
      it("should create a new expense category with all fields", async () => {
        const mockCategoryData = {
          name: "Office Supplies",
          code: "OFFICE",
          description: "Office supplies and equipment",
          requiresReceipt: true,
          isActive: true,
          glCode: "6200",
          glClassId: "class-2",
        };

        const mockCreatedCategory = {
          id: "cat-125",
          entity_id: mockEntityId,
          name: mockCategoryData.name,
          code: mockCategoryData.code,
          description: mockCategoryData.description,
          requires_receipt: true,
          is_active: true,
          gl_code: mockCategoryData.glCode,
          gl_class_id: mockCategoryData.glClassId,
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        };

        (apiClient.post as jest.Mock).mockResolvedValue(mockCreatedCategory);

        const result = await expenseClient.createExpenseCategory(mockEntityId, mockCategoryData);

        expect(apiClient.post).toHaveBeenCalledWith(
          `/admin/entities/${mockEntityId}/expense-categories`,
          {
            name: mockCategoryData.name,
            code: mockCategoryData.code,
            description: mockCategoryData.description,
            requires_receipt: true,
            is_active: true,
            gl_code: mockCategoryData.glCode,
            gl_class_id: mockCategoryData.glClassId,
          }
        );
        expect(result).toEqual(mockCreatedCategory);
        expect(result.id).toBe("cat-125");
      });

      it("should create expense category with default values", async () => {
        const mockCategoryData = {
          name: "Travel",
          code: "TRAVEL",
        };

        const mockCreatedCategory = {
          id: "cat-126",
          entity_id: mockEntityId,
          name: mockCategoryData.name,
          code: mockCategoryData.code,
          requires_receipt: true,
          is_active: true,
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        };

        (apiClient.post as jest.Mock).mockResolvedValue(mockCreatedCategory);

        const result = await expenseClient.createExpenseCategory(mockEntityId, mockCategoryData);

        expect(apiClient.post).toHaveBeenCalledWith(
          `/admin/entities/${mockEntityId}/expense-categories`,
          {
            name: mockCategoryData.name,
            code: mockCategoryData.code,
            description: undefined,
            requires_receipt: true,
            is_active: true,
            gl_code: undefined,
            gl_class_id: undefined,
          }
        );
        expect(result.requires_receipt).toBe(true);
        expect(result.is_active).toBe(true);
      });
    });
  });

  describe("Department Management", () => {
    describe("getDepartments", () => {
      it("should fetch departments for an entity", async () => {
        const mockDepartments = {
          departments: [
            {
              id: mockDepartmentId,
              entity_id: mockEntityId,
              name: "Engineering",
              code: "ENG",
              budget_limit: 50000,
              is_active: true,
              gl_code: "4000",
              gl_class_id: "class-1",
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
            {
              id: "dept-124",
              entity_id: mockEntityId,
              name: "Marketing",
              code: "MKT",
              budget_limit: 30000,
              is_active: true,
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          ],
        };

        (apiClient.get as jest.Mock).mockResolvedValue(mockDepartments);

        const result = await expenseClient.getDepartments(mockEntityId);

        expect(apiClient.get).toHaveBeenCalledWith(`/admin/entities/${mockEntityId}/departments`);
        expect(result).toEqual(mockDepartments);
        expect(result.departments).toHaveLength(2);
        expect(result.departments[0].name).toBe("Engineering");
      });
    });

    describe("createDepartment", () => {
      it("should create a new department with all fields", async () => {
        const mockDepartmentData = {
          name: "Sales",
          code: "SALES",
          budgetLimit: 40000,
          isActive: true,
          glCode: "4100",
          glClassId: "class-3",
        };

        const mockCreatedDepartment = {
          id: "dept-125",
          entity_id: mockEntityId,
          name: mockDepartmentData.name,
          code: mockDepartmentData.code,
          budget_limit: mockDepartmentData.budgetLimit,
          is_active: true,
          gl_code: mockDepartmentData.glCode,
          gl_class_id: mockDepartmentData.glClassId,
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        };

        (apiClient.post as jest.Mock).mockResolvedValue(mockCreatedDepartment);

        const result = await expenseClient.createDepartment(mockEntityId, mockDepartmentData);

        expect(apiClient.post).toHaveBeenCalledWith(`/admin/entities/${mockEntityId}/departments`, {
          name: mockDepartmentData.name,
          code: mockDepartmentData.code,
          budget_limit: mockDepartmentData.budgetLimit,
          is_active: true,
          gl_code: mockDepartmentData.glCode,
          gl_class_id: mockDepartmentData.glClassId,
        });
        expect(result).toEqual(mockCreatedDepartment);
        expect(result.budget_limit).toBe(40000);
      });

      it("should create department with default isActive=true", async () => {
        const mockDepartmentData = {
          name: "HR",
          code: "HR",
        };

        const mockCreatedDepartment = {
          id: "dept-126",
          entity_id: mockEntityId,
          name: mockDepartmentData.name,
          code: mockDepartmentData.code,
          is_active: true,
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        };

        (apiClient.post as jest.Mock).mockResolvedValue(mockCreatedDepartment);

        const result = await expenseClient.createDepartment(mockEntityId, mockDepartmentData);

        expect(apiClient.post).toHaveBeenCalledWith(`/admin/entities/${mockEntityId}/departments`, {
          name: mockDepartmentData.name,
          code: mockDepartmentData.code,
          budget_limit: undefined,
          is_active: true,
          gl_code: undefined,
          gl_class_id: undefined,
        });
        expect(result.is_active).toBe(true);
      });
    });
  });

  describe("Budget Operations", () => {
    describe("getBudgets", () => {
      it("should fetch budgets for an entity", async () => {
        const mockBudgets = {
          budgets: [
            {
              id: "budget-123",
              entityId: mockEntityId,
              departmentId: mockDepartmentId,
              categoryId: mockCategoryId,
              name: "Q1 Budget",
              allocatedAmount: 10000,
              spentAmount: 3500,
              remainingAmount: 6500,
              utilizationPercentage: 35,
              currency: "RWF",
              period: "quarterly",
              startDate: "2025-01-01",
              endDate: "2025-03-31",
              departmentName: "Engineering",
              categoryName: "Transportation",
              status: "on_track",
            },
            {
              id: "budget-124",
              entityId: mockEntityId,
              departmentId: mockDepartmentId,
              categoryId: "cat-124",
              name: "Q1 Meals Budget",
              allocatedAmount: 5000,
              spentAmount: 1200,
              remainingAmount: 3800,
              utilizationPercentage: 24,
              currency: "RWF",
              period: "quarterly",
              startDate: "2025-01-01",
              endDate: "2025-03-31",
              departmentName: "Engineering",
              categoryName: "Meals",
              status: "on_track",
            },
          ],
        };

        (apiClient.get as jest.Mock).mockResolvedValue(mockBudgets);

        const result = await expenseClient.getBudgets(mockEntityId);

        expect(apiClient.get).toHaveBeenCalledWith(`/admin/entities/${mockEntityId}/budgets`);
        expect(result).toEqual(mockBudgets);
        expect(result.budgets).toHaveLength(2);
        expect(result.budgets[0].allocatedAmount).toBe(10000);
        expect(result.budgets[0].spentAmount).toBe(3500);
      });

      it("should handle empty budgets response", async () => {
        const mockEmptyBudgets = {
          budgets: [],
        };

        (apiClient.get as jest.Mock).mockResolvedValue(mockEmptyBudgets);

        const result = await expenseClient.getBudgets(mockEntityId);

        expect(result.budgets).toHaveLength(0);
      });
    });
  });

  describe("Expense Request Creation and Management", () => {
    describe("createExpense", () => {
      it("should create a new expense request with all required fields", async () => {
        const mockExpenseData = {
          entityId: mockEntityId,
          departmentId: mockDepartmentId,
          categoryId: mockCategoryId,
          expenseType: "expense" as const,
          title: "Taxi fare to client meeting",
          amount: 25.5,
          currency: "USD",
          expenseDate: "2025-01-15",
          description: "Transportation to downtown office",
        };

        const mockCreatedExpense = {
          id: mockExpenseId,
          entity_id: mockExpenseData.entityId,
          department_id: mockExpenseData.departmentId,
          submitter_id: "user-123",
          category_id: mockExpenseData.categoryId,
          expense_type: mockExpenseData.expenseType,
          title: mockExpenseData.title,
          amount: mockExpenseData.amount,
          currency: mockExpenseData.currency,
          expense_date: mockExpenseData.expenseDate,
          description: mockExpenseData.description,
          status: "draft" as const,
          created_at: "2025-01-15T10:00:00Z",
          updated_at: "2025-01-15T10:00:00Z",
        };

        (apiClient.post as jest.Mock).mockResolvedValue(mockCreatedExpense);

        const result = await expenseClient.createExpense(mockExpenseData);

        expect(apiClient.post).toHaveBeenCalledWith("/expenses/", {
          entityId: mockExpenseData.entityId,
          departmentId: mockExpenseData.departmentId,
          categoryId: mockExpenseData.categoryId,
          expenseType: mockExpenseData.expenseType,
          title: mockExpenseData.title,
          amount: mockExpenseData.amount,
          currency: mockExpenseData.currency,
          expenseDate: mockExpenseData.expenseDate,
          description: mockExpenseData.description,
        });
        expect(result).toEqual(mockCreatedExpense);
        expect(result.status).toBe("draft");
        expect(result.id).toBe(mockExpenseId);
      });

      it("should create expense without optional description", async () => {
        const mockExpenseData = {
          entityId: mockEntityId,
          departmentId: mockDepartmentId,
          categoryId: mockCategoryId,
          expenseType: "expense" as const,
          title: "Office supplies",
          amount: 150,
          currency: "USD",
          expenseDate: "2025-01-15",
        };

        const mockCreatedExpense = {
          id: "expense-124",
          entity_id: mockExpenseData.entityId,
          department_id: mockExpenseData.departmentId,
          submitter_id: "user-123",
          category_id: mockExpenseData.categoryId,
          expense_type: mockExpenseData.expenseType,
          title: mockExpenseData.title,
          amount: mockExpenseData.amount,
          currency: mockExpenseData.currency,
          expense_date: mockExpenseData.expenseDate,
          status: "draft" as const,
          created_at: "2025-01-15T10:00:00Z",
          updated_at: "2025-01-15T10:00:00Z",
        };

        (apiClient.post as jest.Mock).mockResolvedValue(mockCreatedExpense);

        const result = await expenseClient.createExpense(mockExpenseData);

        expect(result.description).toBeUndefined();
      });

      it("should create per_diem expense type", async () => {
        const mockPerDiemData = {
          entityId: mockEntityId,
          departmentId: mockDepartmentId,
          categoryId: mockCategoryId,
          expenseType: "per_diem" as const,
          title: "Per diem for 3-day field visit",
          amount: 300,
          currency: "USD",
          expenseDate: "2025-01-15",
          description: "3 days @ $100/day",
        };

        const mockCreatedExpense = {
          id: "expense-125",
          entity_id: mockPerDiemData.entityId,
          department_id: mockPerDiemData.departmentId,
          submitter_id: "user-123",
          category_id: mockPerDiemData.categoryId,
          expense_type: "per_diem",
          title: mockPerDiemData.title,
          amount: mockPerDiemData.amount,
          currency: mockPerDiemData.currency,
          expense_date: mockPerDiemData.expenseDate,
          description: mockPerDiemData.description,
          status: "draft" as const,
          created_at: "2025-01-15T10:00:00Z",
          updated_at: "2025-01-15T10:00:00Z",
        };

        (apiClient.post as jest.Mock).mockResolvedValue(mockCreatedExpense);

        const result = await expenseClient.createExpense(mockPerDiemData);

        expect(result.expense_type).toBe("per_diem");
      });
    });

    describe("getExpense", () => {
      it("should fetch a single expense by ID", async () => {
        const mockExpense = {
          id: mockExpenseId,
          entity_id: mockEntityId,
          department_id: mockDepartmentId,
          submitter_id: "user-123",
          category_id: mockCategoryId,
          expense_type: "expense" as const,
          title: "Taxi fare",
          amount: 25.5,
          currency: "USD",
          expense_date: "2025-01-15",
          status: "draft" as const,
          created_at: "2025-01-15T10:00:00Z",
          updated_at: "2025-01-15T10:00:00Z",
          submitter_name: "John Doe",
          department_name: "Engineering",
          category_name: "Transportation",
        };

        (apiClient.get as jest.Mock).mockResolvedValue(mockExpense);

        const result = await expenseClient.getExpense(mockExpenseId);

        expect(apiClient.get).toHaveBeenCalledWith(`/expenses/${mockExpenseId}`);
        expect(result).toEqual(mockExpense);
        expect(result.submitter_name).toBe("John Doe");
      });
    });

    describe("updateExpense", () => {
      it("should update expense draft", async () => {
        const mockUpdateData = {
          title: "Updated taxi fare",
          amount: 30,
          description: "Updated description",
        };

        const mockUpdatedExpense = {
          id: mockExpenseId,
          entity_id: mockEntityId,
          department_id: mockDepartmentId,
          submitter_id: "user-123",
          category_id: mockCategoryId,
          expense_type: "expense" as const,
          title: mockUpdateData.title,
          amount: mockUpdateData.amount,
          currency: "USD",
          expense_date: "2025-01-15",
          description: mockUpdateData.description,
          status: "draft" as const,
          created_at: "2025-01-15T10:00:00Z",
          updated_at: "2025-01-15T11:00:00Z",
        };

        (apiClient.put as jest.Mock).mockResolvedValue(mockUpdatedExpense);

        const result = await expenseClient.updateExpense(mockExpenseId, mockUpdateData);

        expect(apiClient.put).toHaveBeenCalledWith(`/expenses/${mockExpenseId}`, mockUpdateData);
        expect(result).toEqual(mockUpdatedExpense);
        expect(result.title).toBe("Updated taxi fare");
      });
    });

    describe("deleteExpense", () => {
      it("should delete expense draft", async () => {
        (apiClient.delete as jest.Mock).mockResolvedValue(undefined);

        await expenseClient.deleteExpense(mockExpenseId);

        expect(apiClient.delete).toHaveBeenCalledWith(`/expenses/${mockExpenseId}`);
      });
    });
  });

  describe("Expense Submission", () => {
    describe("submitExpense", () => {
      it("should submit expense for approval", async () => {
        const mockSubmittedExpense = {
          id: mockExpenseId,
          entity_id: mockEntityId,
          department_id: mockDepartmentId,
          submitter_id: "user-123",
          category_id: mockCategoryId,
          expense_type: "expense" as const,
          title: "Taxi fare",
          amount: 25.5,
          currency: "USD",
          expense_date: "2025-01-15",
          status: "submitted" as const,
          created_at: "2025-01-15T10:00:00Z",
          updated_at: "2025-01-15T12:00:00Z",
        };

        (apiClient.post as jest.Mock).mockResolvedValue(mockSubmittedExpense);

        const result = await expenseClient.submitExpense(mockExpenseId);

        expect(apiClient.post).toHaveBeenCalledWith(`/expenses/${mockExpenseId}/submit`);
        expect(result).toEqual(mockSubmittedExpense);
        expect(result.status).toBe("submitted");
      });
    });
  });

  describe("Expense Listing and Filtering", () => {
    describe("listExpenses", () => {
      it("should list expenses with all filters", async () => {
        const mockListResponse = {
          expenses: [
            {
              id: mockExpenseId,
              entity_id: mockEntityId,
              department_id: mockDepartmentId,
              submitter_id: "user-123",
              category_id: mockCategoryId,
              expense_type: "expense" as const,
              title: "Taxi fare",
              amount: 25.5,
              currency: "USD",
              expense_date: "2025-01-15",
              status: "submitted" as const,
              created_at: "2025-01-15T10:00:00Z",
              updated_at: "2025-01-15T10:00:00Z",
              submitter_name: "John Doe",
              department_name: "Engineering",
              category_name: "Transportation",
            },
          ],
          total: 1,
          page: 1,
          page_size: 10,
        };

        (apiClient.get as jest.Mock).mockResolvedValue(mockListResponse);

        const result = await expenseClient.listExpenses({
          entityId: mockEntityId,
          departmentId: mockDepartmentId,
          submitterId: "user-123",
          statusFilter: "submitted",
          page: 1,
          pageSize: 10,
        });

        expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining("/expenses/?"));
        expect(result).toEqual(mockListResponse);
        expect(result.expenses).toHaveLength(1);
      });

      it("should list expenses without filters", async () => {
        const mockListResponse = {
          expenses: [],
          total: 0,
          page: 1,
          page_size: 10,
        };

        (apiClient.get as jest.Mock).mockResolvedValue(mockListResponse);

        const result = await expenseClient.listExpenses({});

        expect(apiClient.get).toHaveBeenCalledWith("/expenses/?");
        expect(result.expenses).toHaveLength(0);
      });
    });

    describe("getExpenseSummary", () => {
      it("should fetch expense summary for entity", async () => {
        const mockSummary = {
          total_count: 25,
          total_amount: 5500,
          draft_count: 5,
          submitted_count: 10,
          approved_count: 8,
          rejected_count: 2,
          paid_count: 0,
        };

        (apiClient.get as jest.Mock).mockResolvedValue(mockSummary);

        const result = await expenseClient.getExpenseSummary(mockEntityId);

        expect(apiClient.get).toHaveBeenCalledWith(`/expenses/summary/${mockEntityId}`);
        expect(result).toEqual(mockSummary);
        expect(result.total_count).toBe(25);
      });

      it("should fetch expense summary with department filter", async () => {
        const mockSummary = {
          total_count: 10,
          total_amount: 2000,
          draft_count: 2,
          submitted_count: 5,
          approved_count: 3,
          rejected_count: 0,
          paid_count: 0,
        };

        (apiClient.get as jest.Mock).mockResolvedValue(mockSummary);

        const result = await expenseClient.getExpenseSummary(mockEntityId, mockDepartmentId);

        expect(apiClient.get).toHaveBeenCalledWith(
          `/expenses/summary/${mockEntityId}?department_id=${mockDepartmentId}`
        );
        expect(result.total_count).toBe(10);
      });
    });
  });

  describe("Per Diem Calculation", () => {
    describe("calculatePerDiem", () => {
      it("should calculate per diem amount", async () => {
        const mockCalculation = {
          designation: "Manager",
          days: 3,
          rate_per_day: 100,
          total_amount: 300,
          currency: "USD",
        };

        (apiClient.post as jest.Mock).mockResolvedValue(mockCalculation);

        const result = await expenseClient.calculatePerDiem({
          entityId: mockEntityId,
          designation: "Manager",
          days: 3,
          calculationDate: "2025-01-15",
        });

        expect(apiClient.post).toHaveBeenCalledWith("/expenses/calculate-per-diem", {
          entityId: mockEntityId,
          designation: "Manager",
          days: 3,
          calculationDate: "2025-01-15",
        });
        expect(result).toEqual(mockCalculation);
        expect(result.total_amount).toBe(300);
      });
    });
  });
});
