import { apiAuth } from '@/shared/lib/client'

export const uploadsApi = {
    // ─── Sube un PDF y crea la nueva versión del documento en un solo paso ────
    subirArchivo: (solicitudId: string, tipoDocumentoId: string, archivo: File) => {
        const formData = new FormData();
        formData.append('tipoDocumentoId', tipoDocumentoId);
        formData.append('archivo', archivo);

        return apiAuth<{
            documentoId: string;
            version: number;
            nombreArchivo: string;
            tipoDocumento: { id: string; nombre: string };
        }>(`/uploads/${solicitudId}`, {
            method: 'POST',
            body: formData,
        });
    },

    // ─── Descarga el PDF de un documento específico ────────────────────────────
    descargarArchivo: async (solicitudId: string, documentoId: string): Promise<Blob> =>
        apiAuth<Blob>(`/uploads/${solicitudId}/${documentoId}`),
}