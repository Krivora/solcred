'use client'

import { CheckSquare,} from 'lucide-react'
import { SolicitudesTable } from '../SolicitudesTable'
import type { SolicitudPromocion, PaginacionMeta } from '@/shared/lib/types/solicitudes.types'
import { DocumentosDropdown } from './DocumentosDropdown'

interface Props {
  solicitudes: SolicitudPromocion[]
  meta: PaginacionMeta
  cargando: boolean
  onPaginar: (page: number) => void
  onRefresh: () => void
}

export function HistoricoTable({ solicitudes, meta, cargando, onPaginar }: Props) {
  return (
    <>
      <SolicitudesTable
        solicitudes={solicitudes}
        meta={meta}
        cargando={cargando}
        onPaginar={onPaginar}
        config={{
          getExpedienteUrl: (id) => `/dashboard/admin/promocion/expediente/${id}`,
          getPdfUrl:        (id) => `/dashboard/admin/solicitudes/${id}/pdf`,
          mostrarColumnaGestor:  true,
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
            onSeleccionar={() => {
              // ruta/descarga del documento
            }}
          />
        ),
        }}
      />
    </>
  )
}