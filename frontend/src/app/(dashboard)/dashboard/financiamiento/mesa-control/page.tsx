'use client'

import { Eye, SendHorizonal, RotateCcw, Ban } from 'lucide-react'
import { useMesaControl } from '@/features/financiamiento/hooks/useFinanciamientoListados'
import { FinanciamientoListPage } from '@/features/financiamiento/components/FinanciamientoListPage'

export default function MesaControlPage() {
  const hook = useMesaControl()

  return (
    <FinanciamientoListPage
      titulo="Mesa de Control"
      descripcion="Solicitudes recibidas de aprobación — revisión de información y documentos"
      hook={hook}
      acciones={[
        {
          tipo: 'pasar_asignacion',
          label: 'Pasar a Asignación',
          sub: 'Enviar a la cola de asignación de analista',
          icon: <SendHorizonal className="h-3.5 w-3.5" />,
        },
        {
          tipo: 'regresar_aprobacion',
          label: 'Regresar a Aprobación',
          sub: 'Devolver al comité de aprobación de Promoción',
          icon: <RotateCcw className="h-3.5 w-3.5" />,
        },
        {
          tipo: 'cancelar',
          label: 'Cancelar Solicitud',
          sub: 'Cancelar definitivamente esta solicitud',
          icon: <Ban className="h-3.5 w-3.5" />,
          destructive: true,
          separadorAntes: true,
        },
      ]}
      vacio={{
        icon: <Eye className="h-7 w-7" />,
        titulo: 'Sin solicitudes en Mesa de Control',
        descripcion: 'No hay solicitudes pendientes de revisión',
      }}
    />
  )
}
