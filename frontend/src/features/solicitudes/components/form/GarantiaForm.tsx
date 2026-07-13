'use client'

import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, Home, Package } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select'
import {
    guardarDatosGarantiaSchema,
    type GuardarDatosGarantiaDto,
} from '@/shared/lib/schemas/solicitudes.schema'

interface Props {
    defaultValues?: Partial<GuardarDatosGarantiaDto>
    onSubmit: (dto: GuardarDatosGarantiaDto) => void
    onBack: () => void
    loading: boolean
}

const GARANTIA_VACIA = {
    tipo: 'PRENDARIA' as const,
    nombrePropietario: '',
    valor: 0,
    descripcion: '',
    marca: '',
    modelo: '',
    anio: undefined,
    numeroSerie: '',
    calle: '',
    numeroExterior: '',
    numeroInterior: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    numeroEscritura: '',
    folioReal: '',
}

export function GarantiaForm({ defaultValues, onSubmit, onBack, loading }: Props) {
    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<GuardarDatosGarantiaDto>({
        resolver: zodResolver(guardarDatosGarantiaSchema),
        defaultValues: {
            garantias: defaultValues?.garantias?.length
                ? defaultValues.garantias
                : [GARANTIA_VACIA],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'garantias',
    })

    const garantiasValores = watch('garantias')

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((field, index) => {
                const tipo = garantiasValores?.[index]?.tipo
                const erroresItem = errors.garantias?.[index]

                return (
                    <div
                        key={field.id}
                        className="rounded-lg border border-border p-4 space-y-4 relative"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                {tipo === 'HIPOTECARIA' ? (
                                    <Home className="w-4 h-4 text-primary" />
                                ) : (
                                    <Package className="w-4 h-4 text-primary" />
                                )}
                                Garantía {index + 1}
                            </div>

                            {fields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            )}
                        </div>

                        {/* Tipo */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Tipo de garantía</Label>
                                <Select
                                    value={tipo}
                                    onValueChange={(v) =>
                                        setValue(`garantias.${index}.tipo`, v as 'PRENDARIA' | 'HIPOTECARIA')
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PRENDARIA">Prendaria</SelectItem>
                                        <SelectItem value="HIPOTECARIA">Hipotecaria</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Valor</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register(`garantias.${index}.valor`, { valueAsNumber: true })}
                                />
                                {erroresItem?.valor && (
                                    <p className="text-xs text-destructive">{erroresItem.valor.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Comunes */}
                        <div className="space-y-1.5">
                            <Label>Nombre del propietario</Label>
                            <Input {...register(`garantias.${index}.nombrePropietario`)} />
                            {erroresItem?.nombrePropietario && (
                                <p className="text-xs text-destructive">
                                    {erroresItem.nombrePropietario.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Descripción (opcional)</Label>
                            <Input {...register(`garantias.${index}.descripcion`)} />
                        </div>

                        {/* Campos según tipo */}
                        {tipo === 'PRENDARIA' && (
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                                <div className="space-y-1.5">
                                    <Label>Marca</Label>
                                    <Input {...register(`garantias.${index}.marca`)} />
                                    {erroresItem?.marca && (
                                        <p className="text-xs text-destructive">{erroresItem.marca.message}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Modelo</Label>
                                    <Input {...register(`garantias.${index}.modelo`)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Año</Label>
                                    <Input
                                        type="number"
                                        {...register(`garantias.${index}.anio`, { valueAsNumber: true })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Número de serie</Label>
                                    <Input {...register(`garantias.${index}.numeroSerie`)} />
                                    {erroresItem?.numeroSerie && (
                                        <p className="text-xs text-destructive">
                                            {erroresItem.numeroSerie.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {tipo === 'HIPOTECARIA' && (
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                                <div className="space-y-1.5 col-span-2">
                                    <Label>Calle</Label>
                                    <Input {...register(`garantias.${index}.calle`)} />
                                    {erroresItem?.calle && (
                                        <p className="text-xs text-destructive">{erroresItem.calle.message}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Número exterior</Label>
                                    <Input {...register(`garantias.${index}.numeroExterior`)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Número interior</Label>
                                    <Input {...register(`garantias.${index}.numeroInterior`)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Colonia</Label>
                                    <Input {...register(`garantias.${index}.colonia`)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Código postal</Label>
                                    <Input {...register(`garantias.${index}.codigoPostal`)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Ciudad</Label>
                                    <Input {...register(`garantias.${index}.ciudad`)} />
                                    {erroresItem?.ciudad && (
                                        <p className="text-xs text-destructive">{erroresItem.ciudad.message}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Estado</Label>
                                    <Input {...register(`garantias.${index}.estado`)} />
                                    {erroresItem?.estado && (
                                        <p className="text-xs text-destructive">{erroresItem.estado.message}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Número de escritura</Label>
                                    <Input {...register(`garantias.${index}.numeroEscritura`)} />
                                    {erroresItem?.numeroEscritura && (
                                        <p className="text-xs text-destructive">
                                            {erroresItem.numeroEscritura.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Folio real (opcional)</Label>
                                    <Input {...register(`garantias.${index}.folioReal`)} />
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}

            {errors.garantias?.root && (
                <p className="text-xs text-destructive">{errors.garantias.root.message}</p>
            )}

            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => append(GARANTIA_VACIA)}
            >
                <Plus className="w-4 h-4 mr-2" />
                Agregar otra garantía
            </Button>

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