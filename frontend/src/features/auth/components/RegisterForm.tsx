'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { registerSchema, type RegisterFormValues } from '@/shared/schemas/auth.schema';
import { useAuth } from '@/shared/hooks/useAuth';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { FormError } from '@/shared/components/common/FormError';
import { cn } from '@/shared/lib/cn';

const Req = () => (
  <span aria-hidden="true" className="text-destructive">
    {' '}*
  </span>
);

const TIPOS = [
  { value: 'FISICA', label: 'Persona física' },
  { value: 'MORAL', label: 'Persona moral' },
] as const;

export function RegisterForm() {
  const { register: registerUser, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { tipoPersona: 'FISICA' },
  });

  const tipoPersona = watch('tipoPersona');

  return (
    <form onSubmit={handleSubmit(registerUser)} className="flex flex-col gap-4" noValidate>
      <FormError message={error} />

      {/* Tipo de persona */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-foreground">
          Tipo de persona
          <Req />
        </legend>
        <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-input">
          {TIPOS.map(({ value, label }, i) => (
            <label
              key={value}
              className={cn(
                'flex cursor-pointer items-center justify-center px-3 py-2 text-sm font-medium transition-colors',
                i === 0 && 'border-r border-input',
                tipoPersona === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <input type="radio" value={value} className="sr-only" {...register('tipoPersona')} />
              {label}
            </label>
          ))}
        </div>
        {errors.tipoPersona && (
          <p role="alert" className="mt-1 text-xs text-destructive">{errors.tipoPersona.message}</p>
        )}
      </fieldset>

      {/* Nombre */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nombre">
          Nombre(s)
          <Req />
        </Label>
        <Input id="nombre" className="h-10" placeholder="Juan" autoComplete="given-name" {...register('nombre')} />
        {errors.nombre && <p role="alert" className="text-xs text-destructive">{errors.nombre.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="apellidoPaterno">
            Ap. paterno
            <Req />
          </Label>
          <Input
            id="apellidoPaterno"
            className="h-10"
            placeholder="García"
            autoComplete="family-name"
            {...register('apellidoPaterno')}
          />
          {errors.apellidoPaterno && (
            <p role="alert" className="text-xs text-destructive">{errors.apellidoPaterno.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="apellidoMaterno">
            Ap. materno
            <Req />
          </Label>
          <Input id="apellidoMaterno" className="h-10" placeholder="López" {...register('apellidoMaterno')} />
          {errors.apellidoMaterno && (
            <p role="alert" className="text-xs text-destructive">{errors.apellidoMaterno.message}</p>
          )}
        </div>
      </div>

      {/* Correo */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="correo-reg">
          Correo electrónico
          <Req />
        </Label>
        <Input
          id="correo-reg"
          type="email"
          autoComplete="email"
          placeholder="nombre@empresa.com"
          className="h-10"
          {...register('correo')}
        />
        {errors.correo && <p role="alert" className="text-xs text-destructive">{errors.correo.message}</p>}
      </div>

      {/* Contraseña */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contrasena-reg">
          Contraseña
          <Req />
        </Label>
        <div className="relative">
          <Input
            id="contrasena-reg"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            className="h-10 pr-10"
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
        {errors.contrasena ? (
          <p role="alert" className="text-xs text-destructive">{errors.contrasena.message}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Debe incluir mayúscula, minúscula, número y símbolo.</p>
        )}
      </div>

      {/* CURP y RFC */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="curp">
            CURP <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <Input id="curp" className="h-10" placeholder="XXXX000000XXXXXX00" {...register('curp')} />
          {errors.curp && <p role="alert" className="text-xs text-destructive">{errors.curp.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rfc">
            RFC <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <Input id="rfc" className="h-10" placeholder="XXXX000000XXX" {...register('rfc')} />
          {errors.rfc && <p role="alert" className="text-xs text-destructive">{errors.rfc.message}</p>}
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isLoading}
        aria-busy={isLoading}
        className="mt-2 h-10 w-full hover:bg-primary/90"
      >
        {isLoading ? 'Creando cuenta…' : 'Crear cuenta'}
      </Button>

      <p className="mt-1 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
