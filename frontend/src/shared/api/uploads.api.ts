import { apiAuth } from '@/shared/api/client'

export const uploadsApi = {
    subirArchivo: (solicitudId: string, tipoDocumentoId: string, archivo: File) => {
        const formData = new FormData()
        formData.append('tipoDocumentoId', tipoDocumentoId)
        formData.append('archivo', archivo)

        return apiAuth<{
            documentoId: string
            version: number
            nombreArchivo: string
            tipoDocumento: { id: string; nombre: string }
        }>(`/uploads/${solicitudId}`, {
            method: 'POST',
            body: formData,
        })
    },

    descargarArchivo: (solicitudId: string, documentoId: string): Promise<Blob> =>
        apiAuth<Blob>(`/uploads/${solicitudId}/${documentoId}`),
}