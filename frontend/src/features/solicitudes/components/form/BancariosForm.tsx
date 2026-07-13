'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
    guardarDatosBancariosSchema,
    type GuardarDatosBancariosDto,
} from '@/shared/lib/schemas/solicitudes.schema'

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
        formState: { errors },
    } = useForm<GuardarDatosBancariosDto>({
        resolver: zodResolver(guardarDatosBancariosSchema),
        defaultValues,
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                    <Label>Banco</Label>
                    <Input {...register('banco')} />
                    {errors.banco && (
                        <p className="text-xs text-destructive">{errors.banco.message}</p>
                    )}
                </div>
                <div className="space-y-1.5">
                    <Label>Número de cuenta (opcional)</Label>
                    <Input {...register('numeroCuenta')} />
                    {errors.numeroCuenta && (
                        <p className="text-xs text-destructive">{errors.numeroCuenta.message}</p>
                    )}
                </div>
                <div className="space-y-1.5">
                    <Label>CLABE interbancaria</Label>
                    <Input maxLength={18} {...register('clabe')} />
                    {errors.clabe && (
                        <p className="text-xs text-destructive">{errors.clabe.message}</p>
                    )}
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