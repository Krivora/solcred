'use client'

import { use } from 'react'
import { AlertCircle } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { useNavAnimation } from '@/shared/hooks/useNavAnimation'
import { useAnalisis } from '@/features/analisis/hooks/useAnalisis'
import { AnalisisShell } from '@/features/analisis/components/AnalisisShell'

interface Props {
  params: Promise<{ solicitudId: string }>
}

export default function AnalisisPage({ params }: Props) {
  const { solicitudId } = use(params)
  const { analisis, contexto, origen, editable, cargando, error, guardado, guardarTab } = useAnalisis(solicitudId)
  const claseAnimacion = useNavAnimation('animate-slide-entrada')

  if (cargando) {
    return (
      <div className={`${claseAnimacion} space-y-4 p-6`}>
        <Skeleton className="h-10 w-72 rounded-lg" />
        <Skeleton className="h-10 w-full max-w-2xl rounded-lg" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !analisis || !contexto || !origen) {
    return (
      <div className={`${claseAnimacion} p-6`}>
        <ErrorState
          icon={AlertCircle}
          title="No se pudo cargar el análisis"
          description={error ?? 'Ocurrió un error inesperado.'}
          actionHref="/dashboard/financiamiento/mis-casos"
          actionLabel="Volver a Mis Casos"
        />
      </div>
    )
  }

  return (
    <div className={claseAnimacion}>
      <AnalisisShell
        contexto={contexto}
        analisis={analisis}
        origen={origen}
        editable={editable}
        guardado={guardado}
        onGuardarTab={guardarTab}
      />
    </div>
  )
}
