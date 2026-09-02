import type { ApiResponse } from '@/shared/types/api';
import type { LoginResponseData } from '@/shared/types/auth.types';

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
    /** Código del backend (p. ej. "TOKEN_EXPIRADO", "REFRESH_REUSO"). */
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseErrorResponse(response: Response): Promise<never> {
  let json: Partial<ApiResponse<unknown>> | null = null;
  try {
    json = await response.json();
  } catch {
    // el backend puede responder sin body (ej. 413 de un proxy) — no truena
  }
  throw new ApiError(
    response.status,
    json?.message ?? 'Error inesperado',
    Array.isArray(json?.errors) ? (json.errors as string[]) : undefined,
    typeof json?.code === 'string' ? json.code : undefined,
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
    // Necesario para que viaje/reciba la cookie httpOnly del refresh token.
    credentials: 'include',
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  const contentType = response.headers.get('content-type') ?? '';

  // Descarga de archivos (PDF): no es JSON, regresamos el blob crudo.
  if (!contentType.includes('application/json')) {
    return (await response.blob()) as unknown as T;
  }

  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new ApiError(
      response.status,
      json.message ?? 'Error inesperado',
      Array.isArray(json.errors) ? (json.errors as string[]) : undefined,
      typeof json.code === 'string' ? json.code : undefined,
    );
  }

  return json.data as T;
}

// ── Refresh transparente del access token ──────────────────
//
// El access token vive ~15 min. Cuando expira, el backend responde 401 y el
// cliente intenta UNA renovación con la cookie httpOnly (`/auth/refresh`),
// que rota el refresh token y devuelve un access token nuevo. Si la
// renovación falla, se cierra la sesión y se manda a /login.

/** Promesa única en vuelo: varias peticiones que fallan a la vez comparten un solo refresh. */
let refreshEnVuelo: Promise<string> | null = null;

async function renovarAccessToken(): Promise<string> {
  if (refreshEnVuelo) return refreshEnVuelo;

  refreshEnVuelo = (async () => {
    const { useAuthStore } = await import('@/shared/stores/auth.store');
    try {
      const data = await apiRequest<LoginResponseData>('/auth/refresh', {
        method: 'POST',
      });
      useAuthStore.getState().setAuth(data.usuario, data.token);
      return data.token;
    } finally {
      refreshEnVuelo = null;
    }
  })();

  return refreshEnVuelo;
}

async function cerrarSesionPorFallo(): Promise<void> {
  const { useAuthStore } = await import('@/shared/stores/auth.store');
  useAuthStore.getState().clearAuth();
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login?expired=true';
  }
}

// ── Helper autenticado ─────────────────────────────────────
export async function apiAuth<T>(
  endpoint: string,
  options: Omit<RequestOptions, 'token'> = {},
): Promise<T> {
  const { useAuthStore } = await import('@/shared/stores/auth.store');
  const token = useAuthStore.getState().token;

  if (!token) {
    throw new ApiError(401, 'No autorizado');
  }

  try {
    return await apiRequest<T>(endpoint, { ...options, token });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    // Un 401 aquí = access token expirado/ inválido. Intentamos renovar una vez.
    let nuevoToken: string;
    try {
      nuevoToken = await renovarAccessToken();
    } catch {
      await cerrarSesionPorFallo();
      throw error;
    }

    try {
      return await apiRequest<T>(endpoint, { ...options, token: nuevoToken });
    } catch (reintento) {
      if (reintento instanceof ApiError && reintento.status === 401) {
        await cerrarSesionPorFallo();
      }
      throw reintento;
    }
  }
}
