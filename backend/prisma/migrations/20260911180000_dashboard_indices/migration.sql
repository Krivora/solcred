-- El panorama ejecutivo (dashboard.service.ts) filtra Solicitud e
-- HistorialEstatus casi siempre por estatus + rango de fecha; sin estos
-- índices cada una de sus ~12 consultas hace un scan completo de tabla.

-- CreateIndex
CREATE INDEX "Solicitud_estatus_creadoEn_idx" ON "Solicitud"("estatus", "creadoEn");

-- CreateIndex
CREATE INDEX "Solicitud_estatus_actualizadoEn_idx" ON "Solicitud"("estatus", "actualizadoEn");

-- CreateIndex
CREATE INDEX "Solicitud_creadoEn_idx" ON "Solicitud"("creadoEn");

-- CreateIndex
CREATE INDEX "HistorialEstatus_estatusNuevo_creadoEn_idx" ON "HistorialEstatus"("estatusNuevo", "creadoEn");

-- CreateIndex
CREATE INDEX "HistorialEstatus_creadoEn_idx" ON "HistorialEstatus"("creadoEn");

-- CreateIndex
CREATE INDEX "DocumentoSolicitud_estatus_activo_idx" ON "DocumentoSolicitud"("estatus", "activo");
