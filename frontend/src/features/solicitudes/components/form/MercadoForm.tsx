'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/shared/lib/utils/cn'
import {
    guardarDatosMercadoSchema,
    type GuardarDatosMercadoDto,
} from '@/shared/lib/schemas/solicitudes.schema'

interface Props {
    defaultValues?: Partial<GuardarDatosMercadoDto>
    onSubmit: (dto: GuardarDatosMercadoDto) => void
    onBack: () => void
    loading: boolean
}

export function MercadoForm({ defaultValues, onSubmit, onBack, loading }: Props) {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<GuardarDatosMercadoDto>({
        resolver: zodResolver(guardarDatosMercadoSchema),
        defaultValues,
    })

    const valores = watch()

    const totalClientes =
        (valores.porcentajeMayoristas || 0) +
        (valores.porcentajeDetallistas || 0) +
        (valores.porcentajeClienteFinal || 0)

    const totalCobertura =
        (valores.coberturaLocal || 0) +
        (valores.coberturaRegional || 0) +
        (valores.coberturaEstatal || 0) +
        (valores.coberturaNacional || 0) +
        (valores.coberturaExportacion || 0)

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1.5">
                <Label>Principales productos o servicios</Label>
                <Textarea rows={3} {...register('principalesProductos')} />
            </div>

            {/* Distribución de clientes */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                        Distribución de clientes (%)
                    </h3>
                    <span
                        className={cn(
                            'text-xs font-medium',
                            totalClientes === 100 ? 'text-emerald-600' : 'text-muted-foreground'
                        )}
                    >
                        Total: {totalClientes}%
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label>Mayoristas</Label>
                        <Input
                            type="number"
                            {...register('porcentajeMayoristas', { valueAsNumber: true })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Detallistas</Label>
                        <Input
                            type="number"
                            {...register('porcentajeDetallistas', { valueAsNumber: true })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Cliente final</Label>
                        <Input
                            type="number"
                            {...register('porcentajeClienteFinal', { valueAsNumber: true })}
                        />
                    </div>
                </div>
                {errors.porcentajeMayoristas && (
                    <p className="text-xs text-destructive">{errors.porcentajeMayoristas.message}</p>
                )}
            </div>

            {/* Cobertura geográfica */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                        Cobertura geográfica (%)
                    </h3>
                    <span
                        className={cn(
                            'text-xs font-medium',
                            totalCobertura === 100 ? 'text-emerald-600' : 'text-muted-foreground'
                        )}
                    >
                        Total: {totalCobertura}%
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label>Local</Label>
                        <Input type="number" {...register('coberturaLocal', { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Regional</Label>
                        <Input type="number" {...register('coberturaRegional', { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Estatal</Label>
                        <Input type="number" {...register('coberturaEstatal', { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Nacional</Label>
                        <Input type="number" {...register('coberturaNacional', { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Exportación</Label>
                        <Input
                            type="number"
                            {...register('coberturaExportacion', { valueAsNumber: true })}
                        />
                    </div>
                </div>
                {errors.coberturaLocal && (
                    <p className="text-xs text-destructive">{errors.coberturaLocal.message}</p>
                )}
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