export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
  /** Código legible por el cliente (solo en respuestas de error). */
  code?: string;
}

export const ok = <T>(message: string, data?: T): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const fail = (
  message: string,
  errors?: unknown,
  code?: string
): ApiResponse => ({
  success: false,
  message,
  errors,
  ...(code ? { code } : {}),
});
