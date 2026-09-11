-- El futuro dashboard de métricas de soporte va a consultar TicketEvento por
-- tipo de evento (CAMBIO_ESTATUS, SLA_INCUMPLIDO...) + rango de fecha, igual
-- que el panorama ejecutivo consulta HistorialEstatus (ver
-- 20260911180000_dashboard_indices). Hoy TicketEvento solo tiene índice por
-- ticketId; sin esto cada consulta de métricas haría un scan completo.

-- CreateIndex
CREATE INDEX "TicketEvento_tipo_creadoEn_idx" ON "TicketEvento"("tipo", "creadoEn");

-- CreateIndex
CREATE INDEX "TicketEvento_creadoEn_idx" ON "TicketEvento"("creadoEn");
