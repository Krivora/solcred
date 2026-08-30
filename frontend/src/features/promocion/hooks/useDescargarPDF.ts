import { useCallback } from 'react'
import { solicitudesApi } from '@/features/promocion/api/promocion.api'
import { DOCUMENTO_LABELS, type DocumentoTipo } from '@/shared/config/documentos.config'
import { useDescargarBlob } from '@/shared/hooks/useDescargarBlob'

export function useDescargarPDF() {
    const { descargar: descargarBlob, idDescargando, error } = useDescargarBlob()

    const descargar = useCallback(
        (id: string, tipo: DocumentoTipo = 'solicitud') =>
            descargarBlob(
                id,
                () => solicitudesApi.descargarDocumento(id, tipo),
                `No se pudo generar el documento: ${DOCUMENTO_LABELS[tipo]}.`,
            ),
        [descargarBlob],
    )

    return { descargar, idDescargando, error }
}
