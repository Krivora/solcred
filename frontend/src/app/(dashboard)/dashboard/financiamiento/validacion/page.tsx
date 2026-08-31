'use client'

import { ClipboardCheck, SendHorizonal, RotateCcw, XCircle, Ban } from 'lucide-react'
import { useValidacion } from '@/features/financiamiento/hooks/useFinanciamientoListados'
import { FinanciamientoListPage } from '@/features/financiamiento/components/FinanciamientoListPage'

export default function ValidacionPage() {
  const hook = useValidacion()

  return (
    <FinanciamientoListPage
      titulo="Validación"
      descripcion="Revisión del análisis del analista antes de pasar al comité"
      hook={hook}
      mostrarColumnaAnalista
      acciones={[
        {
          tipo: 'enviar_comite',
          label: 'Enviar al Comité',
          sub: 'Pasar al comité de crédito para decisión final',
          icon: <SendHorizonal className="h-3.5 w-3.5" />,
        },
        {
          tipo: 'regresar_analista',
          label: 'Regresar al Analista',
          sub: 'Devolver para ajustar el análisis',
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
        icon: <ClipboardCheck className="h-7 w-7" />,
        titulo: 'Sin solicitudes en validación',
        descripcion: 'No hay análisis pendientes de validar',
      }}
    />
  )
}
