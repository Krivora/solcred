'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { PageHeader, RefreshAction } from '@/shared/components/common/PageHeader'
import { SolicitudesTable } from '@/features/solicitudes/components/SolicitudesTable'
import { useMisSolicitudes } from '@/features/solicitudes/hooks/useMisSolicitudes'
import { useNavAnimation } from '@/shared/hooks/useNavAnimation'
import { Plus, AlertCircle, AlertTriangle } from 'lucide-react'
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
  const claseAnimacion = useNavAnimation('') // '' = sin animación salvo que regreses del detalle/expediente

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
    <div className={cn(claseAnimacion, 'space-y-6')}>
      <PageHeader
        title="Mis solicitudes"
        description="Consulta y da seguimiento a tus solicitudes de crédito."
        actions={[
          RefreshAction(refetch, isLoading),
          {
            label: 'Nueva solicitud',
            onClick: handleNuevaSolicitud,
            icon: <Plus className="h-3.5 w-3.5" />,
            variant: 'default',
          },
        ]}
      />

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
