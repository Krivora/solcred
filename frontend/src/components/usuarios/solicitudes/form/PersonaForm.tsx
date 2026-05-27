'use client'

import { useForm } from 'react-hook-form'
import type { DatosPersona, EstadoCivil, NivelEstudio } from '@/lib/types/solicitudes.types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { FormError } from '@/components/ui/FormError'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  title: string
  subtitle: string
  defaultValues?: Partial<DatosPersona>
  onSubmit: (data: DatosPersona) => void
  onBack: () => void
  loading: boolean
  error: string | null
  skipLabel?: string
  onSkip?: () => void
}

const ESTADOS_CIVILES: { value: EstadoCivil; label: string }[] = [
  { value: 'SOLTERO',     label: 'Soltero(a)' },
  { value: 'CASADO',      label: 'Casado(a)' },
  { value: 'DIVORCIADO',  label: 'Divorciado(a)' },
  { value: 'VIUDO',       label: 'Viudo(a)' },
  { value: 'UNION_LIBRE', label: 'Unión Libre' },
]

const NIVELES: { value: NivelEstudio; label: string }[] = [
  { value: 'PRIMARIA',     label: 'Primaria' },
  { value: 'SECUNDARIA',   label: 'Secundaria' },
  { value: 'PREPARATORIA', label: 'Preparatoria' },
  { value: 'TECNICO',      label: 'Técnico' },
  { value: 'LICENCIATURA', label: 'Licenciatura' },
  { value: 'MAESTRIA',     label: 'Maestría' },
  { value: 'DOCTORADO',    label: 'Doctorado' },
]

function Field({
  label,
  error,
  children,
  optional,
}: {
  label: string
  error?: string
  children: React.ReactNode
  optional?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {optional && <span className="text-muted-foreground text-xs ml-1">(opcional)</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function PersonaForm({
  title,
  subtitle,
  defaultValues,
  onSubmit,
  onBack,
  loading,
  error,
  skipLabel,
  onSkip,
}: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DatosPersona>({
    defaultValues: defaultValues ?? {},
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      </div>

      {/* Datos personales */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Datos personales
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Nombre(s)" error={errors.nombre?.message}>
            <Input
              {...register('nombre', { required: 'Requerido', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
              placeholder="Juan"
            />
          </Field>
          <Field label="Apellido paterno" error={errors.apellidoPaterno?.message}>
            <Input
              {...register('apellidoPaterno', { required: 'Requerido' })}
              placeholder="García"
            />
          </Field>
          <Field label="Apellido materno" error={errors.apellidoMaterno?.message}>
            <Input
              {...register('apellidoMaterno', { required: 'Requerido' })}
              placeholder="López"
            />
          </Field>
          <Field label="CURP" error={errors.curp?.message} optional>
            <Input
              {...register('curp', {
                pattern: { value: /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$/, message: 'CURP inválida' },
              })}
              placeholder="XXXX000000HXXXXXX00"
              className="uppercase"
              maxLength={18}
            />
          </Field>
          <Field label="RFC" error={errors.rfc?.message} optional>
            <Input
              {...register('rfc', {
                pattern: { value: /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/, message: 'RFC inválido' },
              })}
              placeholder="XXXX000000XXX"
              className="uppercase"
              maxLength={13}
            />
          </Field>
          <Field label="Estado civil" optional>
            <Select
              value={watch('estadoCivil') ?? ''}
              onValueChange={(v) => setValue('estadoCivil', v as EstadoCivil)}
            >
              <SelectTrigger className="w-full"><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent>
                {ESTADOS_CIVILES.map((e) => (
                  <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Nivel de estudios" optional>
            <Select
              value={watch('nivelEstudio') ?? ''}
              onValueChange={(v) => setValue('nivelEstudio', v as NivelEstudio)}
            >
              <SelectTrigger className="w-full"><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent>
                {NIVELES.map((n) => (
                  <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Universidad" optional>
            <Input {...register('universidad')} placeholder="Nombre de institución" />
          </Field>
        </div>
      </div>

      <Separator />

      {/* Contacto */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Contacto
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Teléfono" error={errors.telefono?.message} optional>
            <Input
              {...register('telefono', {
                pattern: { value: /^[0-9]{10}$/, message: '10 dígitos' },
              })}
              placeholder="6441234567"
              maxLength={10}
            />
          </Field>
          <Field label="Celular" error={errors.celular?.message} optional>
            <Input
              {...register('celular', {
                pattern: { value: /^[0-9]{10}$/, message: '10 dígitos' },
              })}
              placeholder="6441234567"
              maxLength={10}
            />
          </Field>
          <Field label="Correo electrónico" error={errors.correo?.message} optional>
            <Input
              {...register('correo', {
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' },
              })}
              type="email"
              placeholder="correo@ejemplo.com"
            />
          </Field>
        </div>
      </div>

      <Separator />

      {/* Domicilio */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Domicilio
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Field label="Calle" optional>
              <Input {...register('calle')} placeholder="Av. Principal" />
            </Field>
          </div>
          <Field label="Núm. exterior" optional>
            <Input {...register('numeroExterior')} placeholder="123" />
          </Field>
          <Field label="Núm. interior" optional>
            <Input {...register('numeroInterior')} placeholder="A" />
          </Field>
          <Field label="Colonia" optional>
            <Input {...register('colonia')} placeholder="Centro" />
          </Field>
          <Field label="Código postal" error={errors.codigoPostal?.message} optional>
            <Input
              {...register('codigoPostal', {
                pattern: { value: /^[0-9]{5}$/, message: '5 dígitos' },
              })}
              placeholder="83000"
              maxLength={5}
            />
          </Field>
          <Field label="Ciudad / Municipio" optional>
            <Input {...register('ciudad')} placeholder="Hermosillo" />
          </Field>
          <Field label="Estado" optional>
            <Input {...register('estado')} placeholder="Sonora" />
          </Field>
        </div>
      </div>

      <FormError message={error} />

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Atrás
        </Button>
        <div className="flex gap-2">
          {onSkip && skipLabel && (
            <Button type="button" variant="ghost" onClick={onSkip}>
              {skipLabel}
            </Button>
          )}
          <Button type="submit" disabled={loading} className="gap-2">
            Continuar <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </form>
  )
}