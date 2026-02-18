"use client";

/**
 * Entities Tab (Admin Only)
 *
 * Entity management with QuickBooks configuration and currency management
 */

import { useState } from "react";
import {
  Input,
  Button,
  LabeledSelect,
  Card,
  Spinner,
  Badge,
  ConfirmDialog,
  ResultModal,
} from "@/src/components/ui";
import type { ResultModalVariant } from "@/src/components/ui";
import { Plus, XCircle, Save, Building2, Edit, Info, Trash2, Star } from "@/src/lib/icons";
import {
  useEntities,
  useCreateEntity,
  useUpdateEntity,
  useEntityCurrencies,
  useCreateEntityCurrency,
  useDeleteEntityCurrency,
  useSetDefaultEntityCurrency,
  useUpdateEntityCurrency,
} from "@/src/hooks/useExpenses";
import type { Entity, EntityCurrency } from "@/src/lib/api/expenseClient";
import { COUNTRY_OPTIONS, CURRENCY_OPTIONS } from "@/src/lib/constants";

export function EntitiesTab() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEntity, setEditingEntity] = useState<string | null>(null);
  const [expandedCurrencyEntity, setExpandedCurrencyEntity] = useState<string | null>(null);
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

  // Currency add form state
  const [currencyForm, setCurrencyForm] = useState({
    currencyCode: "",
    exchangeRate: "",
  });
  const [editingRate, setEditingRate] = useState<{ id: string; rate: string } | null>(null);
  const [resultModal, setResultModal] = useState<{
    variant: ResultModalVariant;
    title: string;
    message: string;
  } | null>(null);

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
        setResultModal({
          variant: "success",
          title: "Entity Updated",
          message: "Entity updated successfully!",
        });
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
        setResultModal({
          variant: "success",
          title: "Entity Created",
          message: "Entity created successfully!",
        });
      }

      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      setResultModal({
        variant: "error",
        title: "Operation Failed",
        message: `Failed to ${editingEntity ? "update" : "create"} entity. Please try again.`,
      });
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
                  label="Default Currency"
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setExpandedCurrencyEntity(
                      expandedCurrencyEntity === entity.id ? null : entity.id
                    )
                  }
                >
                  {expandedCurrencyEntity === entity.id ? "Hide" : "Manage"} Currencies
                </Button>
              </div>

              {/* Currency Management Panel */}
              {expandedCurrencyEntity === entity.id && (
                <CurrencyManagementPanel
                  entityId={entity.id}
                  currencyForm={currencyForm}
                  setCurrencyForm={setCurrencyForm}
                  editingRate={editingRate}
                  setEditingRate={setEditingRate}
                />
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Entity Result Modal */}
      <ResultModal
        isOpen={!!resultModal}
        variant={resultModal?.variant || "info"}
        title={resultModal?.title || ""}
        message={resultModal?.message || ""}
        onAction={() => setResultModal(null)}
      />
    </div>
  );
}

/**
 * Inline currency management panel per entity card
 */
function CurrencyManagementPanel({
  entityId,
  currencyForm,
  setCurrencyForm,
  editingRate,
  setEditingRate,
}: {
  entityId: string;
  currencyForm: { currencyCode: string; exchangeRate: string };
  setCurrencyForm: (v: { currencyCode: string; exchangeRate: string }) => void;
  editingRate: { id: string; rate: string } | null;
  setEditingRate: (v: { id: string; rate: string } | null) => void;
}) {
  const [deletingCurrency, setDeletingCurrency] = useState<{ id: string; code: string } | null>(
    null
  );
  const [resultModal, setResultModal] = useState<{
    variant: ResultModalVariant;
    title: string;
    message: string;
  } | null>(null);

  const { data, isLoading } = useEntityCurrencies(entityId);
  const createCurrency = useCreateEntityCurrency(entityId);
  const deleteCurrency = useDeleteEntityCurrency(entityId);
  const setDefault = useSetDefaultEntityCurrency(entityId);
  const updateCurrency = useUpdateEntityCurrency(entityId);

  const currencies = data?.currencies || [];

  const handleAddCurrency = async () => {
    if (!currencyForm.currencyCode) return;

    const match = CURRENCY_OPTIONS.find((c) => c.value === currencyForm.currencyCode);
    const name = match
      ? match.label.split(" - ")[1] || currencyForm.currencyCode
      : currencyForm.currencyCode;

    try {
      await createCurrency.mutateAsync({
        currency_code: currencyForm.currencyCode,
        currency_name: name,
        exchange_rate: currencyForm.exchangeRate
          ? parseFloat(currencyForm.exchangeRate)
          : undefined,
      });
      setCurrencyForm({ currencyCode: "", exchangeRate: "" });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (error as any)?.response?.data?.detail || "Failed to add currency";
      setResultModal({ variant: "error", title: "Add Currency Failed", message: msg });
    }
  };

  const handleSaveRate = async (currencyId: string) => {
    if (!editingRate) return;
    try {
      await updateCurrency.mutateAsync({
        currencyId,
        data: {
          exchange_rate: editingRate.rate ? parseFloat(editingRate.rate) : undefined,
        },
      });
      setEditingRate(null);
    } catch {
      setResultModal({
        variant: "error",
        title: "Update Failed",
        message: "Failed to update exchange rate.",
      });
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-border-light space-y-3">
      <h4 className="text-sm font-semibold text-text-primary">Accepted Currencies</h4>

      {isLoading ? (
        <Spinner size="sm" />
      ) : (
        <div className="space-y-2">
          {currencies.map((c: EntityCurrency) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-2 rounded-lg bg-background-light"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold">{c.currency_code}</span>
                <span className="text-sm text-text-secondary">{c.currency_name}</span>
                {c.is_default && (
                  <Badge variant="success" size="sm">
                    Default
                  </Badge>
                )}
                {!c.is_default && c.exchange_rate != null && (
                  <span className="text-xs text-text-tertiary">Rate: {c.exchange_rate}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!c.is_default && (
                  <>
                    {editingRate?.id === c.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.000001"
                          value={editingRate.rate}
                          onChange={(e) => setEditingRate({ id: c.id, rate: e.target.value })}
                          className="w-24 px-2 py-1 text-xs border rounded"
                          placeholder="Rate"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveRate(c.id)}
                          loading={updateCurrency.isPending}
                        >
                          Save
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEditingRate(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditingRate({
                            id: c.id,
                            rate: c.exchange_rate != null ? String(c.exchange_rate) : "",
                          })
                        }
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDefault.mutateAsync(c.id)}
                      loading={setDefault.isPending}
                      title="Set as default"
                    >
                      <Star className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingCurrency({ id: c.id, code: c.currency_code })}
                      loading={deleteCurrency.isPending}
                      title="Remove currency"
                    >
                      <Trash2 className="w-3 h-3 text-error" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Currency Form */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <LabeledSelect
            label="Add Currency"
            value={currencyForm.currencyCode}
            onChange={(e) => setCurrencyForm({ ...currencyForm, currencyCode: e.target.value })}
            options={[{ value: "", label: "Select currency" }, ...CURRENCY_OPTIONS]}
          />
        </div>
        <div className="w-32">
          <Input
            label="Exchange Rate"
            type="number"
            step="0.000001"
            value={currencyForm.exchangeRate}
            onChange={(e) => setCurrencyForm({ ...currencyForm, exchangeRate: e.target.value })}
            placeholder="e.g., 1300"
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddCurrency}
          loading={createCurrency.isPending}
          disabled={!currencyForm.currencyCode}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Delete Currency Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingCurrency}
        title="Remove Currency"
        message={`Are you sure you want to remove ${deletingCurrency?.code || ""}? This action cannot be undone.`}
        confirmLabel="Remove"
        confirmVariant="danger"
        onConfirm={async () => {
          if (deletingCurrency) {
            await deleteCurrency.mutateAsync(deletingCurrency.id);
            setDeletingCurrency(null);
          }
        }}
        onCancel={() => setDeletingCurrency(null)}
      />

      {/* Currency Result Modal */}
      <ResultModal
        isOpen={!!resultModal}
        variant={resultModal?.variant || "info"}
        title={resultModal?.title || ""}
        message={resultModal?.message || ""}
        onAction={() => setResultModal(null)}
      />
    </div>
  );
}
