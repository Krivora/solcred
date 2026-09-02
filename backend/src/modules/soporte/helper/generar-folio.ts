import prisma from "@config/db";

/**
 * Folio legible y único de un ticket: `TKT-2026-0007`.
 * Usa la secuencia de Postgres `ticket_folio_seq` (creada en la migración
 * `soporte_tickets`), igual que `solicitud_folio_seq` para las solicitudes.
 * El contador es global (no se reinicia por año); el año es solo prefijo.
 */
export async function generarFolioTicket(): Promise<string> {
  const filas = await prisma.$queryRaw<{ nextval: bigint }[]>`
    SELECT nextval('ticket_folio_seq')
  `;
  const n = Number(filas[0].nextval);
  const anio = new Date().getFullYear();
  return `TKT-${anio}-${String(n).padStart(4, "0")}`;
}
