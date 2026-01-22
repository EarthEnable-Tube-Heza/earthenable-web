"use client";

/**
 * SMS Management Page
 *
 * Admin page for managing SMS settings, templates, and viewing logs.
 */

import { useState } from "react";
import {
  useSmsSettings,
  useSmsTemplates,
  useSmsLogs,
  useSmsStats,
  useEvaluationSmsConfigs,
} from "@/src/hooks/useSms";
import { useEntities } from "@/src/hooks/useExpenses";
import { Badge, Button, Card, Select, Spinner, Tooltip, PageHeader } from "@/src/components/ui";
import {
  getSmsStatusLabel,
  getSmsStatusColors,
  getLanguageLabel,
  getCategoryLabel,
  getRecipientTypeLabel,
} from "@/src/types/sms";
import { cn } from "@/src/lib/theme";
import { SmsSettingsModal } from "@/src/components/sms/SmsSettingsModal";
import { SmsTemplateModal } from "@/src/components/sms/SmsTemplateModal";
import { SmsLogDetailModal } from "@/src/components/sms/SmsLogDetailModal";
import { SendSmsModal } from "@/src/components/sms/SendSmsModal";
import { EvaluationConfigModal } from "@/src/components/sms/EvaluationConfigModal";

type TabType = "messages" | "templates" | "automations" | "logs" | "settings";

export default function SmsManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>("messages");
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");
  const [page, setPage] = useState(0);
  const limit = 20;

  // Modal states
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isLogDetailOpen, setIsLogDetailOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [isSendSmsOpen, setIsSendSmsOpen] = useState(false);
  const [isEvalConfigModalOpen, setIsEvalConfigModalOpen] = useState(false);
  const [selectedEvalConfigId, setSelectedEvalConfigId] = useState<string | null>(null);

  // Fetch entities
  const { data: entitiesData } = useEntities();
  const entities = entitiesData?.entities || [];

  // Set default entity if not selected
  if (!selectedEntityId && entities.length > 0) {
    setSelectedEntityId(entities[0].id);
  }

  // Fetch data based on selected entity
  const { data: smsSettings, isLoading: isLoadingSettings } = useSmsSettings(selectedEntityId);
  const { data: smsStats } = useSmsStats(selectedEntityId);
  const { data: templates, isLoading: isLoadingTemplates } = useSmsTemplates(
    selectedEntityId ? { entity_id: selectedEntityId } : undefined
  );
  const { data: logsData, isLoading: isLoadingLogs } = useSmsLogs({
    entity_id: selectedEntityId,
    skip: page * limit,
    limit,
  });
  const { data: evalConfigs, isLoading: isLoadingEvalConfigs } = useEvaluationSmsConfigs({
    entity_id: selectedEntityId,
  });

  const logs = logsData?.items || [];
  const totalLogs = logsData?.total || 0;
  const totalPages = Math.ceil(totalLogs / limit) || 1;

  const handleEditTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setIsTemplateModalOpen(true);
  };

  const handleCreateTemplate = () => {
    setSelectedTemplateId(null);
    setIsTemplateModalOpen(true);
  };

  const handleViewLog = (logId: string) => {
    setSelectedLogId(logId);
    setIsLogDetailOpen(true);
  };

  const handleEditEvalConfig = (configId: string) => {
    setSelectedEvalConfigId(configId);
    setIsEvalConfigModalOpen(true);
  };

  const handleCreateEvalConfig = () => {
    setSelectedEvalConfigId(null);
    setIsEvalConfigModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="SMS Management"
        description="Manage SMS settings, templates, and view delivery logs"
        pathLabels={{ sms: "SMS" }}
        actions={
          <div className="flex items-center gap-3">
            <Select
              value={selectedEntityId}
              onChange={(e) => {
                setSelectedEntityId(e.target.value);
                setPage(0);
              }}
              className="w-48"
            >
              <option value="">Select Entity</option>
              {entities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.name} ({entity.code})
                </option>
              ))}
            </Select>
            <Tooltip
              content={
                !selectedEntityId
                  ? "Please select an entity first"
                  : !smsSettings?.is_configured
                    ? "SMS is not configured. Go to Settings tab to configure API credentials."
                    : null
              }
              position="bottom"
            >
              <Button
                variant="primary"
                onClick={() => setIsSendSmsOpen(true)}
                disabled={!selectedEntityId || !smsSettings?.is_configured}
              >
                Send SMS
              </Button>
            </Tooltip>
          </div>
        }
      />

      {/* Stats Cards */}
      {selectedEntityId && smsStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card padding="md">
            <div className="text-sm text-text-secondary">Total Sent ({smsStats.period_days}d)</div>
            <div className="text-2xl font-bold text-text-primary">{smsStats.total_sent}</div>
          </Card>
          <Card padding="md">
            <div className="text-sm text-text-secondary">Delivered</div>
            <div className="text-2xl font-bold text-status-success">{smsStats.delivered}</div>
          </Card>
          <Card padding="md">
            <div className="text-sm text-text-secondary">Failed</div>
            <div className="text-2xl font-bold text-status-error">{smsStats.failed}</div>
          </Card>
          <Card padding="md">
            <div className="text-sm text-text-secondary">Delivery Rate</div>
            <div className="text-2xl font-bold text-text-primary">
              {smsStats.delivery_rate.toFixed(1)}%
            </div>
          </Card>
          <Card padding="md">
            <div className="text-sm text-text-secondary">Total Cost</div>
            <div className="text-2xl font-bold text-text-primary">
              {smsStats.currency} {smsStats.total_cost.toFixed(2)}
            </div>
          </Card>
        </div>
      )}

      {/* Settings Summary Card */}
      {selectedEntityId && (
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <span className="text-sm text-text-secondary">Status:</span>{" "}
                {smsSettings?.is_configured ? (
                  <Badge variant="success">Configured</Badge>
                ) : (
                  <Badge variant="warning">Not Configured</Badge>
                )}
              </div>
              {smsSettings?.is_configured ? (
                <>
                  <div>
                    <span className="text-sm text-text-secondary">Provider:</span>{" "}
                    <span className="font-medium">{smsSettings.provider}</span>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Sender ID:</span>{" "}
                    <span className="font-medium">{smsSettings.sender_id || "Default"}</span>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Daily Remaining:</span>{" "}
                    <span className="font-medium">
                      {smsSettings.daily_remaining} / {smsSettings.daily_limit}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-text-secondary">Mode:</span>{" "}
                    {smsSettings.use_sandbox ? (
                      <Badge variant="warning" size="sm">
                        Sandbox
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        Production
                      </Badge>
                    )}
                  </div>
                </>
              ) : smsSettings ? (
                <div className="text-sm text-text-secondary">
                  <span className="text-status-warning font-medium">Missing: </span>
                  {[
                    !smsSettings.api_username && "API Username",
                    !smsSettings.is_enabled && "SMS not enabled",
                  ]
                    .filter(Boolean)
                    .join(", ") || "API Key not set"}
                </div>
              ) : (
                <div className="text-sm text-text-secondary">
                  No settings configured for this entity yet.
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsSettingsModalOpen(true)}>
              {smsSettings?.is_configured ? "Edit Settings" : "Configure SMS"}
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b border-border-light">
        <nav className="flex gap-4">
          {(["messages", "templates", "automations", "logs", "settings"] as TabType[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-2 px-1 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                )}
              >
                {tab === "messages" && "Messages"}
                {tab === "templates" && "Templates"}
                {tab === "automations" && "Automations"}
                {tab === "logs" && "Logs"}
                {tab === "settings" && "Settings"}
              </button>
            )
          )}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "messages" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-text-primary">Recent Messages</h2>
          </div>

          {isLoadingLogs ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : logs.length === 0 ? (
            <Card padding="lg" className="text-center">
              <p className="text-text-secondary">No messages sent yet.</p>
              <p className="text-sm text-text-secondary mt-1">
                Send your first SMS using the &quot;Send SMS&quot; button above.
              </p>
            </Card>
          ) : (
            <div className="bg-white rounded-lg border border-border-light overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-background-light border-b border-border-light">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">
                      Recipient
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Message</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Cost</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Sent</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const statusColors = getSmsStatusColors(log.status);
                    return (
                      <tr
                        key={log.id}
                        className="border-b border-border-light hover:bg-background-light cursor-pointer"
                        onClick={() => handleViewLog(log.id)}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-text-primary">{log.recipient_phone}</div>
                          {log.recipient_name && (
                            <div className="text-xs text-text-secondary">{log.recipient_name}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div
                            className="text-text-primary truncate max-w-[250px]"
                            title={log.message_body}
                          >
                            {log.message_body.substring(0, 60)}
                            {log.message_body.length > 60 ? "..." : ""}
                          </div>
                          {log.template_code && (
                            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-text-secondary mt-1 inline-block">
                              {log.template_code}
                            </code>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={cn(statusColors.bg, statusColors.text)} size="sm">
                            {getSmsStatusLabel(log.status)}
                          </Badge>
                          {log.failure_reason && (
                            <div
                              className="text-xs text-status-error mt-1 max-w-[150px] truncate"
                              title={log.failure_reason}
                            >
                              {log.failure_reason}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {log.cost && log.currency ? (
                            <span>
                              {log.currency} {log.cost.toFixed(4)}
                            </span>
                          ) : (
                            <span className="text-text-secondary">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-text-secondary">
                            {log.sent_at
                              ? new Date(log.sent_at).toLocaleString()
                              : new Date(log.created_at).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewLog(log.id);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {logs.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-text-secondary">
                Showing {page * limit + 1} to {Math.min((page + 1) * limit, totalLogs)} of{" "}
                {totalLogs}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-text-secondary">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "templates" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-text-primary">SMS Templates</h2>
            <Button variant="primary" size="sm" onClick={handleCreateTemplate}>
              Create Template
            </Button>
          </div>

          {isLoadingTemplates ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : !templates || templates.length === 0 ? (
            <Card padding="lg" className="text-center">
              <p className="text-text-secondary">No templates found for this entity.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={handleCreateTemplate}>
                Create First Template
              </Button>
            </Card>
          ) : (
            <div className="bg-white rounded-lg border border-border-light overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-background-light border-b border-border-light">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Code</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">
                      Language
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr
                      key={template.id}
                      className="border-b border-border-light hover:bg-background-light"
                    >
                      <td className="py-3 px-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {template.code}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-text-primary">{template.name}</div>
                        {template.description && (
                          <div className="text-xs text-text-secondary truncate max-w-[200px]">
                            {template.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="default" size="sm">
                          {getLanguageLabel(template.language)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {template.category && (
                          <Badge variant="default" size="sm">
                            {getCategoryLabel(template.category)}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {template.is_active ? (
                          <Badge variant="success" size="sm">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="default" size="sm">
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTemplate(template.id)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "automations" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-text-primary">SMS Automations</h2>
              <p className="text-sm text-text-secondary mt-1">
                Configure automatic SMS notifications for evaluation task completions
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={handleCreateEvalConfig}>
              Create Automation
            </Button>
          </div>

          {isLoadingEvalConfigs ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : !evalConfigs || evalConfigs.length === 0 ? (
            <Card padding="lg" className="text-center">
              <p className="text-text-secondary">No automations configured for this entity.</p>
              <p className="text-sm text-text-secondary mt-1">
                Create an automation to send SMS when evaluation tasks are completed.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={handleCreateEvalConfig}>
                Create First Automation
              </Button>
            </Card>
          ) : (
            <div className="bg-white rounded-lg border border-border-light overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-background-light border-b border-border-light">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">
                      Task Subject
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">
                      Recipient
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">
                      Pass Template
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">
                      Fail Template
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {evalConfigs.map((config) => (
                    <tr
                      key={config.id}
                      className="border-b border-border-light hover:bg-background-light"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-text-primary">
                          {config.task_subject?.name || "Unknown Subject"}
                        </div>
                        {config.qa_subject_mapping && (
                          <div className="text-xs text-text-secondary">
                            QA: {config.qa_subject_mapping}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="default" size="sm">
                          {getRecipientTypeLabel(config.recipient_type)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {config.pass_template ? (
                          <div>
                            <code className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                              {config.pass_template.code}
                            </code>
                            <div className="text-xs text-text-secondary mt-1">
                              {getLanguageLabel(config.pass_template.language)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-text-secondary text-xs">Default</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {config.fail_template ? (
                          <div>
                            <code className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                              {config.fail_template.code}
                            </code>
                            <div className="text-xs text-text-secondary mt-1">
                              {getLanguageLabel(config.fail_template.language)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-text-secondary text-xs">Default</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {config.is_enabled ? (
                          <Badge variant="success" size="sm">
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="default" size="sm">
                            Disabled
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEvalConfig(config.id)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "logs" && (
        <div>
          <h2 className="text-lg font-medium text-text-primary mb-4">SMS Logs</h2>

          {isLoadingLogs ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : logs.length === 0 ? (
            <Card padding="lg" className="text-center">
              <p className="text-text-secondary">No SMS logs found.</p>
            </Card>
          ) : (
            <>
              <div className="bg-white rounded-lg border border-border-light overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-background-light border-b border-border-light">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">
                        Recipient
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">
                        Template
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Cost</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">Sent</th>
                      <th className="text-left py-3 px-4 font-medium text-text-secondary">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => {
                      const statusColors = getSmsStatusColors(log.status);
                      return (
                        <tr
                          key={log.id}
                          className="border-b border-border-light hover:bg-background-light cursor-pointer"
                          onClick={() => handleViewLog(log.id)}
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium text-text-primary">
                              {log.recipient_phone}
                            </div>
                            {log.recipient_name && (
                              <div className="text-xs text-text-secondary">
                                {log.recipient_name}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {log.template_code ? (
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {log.template_code}
                              </code>
                            ) : (
                              <span className="text-text-secondary">Custom</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={cn(statusColors.bg, statusColors.text)} size="sm">
                              {getSmsStatusLabel(log.status)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {log.cost && log.currency ? (
                              <span>
                                {log.currency} {log.cost.toFixed(4)}
                              </span>
                            ) : (
                              <span className="text-text-secondary">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-text-secondary">
                              {log.sent_at
                                ? new Date(log.sent_at).toLocaleString()
                                : new Date(log.created_at).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewLog(log.id);
                              }}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-text-secondary">
                  Showing {page * limit + 1} to {Math.min((page + 1) * limit, totalLogs)} of{" "}
                  {totalLogs}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-text-secondary">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div>
          <h2 className="text-lg font-medium text-text-primary mb-4">SMS Settings</h2>

          {isLoadingSettings ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : !smsSettings ? (
            <Card padding="lg" className="text-center">
              <p className="text-text-secondary mb-4">SMS is not configured for this entity.</p>
              <Button variant="primary" onClick={() => setIsSettingsModalOpen(true)}>
                Configure SMS
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card padding="md">
                <h3 className="font-medium text-text-primary mb-4">Provider Configuration</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Provider</span>
                    <span className="font-medium">{smsSettings.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Username</span>
                    <span className="font-medium">{smsSettings.api_username || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Sender ID</span>
                    <span className="font-medium">{smsSettings.sender_id || "Default"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Short Code</span>
                    <span className="font-medium">{smsSettings.short_code || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Mode</span>
                    {smsSettings.use_sandbox ? (
                      <Badge variant="warning" size="sm">
                        Sandbox
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        Production
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Enabled</span>
                    {smsSettings.is_enabled ? (
                      <Badge variant="success" size="sm">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="default" size="sm">
                        No
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>

              <Card padding="md">
                <h3 className="font-medium text-text-primary mb-4">Rate Limits</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Daily Limit</span>
                    <span className="font-medium">{smsSettings.daily_limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Daily Sent</span>
                    <span className="font-medium">{smsSettings.daily_sent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Daily Remaining</span>
                    <span className="font-medium text-status-success">
                      {smsSettings.daily_remaining}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Monthly Limit</span>
                    <span className="font-medium">{smsSettings.monthly_limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Monthly Sent</span>
                    <span className="font-medium">{smsSettings.monthly_sent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Monthly Remaining</span>
                    <span className="font-medium text-status-success">
                      {smsSettings.monthly_remaining}
                    </span>
                  </div>
                </div>
              </Card>

              <Card padding="md">
                <h3 className="font-medium text-text-primary mb-4">Cost Tracking</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Cost per SMS</span>
                    <span className="font-medium">
                      {smsSettings.currency} {smsSettings.cost_per_sms.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Spent Today</span>
                    <span className="font-medium">
                      {smsSettings.currency} {smsSettings.total_spent_today.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Spent This Month</span>
                    <span className="font-medium">
                      {smsSettings.currency} {smsSettings.total_spent_month.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Budget Alert</span>
                    <span className="font-medium">{smsSettings.budget_alert_threshold}%</span>
                  </div>
                </div>
              </Card>

              <Card padding="md">
                <h3 className="font-medium text-text-primary mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsSettingsModalOpen(true)}
                  >
                    Edit Settings
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <SmsSettingsModal
        entityId={selectedEntityId}
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <SmsTemplateModal
        entityId={selectedEntityId}
        templateId={selectedTemplateId}
        isOpen={isTemplateModalOpen}
        onClose={() => {
          setIsTemplateModalOpen(false);
          setSelectedTemplateId(null);
        }}
      />

      <SmsLogDetailModal
        logId={selectedLogId}
        isOpen={isLogDetailOpen}
        onClose={() => {
          setIsLogDetailOpen(false);
          setSelectedLogId(null);
        }}
      />

      <SendSmsModal
        entityId={selectedEntityId}
        isOpen={isSendSmsOpen}
        onClose={() => setIsSendSmsOpen(false)}
      />

      <EvaluationConfigModal
        entityId={selectedEntityId}
        configId={selectedEvalConfigId}
        isOpen={isEvalConfigModalOpen}
        onClose={() => {
          setIsEvalConfigModalOpen(false);
          setSelectedEvalConfigId(null);
        }}
      />
    </div>
  );
}
