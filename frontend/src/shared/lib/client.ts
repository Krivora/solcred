const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
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

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new ApiError(
      response.status,
      json.message ?? 'Error inesperado',
      json.errors,
    );
  }

  return json.data as T;
}

// ── Helper autenticado ─────────────────────────────────────
// Lee el token del store de Zustand fuera de React y lo inyecta automáticamente
export async function apiAuth<T>(
  endpoint: string,
  options: Omit<RequestOptions, 'token'> = {},
): Promise<T> {
  // Zustand guarda el estado en localStorage con persist
  // getState() funciona fuera de componentes
  const { useAuthStore } = await import('@/shared/lib/store/auth.store');
  const token = useAuthStore.getState().token;

  if (!token) {
    throw new ApiError(401, 'No autorizado');
  }

  return apiRequest<T>(endpoint, { ...options, token });
}