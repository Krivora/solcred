'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { loginSchema, type LoginFormValues } from '@/shared/schemas/auth.schema';
import { useAuth } from '@/shared/hooks/useAuth';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { FormError } from '@/shared/components/common/FormError';

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
    <form onSubmit={handleSubmit(login)} className="flex flex-col gap-4" noValidate>
      <FormError message={error} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="correo">Correo electrónico</Label>
        <Input
          id="correo"
          type="email"
          autoComplete="email"
          placeholder="nombre@empresa.com"
          className="h-10"
          aria-invalid={!!errors.correo}
          aria-describedby={errors.correo ? 'correo-error' : undefined}
          {...register('correo')}
        />
        {errors.correo && (
          <p id="correo-error" role="alert" className="text-xs text-destructive">
            {errors.correo.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contrasena">Contraseña</Label>
        <div className="relative">
          <Input
            id="contrasena"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Tu contraseña"
            className="h-10 pr-10"
            aria-invalid={!!errors.contrasena}
            aria-describedby={errors.contrasena ? 'contrasena-error' : undefined}
            {...register('contrasena')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.contrasena && (
          <p id="contrasena-error" role="alert" className="text-xs text-destructive">
            {errors.contrasena.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isLoading}
        aria-busy={isLoading}
        className="mt-2 h-10 w-full hover:bg-primary/90"
      >
        {isLoading ? 'Verificando…' : 'Iniciar sesión'}
      </Button>

      <p className="mt-1 text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{' '}
        <Link href="/registro" className="font-medium text-primary hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
