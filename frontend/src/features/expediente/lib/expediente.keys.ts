export const expedienteKeys = {
    all: ['expediente'] as const,
    detail: (solicitudId: string) => [...expedienteKeys.all, solicitudId] as const,
    historial: (solicitudId: string, tipoDocumentoId: string) =>
        [...expedienteKeys.all, solicitudId, 'historial', tipoDocumentoId] as const,
}
