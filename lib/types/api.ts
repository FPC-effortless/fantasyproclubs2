export interface ApiResponse<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiRequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
  pagination?: PaginationParams;
}

export function createApiResponse<T>(
  data: T | null,
  error: { code: string; message: string; details?: unknown } | null = null,
  meta?: { page?: number; limit?: number; total?: number }
): ApiResponse<T> {
  return {
    data,
    error,
    meta
  };
}

export function createSuccessResponse<T>(data: T, meta?: { page?: number; limit?: number; total?: number }): ApiResponse<T> {
  return createApiResponse(data, null, meta);
}

export function createErrorResponse<T>(
  code: string,
  message: string,
  details?: unknown
): ApiResponse<T> {
  return createApiResponse<T>(null, { code, message, details });
} 
