"use client";

/**
 * Departments Tab (Admin Only)
 *
 * Department/Branch management with GL code configuration
 */

import { useState } from "react";
import { Input, Button, Card, Spinner, Badge } from "@/src/components/ui";
import { Plus, XCircle, Save, Users, Edit, Info } from "@/src/lib/icons";
import { useDepartments, useCreateDepartment } from "@/src/hooks/useExpenses";
import type { Department } from "@/src/lib/api/expenseClient";

export function DepartmentsTab() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    location: "",
    isActive: true,
    glCode: "",
    glClassId: "",
  });

  const { data, isLoading } = useDepartments();
  const createDepartment = useCreateDepartment();

  const departments = data?.departments || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createDepartment.mutateAsync({
        name: formData.name,
        code: formData.code,
        location: formData.location || undefined,
        isActive: formData.isActive,
        glCode: formData.glCode || undefined,
        glClassId: formData.glClassId || undefined,
      });

      alert("Department created successfully!");
      setShowCreateForm(false);
      setFormData({
        name: "",
        code: "",
        location: "",
        isActive: true,
        glCode: "",
        glClassId: "",
      });
    } catch (error) {
      alert("Failed to create department. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Departments</h3>
          <p className="text-sm text-text-secondary">
            Manage departments/branches with accounting integration
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? (
            <>
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create Department
            </>
          )}
        </Button>
      </div>

      {/* Info Banner */}
      <Card variant="bordered" padding="md">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-info flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="font-semibold text-text-primary mb-1">About Departments</h4>
            <p className="text-sm text-text-secondary">
              Departments (also called Branches) represent organizational units within an entity.
              Each department can have GL codes for accounting integration and QuickBooks class
              mapping.
            </p>
          </div>
        </div>
      </Card>

      {/* Create Department Form */}
      {showCreateForm && (
        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Create New Department</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-text-primary">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Department Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Operations, Sales, Admin"
                  required
                />

                <Input
                  label="Department Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., OPS, SALES, ADMIN"
                  required
                />

                <Input
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Kigali, Nairobi (Optional)"
                />
              </div>
            </div>

            {/* Accounting Integration */}
            <div className="space-y-4 pt-4 border-t border-border-light">
              <h4 className="font-medium text-text-primary">Accounting Integration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="GL Code"
                  value={formData.glCode}
                  onChange={(e) => setFormData({ ...formData, glCode: e.target.value })}
                  placeholder="e.g., 5000, 6100 (Optional)"
                />

                <Input
                  label="GL Class ID"
                  value={formData.glClassId}
                  onChange={(e) => setFormData({ ...formData, glClassId: e.target.value })}
                  placeholder="QuickBooks Class ID (Optional)"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-border-default"
                />
                <label htmlFor="isActive" className="text-sm text-text-primary">
                  Department is active
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" loading={createDepartment.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Create Department
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Departments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="primary" />
        </div>
      ) : departments.length === 0 ? (
        <Card variant="bordered">
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No departments configured
            </h3>
            <p className="text-text-secondary mb-4">
              Create your first department to organize expense tracking.
            </p>
            {!showCreateForm && (
              <Button variant="primary" onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Department
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept: Department) => (
            <Card key={dept.id} variant="bordered" padding="md">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-text-primary">{dept.name}</h3>
                    <p className="text-sm text-text-secondary">{dept.code}</p>
                  </div>
                </div>
                {dept.is_active ? (
                  <Badge variant="success" size="sm">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="default" size="sm">
                    Inactive
                  </Badge>
                )}
              </div>

              {dept.location && (
                <div className="text-sm text-text-secondary mb-3">📍 {dept.location}</div>
              )}

              {/* GL Codes */}
              {(dept.gl_code || dept.gl_class_id) && (
                <div className="bg-background-light p-3 rounded-lg mb-3 space-y-1">
                  {dept.gl_code && (
                    <div className="text-sm">
                      <span className="text-text-secondary">GL Code:</span>{" "}
                      <span className="font-medium text-text-primary">{dept.gl_code}</span>
                    </div>
                  )}
                  {dept.gl_class_id && (
                    <div className="text-sm">
                      <span className="text-text-secondary">GL Class ID:</span>{" "}
                      <span className="font-medium text-text-primary">{dept.gl_class_id}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs text-text-tertiary mb-3">
                Created: {new Date(dept.created_at).toLocaleDateString()}
              </div>

              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
