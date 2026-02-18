"use client";

/**
 * QuickBooks Integration Tab
 *
 * Admin tab for managing QuickBooks connections per entity.
 * Shows connection status, allows connecting/disconnecting,
 * testing connections, and triggering budget syncs.
 */

import { useState } from "react";
import { Button, Card, Badge, Spinner } from "@/src/components/ui";
import { useAuth } from "@/src/lib/auth";
import {
  useEntities,
  useQuickBooksStatus,
  useTestQuickBooksConnection,
  useDisconnectQuickBooks,
  useSyncQuickBooksBudgets,
  useQuickBooksSyncStatus,
} from "@/src/hooks/useExpenses";
import * as expenseAPI from "@/src/lib/api/expenseClient";

export function QuickBooksTab() {
  const { selectedEntityId } = useAuth();
  const { data: entitiesData, isLoading: loadingEntities } = useEntities();
  const {
    data: qbStatus,
    isLoading: loadingStatus,
    refetch: refetchStatus,
  } = useQuickBooksStatus(selectedEntityId || undefined);
  const { data: syncStatus, refetch: refetchSyncStatus } = useQuickBooksSyncStatus(
    selectedEntityId || undefined
  );

  const testConnection = useTestQuickBooksConnection();
  const disconnectQB = useDisconnectQuickBooks();
  const syncBudgets = useSyncQuickBooksBudgets();

  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [syncResult, setSyncResult] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const entities = entitiesData?.entities || [];
  const currentEntity = entities.find((e: expenseAPI.Entity) => e.id === selectedEntityId);

  const handleConnect = async () => {
    if (!selectedEntityId) return;
    try {
      const result = await expenseAPI.getQuickBooksAuthUrl(selectedEntityId);
      // Open QB auth URL in new window
      window.open(result.auth_url, "_blank", "width=600,height=800");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to get auth URL";
      setSyncResult({ type: "error", text: message });
    }
  };

  const handleDisconnect = async () => {
    if (!selectedEntityId) return;
    if (
      !confirm("Are you sure you want to disconnect QuickBooks? This will clear all stored tokens.")
    )
      return;

    try {
      await disconnectQB.mutateAsync(selectedEntityId);
      setSyncResult({ type: "success", text: "QuickBooks disconnected successfully" });
      refetchStatus();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to disconnect";
      setSyncResult({ type: "error", text: message });
    }
  };

  const handleTest = async () => {
    if (!selectedEntityId) return;
    setTestResult(null);

    try {
      const result = await testConnection.mutateAsync(selectedEntityId);
      setTestResult({ success: result.success, message: result.message });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Connection test failed";
      setTestResult({ success: false, message });
    }
  };

  const handleSyncBudgets = async () => {
    if (!selectedEntityId) return;
    setSyncResult(null);

    try {
      const result = await syncBudgets.mutateAsync({ entityId: selectedEntityId });
      setSyncResult({
        type: "success",
        text: `Budget sync complete: ${result.updated} updated, ${result.skipped} skipped${
          result.errors.length > 0 ? `, ${result.errors.length} errors` : ""
        }`,
      });
      refetchSyncStatus();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Budget sync failed";
      setSyncResult({ type: "error", text: message });
    }
  };

  if (loadingEntities || loadingStatus) {
    return <Spinner centered label="Loading QuickBooks configuration..." />;
  }

  const connected = qbStatus?.connected || false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary">QuickBooks Integration</h3>
        <p className="text-sm text-text-secondary mt-1">
          Connect your QuickBooks company for journal entries and budget sync
        </p>
      </div>

      {/* Entity Info */}
      {currentEntity && (
        <Card variant="bordered" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-text-primary">{currentEntity.name}</h4>
              <p className="text-sm text-text-secondary">
                Code: {currentEntity.code} | Currency: {currentEntity.currency}
              </p>
            </div>
            <Badge variant={connected ? "success" : "warning"} size="md">
              {connected ? "Connected" : "Not Connected"}
            </Badge>
          </div>
        </Card>
      )}

      {/* Messages */}
      {syncResult && (
        <div
          className={`p-3 rounded-lg text-sm ${
            syncResult.type === "success"
              ? "bg-success/10 text-success border border-success/20"
              : "bg-error/10 text-error border border-error/20"
          }`}
        >
          {syncResult.text}
        </div>
      )}

      {/* Connection Status */}
      <Card variant="bordered" padding="lg">
        <h4 className="font-semibold text-text-primary mb-4">Connection Status</h4>
        {connected ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-text-secondary block">Realm ID</span>
                <span className="font-medium">{qbStatus?.realmId || "N/A"}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Environment</span>
                <span className="font-medium capitalize">{qbStatus?.environment || "sandbox"}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Connected At</span>
                <span className="font-medium">
                  {qbStatus?.connectedAt
                    ? new Date(qbStatus.connectedAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-text-secondary block">Token Expires</span>
                <span className="font-medium">
                  {qbStatus?.tokenExpiresAt
                    ? new Date(qbStatus.tokenExpiresAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Test Result */}
            {testResult && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  testResult.success
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-error/10 text-error border border-error/20"
                }`}
              >
                {testResult.message}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                loading={testConnection.isPending}
              >
                Test Connection
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDisconnect}
                loading={disconnectQB.isPending}
              >
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-text-secondary mb-4">
              Connect this entity to QuickBooks to enable journal entry posting and budget sync.
            </p>
            <Button variant="primary" onClick={handleConnect}>
              Connect to QuickBooks
            </Button>
          </div>
        )}
      </Card>

      {/* Budget Sync (only when connected) */}
      {connected && (
        <Card variant="bordered" padding="lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold text-text-primary">Budget Sync</h4>
              <p className="text-sm text-text-secondary mt-1">
                Sync budget allocations from QuickBooks (runs daily automatically)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncBudgets}
              loading={syncBudgets.isPending}
            >
              Sync Now
            </Button>
          </div>
          {syncStatus && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-secondary block">Synced Budgets</span>
                <span className="font-medium">{syncStatus.syncedBudgetCount || 0}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Last Synced</span>
                <span className="font-medium">
                  {syncStatus.lastSyncedAt
                    ? new Date(syncStatus.lastSyncedAt).toLocaleString()
                    : "Never"}
                </span>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
