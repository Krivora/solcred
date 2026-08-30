import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import type { PaginacionMeta } from '@/shared/types/solicitudes.types'

interface PaginacionProps {
    meta: PaginacionMeta
    onPaginar: (page: number) => void
}

export function Paginacion({ meta, onPaginar }: PaginacionProps) {
    const desde = Math.min((meta.page - 1) * meta.limit + 1, meta.total)
    const hasta = Math.min(meta.page * meta.limit, meta.total)

    return (
        <div className="flex items-center justify-between px-1">
            <p className="text-xs text-muted-foreground">
                Mostrando{' '}
                <span className="font-semibold text-foreground">{desde}–{hasta}</span>
                {' '}de{' '}
                <span className="font-semibold text-foreground">{meta.total.toLocaleString('es-MX')}</span>
                {' '}solicitudes
            </p>

            <div className="flex items-center gap-1">
                <Button
                    variant="outline" size="icon"
                    className="h-7 w-7 border-border/60 hover:bg-accent"
                    disabled={meta.page <= 1}
                    onClick={() => onPaginar(meta.page - 1)}
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                </Button>

                {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                    const p = Math.max(1, meta.page - 2) + i
                    if (p > meta.totalPages) return null
                    return (
                        <Button
                            key={p}
                            variant={p === meta.page ? 'default' : 'outline'}
                            size="icon"
                            className={`h-7 w-7 text-xs border-border/60 ${p === meta.page
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                                : 'hover:bg-accent'
                                }`}
                            onClick={() => onPaginar(p)}
                        >
                            {p}
                        </Button>
                    )
                })}

                <Button
                    variant="outline" size="icon"
                    className="h-7 w-7 border-border/60 hover:bg-accent"
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => onPaginar(meta.page + 1)}
                >
                    <ChevronRight className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    )
}