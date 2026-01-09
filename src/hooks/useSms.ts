/**
 * SMS Hooks
 *
 * React Query hooks for SMS management.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import {
  SmsSettingsCreate,
  SmsSettingsUpdate,
  SmsTemplateCreate,
  SmsTemplateUpdate,
  SmsTemplateFilters,
  SmsTemplatePreviewRequest,
  SmsLogsFilters,
  SendSmsRequest,
  SendBulkSmsRequest,
  TestSmsRequest,
  EvaluationSmsConfigCreate,
  EvaluationSmsConfigUpdate,
} from "@/src/types";

// ==================== Query Keys ====================

export const smsQueryKeys = {
  all: ["sms"] as const,
  settings: (entityId: string) => [...smsQueryKeys.all, "settings", entityId] as const,
  templates: (filters?: SmsTemplateFilters) => [...smsQueryKeys.all, "templates", filters] as const,
  template: (id: string) => [...smsQueryKeys.all, "template", id] as const,
  logs: (filters?: SmsLogsFilters) => [...smsQueryKeys.all, "logs", filters] as const,
  log: (id: string) => [...smsQueryKeys.all, "log", id] as const,
  stats: (entityId: string, days?: number) =>
    [...smsQueryKeys.all, "stats", entityId, days] as const,
  evaluationConfigs: (filters?: {
    entity_id?: string;
    task_subject_id?: string;
    is_enabled?: boolean;
  }) => [...smsQueryKeys.all, "evaluation-configs", filters] as const,
  evaluationConfig: (id: string) => [...smsQueryKeys.all, "evaluation-config", id] as const,
  taskSubjectsForSms: () => [...smsQueryKeys.all, "task-subjects"] as const,
};

// ==================== SMS Settings Hooks ====================

/**
 * Hook to get SMS settings for an entity
 */
export function useSmsSettings(entityId: string | undefined) {
  return useQuery({
    queryKey: smsQueryKeys.settings(entityId || ""),
    queryFn: () => apiClient.getSmsSettings(entityId!),
    enabled: !!entityId,
  });
}

/**
 * Hook to create SMS settings
 */
export function useCreateSmsSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SmsSettingsCreate) => apiClient.createSmsSettings(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: smsQueryKeys.settings(variables.entity_id),
      });
    },
  });
}

/**
 * Hook to update SMS settings
 */
export function useUpdateSmsSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entityId, data }: { entityId: string; data: SmsSettingsUpdate }) =>
      apiClient.updateSmsSettings(entityId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: smsQueryKeys.settings(variables.entityId),
      });
    },
  });
}

/**
 * Hook to test SMS settings
 */
export function useTestSmsSettings() {
  return useMutation({
    mutationFn: ({ entityId, data }: { entityId: string; data: TestSmsRequest }) =>
      apiClient.testSmsSettings(entityId, data),
  });
}

// ==================== SMS Template Hooks ====================

/**
 * Hook to get SMS templates with optional filters
 */
export function useSmsTemplates(filters?: SmsTemplateFilters) {
  return useQuery({
    queryKey: smsQueryKeys.templates(filters),
    queryFn: () => apiClient.getSmsTemplates(filters),
  });
}

/**
 * Hook to get a specific SMS template
 */
export function useSmsTemplate(templateId: string | undefined) {
  return useQuery({
    queryKey: smsQueryKeys.template(templateId || ""),
    queryFn: () => apiClient.getSmsTemplate(templateId!),
    enabled: !!templateId,
  });
}

/**
 * Hook to create SMS template
 */
export function useCreateSmsTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SmsTemplateCreate) => apiClient.createSmsTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: smsQueryKeys.templates(),
      });
    },
  });
}

/**
 * Hook to update SMS template
 */
export function useUpdateSmsTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: SmsTemplateUpdate }) =>
      apiClient.updateSmsTemplate(templateId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: smsQueryKeys.templates(),
      });
      queryClient.invalidateQueries({
        queryKey: smsQueryKeys.template(variables.templateId),
      });
    },
  });
}

/**
 * Hook to delete SMS template
 */
export function useDeleteSmsTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => apiClient.deleteSmsTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: smsQueryKeys.templates(),
      });
    },
  });
}

/**
 * Hook to preview SMS template
 */
export function usePreviewSmsTemplate() {
  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: SmsTemplatePreviewRequest }) =>
      apiClient.previewSmsTemplate(templateId, data),
  });
}

// ==================== SMS Logs Hooks ====================

/**
 * Hook to get SMS logs with pagination and filters
 */
export function useSmsLogs(filters?: SmsLogsFilters) {
  return useQuery({
    queryKey: smsQueryKeys.logs(filters),
    queryFn: () => apiClient.getSmsLogs(filters),
  });
}

/**
 * Hook to get a specific SMS log
 */
export function useSmsLog(logId: string | undefined) {
  return useQuery({
    queryKey: smsQueryKeys.log(logId || ""),
    queryFn: () => apiClient.getSmsLog(logId!),
    enabled: !!logId,
  });
}

// ==================== SMS Stats Hook ====================

/**
 * Hook to get SMS statistics for an entity
 */
export function useSmsStats(entityId: string | undefined, days: number = 30) {
  return useQuery({
    queryKey: smsQueryKeys.stats(entityId || "", days),
    queryFn: () => apiClient.getSmsStats(entityId!, days),
    enabled: !!entityId,
  });
}

// ==================== Send SMS Hooks ====================

/**
 * Hook to send SMS
 */
export function useSendSms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendSmsRequest) => apiClient.sendSms(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: smsQueryKeys.logs(),
      });
      queryClient.invalidateQueries({
        queryKey: smsQueryKeys.stats(variables.entity_id),
      });
      queryClient.invalidateQueries({
        queryKey: smsQueryKeys.settings(variables.entity_id),
      });
    },
  });
}

/**
 * Hook to send bulk SMS
 */
export function useSendBulkSms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendBulkSmsRequest) => apiClient.sendBulkSms(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: smsQueryKeys.logs(),
      });
      queryClient.invalidateQueries({
        queryKey: smsQueryKeys.stats(variables.entity_id),
      });
      queryClient.invalidateQueries({
        queryKey: smsQueryKeys.settings(variables.entity_id),
      });
    },
  });
}

// ==================== Evaluation SMS Config Hooks ====================

/**
 * Hook to get evaluation SMS configs with optional filters
 */
export function useEvaluationSmsConfigs(filters?: {
  entity_id?: string;
  task_subject_id?: string;
  is_enabled?: boolean;
}) {
  return useQuery({
    queryKey: smsQueryKeys.evaluationConfigs(filters),
    queryFn: () => apiClient.getEvaluationSmsConfigs(filters),
    enabled: !!filters?.entity_id,
  });
}

/**
 * Hook to get a specific evaluation SMS config
 */
export function useEvaluationSmsConfig(configId: string | undefined) {
  return useQuery({
    queryKey: smsQueryKeys.evaluationConfig(configId || ""),
    queryFn: () => apiClient.getEvaluationSmsConfig(configId!),
    enabled: !!configId,
  });
}

/**
 * Hook to create evaluation SMS config
 */
export function useCreateEvaluationSmsConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EvaluationSmsConfigCreate) => apiClient.createEvaluationSmsConfig(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: smsQueryKeys.evaluationConfigs({ entity_id: variables.entity_id }),
      });
    },
  });
}

/**
 * Hook to update evaluation SMS config
 */
export function useUpdateEvaluationSmsConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ configId, data }: { configId: string; data: EvaluationSmsConfigUpdate }) =>
      apiClient.updateEvaluationSmsConfig(configId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: smsQueryKeys.evaluationConfigs(),
      });
    },
  });
}

/**
 * Hook to delete evaluation SMS config
 */
export function useDeleteEvaluationSmsConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (configId: string) => apiClient.deleteEvaluationSmsConfig(configId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: smsQueryKeys.evaluationConfigs(),
      });
    },
  });
}

/**
 * Hook to get task subjects for SMS config dropdown
 */
export function useTaskSubjectsForSms() {
  return useQuery({
    queryKey: smsQueryKeys.taskSubjectsForSms(),
    queryFn: () => apiClient.getTaskSubjectsForSms(),
  });
}
