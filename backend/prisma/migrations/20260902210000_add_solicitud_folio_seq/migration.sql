-- La secuencia del folio de solicitudes existía en los ambientes desplegados
-- pero nunca se había versionado en una migración (a diferencia de
-- `ticket_folio_seq`). `IF NOT EXISTS` la hace idempotente donde ya está.
CREATE SEQUENCE IF NOT EXISTS solicitud_folio_seq START 1;
