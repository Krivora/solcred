'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Landmark, ShieldCheck, AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { cn } from "@/shared/lib/utils/cn"
import {
    guardarDatosBancariosSchema,
    type GuardarDatosBancariosDto,
} from '@/features/solicitudes/schemas/solicitudes.schema'

interface Props {
    defaultValues?: Partial<GuardarDatosBancariosDto>
    onSubmit: (dto: GuardarDatosBancariosDto) => void
    onBack: () => void
    loading: boolean
}

export function BancariosForm({ defaultValues, onSubmit, onBack, loading }: Props) {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<GuardarDatosBancariosDto>({
        resolver: zodResolver(guardarDatosBancariosSchema),
        mode: 'onBlur',
        defaultValues,
    })

    const clabe = watch('clabe') || ''

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold text-foreground">Datos bancarios</h2>
                <p className="text-sm text-muted-foreground">
                    Cuenta donde se depositará el crédito si es aprobado.
                </p>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 bg-accent/40 border-b border-border">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent shrink-0">
                        <Landmark className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">Cuenta de depósito</p>
                        <p className="text-xs text-muted-foreground">Verifica que los datos sean correctos</p>
                    </div>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                    <div className="space-y-1.5">
                        <Label>Banco</Label>
                        <Input className="h-11" placeholder="Ej. BBVA, Santander, Banorte" {...register('banco')} />
                        {errors.banco && (
                            <p className="flex items-center gap-1 text-xs text-destructive">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {errors.banco.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-1.5">
                                Número de cuenta
                                <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
                            </Label>
                            <Input className="h-11" inputMode="numeric" {...register('numeroCuenta')} />
                            {errors.numeroCuenta && (
                                <p className="flex items-center gap-1 text-xs text-destructive">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {errors.numeroCuenta.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label>CLABE interbancaria</Label>
                            <Input
                                className="h-11 font-mono tracking-wide"
                                maxLength={18}
                                inputMode="numeric"
                                placeholder="18 dígitos"
                                {...register('clabe')}
                            />
                            <div className="flex items-center justify-between">
                                {errors.clabe ? (
                                    <p className="flex items-center gap-1 text-xs text-destructive">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        {errors.clabe.message}
                                    </p>
                                ) : (
                                    <span />
                                )}
                                <span
                                    className={cn(
                                        'text-xs shrink-0',
                                        clabe.length === 18 ? 'text-success' : 'text-muted-foreground'
                                    )}
                                >
                                    {clabe.length}/18
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nota de confianza — reduce fricción al pedir datos financieros */}
                <div className="flex items-start gap-2 px-4 sm:px-5 py-3 bg-muted/50 border-t border-border">
                    <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                        Esta información se usa únicamente para depositar el crédito y se maneja de forma confidencial.
                    </p>
                </div>
            </div>

            <div className="flex justify-between pt-2 sticky bottom-0 bg-background/95 backdrop-blur-sm -mx-1 px-1 py-3 sm:static sm:bg-transparent sm:backdrop-blur-none sm:p-0">
                <Button type="button" variant="ghost" className="h-11" onClick={onBack}>
                    Regresar
                </Button>
                <Button type="submit" disabled={loading} className="h-11 min-w-30">
                    {loading ? 'Guardando...' : 'Continuar'}
                </Button>
            </div>
        </form>
    )
}