'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { registerSchema, type RegisterFormValues } from '@/lib/schemas/auth.schemas';
import { useAuth } from '@/lib/hooks/useAuth';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { FormError } from '@/shared/components/ui/FormError';

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

      {/* Tipo persona */}
      <fieldset>
        <legend className="text-sm font-medium text-[#1C2833] mb-2">
          Tipo de persona <span className="text-red-500" aria-hidden="true">*</span>
        </legend>
        <div className="flex gap-3">
          {(['FISICA', 'MORAL'] as const).map((tipo) => (
            <label
              key={tipo}
              className={`flex-1 flex items-center justify-center h-10 rounded-xl border cursor-pointer text-sm font-medium transition-all duration-150 ${
                tipoPersona === tipo
                  ? 'bg-[#1B4F72] text-white border-[#1B4F72]'
                  : 'border-[#D5D8DC] text-[#1C2833] hover:border-[#1B4F72]/40'
              }`}
            >
              <input type="radio" value={tipo} className="sr-only" {...register('tipoPersona')} />
              {tipo === 'FISICA' ? 'Persona Física' : 'Persona Moral'}
            </label>
          ))}
        </div>
        {errors.tipoPersona && (
          <p role="alert" className="text-xs text-red-500 mt-1">{errors.tipoPersona.message}</p>
        )}
      </fieldset>

      {/* Nombre */}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nombre" className="text-sm font-medium text-[#1C2833]">
          Nombre(s) <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <Input id="nombre" placeholder="Juan" autoComplete="given-name" {...register('nombre')} />
        {errors.nombre && <p role="alert" className="text-xs text-red-500">{errors.nombre.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="apellidoPaterno" className="text-sm font-medium text-[#1C2833]">
            Ap. paterno <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <Input id="apellidoPaterno" placeholder="García" autoComplete="family-name" {...register('apellidoPaterno')} />
          {errors.apellidoPaterno && <p role="alert" className="text-xs text-red-500">{errors.apellidoPaterno.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="apellidoMaterno" className="text-sm font-medium text-[#1C2833]">
            Ap. materno <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <Input id="apellidoMaterno" placeholder="López" {...register('apellidoMaterno')} />
          {errors.apellidoMaterno && <p role="alert" className="text-xs text-red-500">{errors.apellidoMaterno.message}</p>}
        </div>
      </div>

      {/* Correo */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="correo-reg" className="text-sm font-medium text-[#1C2833]">
          Correo electrónico <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <Input id="correo-reg" type="email" autoComplete="email" placeholder="tu@correo.com" {...register('correo')} />
        {errors.correo && <p role="alert" className="text-xs text-red-500">{errors.correo.message}</p>}
      </div>

      {/* Contraseña */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contrasena-reg" className="text-sm font-medium text-[#1C2833]">
          Contraseña <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <Input
            id="contrasena-reg"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Mín. 8 caracteres"
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
        {errors.contrasena
          ? <p role="alert" className="text-xs text-red-500">{errors.contrasena.message}</p>
          : <p className="text-xs text-[#7F8C8D]">Debe incluir mayúscula, minúscula, número y símbolo</p>
        }
      </div>

      {/* CURP y RFC */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="curp" className="text-sm font-medium text-[#1C2833]">CURP <span className="text-[#7F8C8D] font-normal">(opcional)</span></label>
          <Input id="curp" placeholder="XXXX000000XXXXXX00" {...register('curp')} />
          {errors.curp && <p role="alert" className="text-xs text-red-500">{errors.curp.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rfc" className="text-sm font-medium text-[#1C2833]">RFC <span className="text-[#7F8C8D] font-normal">(opcional)</span></label>
          <Input id="rfc" placeholder="XXXX000000XXX" {...register('rfc')} />
          {errors.rfc && <p role="alert" className="text-xs text-red-500">{errors.rfc.message}</p>}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        className="w-full h-11 bg-[#1B4F72] hover:bg-[#154360] text-white rounded-xl mt-1"
      >
        {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>

      <p className="text-center text-sm text-[#7F8C8D]">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-[#1B4F72] font-medium hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}