import { apiAuth } from '@/shared/lib/client'
import type {
    Expediente,
    DocumentoActivo,
    ValidarDocumentoDto,
    DocumentoConValidacionRaw,
} from '../types/expediente.types'

export const expedienteApi = {
    // ─── Vista general del expediente ──────────────────────────────────────────
    obtener: (solicitudId: string) =>
        apiAuth<Expediente>(`/expediente/${solicitudId}`),

    // La subida de documentos vive ahora en uploads.api.ts (uploadsApi.subirArchivo),
    // porque requiere multipart/form-data y validación de contenido real del
    // archivo antes de crear el registro — ya no es un simple POST de JSON.

    // ─── Gestor valida documento ────────────────────────────────────────────────
    validarDocumento: (
        solicitudId: string,
        documentoId: string,
        dto: ValidarDocumentoDto
    ) =>
        apiAuth<DocumentoActivo>(
            `/expediente/${solicitudId}/documentos/${documentoId}/validar`,
            { method: 'PATCH', body: dto }
        ),

    // ─── Historial de versiones ─────────────────────────────────────────────────
    historial: (solicitudId: string, tipoDocumentoId: string) =>
        apiAuth<DocumentoConValidacionRaw[]>(
            `/expediente/${solicitudId}/documentos/${tipoDocumentoId}/historial`
        ),
}