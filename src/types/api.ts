/**
 * API Types
 *
 * Common TypeScript types for API requests and responses.
 */

/**
 * Generic API error response
 */
export interface APIError {
  detail: string;
  status?: number;
  code?: string;
}

/**
 * Generic paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * API request status
 */
export enum APIRequestStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * Generic API request state
 */
export interface APIRequestState<T> {
  data: T | null;
  status: APIRequestStatus;
  error: APIError | null;
}

/**
 * Query parameters for listing endpoints
 */
export interface ListQueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * HTTP methods
 */
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API client configuration
 */
export interface APIClientConfig {
  baseURL: string;
  version: string;
  timeout?: number;
}

/**
 * Request interceptor function type
 */
export type RequestInterceptor = <T = unknown>(config: T) => T | Promise<T>;

/**
 * Response interceptor function type
 */
export type ResponseInterceptor = <T = unknown>(response: T) => T | Promise<T>;

/**
 * Error interceptor function type
 */
export type ErrorInterceptor = (error: unknown) => unknown | Promise<unknown>;
