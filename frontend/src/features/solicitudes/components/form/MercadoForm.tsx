'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Users, Globe, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/shared/lib/cn'
import {
    guardarDatosMercadoSchema,
    type GuardarDatosMercadoDto,
} from '@/features/solicitudes/schemas/solicitudes.schema'

interface Props {
    defaultValues?: Partial<GuardarDatosMercadoDto>
    onSubmit: (dto: GuardarDatosMercadoDto) => void
    onBack: () => void
    loading: boolean
    skipLabel?: string
    onSkip?: () => void
}


function BarraTotal({ total }: { total: number }) {
    const completo = total === 100
    const excedido = total > 100

    return (
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="h-1.5 w-24 sm:w-28 rounded-full bg-secondary overflow-hidden shrink-0">
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-300 ease-out',
                        completo ? 'bg-success' : excedido ? 'bg-destructive' : 'bg-primary'
                    )}
                    style={{ width: `${Math.min(total, 100)}%` }}
                />
            </div>
            <span
                className={cn(
                    'flex items-center gap-1 text-xs font-medium shrink-0',
                    completo ? 'text-success' : excedido ? 'text-destructive' : 'text-muted-foreground'
                )}
            >
                {completo && <CheckCircle2 className="w-3.5 h-3.5" />}
                {excedido && <AlertCircle className="w-3.5 h-3.5" />}
                {total}%
            </span>
        </div>
    )
}

export function MercadoForm({ defaultValues, onSubmit, onBack, loading, skipLabel, onSkip }: Props) {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<GuardarDatosMercadoDto>({
        resolver: zodResolver(guardarDatosMercadoSchema),
        mode: 'onBlur',
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
            <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">Mercado</h2>
                <p className="text-sm text-muted-foreground">
                    Describe a quién le vendes y en qué zonas opera el negocio.
                </p>
            </div>

            <div className="space-y-1.5">
                <Label>Principales productos o servicios</Label>
                <Textarea rows={3} className="resize-none" {...register('principalesProductos')} />
            </div>

            {/* Distribución de clientes */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-accent/40 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent shrink-0">
                            <Users className="w-4 h-4 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Distribución de clientes</p>
                            <p className="text-xs text-muted-foreground">Debe sumar 100%</p>
                        </div>
                    </div>
                    <BarraTotal total={totalClientes} />
                </div>
                <div className="p-4 sm:p-5">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label>Mayoristas</Label>
                            <Input
                                type="number"
                                inputMode="numeric"
                                className="h-11"
                                placeholder="0"
                                {...register('porcentajeMayoristas', { valueAsNumber: true })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Detallistas</Label>
                            <Input
                                type="number"
                                inputMode="numeric"
                                className="h-11"
                                placeholder="0"
                                {...register('porcentajeDetallistas', { valueAsNumber: true })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Cliente final</Label>
                            <Input
                                type="number"
                                inputMode="numeric"
                                className="h-11"
                                placeholder="0"
                                {...register('porcentajeClienteFinal', { valueAsNumber: true })}
                            />
                        </div>
                    </div>
                    {errors.porcentajeMayoristas && (
                        <p className="flex items-center gap-1 text-xs text-destructive mt-3">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.porcentajeMayoristas.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Cobertura geográfica */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 bg-accent/40 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent shrink-0">
                            <Globe className="w-4 h-4 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Cobertura geográfica</p>
                            <p className="text-xs text-muted-foreground">Debe sumar 100%</p>
                        </div>
                    </div>
                    <BarraTotal total={totalCobertura} />
                </div>
                <div className="p-4 sm:p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label>Local</Label>
                            <Input type="number" inputMode="numeric" className="h-11" placeholder="0" {...register('coberturaLocal', { valueAsNumber: true })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Regional</Label>
                            <Input type="number" inputMode="numeric" className="h-11" placeholder="0" {...register('coberturaRegional', { valueAsNumber: true })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Estatal</Label>
                            <Input type="number" inputMode="numeric" className="h-11" placeholder="0" {...register('coberturaEstatal', { valueAsNumber: true })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Nacional</Label>
                            <Input type="number" inputMode="numeric" className="h-11" placeholder="0" {...register('coberturaNacional', { valueAsNumber: true })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Exportación</Label>
                            <Input type="number" inputMode="numeric" className="h-11" placeholder="0" {...register('coberturaExportacion', { valueAsNumber: true })} />
                        </div>
                    </div>
                    {errors.coberturaLocal && (
                        <p className="flex items-center gap-1 text-xs text-destructive mt-3">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.coberturaLocal.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-2 sticky bottom-0 bg-background/95 backdrop-blur-sm -mx-1 px-1 py-3 sm:static sm:bg-transparent sm:backdrop-blur-none sm:p-0">
                <Button type="button" variant="ghost" className="h-11" onClick={onBack}>
                    Regresar
                </Button>
                <div className="flex items-center gap-2">
                    {onSkip && (
                        <Button type="button" variant="outline" className="h-11" onClick={onSkip} disabled={loading}>
                            {skipLabel ?? 'Omitir'}
                        </Button>
                    )}
                    <Button type="submit" disabled={loading} className="h-11 min-w-[120px]">
                        {loading ? 'Guardando...' : 'Continuar'}
                    </Button>
                </div>
            </div>
        </form>
    )
}