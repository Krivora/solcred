'use client'

import { Check, Circle } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { Step } from '@/features/solicitudes/hooks/useSolicitudForm'
import type { Solicitud } from '@/features/solicitudes/types/solicitud.types'

const LABELS: Record<Step, string> = {
    programa: 'Programa',
    general: 'Generales',
    solicitante: 'Solicitante',
    aval: 'Aval',
    credito: 'Crédito',
    garantia: 'Garantía',
    negocio: 'Negocio',
    mercado: 'Mercado',
    bancarios: 'Bancarios',
    resumen: 'Resumen',
}

interface Props {
    currentStep: Step
    pasosActivos: Step[]
    onSelect: (step: Step) => void
    solicitud: Solicitud
}

function estaCompleta(step: Step, solicitud: Solicitud): boolean | null {
    switch (step) {
        case 'general':
            return Boolean(solicitud.tipoPersona && solicitud.sector && solicitud.tamanoEmpresa)
        case 'solicitante':
            return Boolean(solicitud.datosSolicitante)
        case 'aval':
            return Boolean(solicitud.datosAval)
        case 'credito':
            return Boolean(solicitud.datosCredito)
        case 'garantia':
            return Boolean(solicitud.datosGarantia)
        case 'negocio':
            return Boolean(solicitud.datosNegocio)
        case 'mercado':
            return Boolean(solicitud.datosMercado)
        case 'bancarios':
            return Boolean(solicitud.datosBancarios)
        case 'resumen':
            return null
        default:
            return null
    }
}

export function EditarSolicitudSidebar({ currentStep, pasosActivos, onSelect, solicitud }: Props) {
    return (
        <nav className="flex flex-col gap-1 w-48 shrink-0">
            {pasosActivos
                .filter((step) => step !== 'programa') // el step de selección de programa no aplica en edición
                .map((step) => {
                    const isCurrent = step === currentStep
                    const completa = estaCompleta(step, solicitud)

                    return (
                        <button
                            key={step}
                            type="button"
                            onClick={() => onSelect(step)}
                            className={cn(
                                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-colors',
                                isCurrent
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                            )}
                        >
                            {completa === true && (
                                <Check className="size-3.5 shrink-0 text-ok-ink" />
                            )}
                            {completa === false && (
                                <Circle className="size-3.5 shrink-0 text-warn-ink fill-warn/20" />
                            )}
                            {completa === null && (
                                <span className="size-3.5 shrink-0" />
                            )}
                            <span className="truncate">{LABELS[step]}</span>
                        </button>
                    )
                })}
        </nav>
    )
}