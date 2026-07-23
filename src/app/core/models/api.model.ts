export interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
  errors?: Record<string, string[] | string>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  validationErrors?: Record<string, string[]>;
  details?: unknown;
}

export interface QueryParams {
  [key: string]: string | number | boolean | null | undefined | Array<string | number>;
}
