import { apiAuth } from '@/shared/lib/client'
import type {
    Expediente,
    DocumentoActivo,
    SubirDocumentoDto,
    ValidarDocumentoDto,
} from '../types/expediente.types'

export const expedienteApi = {
    // ─── Vista general del expediente ──────────────────────────────────────────
    obtener: (solicitudId: string) =>
        apiAuth<Expediente>(`/expediente/${solicitudId}`),

    // ─── Cliente sube documento ─────────────────────────────────────────────────
    subirDocumento: (solicitudId: string, dto: SubirDocumentoDto) =>
        apiAuth<DocumentoActivo>(`/expediente/${solicitudId}/documentos`, {
            method: 'POST',
            body: dto,
        }),

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
        apiAuth<DocumentoActivo[]>(
            `/expediente/${solicitudId}/documentos/${tipoDocumentoId}/historial`
        ),
}