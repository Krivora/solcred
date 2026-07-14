'use client'

import { Check } from 'lucide-react'
import { cn } from "@/shared/lib/utils/cn"

const STEPS = [
    { id: 'programa', label: 'Programa' },
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
    currentIndex: number
}

export function StepIndicator({ currentIndex }: Props) {
    const total = STEPS.length
    const currentLabel = STEPS[currentIndex]?.label ?? ''

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

            {/* Puntos desktop — escala mejor que 10 círculos con texto */}
            <div className="hidden md:flex items-center justify-between mt-3">
                {STEPS.map((step, index) => {
                    const isCompleted = index < currentIndex
                    const isCurrent = index === currentIndex

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-1.5 flex-1 group">
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
                                {step.label}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}