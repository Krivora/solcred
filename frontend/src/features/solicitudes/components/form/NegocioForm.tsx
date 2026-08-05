'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, MapPin, TrendingUp, Phone, AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select'
import {
    guardarDatosNegocioSchema,
    type GuardarDatosNegocioDto,
} from '@/features/solicitudes/schemas/solicitudes.schema'

interface Props {
    defaultValues?: Partial<GuardarDatosNegocioDto>
    onSubmit: (dto: GuardarDatosNegocioDto) => void
    onBack: () => void
    loading: boolean
}

function SeccionHeader({
    icon: Icon,
    title,
    subtitle,
}: {
    icon: React.ElementType
    title: string
    subtitle?: string
}) {
    return (
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 bg-accent/40 border-b border-border">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent shrink-0">
                <Icon className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
        </div>
    )
}

export function NegocioForm({ defaultValues, onSubmit, onBack, loading }: Props) {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<GuardarDatosNegocioDto>({
        resolver: zodResolver(guardarDatosNegocioSchema),
        mode: 'onBlur',
        defaultValues,
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">Datos del negocio</h2>
                <p className="text-sm text-muted-foreground">
                    Cuéntanos sobre el negocio que respalda esta solicitud.
                </p>
            </div>

            {/* Identificación */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <SeccionHeader icon={Building2} title="Identificación" subtitle="Nombre y giro del negocio" />
                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Razón social</Label>
                        <Input className="h-11" {...register('razonSocial')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>RFC del negocio</Label>
                        <Input className="h-11" {...register('rfcNegocio')} />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                        <Label>Nombre comercial</Label>
                        <Input className="h-11" {...register('nombreNegocio')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Actividad del negocio</Label>
                        <Input className="h-11" {...register('actividadNegocio')} placeholder="Ej. Venta de abarrotes" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Área del negocio</Label>
                        <Input className="h-11" {...register('areaNegocio')} />
                    </div>
                </div>
            </div>

            {/* Domicilio */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <SeccionHeader icon={MapPin} title="Domicilio del negocio" subtitle="Ubicación donde opera" />
                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                        <Label>Calle</Label>
                        <Input className="h-11" {...register('domicilioNegocio')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Número exterior</Label>
                        <Input className="h-11" {...register('numeroExteriorNegocio')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Número interior</Label>
                        <Input className="h-11" {...register('numeroInteriorNegocio')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Colonia</Label>
                        <Input className="h-11" {...register('coloniaLocal')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Código postal</Label>
                        <Input className="h-11" inputMode="numeric" {...register('codigoPostalLocal')} />
                        {errors.codigoPostalLocal && (
                            <p className="flex items-center gap-1 text-xs text-destructive">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {errors.codigoPostalLocal.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label>Municipio</Label>
                        <Input className="h-11" {...register('municipioLocal')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Estado</Label>
                        <Input className="h-11" {...register('estadoLocal')} />
                    </div>
                </div>
            </div>

            {/* Operación */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <SeccionHeader icon={TrendingUp} title="Operación" subtitle="Antigüedad, empleos y experiencia" />
                <div className="p-4 sm:p-5 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Tipo de local</Label>
                            <Controller
                                control={control}
                                name="tipoLocal"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Selecciona" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PROPIO">Propio</SelectItem>
                                            <SelectItem value="RENTADO">Rentado</SelectItem>
                                            <SelectItem value="FAMILIAR">Familiar</SelectItem>
                                            <SelectItem value="OTRO">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Fecha de inicio de operaciones</Label>
                            <Input className="h-11" type="date" {...register('fechaInicioOperaciones')} />
                        </div>
                    </div>

                    {/* Sub-grupo: cifras — separadas visualmente para no mezclar con selects/fechas */}
                    <div className="rounded-lg bg-muted/50 p-3.5 sm:p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                            Cifras del negocio
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Antigüedad (años)</Label>
                                <Input className="h-11" type="number" inputMode="numeric" {...register('antiguedadNegocio', { valueAsNumber: true })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Empleos conservados</Label>
                                <Input className="h-11" type="number" inputMode="numeric" {...register('empleosConservados', { valueAsNumber: true })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Empleos nuevos</Label>
                                <Input className="h-11" type="number" inputMode="numeric" {...register('empleosNuevos', { valueAsNumber: true })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Exp. como empresario</Label>
                                <Input className="h-11" type="number" inputMode="numeric" {...register('experienciaEmpresarioSolicitante', { valueAsNumber: true })} />
                            </div>
                        </div>
                        <div className="mt-3">
                            <Label className="text-xs">Experiencia en la actividad (años)</Label>
                            <Input className="h-11 mt-1.5 sm:w-1/2" type="number" inputMode="numeric" {...register('experienciaActividadSolicitante', { valueAsNumber: true })} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5">
                            ¿Qué considera importante para su negocio?
                            <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
                        </Label>
                        <Input className="h-11" {...register('negocioConsidera')} />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 pt-1">
                        <label className="flex items-center gap-2.5 rounded-lg border border-border px-3.5 py-2.5 cursor-pointer hover:bg-accent/40 transition-colors flex-1">
                            <Controller
                                control={control}
                                name="actualExporta"
                                render={({ field }) => (
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <span className="text-sm text-foreground">Actualmente exporta</span>
                        </label>
                        <label className="flex items-center gap-2.5 rounded-lg border border-border px-3.5 py-2.5 cursor-pointer hover:bg-accent/40 transition-colors flex-1">
                            <Controller
                                control={control}
                                name="obtuvoExperiencia"
                                render={({ field }) => (
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                            <span className="text-sm text-foreground">Obtuvo experiencia previa</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Contacto */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <SeccionHeader icon={Phone} title="Contacto" subtitle="Teléfonos del negocio" />
                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Teléfono de recados</Label>
                        <Input className="h-11" type="tel" {...register('telefonoRecadosNegocio')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Teléfono fijo</Label>
                        <Input className="h-11" type="tel" {...register('telefonoFijoNegocio')} />
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-2 sticky bottom-0 bg-background/95 backdrop-blur-sm -mx-1 px-1 py-3 sm:static sm:bg-transparent sm:backdrop-blur-none sm:p-0">
                <Button type="button" variant="ghost" className="h-11" onClick={onBack}>
                    Regresar
                </Button>
                <Button type="submit" disabled={loading} className="h-11 min-w-[120px]">
                    {loading ? 'Guardando...' : 'Continuar'}
                </Button>
            </div>
        </form>
    )
}