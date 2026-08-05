const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: string[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseErrorResponse(response: Response): Promise<never> {
  let json: any = null;
  try {
    json = await response.json();
  } catch {
    // el backend puede responder sin body (ej. 413 de un proxy) — no truena
  }
  throw new ApiError(
    response.status,
    json?.message ?? 'Error inesperado',
    json?.errors,
  );
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, token, signal } = options;

  const isFormData = body instanceof FormData;

  const headers: HeadersInit = {};
  // Content-Type NO se fija manualmente para FormData: el navegador debe
  // generar el boundary del multipart automáticamente.
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  const contentType = response.headers.get('content-type') ?? '';

  // Descarga de archivos (PDF): no es JSON, regresamos el blob crudo.
  if (!contentType.includes('application/json')) {
    return (await response.blob()) as unknown as T;
  }

  const json = await response.json();

  if (!json.success) {
    throw new ApiError(response.status, json.message ?? 'Error inesperado', json.errors);
  }

  return json.data as T;
}

// ── Helper autenticado ─────────────────────────────────────
export async function apiAuth<T>(
  endpoint: string,
  options: Omit<RequestOptions, 'token'> = {},
): Promise<T> {
  const { useAuthStore } = await import('@/shared/lib/store/auth.store');
  const token = useAuthStore.getState().token;

  if (!token) {
    throw new ApiError(401, 'No autorizado');
  }

  return apiRequest<T>(endpoint, { ...options, token });
}