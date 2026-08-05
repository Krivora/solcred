'use client'

import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, Home, Package, AlertCircle, ShieldCheck, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
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
} from '@/features/solicitudes/schemas/solicitudes.schema'

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
    if (!valor) return '$0'
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0,
    }).format(valor)
}

// Input de moneda "vivo": muestra el formato mientras se escribe,
// pero guarda el número puro en el form.
function CampoMoneda({
    value,
    onChange,
    placeholder = '0.00',
}: {
    value: number
    onChange: (v: number) => void
    placeholder?: string
}) {
    const [texto, setTexto] = useState(value ? String(value) : '')

    return (
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                $
            </span>
            <Input
                type="text"
                inputMode="decimal"
                placeholder={placeholder}
                className="pl-6"
                value={texto}
                onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9.]/g, '')
                    setTexto(raw)
                    onChange(raw ? parseFloat(raw) : 0)
                }}
                onBlur={() => {
                    if (value) setTexto(String(value))
                }}
            />
        </div>
    )
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
    const valorTotal = (garantiasValores ?? []).reduce((acc, g) => acc + (g?.valor || 0), 0)

    const confirmarEliminacion = () => {
        if (indexAEliminar !== null) {
            remove(indexAEliminar)
            setIndexAEliminar(null)
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Encabezado con contexto — reduce la sensación de "trámite" */}
                <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0">
                        <ShieldCheck className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                        <h2 className="text-base font-semibold text-foreground">Garantías del crédito</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Cuéntanos qué bienes respaldan tu solicitud — un vehículo, maquinaria
                            o una propiedad. Puedes agregar más de uno si lo necesitas.
                        </p>
                    </div>
                </div>

                {fields.map((field, index) => {
                    const tipo = garantiasValores?.[index]?.tipo
                    const erroresItem = errors.garantias?.[index]
                    const esHipotecaria = tipo === 'HIPOTECARIA'

                    return (
                        <div
                            key={field.id}
                            className={cn(
                                'relative rounded-2xl border border-border bg-card',
                                'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
                                'animate-in fade-in slide-in-from-top-2 duration-300',
                                'overflow-hidden'
                            )}
                        >
                            {/* Header de tarjeta */}
                            <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-border/70">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-foreground/5 text-xs font-semibold text-muted-foreground">
                                        {index + 1}
                                    </span>
                                    <p className="text-sm font-semibold text-foreground">
                                        Garantía {index + 1}
                                    </p>
                                    {garantiasValores?.[index]?.valor ? (
                                        <span className="text-xs font-medium text-muted-foreground">
                                            · {formatoMoneda(garantiasValores[index].valor)}
                                        </span>
                                    ) : null}
                                </div>

                                {fields.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => setIndexAEliminar(index)}
                                        aria-label={`Eliminar garantía ${index + 1}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="p-4 sm:p-5 space-y-5">
                                {/* Selector de tipo como tarjetas grandes, no dropdown */}
                                <div className="space-y-1.5">
                                    <Label>Tipo de garantía</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setValue(`garantias.${index}.tipo`, 'PRENDARIA', { shouldValidate: true })
                                            }
                                            className={cn(
                                                'flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all',
                                                !esHipotecaria
                                                    ? 'border-warning bg-warning/10 ring-1 ring-warning'
                                                    : 'border-border hover:border-warning/50 hover:bg-warning/5'
                                            )}
                                        >
                                            <Package className={cn('w-5 h-5', !esHipotecaria ? 'text-warning-foreground' : 'text-muted-foreground')} />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Bien mueble</p>
                                                <p className="text-xs text-muted-foreground">Vehículo, maquinaria, equipo</p>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setValue(`garantias.${index}.tipo`, 'HIPOTECARIA', { shouldValidate: true })
                                            }
                                            className={cn(
                                                'flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all',
                                                esHipotecaria
                                                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                                    : 'border-border hover:border-primary/50 hover:bg-primary/5'
                                            )}
                                        >
                                            <Home className={cn('w-5 h-5', esHipotecaria ? 'text-primary' : 'text-muted-foreground')} />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Inmueble</p>
                                                <p className="text-xs text-muted-foreground">Casa, terreno, local</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Valor comercial — ahora con formato de moneda en vivo */}
                                <div className="space-y-1.5">
                                    <Label className="flex items-center gap-1.5">
                                        <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
                                        Valor comercial
                                    </Label>
                                    <CampoMoneda
                                        value={garantiasValores?.[index]?.valor ?? 0}
                                        onChange={(v) =>
                                            setValue(`garantias.${index}.valor`, v, { shouldValidate: true })
                                        }
                                    />
                                    {erroresItem?.valor && (
                                        <p className="flex items-center gap-1 text-xs text-destructive">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            {erroresItem.valor.message}
                                        </p>
                                    )}
                                </div>

                                {/* Comunes */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label>Nombre del propietario</Label>
                                        <Input placeholder="Nombre completo" {...register(`garantias.${index}.nombrePropietario`)} />
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
                                        <Input placeholder="Estado, características, etc." {...register(`garantias.${index}.descripcion`)} />
                                    </div>
                                </div>

                                {/* Campos según tipo */}
                                {tipo === 'PRENDARIA' && (
                                    <div className="rounded-xl bg-warning/5 border border-warning/20 p-4 space-y-4">
                                        <p className="text-xs font-semibold text-warning uppercase tracking-wide">
                                            Datos del bien
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label>Marca</Label>
                                                <Input placeholder="Ej. Ford, Caterpillar" {...register(`garantias.${index}.marca`)} />
                                                {erroresItem?.marca && (
                                                    <p className="flex items-center gap-1 text-xs text-destructive">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                        {erroresItem.marca.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Modelo</Label>
                                                <Input placeholder="Ej. F-150, D6" {...register(`garantias.${index}.modelo`)} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Año</Label>
                                                <Input
                                                    type="number"
                                                    inputMode="numeric"
                                                    placeholder="2020"
                                                    {...register(`garantias.${index}.anio`, { valueAsNumber: true })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Número de serie</Label>
                                                <Input placeholder="VIN o número de serie" {...register(`garantias.${index}.numeroSerie`)} />
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
                                    <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-4">
                                        <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                                            Ubicación del inmueble
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5 sm:col-span-2">
                                                <Label>Calle</Label>
                                                <Input placeholder="Nombre de la calle" {...register(`garantias.${index}.calle`)} />
                                                {erroresItem?.calle && (
                                                    <p className="flex items-center gap-1 text-xs text-destructive">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                        {erroresItem.calle.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Número exterior</Label>
                                                <Input {...register(`garantias.${index}.numeroExterior`)} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Número interior</Label>
                                                <Input placeholder="Opcional" {...register(`garantias.${index}.numeroInterior`)} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Colonia</Label>
                                                <Input {...register(`garantias.${index}.colonia`)} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Código postal</Label>
                                                <Input inputMode="numeric" placeholder="00000" {...register(`garantias.${index}.codigoPostal`)} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Ciudad</Label>
                                                <Input {...register(`garantias.${index}.ciudad`)} />
                                                {erroresItem?.ciudad && (
                                                    <p className="flex items-center gap-1 text-xs text-destructive">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                        {erroresItem.ciudad.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Estado</Label>
                                                <Input {...register(`garantias.${index}.estado`)} />
                                                {erroresItem?.estado && (
                                                    <p className="flex items-center gap-1 text-xs text-destructive">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                        {erroresItem.estado.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Número de escritura</Label>
                                                <Input {...register(`garantias.${index}.numeroEscritura`)} />
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
                                                <Input {...register(`garantias.${index}.folioReal`)} />
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

                {/* Resumen de valor total — refuerzo positivo de progreso */}
                {valorTotal > 0 && (
                    <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                            Valor total en garantías
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                            {formatoMoneda(valorTotal)}
                        </span>
                    </div>
                )}

                <div className="flex justify-between pt-4 sticky bottom-0 bg-background/95 backdrop-blur-sm -mx-1 px-1 py-3 sm:static sm:bg-transparent sm:backdrop-blur-none sm:p-0">
                    <Button type="button" variant="ghost" onClick={onBack}>
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