import { useCallback } from 'react'
import { solicitudesApi } from '@/features/solicitudes/api/solicitudes.api'
import { useDescargarBlob } from '@/shared/hooks/useDescargarBlob'

export function useDescargarPDF() {
    const { descargar: descargarBlob, idDescargando, error } = useDescargarBlob()

    const descargar = useCallback(
        (id: string) =>
            descargarBlob(
                id,
                () => solicitudesApi.descargarPDF(id),
                'No se pudo generar el PDF. Intenta de nuevo.',
            ),
        [descargarBlob],
    )

    return { descargar, idDescargando, error }
}
