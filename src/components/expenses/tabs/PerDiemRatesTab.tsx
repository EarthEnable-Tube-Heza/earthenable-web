"use client";

/**
 * Per Diem Rates Tab (Admin Only)
 *
 * Per diem rate management with creation, editing, and effective date tracking
 */

import { useState } from "react";
import { Input, Button, LabeledSelect, Card, Spinner, Badge } from "@/src/components/ui";

export function PerDiemRatesTab() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    designation: "",
    ratePerDay: "",
    currency: "RWF",
    effectiveDate: new Date().toISOString().split("T")[0],
    isActive: true,
  });

  // Mock data - will be replaced with API call
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rates: any[] = [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: API call to create per diem rate
    console.log("Creating per diem rate:", formData);

    setTimeout(() => {
      setLoading(false);
      alert("Per diem rate created successfully!");
      setShowCreateForm(false);
      setFormData({
        designation: "",
        ratePerDay: "",
        currency: "RWF",
        effectiveDate: new Date().toISOString().split("T")[0],
        isActive: true,
      });
    }, 1000);
  };

  const handleDeactivate = async (rateId: string) => {
    if (!confirm("Are you sure you want to deactivate this rate?")) return;

    // TODO: API call to deactivate rate
    console.log("Deactivating rate:", rateId);
    alert("Rate deactivated successfully!");
  };

  const handleActivate = async (rateId: string) => {
    // TODO: API call to activate rate
    console.log("Activating rate:", rateId);
    alert("Rate activated successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Per Diem Rates</h3>
          <p className="text-sm text-text-secondary">
            Manage per diem rates by designation and track effective dates
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "❌ Cancel" : "➕ Create Rate"}
        </Button>
      </div>

      {/* Info Banner */}
      <Card variant="bordered" padding="md">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
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
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            ➕ Create New Per Diem Rate
          </h3>
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

              <Input
                label="Effective Date"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" loading={loading}>
                💾 Create Rate
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Rates List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="primary" />
        </div>
      ) : rates.length === 0 ? (
        <Card variant="bordered">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No per diem rates configured
            </h3>
            <p className="text-text-secondary mb-4">
              Create your first per diem rate to enable per diem calculations.
            </p>
            {!showCreateForm && (
              <Button variant="primary" onClick={() => setShowCreateForm(true)}>
                ➕ Create Rate
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
              <h3 className="text-lg font-semibold text-text-primary mb-4">👤 {designation}</h3>

              <div className="space-y-3">
                {}
                {designationRates
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .sort(
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
                          ✏️ Edit
                        </Button>
                        {rate.is_active ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivate(rate.id)}
                          >
                            🚫 Deactivate
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleActivate(rate.id)}>
                            ✅ Activate
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
