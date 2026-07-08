'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { HistoricoFiltros} from '@/features/promocion/components/historico/HistoricoFiltros'
import { HistoricoTable } from '@/features/promocion/components/historico/HistoricoTable'
import { useHistorico } from '@/features/promocion/hooks/useHistorico'
import { PageHeader, RefreshAction } from '@/shared/components/ui/PageHeader'

export default function HistoricoPage() {
    const { 
        solicitudes, meta, filtros, cargando, error,
        hayFiltrosActivos, actualizarFiltros, cambiarPagina,
        limpiarFiltros, recargar,
    } = useHistorico()

    return (
        <div className="mx-auto max-w-8xl space-y-6">

            <PageHeader
                title="Historial de Solicitudes"
                description="Solicitudes de promoción que han sido aprobadas o rechazadas"
                action={RefreshAction(recargar, cargando)}
            />

            <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
                <HistoricoFiltros
                    filtros={filtros}
                    onFiltrar={actualizarFiltros}
                    onLimpiar={limpiarFiltros}
                    hayFiltrosActivos={hayFiltrosActivos}
                />
            </div>

            {error && (
                <div className="flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                    <div className="shrink-0 p-1.5 bg-destructive/10 rounded-lg">
                        <AlertCircle className="h-4 w-4" />
                    </div>
                    <span className="flex-1">{error}</span>
                    <Button
                        variant="ghost" size="sm"
                        onClick={recargar}
                        className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                        Reintentar
                    </Button>
                </div>
            )}

            <HistoricoTable
                solicitudes={solicitudes}
                meta={meta}
                cargando={cargando}
                onPaginar={cambiarPagina}
                onRefresh={recargar}
            />
        </div>
    )
}