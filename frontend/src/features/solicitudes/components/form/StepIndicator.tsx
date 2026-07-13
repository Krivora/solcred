import { Check } from 'lucide-react'
import { cn } from '@/shared/lib/utils/cn'

const STEPS = [
  { key: 'programa',    label: 'Programa' },
  { key: 'general',     label: 'Generales' },
  { key: 'solicitante', label: 'Solicitante' },
  { key: 'aval',        label: 'Aval' },
  { key: 'credito',     label: 'Crédito' },
  { key: 'garantia',    label: 'Garantía' },
  { key: 'negocio',     label: 'Negocio' },
  { key: 'mercado',     label: 'Mercado' },
  { key: 'bancarios',   label: 'Bancarios' },
  { key: 'resumen',     label: 'Resumen' },
]

interface Props {
  currentIndex: number
}

export function StepIndicator({ currentIndex }: Props) {
  return (
    <div className="flex items-center justify-between w-full">
      {STEPS.map((step, i) => {
        const done    = i < currentIndex
        const active  = i === currentIndex
        const pending = i > currentIndex

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            {/* Círculo */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-semibold transition-all duration-300 shrink-0',
                  done    && 'bg-primary border-primary text-primary-foreground',
                  active  && 'border-primary text-primary bg-primary/10',
                  pending && 'border-border text-muted-foreground bg-background',
                )}
              >
                {done ? <Check className="w-4 h-4" /> : <span>{i + 1}</span>}
              </div>
              <span
                className={cn(
                  'text-[11px] font-medium whitespace-nowrap hidden lg:block',
                  active  && 'text-primary',
                  done    && 'text-primary',
                  pending && 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Línea conectora */}
            {i < STEPS.length - 1 && (
              <div className="flex-1 mx-2 mb-5">
                <div
                  className={cn(
                    'h-0.5 w-full rounded transition-all duration-500',
                    i < currentIndex ? 'bg-primary' : 'bg-border',
                  )}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}