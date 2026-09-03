'use client'

import { useState } from 'react'
import { MessageSquarePlus } from 'lucide-react'
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
    <section className="rounded-lg border border-hairline bg-card">
      <header className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4">
        <div>
          <h2 className="text-heading text-ink">Historial de comunicaciones</h2>
          <p className="mt-0.5 text-body-sm text-ink-muted">
            {meta
              ? `${meta.total} ${meta.total === 1 ? 'contacto' : 'contactos'} con el cliente`
              : 'Contactos con el cliente'}
          </p>
        </div>

        {puedeRegistrar && (
          <Button size="sm" className="shrink-0" onClick={abrirNueva}>
            <MessageSquarePlus className="size-3.5" />
            Registrar
          </Button>
        )}
      </header>

      <div className="px-5 py-4">
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        )}

        {isError && !isLoading && (
          <p className="py-6 text-center text-body-sm text-ink-muted">
            No se pudo cargar el historial de comunicaciones.
          </p>
        )}

        {!isLoading && !isError && comunicaciones.length === 0 && (
          <div className="flex flex-col items-center gap-1.5 py-10 text-center">
            <MessageSquarePlus className="size-5 text-ink-subtle" />
            <p className="text-heading text-ink">Sin comunicaciones registradas</p>
            <p className="max-w-xs text-body-sm text-ink-muted">
              Cuando contactes al cliente sobre esta solicitud, deja aquí la constancia.
            </p>
          </div>
        )}

        {comunicaciones.length > 0 && (
          <div className="divide-y divide-hairline">
            {comunicaciones.map((c) => (
              <ComunicacionCard
                key={c.id}
                comunicacion={c}
                canEdit={puedeRegistrar && !!personalId && c.registradoPor.id === personalId}
                onEditar={abrirEdicion}
              />
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="mt-4 border-t border-hairline pt-4">
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
