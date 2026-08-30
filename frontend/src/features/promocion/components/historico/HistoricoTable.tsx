'use client'

import { CheckSquare } from 'lucide-react'
import { SolicitudesTable } from '@/features/promocion/components/SolicitudesTable'
import type { SolicitudPromocion, PaginacionMeta } from '@/features/promocion/types/solicitud.types'
import { DocumentosDropdown } from './DocumentosDropdown'
import { useDescargarPDF } from '@/features/promocion/hooks/useDescargarPDF'

interface Props {
  solicitudes: SolicitudPromocion[]
  meta: PaginacionMeta
  cargando: boolean
  onPaginar: (page: number) => void
  onRefresh: () => void
}

export function HistoricoTable({ solicitudes, meta, cargando, onPaginar }: Props) {
  const { descargar, idDescargando, error } = useDescargarPDF()

  return (
    <>
      <SolicitudesTable
        solicitudes={solicitudes}
        meta={meta}
        cargando={cargando}
        onPaginar={onPaginar}
        config={{
          getExpedienteUrl: (id) => `/dashboard/admin/promocion/expediente/${id}`,
          mostrarColumnaGestor: true,
          mostrarColumnaEstatus: true,
          mostrarColumnaComentario: false,
          mostrarColumnaPdf: false,
          labelFecha: 'Recibida',
          vacioCopy: {
            icon: <CheckSquare className="h-7 w-7" />,
            titulo: 'Sin solicitudes en aprobación',
            descripcion: 'No hay solicitudes pendientes de aprobación',
          },
          renderDocumentos: (solicitudId, estatus) => (
            <DocumentosDropdown
              estatus={estatus}
              disabled={idDescargando === solicitudId}
              onSeleccionar={(tipo) => descargar(solicitudId, tipo)}
            />
          ),
        }}
      />
      {error && (
        <p className="text-xs text-destructive px-1">{error}</p>
      )}
    </>
  )
}