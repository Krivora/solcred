'use client'

import { Users, CheckCircle2, RotateCcw, XCircle, Ban } from 'lucide-react'
import { useComite } from '@/features/financiamiento/hooks/useFinanciamientoListados'
import { FinanciamientoListPage } from '@/features/financiamiento/components/FinanciamientoListPage'

export default function ComitePage() {
  const hook = useComite()

  return (
    <FinanciamientoListPage
      titulo="Comité de Crédito"
      descripcion="Decisión final: aprobar o rechazar el crédito"
      hook={hook}
      mostrarColumnaAnalista
      mostrarInforme
      acciones={[
        {
          tipo: 'aprobar',
          label: 'Aprobar Solicitud',
          sub: 'Aprobar el crédito — estatus final APROBADO',
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        },
        {
          tipo: 'regresar_validacion',
          label: 'Regresar a Validación',
          sub: 'Devolver para nueva revisión del supervisor',
          icon: <RotateCcw className="h-3.5 w-3.5" />,
        },
        {
          tipo: 'rechazar',
          label: 'Rechazar Solicitud',
          sub: 'Decisión de crédito negativa',
          icon: <XCircle className="h-3.5 w-3.5" />,
          destructive: true,
          separadorAntes: true,
        },
        {
          tipo: 'cancelar',
          label: 'Cancelar Solicitud',
          sub: 'Cancelar definitivamente esta solicitud',
          icon: <Ban className="h-3.5 w-3.5" />,
          destructive: true,
        },
      ]}
      vacio={{
        icon: <Users className="h-7 w-7" />,
        titulo: 'Sin solicitudes en comité',
        descripcion: 'No hay solicitudes pendientes de decisión',
      }}
    />
  )
}
