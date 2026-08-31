'use client'

import { FolderKanban, SendHorizonal, Ban } from 'lucide-react'
import { useMisCasosFinanciamiento } from '@/features/financiamiento/hooks/useFinanciamientoListados'
import { FinanciamientoListPage } from '@/features/financiamiento/components/FinanciamientoListPage'

export default function MisCasosFinanciamientoPage() {
  const hook = useMisCasosFinanciamiento()

  return (
    <FinanciamientoListPage
      titulo="Mis Casos"
      descripcion="Solicitudes asignadas a ti para análisis financiero"
      hook={hook}
      acciones={[
        {
          tipo: 'enviar_validacion',
          label: 'Enviar a Validación',
          sub: 'Mandar el análisis a revisión del supervisor',
          icon: <SendHorizonal className="h-3.5 w-3.5" />,
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
        icon: <FolderKanban className="h-7 w-7" />,
        titulo: 'No tienes casos asignados',
        descripcion: 'Cuando te asignen una solicitud aparecerá aquí',
      }}
    />
  )
}
