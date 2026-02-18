"use client";

/**
 * Payment Accounts Tab (Admin Only)
 *
 * Manage configurable source payment accounts per entity
 */

import { useState } from "react";
import { Input, Button, Card, Spinner, Badge, Toast } from "@/src/components/ui";
import type { ToastType } from "@/src/components/ui/Toast";
import { Plus, XCircle, Save, CreditCard, Info } from "@/src/lib/icons";
import {
  usePaymentAccountsAdmin,
  useCreatePaymentAccount,
  useUpdatePaymentAccount,
} from "@/src/hooks/useExpenses";
import { useAuth } from "@/src/lib/auth";
import type { PaymentAccount } from "@/src/lib/api/expenseClient";

export function PaymentAccountsTab() {
  const { selectedEntityId } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    type: "success" as ToastType,
    message: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    accountNumber: "",
    bankName: "",
    description: "",
    isActive: true,
    displayOrder: 0,
  });

  const { data, isLoading } = usePaymentAccountsAdmin(selectedEntityId || undefined);
  const createAccount = useCreatePaymentAccount();
  const updateAccount = useUpdatePaymentAccount();

  const paymentAccounts = data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEntityId) return;

    try {
      await createAccount.mutateAsync({
        entityId: selectedEntityId,
        data: {
          name: formData.name,
          account_number: formData.accountNumber || undefined,
          bank_name: formData.bankName || undefined,
          description: formData.description || undefined,
          is_active: formData.isActive,
          display_order: formData.displayOrder,
        },
      });

      setToast({
        visible: true,
        type: "success",
        message: "Payment account created successfully!",
      });
      setShowCreateForm(false);
      setFormData({
        name: "",
        accountNumber: "",
        bankName: "",
        description: "",
        isActive: true,
        displayOrder: 0,
      });
    } catch (error) {
      setToast({
        visible: true,
        type: "error",
        message: "Failed to create payment account. Please try again.",
      });
      console.error(error);
    }
  };

  const handleToggleActive = async (account: PaymentAccount, newActive: boolean) => {
    if (!selectedEntityId) return;

    try {
      await updateAccount.mutateAsync({
        entityId: selectedEntityId,
        accountId: account.id,
        data: { is_active: newActive },
      });
      setToast({
        visible: true,
        type: "success",
        message: `Payment account "${account.name}" ${newActive ? "activated" : "deactivated"}.`,
      });
    } catch (error) {
      setToast({
        visible: true,
        type: "error",
        message: "Failed to update payment account.",
      });
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Payment Accounts</h3>
          <p className="text-sm text-text-secondary">
            Manage source payment accounts used when marking expenses as paid
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
              Create Account
            </>
          )}
        </Button>
      </div>

      {/* Info Banner */}
      <Card variant="bordered" padding="md">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-info flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="font-semibold text-text-primary mb-1">About Payment Accounts</h4>
            <p className="text-sm text-text-secondary">
              Payment accounts represent the source bank accounts or funds from which expenses are
              disbursed (e.g., &quot;Main Bank Account - KCB&quot;, &quot;Petty Cash&quot;,
              &quot;Mobile Money Float&quot;). These appear in the &quot;Mark as Paid&quot; form so
              finance can track which account was used for each payment.
            </p>
          </div>
        </div>
      </Card>

      {/* Create Form */}
      {showCreateForm && (
        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Create New Payment Account</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium text-text-primary">Account Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Account Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Bank Account - KCB"
                  required
                />

                <Input
                  label="Bank Name"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="e.g., KCB, Equity Bank"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Account Number"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="e.g., 1234567890"
                />

                <Input
                  label="Display Order"
                  type="number"
                  value={String(formData.displayOrder)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayOrder: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="paIsActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isActive: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-border-default"
                />
                <label htmlFor="paIsActive" className="text-sm text-text-primary">
                  Account is active
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" loading={createAccount.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Create Account
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Accounts List */}
      {!selectedEntityId ? (
        <Card variant="bordered">
          <div className="text-center py-12">
            <Info className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No entity selected</h3>
            <p className="text-text-secondary">
              Please select an entity from the header to view and manage payment accounts.
            </p>
          </div>
        </Card>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="primary" />
        </div>
      ) : paymentAccounts.length === 0 ? (
        <Card variant="bordered">
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No payment accounts configured
            </h3>
            <p className="text-text-secondary mb-4">
              Create your first payment account to track payment sources.
            </p>
            {!showCreateForm && (
              <Button variant="primary" onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paymentAccounts.map((account: PaymentAccount) => (
            <Card key={account.id} variant="bordered" padding="md">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-text-primary">{account.name}</h3>
                    {account.bank_name && (
                      <p className="text-sm text-text-secondary">{account.bank_name}</p>
                    )}
                  </div>
                </div>
                {account.is_active ? (
                  <Badge variant="success" size="sm">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="default" size="sm">
                    Inactive
                  </Badge>
                )}
              </div>

              {account.description && (
                <p className="text-sm text-text-secondary mb-3">{account.description}</p>
              )}

              <div className="bg-background-light p-3 rounded-lg mb-3 space-y-1">
                {account.account_number && (
                  <div className="text-sm">
                    <span className="text-text-secondary">Account #:</span>{" "}
                    <span className="font-medium text-text-primary font-mono">
                      {account.account_number}
                    </span>
                  </div>
                )}
                <div className="text-sm">
                  <span className="text-text-secondary">Display Order:</span>{" "}
                  <span className="font-medium text-text-primary">{account.display_order}</span>
                </div>
              </div>

              <div className="text-xs text-text-tertiary mb-3">
                Created: {new Date(account.created_at).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <Button
                  variant={account.is_active ? "outline" : "primary"}
                  size="sm"
                  onClick={() => handleToggleActive(account, !account.is_active)}
                  loading={updateAccount.isPending}
                >
                  {account.is_active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
