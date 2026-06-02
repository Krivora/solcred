'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/shared/components/ui/button'
import { SolicitudesTable } from '@/components/usuarios/solicitudes/Solicitudestable'
import { useMisSolicitudes } from '@/shared/lib/hooks/Usemissolicitudes'
import { Plus, RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '@/shared/lib/utils/cn'

export default function MisSolicitudesPage() {
  const router = useRouter()
  const { solicitudes, isLoading, error, refetch } = useMisSolicitudes()

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis solicitudes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Consulta y da seguimiento a tus solicitudes de crédito.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={refetch}
            disabled={isLoading}
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
            Actualizar
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => router.push('/dashboard/usuarios/solicitudes/nueva')}
          >
            <Plus className="w-4 h-4" />
            Nueva solicitud
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-destructive hover:text-destructive"
            onClick={refetch}
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Table */}
      {!error && (
        <SolicitudesTable solicitudes={solicitudes} isLoading={isLoading} onEnviada={refetch} />
      )}
    </div>
  )
}