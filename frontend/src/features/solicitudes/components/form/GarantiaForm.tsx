'use client'

import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, Home, Package, AlertCircle } from 'lucide-react'
import { useState } from 'react'
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { cn } from "@/shared/lib/utils/cn"
import {
    guardarDatosGarantiaSchema,
    type GuardarDatosGarantiaDto,
} from '@/shared/lib/schema/solicitudes.schema'

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

function formatoMoneda(valor: number) {
    if (!valor) return ''
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0,
    }).format(valor)
}

export function GarantiaForm({ defaultValues, onSubmit, onBack, loading }: Props) {
    const [indexAEliminar, setIndexAEliminar] = useState<number | null>(null)

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<GuardarDatosGarantiaDto>({
        resolver: zodResolver(guardarDatosGarantiaSchema),
        mode: 'onBlur',
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

    const confirmarEliminacion = () => {
        if (indexAEliminar !== null) {
            remove(indexAEliminar)
            setIndexAEliminar(null)
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-foreground">Garantías del crédito</h2>
                    <p className="text-sm text-muted-foreground">
                        Registra los bienes que respaldan tu solicitud. Puedes agregar más de uno.
                    </p>
                </div>

                {fields.map((field, index) => {
                    const tipo = garantiasValores?.[index]?.tipo
                    const erroresItem = errors.garantias?.[index]
                    const esHipotecaria = tipo === 'HIPOTECARIA'

                    return (
                        <div
                            key={field.id}
                            className={cn(
                                'relative rounded-xl border border-border bg-card shadow-sm overflow-hidden',
                                'animate-in fade-in slide-in-from-top-2 duration-300',
                                'border-l-4',
                                esHipotecaria ? 'border-l-primary' : 'border-l-warning'
                            )}
                        >
                            {/* Header de tarjeta con fondo tenue diferenciado */}
                            <div
                                className={cn(
                                    'flex items-center justify-between px-4 sm:px-5 py-3.5',
                                    esHipotecaria ? 'bg-primary/5' : 'bg-warning/10'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={cn(
                                            'flex items-center justify-center w-10 h-10 rounded-lg shrink-0',
                                            esHipotecaria ? 'bg-primary/15' : 'bg-warning/20'
                                        )}
                                    >
                                        {esHipotecaria ? (
                                            <Home className="w-5 h-5 text-primary" />
                                        ) : (
                                            <Package className="w-5 h-5 text-warning-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-foreground">
                                                Garantía {index + 1}
                                            </p>
                                            <span
                                                className={cn(
                                                    'text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded',
                                                    esHipotecaria
                                                        ? 'bg-primary/15 text-primary'
                                                        : 'bg-warning/25 text-warning-foreground'
                                                )}
                                            >
                                                {esHipotecaria ? 'Inmueble' : 'Mueble'}
                                            </span>
                                        </div>
                                        {garantiasValores?.[index]?.valor ? (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {formatoMoneda(garantiasValores[index].valor)}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>

                                {fields.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-11 w-11 hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => setIndexAEliminar(index)}
                                        aria-label={`Eliminar garantía ${index + 1}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="p-4 sm:p-5 space-y-5">
                                {/* Tipo */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label>Tipo de garantía</Label>
                                        <Select
                                            value={tipo}
                                            onValueChange={(v) =>
                                                setValue(`garantias.${index}.tipo`, v as 'PRENDARIA' | 'HIPOTECARIA', {
                                                    shouldValidate: true,
                                                })
                                            }
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PRENDARIA">Prendaria (vehículo, maquinaria, etc.)</SelectItem>
                                                <SelectItem value="HIPOTECARIA">Hipotecaria (inmueble)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label>Valor comercial</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            inputMode="decimal"
                                            className="h-11"
                                            placeholder="0.00"
                                            {...register(`garantias.${index}.valor`, { valueAsNumber: true })}
                                        />
                                        {erroresItem?.valor && (
                                            <p className="flex items-center gap-1 text-xs text-destructive">
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                {erroresItem.valor.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Comunes */}
                                <div className="space-y-1.5">
                                    <Label>Nombre del propietario</Label>
                                    <Input className="h-11" {...register(`garantias.${index}.nombrePropietario`)} />
                                    {erroresItem?.nombrePropietario && (
                                        <p className="flex items-center gap-1 text-xs text-destructive">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            {erroresItem.nombrePropietario.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="flex items-center gap-1.5">
                                        Descripción
                                        <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
                                    </Label>
                                    <Input className="h-11" {...register(`garantias.${index}.descripcion`)} />
                                </div>

                                {/* Campos según tipo */}
                                {tipo === 'PRENDARIA' && (
                                    <div className="pt-4 border-t border-border space-y-4">
                                        <p className="text-xs font-medium text-warning-foreground uppercase tracking-wide">
                                            Datos del bien
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label>Marca</Label>
                                                <Input className="h-11" {...register(`garantias.${index}.marca`)} />
                                                {erroresItem?.marca && (
                                                    <p className="flex items-center gap-1 text-xs text-destructive">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                        {erroresItem.marca.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Modelo</Label>
                                                <Input className="h-11" {...register(`garantias.${index}.modelo`)} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Año</Label>
                                                <Input
                                                    type="number"
                                                    inputMode="numeric"
                                                    className="h-11"
                                                    {...register(`garantias.${index}.anio`, { valueAsNumber: true })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Número de serie</Label>
                                                <Input className="h-11" {...register(`garantias.${index}.numeroSerie`)} />
                                                {erroresItem?.numeroSerie && (
                                                    <p className="flex items-center gap-1 text-xs text-destructive">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                        {erroresItem.numeroSerie.message}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    Se encuentra en la tarjeta de circulación o factura.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {tipo === 'HIPOTECARIA' && (
                                    <div className="pt-4 border-t border-border space-y-4">
                                        <p className="text-xs font-medium text-primary uppercase tracking-wide">
                                            Ubicación del inmueble
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5 sm:col-span-2">
                                                <Label>Calle</Label>
                                                <Input className="h-11" {...register(`garantias.${index}.calle`)} />
                                                {erroresItem?.calle && (
                                                    <p className="flex items-center gap-1 text-xs text-destructive">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                        {erroresItem.calle.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Número exterior</Label>
                                                <Input className="h-11" {...register(`garantias.${index}.numeroExterior`)} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Número interior</Label>
                                                <Input className="h-11" {...register(`garantias.${index}.numeroInterior`)} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Colonia</Label>
                                                <Input className="h-11" {...register(`garantias.${index}.colonia`)} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Código postal</Label>
                                                <Input className="h-11" inputMode="numeric" {...register(`garantias.${index}.codigoPostal`)} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Ciudad</Label>
                                                <Input className="h-11" {...register(`garantias.${index}.ciudad`)} />
                                                {erroresItem?.ciudad && (
                                                    <p className="flex items-center gap-1 text-xs text-destructive">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                        {erroresItem.ciudad.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Estado</Label>
                                                <Input className="h-11" {...register(`garantias.${index}.estado`)} />
                                                {erroresItem?.estado && (
                                                    <p className="flex items-center gap-1 text-xs text-destructive">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                        {erroresItem.estado.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Número de escritura</Label>
                                                <Input className="h-11" {...register(`garantias.${index}.numeroEscritura`)} />
                                                {erroresItem?.numeroEscritura && (
                                                    <p className="flex items-center gap-1 text-xs text-destructive">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                        {erroresItem.numeroEscritura.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="flex items-center gap-1.5">
                                                    Folio real
                                                    <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
                                                </Label>
                                                <Input className="h-11" {...register(`garantias.${index}.folioReal`)} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}

                {errors.garantias?.root && (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.garantias.root.message}
                    </p>
                )}

                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 border-dashed"
                    onClick={() => append(GARANTIA_VACIA)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar otra garantía
                </Button>

                <div className="flex justify-between pt-4 sticky bottom-0 bg-background/95 backdrop-blur-sm -mx-1 px-1 py-3 sm:static sm:bg-transparent sm:backdrop-blur-none sm:p-0">
                    <Button type="button" variant="ghost" className="h-11" onClick={onBack}>
                        Regresar
                    </Button>
                    <Button type="submit" disabled={loading} className="h-11 min-w-30">
                        {loading ? 'Guardando...' : 'Continuar'}
                    </Button>
                </div>
            </form>

            <AlertDialog open={indexAEliminar !== null} onOpenChange={(open) => !open && setIndexAEliminar(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar esta garantía?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se perderá la información capturada para esta garantía. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmarEliminacion}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}