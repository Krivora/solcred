'use client'

import { Check } from 'lucide-react'
import { cn } from "@/shared/lib/utils/cn"
import type { Step } from '@/features/solicitudes/hooks/useSolicitudForm'

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
    pasos: Step[]
    currentIndex: number
}

export function StepIndicator({ pasos, currentIndex }: Props) {
    const total = pasos.length
    const currentLabel = LABELS[pasos[currentIndex]] ?? ''

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                    Paso {currentIndex + 1} de {total}
                </span>
                <span className="text-sm text-muted-foreground">{currentLabel}</span>
            </div>

            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                    className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                />
            </div>

            <div className="hidden md:flex items-center justify-between mt-3">
                {pasos.map((step, index) => {
                    const isCompleted = index < currentIndex
                    const isCurrent = index === currentIndex

                    return (
                        <div key={step} className="flex flex-col items-center gap-1.5 flex-1 group">
                            <div
                                className={cn(
                                    'flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-semibold transition-colors duration-200 shrink-0',
                                    isCompleted && 'bg-primary text-primary-foreground',
                                    isCurrent && 'bg-primary/15 text-primary ring-2 ring-primary ring-offset-2 ring-offset-background',
                                    !isCompleted && !isCurrent && 'bg-secondary text-muted-foreground'
                                )}
                            >
                                {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
                            </div>
                            <span
                                className={cn(
                                    'text-[10px] text-center leading-tight max-w-[60px] truncate',
                                    isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
                                )}
                            >
                                {LABELS[step]}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}