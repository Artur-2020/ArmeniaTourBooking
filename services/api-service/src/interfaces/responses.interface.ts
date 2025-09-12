export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}

export interface ServiceErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: Array<{
    field: string;
    errors: string[];
  }>;
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T> extends ServiceResponse<T> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ValidationError {
  field: string;
  errors: string[];
}

export interface ErrorResponse extends ServiceErrorResponse {
  errors: ValidationError[];
} 