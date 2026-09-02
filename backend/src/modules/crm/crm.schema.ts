import { z } from "zod";

// Los valores replican los enums de Prisma (`schema.prisma`). El contrato de
// tipos frontend↔backend se verifica en `scripts/check-contract.ts`.
const TIPOS = ["LLAMADA", "CORREO", "MENSAJE", "PRESENCIAL", "OTRO"] as const;

const MOTIVOS = [
  "ACTUALIZACION_DOCUMENTACION",
  "DOCUMENTACION_FALTANTE",
  "CONFIRMACION_INFORMACION",
  "SEGUIMIENTO_SOLICITUD",
  "CONFIRMACION_INTERES",
  "NOTIFICACION_AVANCE",
  "ACLARACION_INFORMACION",
  "NOTIFICACION_INCIDENCIA",
  "RECORDATORIO_PENDIENTE",
  "OTRO",
] as const;

const RESULTADOS = [
  "CONTACTADO",
  "NO_CONTACTADO",
  "SOLICITA_RECONTACTO",
  "CONFIRMA_CONTINUIDAD",
  "DESISTE",
  "DOCUMENTACION_PENDIENTE",
  "DOCUMENTACION_ENVIADA",
  "INFORMACION_ACLARADA",
  "SIN_RESPUESTA",
  "OTRO",
] as const;

export const crearComunicacionSchema = z.object({
  solicitudId: z.string().uuid("solicitudId inválido"),
  tipo: z.enum(TIPOS, { message: "Tipo de comunicación inválido" }),
  motivo: z.enum(MOTIVOS, { message: "Motivo inválido" }),
  resultado: z.enum(RESULTADOS, { message: "Resultado inválido" }),
  observaciones: z.string().trim().max(4000, "Máximo 4000 caracteres").optional(),
  // Si no se envía, el service usa el momento actual.
  fechaContacto: z
    .string()
    .datetime({ message: "fechaContacto debe ser una fecha ISO 8601" })
    .optional(),
});

export const editarComunicacionSchema = z
  .object({
    tipo: z.enum(TIPOS).optional(),
    motivo: z.enum(MOTIVOS).optional(),
    resultado: z.enum(RESULTADOS).optional(),
    observaciones: z.string().trim().max(4000).optional(),
    fechaContacto: z.string().datetime().optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), {
    message: "Envía al menos un campo para actualizar",
  });

export const listarComunicacionesQuerySchema = z
  .object({
    solicitudId: z.string().uuid().optional(),
    clienteId: z.string().uuid().optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
  })
  .refine((v) => !!v.solicitudId !== !!v.clienteId, {
    message: "Especifica solicitudId o clienteId (exactamente uno)",
  });

export type CrearComunicacionDto = z.infer<typeof crearComunicacionSchema>;
export type EditarComunicacionDto = z.infer<typeof editarComunicacionSchema>;
export type ListarComunicacionesQuery = z.infer<
  typeof listarComunicacionesQuerySchema
>;
