'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth';
import { ApiError } from '../api/client';
import type { LoginFormValues, RegisterFormValues } from '../schemas/auth.schemas';

interface UseAuthReturn {
  isLoading: boolean;
  error: string | null;
  login: (values: LoginFormValues) => Promise<void>;
  register: (values: RegisterFormValues) => Promise<void>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const { setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (values: LoginFormValues): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.login(values);
      setAuth(data.usuario, data.token);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (values: RegisterFormValues): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        ...values,
        curp: values.curp || undefined,
        rfc: values.rfc || undefined,
      };
      await authApi.registro(payload);
      router.push('/login?registered=true');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    clearAuth();
    router.push('/login');
  };

  return { isLoading, error, login, register, logout };
}