'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { SolicitudesTable } from '@/features/solicitudes/components/SolicitudesTable'
import { useMisSolicitudes } from '@/features/solicitudes/hooks/useMisSolicitudes'
import { Plus, RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { ESTATUS_FINALES } from '@/shared/types/solicitudes.types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog'

export default function MisSolicitudesPage() {
  const router = useRouter()
  const { solicitudes, isLoading, error, refetch } = useMisSolicitudes()
  const [dialogOpen, setDialogOpen] = useState(false)

  const solicitudActiva = solicitudes.find(
    s => !ESTATUS_FINALES.includes(s.estatus)
  )
  const tieneActiva = !!solicitudActiva

  const handleNuevaSolicitud = () => {
    if (tieneActiva) {
      setDialogOpen(true)
      return
    }
    router.push('/dashboard/usuarios/solicitudes/nueva')
  }

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
          <Button size="sm" className="gap-2" onClick={handleNuevaSolicitud}>
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

      {/* Dialog: solicitud activa */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle>Ya tienes una solicitud activa</DialogTitle>
            <DialogDescription className="pt-1.5">
              No puedes crear una nueva solicitud mientras la folio{' '}
              <span className="font-medium text-foreground">
                {solicitudActiva?.folio}
              </span>{' '}
              siga en curso. Podrás crear otra una vez que sea cancelada,
              rechazada o aprobada.
              <br /><br />
              Si crees que esto es un error o tu solicitud lleva demasiado tiempo
              sin movimiento, contáctanos a través de{' '}
              <span className="font-medium text-foreground">Soporte</span>{' '}
              para aclararlo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Entendido
            </Button>
            <Button
              onClick={() => {
                setDialogOpen(false)
                router.push(`/dashboard/usuarios/solicitudes/${solicitudActiva?.id}`)
              }}
            >
              Ver mi solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}