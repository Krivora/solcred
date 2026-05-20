export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

export const ok = <T>(message: string, data?: T): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const fail = (message: string, errors?: unknown): ApiResponse => ({
  success: false,
  message,
  errors,
});