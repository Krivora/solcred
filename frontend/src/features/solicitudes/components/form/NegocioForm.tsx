'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
} from '@/shared/lib/schemas/solicitudes.schema'

interface Props {
    defaultValues?: Partial<GuardarDatosNegocioDto>
    onSubmit: (dto: GuardarDatosNegocioDto) => void
    onBack: () => void
    loading: boolean
}

export function NegocioForm({ defaultValues, onSubmit, onBack, loading }: Props) {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<GuardarDatosNegocioDto>({
        resolver: zodResolver(guardarDatosNegocioSchema),
        defaultValues,
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Identificación del negocio */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Identificación</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Razón social</Label>
                        <Input {...register('razonSocial')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>RFC del negocio</Label>
                        <Input {...register('rfcNegocio')} />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                        <Label>Nombre comercial</Label>
                        <Input {...register('nombreNegocio')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Actividad del negocio</Label>
                        <Input {...register('actividadNegocio')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Área del negocio</Label>
                        <Input {...register('areaNegocio')} />
                    </div>
                </div>
            </div>

            {/* Domicilio */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Domicilio del negocio</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                        <Label>Calle</Label>
                        <Input {...register('domicilioNegocio')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Número exterior</Label>
                        <Input {...register('numeroExteriorNegocio')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Número interior</Label>
                        <Input {...register('numeroInteriorNegocio')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Colonia</Label>
                        <Input {...register('coloniaLocal')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Código postal</Label>
                        <Input {...register('codigoPostalLocal')} />
                        {errors.codigoPostalLocal && (
                            <p className="text-xs text-destructive">{errors.codigoPostalLocal.message}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label>Municipio</Label>
                        <Input {...register('municipioLocal')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Estado</Label>
                        <Input {...register('estadoLocal')} />
                    </div>
                </div>
            </div>

            {/* Operación */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Operación</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Tipo de local</Label>
                        <Controller
                            control={control}
                            name="tipoLocal"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
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
                        <Input type="date" {...register('fechaInicioOperaciones')} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Antigüedad del negocio (años)</Label>
                        <Input type="number" {...register('antiguedadNegocio', { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Empleos conservados</Label>
                        <Input type="number" {...register('empleosConservados', { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Empleos nuevos</Label>
                        <Input type="number" {...register('empleosNuevos', { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Experiencia en la actividad (años)</Label>
                        <Input
                            type="number"
                            {...register('experienciaActividadSolicitante', { valueAsNumber: true })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Experiencia como empresario (años)</Label>
                        <Input
                            type="number"
                            {...register('experienciaEmpresarioSolicitante', { valueAsNumber: true })}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label>¿Qué considera importante para su negocio? (opcional)</Label>
                    <Input {...register('negocioConsidera')} />
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Controller
                            control={control}
                            name="actualExporta"
                            render={({ field }) => (
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            )}
                        />
                        <Label className="font-normal">Actualmente exporta</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Controller
                            control={control}
                            name="obtuvoExperiencia"
                            render={({ field }) => (
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            )}
                        />
                        <Label className="font-normal">Obtuvo experiencia previa</Label>
                    </div>
                </div>
            </div>

            {/* Contacto */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Teléfono de recados</Label>
                    <Input {...register('telefonoRecadosNegocio')} />
                </div>
                <div className="space-y-1.5">
                    <Label>Teléfono fijo</Label>
                    <Input {...register('telefonoFijoNegocio')} />
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button type="button" variant="ghost" onClick={onBack}>
                    Regresar
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : 'Continuar'}
                </Button>
            </div>
        </form>
    )
}