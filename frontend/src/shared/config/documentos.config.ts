// shared/config/documentos.config.ts
import type { EstatusSolicitud } from '@/shared/lib/types/solicitudes.types'

export type DocumentoTipo = 'solicitud' | 'tarjeta_informativa' | 'carta_rechazo' | 'carta_financiamiento'

export const DOCUMENTO_LABELS: Record<DocumentoTipo, string> = {
    solicitud: 'Solicitud',
    tarjeta_informativa: 'Tarjeta Informativa',
    carta_rechazo: 'Carta de Rechazo',
    carta_financiamiento: 'Carta de Envío a Financiamiento',
}

// Solicitud y Tarjeta Informativa siempre están disponibles.
// Se agrega un documento extra según el estatus.
export function getDocumentosDisponibles(estatus: EstatusSolicitud): DocumentoTipo[] {
    const base: DocumentoTipo[] = ['solicitud', 'tarjeta_informativa']

    switch (estatus) {
        case 'CANCELADO':
            return [...base, 'carta_rechazo']
        case 'EN_FINANCIAMIENTO':
            return [...base, 'carta_financiamiento']
        default:
            return base
    }
}