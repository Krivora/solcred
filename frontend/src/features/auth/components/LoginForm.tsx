'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { loginSchema, type LoginFormValues } from '@/lib/schemas/auth.schemas';
import { useAuth } from '@/lib/hooks/useAuth';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { FormError } from '@/shared/components/ui/FormError';

export function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(login)} className="flex flex-col gap-5" noValidate>
      <FormError message={error} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="correo" className="text-sm font-medium text-[#1C2833]">
          Correo electrónico <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <Input
          id="correo"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          aria-invalid={!!errors.correo}
          aria-describedby={errors.correo ? 'correo-error' : undefined}
          {...register('correo')}
        />
        {errors.correo && (
          <p id="correo-error" role="alert" className="text-xs text-red-500">
            {errors.correo.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contrasena" className="text-sm font-medium text-[#1C2833]">
          Contraseña <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <Input
            id="contrasena"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.contrasena}
            aria-describedby={errors.contrasena ? 'contrasena-error' : undefined}
            {...register('contrasena')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7F8C8D] hover:text-[#1B4F72] transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.contrasena && (
          <p id="contrasena-error" role="alert" className="text-xs text-red-500">
            {errors.contrasena.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        className="w-full h-11 bg-[#1B4F72] hover:bg-[#154360] text-white rounded-xl mt-1"
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>

      <p className="text-center text-sm text-[#7F8C8D]">
        ¿No tienes cuenta?{' '}
        <Link href="/registro" className="text-[#1B4F72] font-medium hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </form>
  );
}