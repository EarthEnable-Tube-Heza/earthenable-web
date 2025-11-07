/**
 * Form Types
 *
 * TypeScript types for TaskSubject and FormYoula form mappings.
 */

/**
 * TaskSubject (evaluation type)
 */
export interface TaskSubject {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

/**
 * Create task subject request
 */
export interface CreateTaskSubject {
  name: string;
  description?: string | null;
  is_active?: boolean;
}

/**
 * Paginated task subjects response
 */
export interface PaginatedTaskSubjectsResponse {
  items: TaskSubject[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * TaskSubject form mapping
 */
export interface TaskSubjectForm {
  id: string;
  task_subject_id: string;
  task_subject_name: string;
  country_code: string | null;
  formyoula_form_id: string;
  is_default: boolean;
}

/**
 * Create form mapping request
 */
export interface CreateFormMapping {
  task_subject_id: string;
  country_code?: string | null;
  formyoula_form_id: string;
  is_default?: boolean;
}

/**
 * Update form mapping request
 */
export interface UpdateFormMapping {
  formyoula_form_id: string;
}

/**
 * Paginated form mappings response
 */
export interface PaginatedFormMappingsResponse {
  items: TaskSubjectForm[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}
