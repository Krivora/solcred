'use client'

import { Eye } from 'lucide-react'
import { useEsSoloLectura } from '@/shared/lib/permisos'

/**
 * Aviso persistente para el rol SUPERVISOR: puede consultar todo el sistema
 * pero no ejecutar acciones. Se muestra encima del contenido del dashboard.
 */
export function ModoSoloLecturaBanner() {
  const soloLectura = useEsSoloLectura()
  if (!soloLectura) return null

  return (
    <div
      role="status"
      className="mb-4 flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300"
    >
      <Eye className="size-3.5 shrink-0" />
      <span>
        <strong className="font-medium">Modo solo lectura.</strong> Tu rol
        (Supervisor) puede consultar toda la información del sistema pero no
        realizar acciones.
      </span>
    </div>
  )
}
