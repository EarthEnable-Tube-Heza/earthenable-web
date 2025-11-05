/**
 * Form Types
 *
 * TypeScript types for TaskSubject and FormYoula form mappings.
 */

/**
 * TaskSubject form mapping
 */
export interface TaskSubjectForm {
  id: string;
  task_subject_id: string;
  task_subject_name: string;
  country_code: string;
  formyoula_form_id: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
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
}
