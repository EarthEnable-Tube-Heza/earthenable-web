import { render, screen, fireEvent } from "@testing-library/react";
import {
  EmployeeFormFields,
  createEmptyEmployeeFormData,
  employeeDetailToFormData,
} from "../EmployeeFormFields";
import { EntityListResponse } from "@/src/types";

// Mock the apiClient
jest.mock("@/src/lib/api/apiClient", () => ({
  apiClient: {
    getEntityDepartments: jest.fn().mockResolvedValue([
      { id: "dept-1", entity_id: "entity-1", name: "Engineering", code: "ENG", is_active: true },
      { id: "dept-2", entity_id: "entity-1", name: "Sales", code: "SAL", is_active: true },
    ]),
    getEntityBranches: jest.fn().mockResolvedValue([
      {
        id: "branch-1",
        entity_id: "entity-1",
        name: "Main Office",
        code: "HQ",
        location: "Kigali",
        is_active: true,
      },
    ]),
    getEntityJobRoles: jest.fn().mockResolvedValue([
      {
        id: "role-1",
        entity_id: "entity-1",
        name: "QA Agent",
        code: "QA",
        seniority_level_id: "sl-1",
        seniority_level_name: "Officer",
        is_active: true,
      },
    ]),
    getUsers: jest.fn().mockResolvedValue({ items: [], total: 0 }),
  },
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />;
  },
}));

const mockEntities: EntityListResponse[] = [
  {
    id: "entity-1",
    name: "Rwanda Entity",
    code: "RW",
    is_parent: false,
    is_active: true,
    user_count: 10,
  },
  {
    id: "entity-2",
    name: "Kenya Entity",
    code: "KE",
    is_parent: false,
    is_active: true,
    user_count: 5,
  },
];

describe("EmployeeFormFields Component", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders entity select with options", () => {
    const formData = createEmptyEmployeeFormData();

    render(
      <EmployeeFormFields
        data={formData}
        onChange={mockOnChange}
        entities={mockEntities}
        mode="create"
      />
    );

    expect(screen.getByText("Entity")).toBeInTheDocument();
    expect(screen.getByText("Select entity...")).toBeInTheDocument();
    expect(screen.getByText("RW - Rwanda Entity")).toBeInTheDocument();
    expect(screen.getByText("KE - Kenya Entity")).toBeInTheDocument();
  });

  it("renders role input as required", () => {
    const formData = createEmptyEmployeeFormData();

    render(
      <EmployeeFormFields
        data={formData}
        onChange={mockOnChange}
        entities={mockEntities}
        mode="create"
      />
    );

    const roleInput = screen.getByPlaceholderText("e.g., qa_agent, manager");
    expect(roleInput).toBeInTheDocument();
    expect(roleInput).toHaveAttribute("required");
  });

  it("calls onChange when entity is selected", async () => {
    const formData = createEmptyEmployeeFormData();

    render(
      <EmployeeFormFields
        data={formData}
        onChange={mockOnChange}
        entities={mockEntities}
        mode="create"
      />
    );

    // Find and change the entity select
    const selects = screen.getAllByRole("combobox");
    const entitySelect = selects[0]; // First select is entity

    fireEvent.change(entitySelect, { target: { value: "entity-1" } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        entity_id: "entity-1",
        department_id: "",
        branch_id: "",
        job_role_id: "",
      })
    );
  });

  it("calls onChange when role is changed", () => {
    const formData = createEmptyEmployeeFormData();

    render(
      <EmployeeFormFields
        data={formData}
        onChange={mockOnChange}
        entities={mockEntities}
        mode="create"
      />
    );

    const roleInput = screen.getByPlaceholderText("e.g., qa_agent, manager");
    fireEvent.change(roleInput, { target: { value: "qa_agent" } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "qa_agent",
      })
    );
  });

  it("shows only end date and notes in end mode", () => {
    const formData = createEmptyEmployeeFormData();

    render(
      <EmployeeFormFields
        data={formData}
        onChange={mockOnChange}
        entities={mockEntities}
        mode="end"
      />
    );

    // Should show end date
    expect(screen.getByText("End Date")).toBeInTheDocument();

    // Should show notes textarea
    expect(
      screen.getByPlaceholderText("Add any notes about ending this employment...")
    ).toBeInTheDocument();

    // Should NOT show entity, role, etc.
    expect(screen.queryByText("Entity")).not.toBeInTheDocument();
    expect(screen.queryByText("Role")).not.toBeInTheDocument();
  });

  it("disables entity select in edit mode", () => {
    const formData = {
      ...createEmptyEmployeeFormData(),
      entity_id: "entity-1",
    };

    render(
      <EmployeeFormFields
        data={formData}
        onChange={mockOnChange}
        entities={mockEntities}
        mode="edit"
      />
    );

    const selects = screen.getAllByRole("combobox");
    const entitySelect = selects[0];

    expect(entitySelect).toBeDisabled();
  });

  it("displays validation errors", () => {
    const formData = createEmptyEmployeeFormData();
    const errors = {
      entity_id: "Entity is required",
      role: "Role is required",
    };

    render(
      <EmployeeFormFields
        data={formData}
        onChange={mockOnChange}
        entities={mockEntities}
        mode="create"
        errors={errors}
      />
    );

    expect(screen.getByText("Entity is required")).toBeInTheDocument();
    expect(screen.getByText("Role is required")).toBeInTheDocument();
  });

  it("disables all fields when disabled prop is true", () => {
    const formData = createEmptyEmployeeFormData();

    render(
      <EmployeeFormFields
        data={formData}
        onChange={mockOnChange}
        entities={mockEntities}
        mode="create"
        disabled={true}
      />
    );

    const selects = screen.getAllByRole("combobox");
    selects.forEach((select) => {
      expect(select).toBeDisabled();
    });

    const roleInput = screen.getByPlaceholderText("e.g., qa_agent, manager");
    expect(roleInput).toBeDisabled();
  });
});

describe("createEmptyEmployeeFormData", () => {
  it("returns empty form data with today's date", () => {
    const formData = createEmptyEmployeeFormData();

    expect(formData.entity_id).toBe("");
    expect(formData.department_id).toBe("");
    expect(formData.sub_department_id).toBe("");
    expect(formData.branch_id).toBe("");
    expect(formData.job_role_id).toBe("");
    expect(formData.approver_id).toBe("");
    expect(formData.role).toBe("");
    expect(formData.employee_number).toBe("");
    expect(formData.start_date).toBe(new Date().toISOString().split("T")[0]);
    expect(formData.end_date).toBe("");
    expect(formData.notes).toBe("");
  });
});

describe("employeeDetailToFormData", () => {
  it("converts employee detail to form data", () => {
    const employee = {
      entity_id: "entity-1",
      department_id: "dept-1",
      sub_department_id: "sub-dept-1",
      branch_id: "branch-1",
      job_role_id: "role-1",
      approver_id: "approver-1",
      role: "qa_agent",
      employee_number: "EMP001",
      start_date: "2024-01-15T00:00:00Z",
      end_date: "2024-12-31T00:00:00Z",
      notes: "Test notes",
    };

    const formData = employeeDetailToFormData(employee);

    expect(formData.entity_id).toBe("entity-1");
    expect(formData.department_id).toBe("dept-1");
    expect(formData.sub_department_id).toBe("sub-dept-1");
    expect(formData.branch_id).toBe("branch-1");
    expect(formData.job_role_id).toBe("role-1");
    expect(formData.approver_id).toBe("approver-1");
    expect(formData.role).toBe("qa_agent");
    expect(formData.employee_number).toBe("EMP001");
    expect(formData.start_date).toBe("2024-01-15");
    expect(formData.end_date).toBe("2024-12-31");
    expect(formData.notes).toBe("Test notes");
  });

  it("handles missing optional fields", () => {
    const employee = {
      entity_id: "entity-1",
      role: "qa_agent",
      start_date: "2024-01-15",
    };

    const formData = employeeDetailToFormData(employee);

    expect(formData.entity_id).toBe("entity-1");
    expect(formData.role).toBe("qa_agent");
    expect(formData.department_id).toBe("");
    expect(formData.branch_id).toBe("");
    expect(formData.end_date).toBe("");
    expect(formData.notes).toBe("");
  });
});
