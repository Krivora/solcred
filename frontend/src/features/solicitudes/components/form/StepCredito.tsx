'use client'
import { useState } from 'react'
import {
    Plus,
    Trash2,
    Wallet,
    Wrench,
    Hammer,
    AlertCircle,
    CalendarClock,
    Clock,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent } from '@/shared/components/ui/card'
import type {
    ConceptoCredito,
    DatosCredito,
} from '@/features/solicitudes/types/solicitud.types'
import { CategoriaCredito } from '@/shared/types/solicitudes.types'
import { MontoInput } from '@/shared/components/common/inputs'
import { montoAFloat } from '@/shared/lib/masks'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { StepHeader } from './StepHeader'

interface StepCreditoProps {
    defaultValues?: DatosCredito
    onSubmit: (dto: DatosCredito) => void
    onBack: () => void
    loading?: boolean
    error?: string | null
    skipLabel?: string
    onSkip?: () => void
}

const CATEGORIAS: {
    key: CategoriaCredito
    label: string
    descripcion: string
    icon: typeof Wallet
}[] = [
        {
            key: 'CAPITAL',
            label: 'Capital de trabajo',
            descripcion: 'Insumos, nómina, operación',
            icon: Wallet,
        },
        {
            key: 'MAQUINARIA_EQUIPO',
            label: 'Maquinaria y equipo',
            descripcion: 'Activos productivos',
            icon: Wrench,
        },
        {
            key: 'REMODELACION',
            label: 'Remodelación',
            descripcion: 'Obra y adecuaciones',
            icon: Hammer,
        },
    ]

function crearConceptoVacio(categoria: CategoriaCredito): ConceptoCredito {
    return { categoria, concepto: '', monto: 0 }
}

function formatoMoneda(valor: number) {
    return valor.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })
}

export function StepCredito({
    defaultValues,
    onSubmit,
    onBack,
    loading,
    error,
    skipLabel, onSkip
}: StepCreditoProps) {
    const [plazoMeses, setPlazoMeses] = useState(defaultValues?.plazoMeses ?? 0)
    const [mesesGracia, setMesesGracia] = useState(defaultValues?.mesesGracia ?? 0)
    const [conceptos, setConceptos] = useState<ConceptoCredito[]>(
        defaultValues?.conceptos?.length
            ? defaultValues.conceptos
            : [crearConceptoVacio('CAPITAL')]
    )
    const [formError, setFormError] = useState<string | null>(null)

    const conceptosPorCategoria = (categoria: CategoriaCredito) =>
        conceptos.filter((c) => c.categoria === categoria)

    const subtotalPorCategoria = (categoria: CategoriaCredito) =>
        conceptosPorCategoria(categoria).reduce((sum, c) => sum + (c.monto || 0), 0)

    const totalGeneral = conceptos.reduce((sum, c) => sum + (c.monto || 0), 0)
    const conceptosCapturados = conceptos.filter((c) => c.concepto.trim() && c.monto > 0).length

    function agregarConcepto(categoria: CategoriaCredito) {
        setConceptos((prev) => [...prev, crearConceptoVacio(categoria)])
    }

    function eliminarConcepto(index: number) {
        setConceptos((prev) => prev.filter((_, i) => i !== index))
    }

    function actualizarConcepto(
        index: number,
        campo: 'concepto' | 'monto',
        valor: string | number
    ) {
        setConceptos((prev) =>
            prev.map((c, i) => (i === index ? { ...c, [campo]: valor } : c))
        )
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setFormError(null)

        if (plazoMeses <= 0) {
            setFormError('El plazo debe ser mayor a 0 meses')
            return
        }
        if (mesesGracia > plazoMeses) {
            setFormError('El periodo de gracia no puede ser mayor al plazo total')
            return
        }

        const conceptosValidos = conceptos.filter(
            (c) => c.concepto.trim() !== '' && c.monto > 0
        )
        if (conceptosValidos.length === 0) {
            setFormError('Agrega al menos un concepto con monto mayor a 0')
            return
        }

        onSubmit({ plazoMeses, mesesGracia, conceptos: conceptosValidos })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <StepHeader
                icon={Wallet}
                title="Datos del crédito"
                subtitle="Define plazo, gracia y el destino de los recursos."
            >
                <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Monto total solicitado
                </span>
                <span className="block text-2xl font-bold tabular-nums text-primary leading-tight">
                    {formatoMoneda(totalGeneral)}
                </span>
                <span className="block text-xs text-muted-foreground">
                    {conceptosCapturados}{' '}
                    {conceptosCapturados === 1 ? 'concepto capturado' : 'conceptos capturados'}
                </span>
            </StepHeader>

            {/* Condiciones — ancho completo, campos con espacio real */}
            <Card>
                <CardContent className="pt-5 pb-5">
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                            Condiciones del crédito
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:max-w-xl">
                        <div className="space-y-1.5">
                            <Label htmlFor="plazoMeses" className="text-xs text-muted-foreground">
                                Plazo (meses)
                            </Label>
                            <Select
                                value={plazoMeses ? String(plazoMeses) : ''}
                                onValueChange={(v) => setPlazoMeses(Number(v))}
                            >
                                <SelectTrigger id="plazoMeses" className="w-full h-12 text-base font-medium">
                                    <SelectValue placeholder="Selecciona" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[6, 12, 18, 24, 30, 36].map((meses) => (
                                        <SelectItem key={meses} value={String(meses)}>
                                            {meses} meses
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="mesesGracia" className="text-xs text-muted-foreground">
                                Meses de gracia
                            </Label>
                            <Select
                                value={mesesGracia ? String(mesesGracia) : ''}
                                onValueChange={(v) => setMesesGracia(Number(v))}
                            >
                                <SelectTrigger id="mesesGracia" className="w-full h-12 text-base font-medium">
                                    <SelectValue placeholder="Selecciona" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6].map((meses) => (
                                        <SelectItem key={meses} value={String(meses)}>
                                            {meses} {meses === 1 ? 'mes' : 'meses'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {mesesGracia > 0 && plazoMeses > 0 && (
                        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                                Pagarás intereses ordinarios los primeros {mesesGracia}{' '}
                                {mesesGracia === 1 ? 'mes' : 'meses'} y comenzarás a amortizar capital
                                a partir del mes {mesesGracia + 1} de {plazoMeses}.
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Destino del crédito — lista vertical, una sección por categoría */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                    Destino del crédito
                </h3>

                {CATEGORIAS.map(({ key, label, descripcion, icon: Icon }) => {
                    const items = conceptos
                        .map((c, i) => ({ ...c, index: i }))
                        .filter((c) => c.categoria === key)
                    const subtotal = subtotalPorCategoria(key)

                    return (
                        <Card key={key} className="overflow-hidden">
                            <CardContent className="p-0">
                                {/* Encabezado de la sección */}
                                <div className="flex items-center justify-between gap-3 px-5 py-4 bg-accent/30 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                            <Icon className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground leading-tight">
                                                {label}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {descripcion}
                                            </p>
                                        </div>
                                    </div>
                                    {subtotal > 0 && (
                                        <span className="text-sm font-semibold tabular-nums text-foreground shrink-0">
                                            {formatoMoneda(subtotal)}
                                        </span>
                                    )}
                                </div>

                                {/* Contenido: conceptos o estado vacío */}
                                <div className="p-5">
                                    {items.length === 0 ? (
                                        <button
                                            type="button"
                                            onClick={() => agregarConcepto(key)}
                                            className="w-full border border-dashed border-border rounded-lg py-6 text-center text-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
                                        >
                                            <Plus className="h-4 w-4 mx-auto mb-1.5" />
                                            Agregar concepto
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            {items.map((concepto) => (
                                                <div
                                                    key={concepto.index}
                                                    className="flex flex-col sm:flex-row gap-2.5 sm:items-center"
                                                >
                                                    <Input
                                                        placeholder="Concepto (ej. Compra de torno CNC)"
                                                        value={concepto.concepto}
                                                        onChange={(e) =>
                                                            actualizarConcepto(
                                                                concepto.index,
                                                                'concepto',
                                                                e.target.value
                                                            )
                                                        }
                                                        className="h-11 sm:flex-1"
                                                    />
                                                    <MontoInput
                                                        placeholder="Monto"
                                                        value={concepto.monto ? String(concepto.monto) : ''}
                                                        onChange={(valorCrudo) =>
                                                            actualizarConcepto(
                                                                concepto.index,
                                                                'monto',
                                                                montoAFloat(valorCrudo) ?? 0
                                                            )
                                                        }
                                                        className="h-11 sm:w-44 text-right"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => eliminarConcepto(concepto.index)}
                                                        className="h-11 w-11 shrink-0 self-end sm:self-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}

                                            <button
                                                type="button"
                                                onClick={() => agregarConcepto(key)}
                                                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors pt-1"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Agregar otro concepto
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {(formError || error) && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3.5 py-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError || error}</span>
                </div>
            )}

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