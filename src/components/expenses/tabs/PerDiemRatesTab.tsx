"use client";

/**
 * Per Diem Rates Tab (Admin Only)
 *
 * Per diem rate management with creation, editing, and effective date tracking
 */

import { useState } from "react";
import {
  Input,
  Button,
  LabeledSelect,
  Card,
  Spinner,
  Badge,
  Select,
  Toast,
} from "@/src/components/ui";
import type { ToastType } from "@/src/components/ui/Toast";
import { Plus, XCircle, Save, Target, User, Edit, Info, CheckCircle } from "@/src/lib/icons";
import { usePerDiemRates, useCreatePerDiemRate, useEntities } from "@/src/hooks/useExpenses";

export function PerDiemRatesTab() {
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: "success" as ToastType, message: "" });
  const [formData, setFormData] = useState({
    designation: "",
    ratePerDay: "",
    currency: "RWF",
    dayNight: "day",
    effectiveDate: new Date().toISOString().split("T")[0],
    isActive: true,
  });

  const { data: entitiesData, isLoading: entitiesLoading } = useEntities();
  const { data, isLoading } = usePerDiemRates(selectedEntityId);
  const createPerDiemRate = useCreatePerDiemRate(selectedEntityId);

  const entities = entitiesData?.entities || [];
  const rates = data?.rates || [];

  // Auto-select first entity if none selected
  if (!selectedEntityId && entities.length > 0 && !entitiesLoading) {
    setSelectedEntityId(entities[0].id);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createPerDiemRate.mutateAsync({
        designation: formData.designation,
        ratePerDay: parseFloat(formData.ratePerDay),
        currency: formData.currency,
        dayNight: formData.dayNight,
        effectiveDate: formData.effectiveDate,
        isActive: formData.isActive,
      });

      setToast({ visible: true, type: "success", message: "Per diem rate created successfully!" });
      setShowCreateForm(false);
      setFormData({
        designation: "",
        ratePerDay: "",
        currency: "RWF",
        dayNight: "day",
        effectiveDate: new Date().toISOString().split("T")[0],
        isActive: true,
      });
    } catch (error) {
      setToast({
        visible: true,
        type: "error",
        message: "Failed to create per diem rate. Please try again.",
      });
      console.error(error);
    }
  };

  const handleDeactivate = async (rateId: string) => {
    // TODO: API call to deactivate rate
    console.log("Deactivating rate:", rateId);
    setToast({ visible: true, type: "warning", message: "Deactivate functionality coming soon!" });
  };

  const handleActivate = async (rateId: string) => {
    // TODO: API call to activate rate
    console.log("Activating rate:", rateId);
    setToast({ visible: true, type: "info", message: "Activate functionality coming soon!" });
  };

  return (
    <div className="space-y-6">
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />

      {/* Entity Selection */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-text-primary whitespace-nowrap">
            Select Entity:
          </label>
          <Select
            value={selectedEntityId}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            disabled={entitiesLoading || entities.length === 0}
            className="flex-1 max-w-md"
          >
            <option value="">Select an entity...</option>
            {entities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name} ({entity.code})
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Per Diem Rates</h3>
          <p className="text-sm text-text-secondary">
            Manage per diem rates by designation and track effective dates
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={!selectedEntityId}
        >
          {showCreateForm ? (
            <>
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create Rate
            </>
          )}
        </Button>
      </div>

      {/* Info Banner */}
      <Card variant="bordered" padding="md">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-info flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="font-semibold text-text-primary mb-1">How Per Diem Rates Work</h4>
            <p className="text-sm text-text-secondary">
              Per diem rates are applied based on designation and calculation date. When a rate has
              an effective date, it will be used for all calculations from that date forward until a
              new rate is created. You can have multiple rates for the same designation with
              different effective dates to maintain historical accuracy.
            </p>
          </div>
        </div>
      </Card>

      {/* Create Rate Form */}
      {showCreateForm && (
        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Create New Per Diem Rate</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g., Field Staff, Manager, Director"
                required
              />

              <Input
                label="Rate Per Day"
                type="number"
                value={formData.ratePerDay}
                onChange={(e) => setFormData({ ...formData, ratePerDay: e.target.value })}
                placeholder="25000"
                required
              />

              <LabeledSelect
                label="Currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                options={[
                  { value: "RWF", label: "RWF - Rwandan Franc" },
                  { value: "USD", label: "USD - US Dollar" },
                  { value: "EUR", label: "EUR - Euro" },
                ]}
                required
              />

              <LabeledSelect
                label="Day/Night Rate"
                value={formData.dayNight}
                onChange={(e) => setFormData({ ...formData, dayNight: e.target.value })}
                options={[
                  { value: "day", label: "Day Rate" },
                  { value: "night", label: "Night Rate" },
                ]}
                required
              />

              <Input
                label="Effective Date"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" loading={createPerDiemRate.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Create Rate
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Rates List */}
      {!selectedEntityId ? (
        <Card variant="bordered">
          <div className="text-center py-12">
            <Info className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">Select an entity</h3>
            <p className="text-text-secondary">
              Please select an entity from the dropdown above to view and manage per diem rates.
            </p>
          </div>
        </Card>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="primary" />
        </div>
      ) : rates.length === 0 ? (
        <Card variant="bordered">
          <div className="text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No per diem rates configured
            </h3>
            <p className="text-text-secondary mb-4">
              Create your first per diem rate to enable per diem calculations.
            </p>
            {!showCreateForm && (
              <Button variant="primary" onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Rate
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Group rates by designation */}
          {}
          {Object.entries(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rates.reduce((acc: any, rate: any) => {
              if (!acc[rate.designation]) {
                acc[rate.designation] = [];
              }
              acc[rate.designation].push(rate);
              return acc;
            }, {})
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ).map(([designation, designationRates]: [string, any]) => (
            <Card key={designation} variant="bordered" padding="md">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-text-primary">{designation}</h3>
              </div>

              <div className="space-y-3">
                {}
                {designationRates
                  .sort(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (a: any, b: any) =>
                      new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()
                  )
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .map((rate: any, index: number) => (
                    <div
                      key={rate.id}
                      className="flex items-center justify-between p-4 bg-background-light rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-2xl font-bold text-text-primary">
                            {parseInt(rate.rate_per_day).toLocaleString()} {rate.currency}
                          </div>
                          {rate.is_active ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="default">Inactive</Badge>
                          )}
                          {index === 0 && rate.is_active && (
                            <Badge variant="warning">Current</Badge>
                          )}
                        </div>
                        <div className="text-sm text-text-secondary">
                          Effective from: {new Date(rate.effective_date).toLocaleDateString()}
                        </div>
                        {rate.created_at && (
                          <div className="text-xs text-text-tertiary mt-1">
                            Created: {new Date(rate.created_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        {rate.is_active ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivate(rate.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Deactivate
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleActivate(rate.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
