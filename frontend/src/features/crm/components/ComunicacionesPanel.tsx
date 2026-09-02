'use client'

import { useState } from 'react'
import { MessageSquarePlus, MessagesSquare } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Paginacion } from '@/shared/components/common/Paginacion'
import { useAuthStore } from '@/shared/stores/auth.store'
import { useHistorialComunicaciones } from '@/features/crm/hooks/useComunicaciones'
import { ComunicacionCard } from '@/features/crm/components/ComunicacionCard'
import { RegistrarComunicacionDialog } from '@/features/crm/components/RegistrarComunicacionDialog'
import type { Comunicacion } from '@/features/crm/types/crm.types'

interface Props {
  solicitudId: string
  /** Si el usuario puede registrar/editar (staff con acceso a la solicitud). */
  puedeRegistrar?: boolean
}

export function ComunicacionesPanel({ solicitudId, puedeRegistrar = true }: Props) {
  const { usuario } = useAuthStore()
  const personalId = usuario?.personal?.id ?? null

  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Comunicacion | null>(null)

  const { data, isLoading, isError } = useHistorialComunicaciones({ solicitudId, page })
  const comunicaciones = data?.data ?? []
  const meta = data?.pagination

  const abrirNueva = () => {
    setEditando(null)
    setDialogOpen(true)
  }
  const abrirEdicion = (c: Comunicacion) => {
    setEditando(c)
    setDialogOpen(true)
  }

  return (
    <section className="rounded-xl border border-border/60 bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary/10 p-2 ring-1 ring-primary/20">
            <MessagesSquare className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Historial de comunicaciones
            </h2>
            <p className="text-xs text-muted-foreground">
              {meta ? `${meta.total} registro${meta.total === 1 ? '' : 's'}` : 'Contactos con el cliente'}
            </p>
          </div>
        </div>

        {puedeRegistrar && (
          <Button size="sm" className="gap-1.5" onClick={abrirNueva}>
            <MessageSquarePlus className="h-3.5 w-3.5" />
            Registrar
          </Button>
        )}
      </header>

      <div className="space-y-3 p-4">
        {isLoading && (
          <>
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </>
        )}

        {isError && !isLoading && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No se pudo cargar el historial de comunicaciones.
          </p>
        )}

        {!isLoading && !isError && comunicaciones.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <MessagesSquare className="h-6 w-6 text-muted-foreground/60" />
            <p className="text-sm font-medium text-foreground">Sin comunicaciones registradas</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Cuando contactes al cliente sobre esta solicitud, deja aquí la constancia.
            </p>
          </div>
        )}

        {comunicaciones.map((c) => (
          <ComunicacionCard
            key={c.id}
            comunicacion={c}
            canEdit={puedeRegistrar && !!personalId && c.registradoPor.id === personalId}
            onEditar={abrirEdicion}
          />
        ))}

        {meta && meta.totalPages > 1 && (
          <div className="pt-1">
            <Paginacion meta={meta} onPaginar={setPage} />
          </div>
        )}
      </div>

      {dialogOpen && (
        <RegistrarComunicacionDialog
          key={editando?.id ?? 'nueva'}
          open
          onOpenChange={setDialogOpen}
          solicitudId={solicitudId}
          comunicacion={editando}
        />
      )}
    </section>
  )
}
