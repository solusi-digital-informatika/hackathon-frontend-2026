import type { ApiErrorResponse, ApiFieldError } from '../../modules/projects/types/project.types';

export class ApiClientError extends Error {
  public status: number;
  public code: string;
  public fields: ApiFieldError[];
  public isNetworkError: boolean;

  constructor(options: {
    status: number;
    code: string;
    message: string;
    fields?: ApiFieldError[];
    isNetworkError?: boolean;
  }) {
    super(options.message);
    this.name = 'ApiClientError';
    this.status = options.status;
    this.code = options.code;
    this.fields = options.fields || [];
    this.isNetworkError = options.isNetworkError || false;
  }
}

export async function requestJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options?.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...options?.headers,
      },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    const errorMsg = err instanceof Error ? err.message : 'Network request failed';
    throw new ApiClientError({
      status: 0,
      code: 'network_error',
      message: errorMsg || 'Unable to connect to server. Please check your network connection.',
      isNetworkError: true,
    });
  }

  if (!response.ok) {
    let errorDetail: ApiErrorResponse | null = null;
    try {
      errorDetail = (await response.json()) as ApiErrorResponse;
    } catch {
      // Non-JSON error body fallback
    }

    const code = errorDetail?.error?.code || (response.status === 404 ? 'not_found' : 'server_error');
    const message =
      errorDetail?.error?.message ||
      (response.status === 404
        ? 'Resource not found or inaccessible'
        : response.status >= 500
          ? 'An unexpected server error occurred.'
          : 'Request failed.');
    const fields = errorDetail?.error?.fields || [];

    throw new ApiClientError({
      status: response.status,
      code,
      message,
      fields,
      isNetworkError: false,
    });
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}
