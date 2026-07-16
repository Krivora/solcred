// features/solicitudes/components/form/StepCredito.tsx
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
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent } from '@/shared/components/ui/card'
import type {
    ConceptoCredito,
    DatosCredito,
} from '@/features/solicitudes/types/solicitud.types'
import { CategoriaCredito } from '@/shared/lib/types/solicitudes.types'
interface StepCreditoProps {
    defaultValues?: DatosCredito
    onSubmit: (dto: DatosCredito) => void
    onBack: () => void
    loading?: boolean
    error?: string | null
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
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Encabezado */}
            <div className="flex items-center gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-foreground leading-tight">
                        Datos del crédito
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Plazo, gracia y destino de los recursos solicitados
                    </p>
                </div>
            </div>

            {/* Condiciones + Total en una sola franja */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <Card className="lg:col-span-3">
                    <CardContent className="pt-5 pb-5">
                        <div className="flex items-center gap-2 mb-4">
                            <CalendarClock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                                Condiciones
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="plazoMeses" className="text-xs text-muted-foreground">
                                    Plazo (meses)
                                </Label>
                                <Input
                                    id="plazoMeses"
                                    type="number"
                                    min={1}
                                    value={plazoMeses || ''}
                                    onChange={(e) => setPlazoMeses(Number(e.target.value))}
                                    placeholder="24"
                                    className="text-base font-medium"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="mesesGracia" className="text-xs text-muted-foreground">
                                    Meses de gracia
                                </Label>
                                <Input
                                    id="mesesGracia"
                                    type="number"
                                    min={0}
                                    value={mesesGracia || ''}
                                    onChange={(e) => setMesesGracia(Number(e.target.value))}
                                    placeholder="0"
                                    className="text-base font-medium"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 bg-primary text-primary-foreground border-primary overflow-hidden relative">
                    <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary-foreground/10" />
                    <CardContent className="pt-5 pb-5 relative flex flex-col justify-center h-full">
                        <span className="text-xs font-medium uppercase tracking-wide text-primary-foreground/70">
                            Monto total solicitado
                        </span>
                        <span className="text-3xl font-bold tabular-nums mt-1.5">
                            {formatoMoneda(totalGeneral)}
                        </span>
                        <span className="text-xs text-primary-foreground/70 mt-1.5">
                            {conceptos.filter((c) => c.concepto.trim() && c.monto > 0).length}{' '}
                            {conceptos.filter((c) => c.concepto.trim() && c.monto > 0).length === 1
                                ? 'concepto capturado'
                                : 'conceptos capturados'}
                        </span>
                    </CardContent>
                </Card>
            </div>

            {/* Destino del crédito — grid horizontal */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                    Destino del crédito
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {CATEGORIAS.map(({ key, label, descripcion, icon: Icon }) => {
                        const items = conceptos
                            .map((c, i) => ({ ...c, index: i }))
                            .filter((c) => c.categoria === key)
                        const subtotal = subtotalPorCategoria(key)

                        return (
                            <Card
                                key={key}
                                className="flex flex-col overflow-hidden border-t-2 border-t-primary"
                            >
                                <CardContent className="pt-4 pb-4 flex flex-col gap-3 flex-1">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                                                <Icon className="h-4 w-4 text-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground leading-tight">
                                                    {label}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {descripcion}
                                                </p>
                                            </div>
                                        </div>
                                        {items.length > 0 && (
                                            <span className="text-[11px] font-medium text-muted-foreground bg-muted rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center shrink-0">
                                                {items.length}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        {items.length === 0 && (
                                            <button
                                                type="button"
                                                onClick={() => agregarConcepto(key)}
                                                className="w-full border border-dashed border-border rounded-md py-5 text-center text-xs text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
                                            >
                                                <Plus className="h-4 w-4 mx-auto mb-1" />
                                                Agregar concepto
                                            </button>
                                        )}

                                        {items.map((concepto) => (
                                            <div key={concepto.index} className="space-y-1.5">
                                                <div className="flex gap-1.5">
                                                    <Input
                                                        placeholder="Concepto"
                                                        value={concepto.concepto}
                                                        onChange={(e) =>
                                                            actualizarConcepto(
                                                                concepto.index,
                                                                'concepto',
                                                                e.target.value
                                                            )
                                                        }
                                                        className="text-sm h-9"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => eliminarConcepto(concepto.index)}
                                                        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="Monto"
                                                    value={concepto.monto || ''}
                                                    onChange={(e) =>
                                                        actualizarConcepto(
                                                            concepto.index,
                                                            'monto',
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    className="text-sm h-9"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {items.length > 0 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => agregarConcepto(key)}
                                                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Agregar otro
                                            </button>

                                            <div className="pt-3 border-t border-border flex items-center justify-between">
                                                <span className="text-[11px] text-muted-foreground">
                                                    Subtotal
                                                </span>
                                                <span className="text-sm font-semibold tabular-nums text-foreground">
                                                    {formatoMoneda(subtotal)}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {(formError || error) && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3.5 py-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError || error}</span>
                </div>
            )}

            <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
                    Atrás
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : 'Continuar'}
                </Button>
            </div>
        </form>
    )
}