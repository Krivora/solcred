'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { useAuthStore } from '@/shared/stores/auth.store'
import { NotificacionesLista } from '@/features/notificaciones/components/NotificacionesLista'
import { useNotificaciones } from '@/features/notificaciones/hooks/useNotificaciones'
import { useAccionesNotificacion } from '@/features/notificaciones/hooks/useAccionesNotificacion'

const PAGE_SIZE = 20

export function NotificacionesPage() {
  const [tab, setTab] = useState<'todas' | 'no-leidas'>('todas')
  const [page, setPage] = useState(1)
  const rol = useAuthStore((s) => s.rol) ?? undefined

  const { data, isLoading } = useNotificaciones({
    page,
    pageSize: PAGE_SIZE,
    soloNoLeidas: tab === 'no-leidas',
  })
  const { marcarTodasLeidas } = useAccionesNotificacion()

  const notificaciones = data?.data ?? []
  const { page: paginaActual, totalPages } = data?.pagination ?? { page: 1, totalPages: 1 }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notificaciones"
        description="Avisos de tus solicitudes y asignaciones."
        action={{
          label: 'Marcar todas como leídas',
          onClick: () => marcarTodasLeidas.mutate(),
          loading: marcarTodasLeidas.isPending,
          variant: 'outline',
        }}
      />

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as 'todas' | 'no-leidas')
          setPage(1)
        }}
      >
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="no-leidas">No leídas</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border border-hairline bg-surface">
        <NotificacionesLista notificaciones={notificaciones} cargando={isLoading} rol={rol} />

        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-hairline px-3 py-2.5">
            <p className="text-caption text-ink-subtle">
              Página {paginaActual} de {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={paginaActual <= 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Página anterior"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={paginaActual >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Página siguiente"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
