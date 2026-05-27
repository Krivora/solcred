'use client'

import { useForm } from 'react-hook-form'
import type { DatosPersona, EstadoCivil, NivelEstudio, TipoVivienda } from '@/lib/types/solicitudes.types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { FormError } from '@/components/ui/FormError'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, ChevronRight, User, Phone, MapPin } from 'lucide-react'

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
  { value: 'SOLTERO', label: 'Soltero(a)' },
  { value: 'CASADO', label: 'Casado(a)' },
  { value: 'DIVORCIADO', label: 'Divorciado(a)' },
  { value: 'VIUDO', label: 'Viudo(a)' },
  { value: 'UNION_LIBRE', label: 'Unión Libre' },
]

const NIVELES: { value: NivelEstudio; label: string }[] = [
  { value: 'PRIMARIA', label: 'Primaria' },
  { value: 'SECUNDARIA', label: 'Secundaria' },
  { value: 'PREPARATORIA', label: 'Preparatoria' },
  { value: 'TECNICO', label: 'Técnico' },
  { value: 'LICENCIATURA', label: 'Licenciatura' },
  { value: 'MAESTRIA', label: 'Maestría' },
  { value: 'DOCTORADO', label: 'Doctorado' },
]

const TIPOS_VIVIENDA: { value: TipoVivienda; label: string }[] = [
  { value: 'PROPIA', label: 'Propia' },
  { value: 'RENTADA', label: 'Rentada' },
  { value: 'PAGANDO', label: 'Pagando' },
]

const ESTADOS_MX = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Guanajuato',
  'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
]

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
    </div>
  )
}

function Field({
  label,
  error,
  children,
  optional,
  className,
}: {
  label: string
  error?: string
  children: React.ReactNode
  optional?: boolean
  className?: string
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <Label className="text-sm">
        {label}
        {optional && (
          <span className="text-muted-foreground text-xs font-normal ml-1">(opcional)</span>
        )}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
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
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DatosPersona>({ defaultValues: defaultValues ?? {} })

  const estadoCivil = watch('estadoCivil')
  const nivelEstudio = watch('nivelEstudio')
  const tipoVivienda = watch('tipoVivienda')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">

      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      </div>

      {/* ── DATOS PERSONALES ──────────────────────────────────── */}
      <section>
        <SectionHeader icon={User} label="Datos personales" />
        <div className="space-y-4">

          {/* Nombre completo: 3 columnas iguales, nombres tienen espacio suficiente */}
          <div className="grid grid-cols-6 gap-4">
            <Field label="Nombre(s)" error={errors.nombre?.message} className="col-span-2">
              <Input
                {...register('nombre', { required: 'Requerido', minLength: { value: 2, message: 'Mín. 2 caracteres' } })}
                placeholder="Juan"
              />
            </Field>
            <Field label="Apellido paterno" error={errors.apellidoPaterno?.message} className="col-span-2">
              <Input {...register('apellidoPaterno', { required: 'Requerido' })} placeholder="García" />
            </Field>
            <Field label="Apellido materno" error={errors.apellidoMaterno?.message} className="col-span-2">
              <Input {...register('apellidoMaterno', { required: 'Requerido' })} placeholder="López" />
            </Field>
          </div>

          {/* CURP (tamaño fijo 18) + RFC (tamaño fijo 13) + No. INE */}
          {/* 6 cols: CURP=2, RFC=2, INE=2 — proporcional al largo real del dato */}
          <div className="grid grid-cols-6 gap-4">
            <Field label="CURP" error={errors.curp?.message} optional className="col-span-2">
              <Input
                {...register('curp', {
                  pattern: { value: /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$/, message: 'CURP inválida' },
                })}
                placeholder="GALO900101HSONPZ01"
                className="uppercase font-mono text-sm tracking-wide"
                maxLength={18}
              />
            </Field>
            <Field label="RFC" error={errors.rfc?.message} optional className="col-span-2">
              <Input
                {...register('rfc', {
                  pattern: { value: /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/, message: 'RFC inválido' },
                })}
                placeholder="GAOL900101XX0"
                className="uppercase font-mono text-sm tracking-wide"
                maxLength={13}
              />
            </Field>
            <Field label="Número de INE" error={errors.numeroINE?.message} optional className="col-span-2">
              <Input {...register('numeroINE')} placeholder="0000000000000" maxLength={13} />
            </Field>
          </div>

          {/* Estado civil + Cónyuge + Nivel estudios */}
          {/* Estado civil es un select corto; cónyuge toma más espacio; nivel estudios = corto */}
          <div className="grid grid-cols-6 gap-4">
            <Field label="Estado civil" optional className="col-span-2">
              <Select
                value={estadoCivil ?? ''}
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
            <Field label="Nombre del cónyuge" optional className="col-span-2">
              <Input
                {...register('nombreConyuge')}
                placeholder="Nombre completo"
                disabled={estadoCivil !== 'CASADO' && estadoCivil !== 'UNION_LIBRE'}
                className="disabled:opacity-40"
              />
            </Field>
            <Field label="Nivel de estudios" optional className="col-span-2">
              <Select
                value={nivelEstudio ?? ''}
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
          </div>

          {/* Universidad — solo cuando aplica, campo amplio */}
          <div className="grid grid-cols-6 gap-4">
            <Field label="Institución educativa" optional className="col-span-4">
              <Input
                {...register('universidad')}
                placeholder="Universidad de Sonora"
                disabled={!nivelEstudio || nivelEstudio === 'PRIMARIA' || nivelEstudio === 'SECUNDARIA'}
                className="disabled:opacity-40"
              />
            </Field>
          </div>

        </div>
      </section>

      <Separator />

      {/* ── DOMICILIO ─────────────────────────────────────────── */}
      <section>
        <SectionHeader icon={MapPin} label="Domicilio" />
        <div className="grid grid-cols-6 gap-6">
          {/* IZQUIERDA */}
          <div className="col-span-4 space-y-4">
            <Field label="Calle" optional>
              <Input
                {...register('calle')}
                placeholder="Av. Rodríguez"
              />
            </Field>

            <Field label="Colonia" optional>
              <Input
                {...register('colonia')}
                placeholder="Centro"
              />
            </Field>

            <div className="grid grid-cols-6 gap-4">
              <Field
                label="Ciudad / Municipio"
                optional
                className="col-span-4"
              >
                <Input
                  {...register('ciudad')}
                  placeholder="Hermosillo"
                />
              </Field>

              <Field
                label="Estado"
                optional
                className="col-span-2"
              >
                <Select
                  value={watch('estado') ?? ''}
                  onValueChange={(v) => setValue('estado', v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>

                  <SelectContent>
                    {ESTADOS_MX.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          {/* DERECHA */}
          <div className="col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Núm. ext." optional>
                <Input
                  {...register('numeroExterior')}
                  placeholder="123"
                />
              </Field>

              <Field label="Núm. int." optional>
                <Input
                  {...register('numeroInterior')}
                  placeholder="4B"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="C.P."
                error={errors.codigoPostal?.message}
                optional
              >
                <Input
                  {...register('codigoPostal', {
                    pattern: {
                      value: /^[0-9]{5}$/,
                      message: '5 dígitos',
                    },
                  })}
                  placeholder="83000"
                  maxLength={5}
                />
              </Field>

              <Field label="Tipo de vivienda" optional>
                <Select
                  value={tipoVivienda ?? ''}
                  onValueChange={(v) =>
                    setValue('tipoVivienda', v as TipoVivienda)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_VIVIENDA.map((t) => (
                      <SelectItem
                        key={t.value}
                        value={t.value}
                      >
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Años actual"
                error={errors.aniosDomicilioActual?.message}
                optional
              >
                <Input
                  {...register('aniosDomicilioActual', {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min={0}
                  max={99}
                  placeholder="0"
                />
              </Field>

              <Field
                label="Años anterior"
                error={errors.aniosDomicilioAnterior?.message}
                optional
              >
                <Input
                  {...register('aniosDomicilioAnterior', {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min={0}
                  max={99}
                  placeholder="0"
                />
              </Field>
            </div>
          </div>
        </div>
      </section>
      <Separator />
      {/* ── CONTACTO ──────────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Phone} label="Información de contacto" />
        {/* Teléfono 10 dígitos + Celular 10 dígitos = misma anchura; correo más largo */}
        <div className="grid grid-cols-6 gap-4">
          <Field label="Teléfono fijo" error={errors.telefono?.message} optional className="col-span-2">
            <Input
              {...register('telefono', { pattern: { value: /^[0-9]{10}$/, message: '10 dígitos' } })}
              placeholder="6441234567"
              maxLength={10}
            />
          </Field>
          <Field label="Celular" error={errors.celular?.message} optional className="col-span-2">
            <Input
              {...register('celular', { pattern: { value: /^[0-9]{10}$/, message: '10 dígitos' } })}
              placeholder="6441234567"
              maxLength={10}
            />
          </Field>
          <Field label="Correo electrónico" error={errors.correo?.message} optional className="col-span-2">
            <Input
              {...register('correo', { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' } })}
              type="email"
              placeholder="juan@ejemplo.com"
            />
          </Field>
        </div>
      </section>

      <FormError message={error} />
      {/* Acciones */}
      <div className="flex justify-between pt-1">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Atrás
        </Button>
        <div className="flex gap-2">
          {onSkip && skipLabel && (
            <Button type="button" variant="ghost" onClick={onSkip}>{skipLabel}</Button>
          )}
          <Button type="submit" disabled={loading} className="gap-2">
            Continuar <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </form>
  )
}