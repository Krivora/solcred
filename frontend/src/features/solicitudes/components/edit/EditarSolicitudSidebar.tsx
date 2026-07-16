// EditarSolicitudSidebar.tsx
'use client'

import { Check, Circle } from 'lucide-react'
import { cn } from '@/shared/lib/utils/cn'
import type { Step } from '../../hooks/useSolicitudForm'
import type { Solicitud } from '@/features/solicitudes/types/solicitud.types'

const SECCIONES: { id: Step; label: string }[] = [
    { id: 'general', label: 'Generales' },
    { id: 'solicitante', label: 'Solicitante' },
    { id: 'aval', label: 'Aval' },
    { id: 'credito', label: 'Crédito' },
    { id: 'garantia', label: 'Garantía' },
    { id: 'negocio', label: 'Negocio' },
    { id: 'mercado', label: 'Mercado' },
    { id: 'bancarios', label: 'Bancarios' },
    { id: 'resumen', label: 'Resumen' },
]

interface Props {
    currentStep: Step
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
            // El aval puede ser opcional según el programa — null indica "no aplica/no requerido"
            return solicitud.datosAval?.id || solicitud.programa?.nombre
                ? Boolean(solicitud.datosAval)
                : null
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

export function EditarSolicitudSidebar({ currentStep, onSelect, solicitud }: Props) {
    return (
        <nav className="flex flex-col gap-1 w-48 shrink-0">
            {SECCIONES.map((s) => {
                const isCurrent = s.id === currentStep
                const completa = estaCompleta(s.id, solicitud)

                return (
                    <button
                        key={s.id}
                        type="button"
                        onClick={() => onSelect(s.id)}
                        className={cn(
                            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-colors',
                            isCurrent
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        )}
                    >
                        {completa === true && (
                            <Check className="size-3.5 shrink-0 text-emerald-600" />
                        )}
                        {completa === false && (
                            <Circle className="size-3.5 shrink-0 text-amber-500 fill-amber-500/20" />
                        )}
                        {completa === null && (
                            <span className="size-3.5 shrink-0" />
                        )}
                        <span className="truncate">{s.label}</span>
                    </button>
                )
            })}
        </nav>
    )
}