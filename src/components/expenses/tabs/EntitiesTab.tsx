"use client";

/**
 * Entities Tab (Admin Only)
 *
 * Entity management with QuickBooks configuration
 */

import { useState } from "react";
import { Input, Button, LabeledSelect, Card, Spinner, Badge } from "@/src/components/ui";
import { Plus, XCircle, Save, Building2, Edit, Info } from "@/src/lib/icons";
import { useEntities, useCreateEntity, useUpdateEntity } from "@/src/hooks/useExpenses";
import type { Entity } from "@/src/lib/api/expenseClient";
import { COUNTRY_OPTIONS, CURRENCY_OPTIONS } from "@/src/lib/constants";

export function EntitiesTab() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEntity, setEditingEntity] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    countryCode: "",
    currency: "RWF",
    isActive: true,
    quickbooksCompanyId: "",
    quickbooksRealmId: "",
    quickbooksEnabled: false,
  });

  const { data, isLoading } = useEntities();
  const createEntity = useCreateEntity();
  const updateEntity = useUpdateEntity();

  const entities = data?.entities || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEntity) {
        await updateEntity.mutateAsync({
          id: editingEntity,
          data: {
            name: formData.name,
            code: formData.code,
            countryCode: formData.countryCode,
            currency: formData.currency,
            isActive: formData.isActive,
            quickbooksCompanyId: formData.quickbooksCompanyId || undefined,
            quickbooksRealmId: formData.quickbooksRealmId || undefined,
            quickbooksEnabled: formData.quickbooksEnabled,
          },
        });
        alert("Entity updated successfully!");
        setEditingEntity(null);
      } else {
        await createEntity.mutateAsync({
          name: formData.name,
          code: formData.code,
          countryCode: formData.countryCode,
          currency: formData.currency,
          isActive: formData.isActive,
          quickbooksCompanyId: formData.quickbooksCompanyId || undefined,
          quickbooksRealmId: formData.quickbooksRealmId || undefined,
          quickbooksEnabled: formData.quickbooksEnabled,
        });
        alert("Entity created successfully!");
      }

      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      alert(`Failed to ${editingEntity ? "update" : "create"} entity. Please try again.`);
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      countryCode: "",
      currency: "RWF",
      isActive: true,
      quickbooksCompanyId: "",
      quickbooksRealmId: "",
      quickbooksEnabled: false,
    });
  };

  const handleEdit = (entity: Entity) => {
    setFormData({
      name: entity.name,
      code: entity.code,
      countryCode: entity.country_code,
      currency: entity.currency,
      isActive: entity.is_active,
      quickbooksCompanyId: entity.quickbooks_company_id || "",
      quickbooksRealmId: entity.quickbooks_realm_id || "",
      quickbooksEnabled: entity.quickbooks_enabled || false,
    });
    setEditingEntity(entity.id);
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingEntity(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Entities</h3>
          <p className="text-sm text-text-secondary">
            Manage legal entities with QuickBooks integration settings
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
              Create Entity
            </>
          )}
        </Button>
      </div>

      {/* Info Banner */}
      <Card variant="bordered" padding="md">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-info flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="font-semibold text-text-primary mb-1">About Entities</h4>
            <p className="text-sm text-text-secondary">
              Entities represent legal entities or country operations (e.g., EarthEnable Rwanda,
              EarthEnable Kenya). Each entity can have its own QuickBooks configuration for
              accounting integration.
            </p>
          </div>
        </div>
      </Card>

      {/* Create/Edit Entity Form */}
      {showCreateForm && (
        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">
              {editingEntity ? "Edit Entity" : "Create New Entity"}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-text-primary">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Entity Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., EarthEnable Rwanda"
                  required
                />

                <Input
                  label="Entity Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., RW, KE, ZM"
                  required
                />

                <LabeledSelect
                  label="Country Code"
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  options={[{ value: "", label: "Select Country" }, ...COUNTRY_OPTIONS]}
                  required
                />

                <LabeledSelect
                  label="Currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  options={CURRENCY_OPTIONS}
                  required
                />
              </div>
            </div>

            {/* QuickBooks Configuration */}
            <div className="space-y-4 pt-4 border-t border-border-light">
              <h4 className="font-medium text-text-primary">QuickBooks Integration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="QuickBooks Company ID"
                  value={formData.quickbooksCompanyId}
                  onChange={(e) =>
                    setFormData({ ...formData, quickbooksCompanyId: e.target.value })
                  }
                  placeholder="Optional"
                />

                <Input
                  label="QuickBooks Realm ID"
                  value={formData.quickbooksRealmId}
                  onChange={(e) => setFormData({ ...formData, quickbooksRealmId: e.target.value })}
                  placeholder="Optional"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="quickbooksEnabled"
                  checked={formData.quickbooksEnabled}
                  onChange={(e) =>
                    setFormData({ ...formData, quickbooksEnabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-border-default"
                />
                <label htmlFor="quickbooksEnabled" className="text-sm text-text-primary">
                  Enable QuickBooks integration for this entity
                </label>
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
                  Entity is active
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                loading={createEntity.isPending || updateEntity.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingEntity ? "Update Entity" : "Create Entity"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Entities List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="primary" />
        </div>
      ) : entities.length === 0 ? (
        <Card variant="bordered">
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No entities configured</h3>
            <p className="text-text-secondary mb-4">
              Create your first entity to start managing expenses.
            </p>
            {!showCreateForm && (
              <Button variant="primary" onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Entity
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entities.map((entity: Entity) => (
            <Card key={entity.id} variant="bordered" padding="md">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{entity.name}</h3>
                    <p className="text-sm text-text-secondary">
                      {entity.code} · {entity.country_code} · {entity.currency}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {entity.is_active ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="default">Inactive</Badge>
                  )}
                </div>
              </div>

              {/* QuickBooks Status */}
              {entity.quickbooks_enabled && (
                <div className="bg-background-light p-3 rounded-lg mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="info" size="sm">
                      QuickBooks Enabled
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    {entity.quickbooks_company_id && (
                      <div className="text-text-secondary">
                        Company ID: {entity.quickbooks_company_id}
                      </div>
                    )}
                    {entity.quickbooks_realm_id && (
                      <div className="text-text-secondary">
                        Realm ID: {entity.quickbooks_realm_id}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-text-tertiary mb-4">
                Created: {new Date(entity.created_at).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(entity)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
