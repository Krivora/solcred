import { z } from "zod";

const CATEGORIAS = [
  "SOPORTE_TECNICO",
  "INCIDENTE",
  "DUDA_USO",
  "ACCESO_PERMISOS",
  "PRESTAMO_EQUIPO",
  "SOLICITUD_INFORMACION",
  "OTRO",
] as const;

/** El solicitante solo sugiere prioridad (nunca URGENTE); el ADMIN la confirma al asignar. */
const PRIORIDADES_SUGERIBLES = ["BAJA", "MEDIA", "ALTA"] as const;

// multipart: multer entrega los campos de texto como string.
const boolDesdeForm = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((v) => v === true || v === "true" || v === "1");

export const crearTicketSchema = z.object({
  titulo: z.string().trim().min(4, "El título debe tener al menos 4 caracteres").max(160),
  descripcion: z.string().trim().min(10, "Describe el problema con al menos 10 caracteres").max(5000),
  categoria: z.enum(CATEGORIAS, { message: "Categoría inválida" }),
  prioridadSugerida: z.enum(PRIORIDADES_SUGERIBLES).optional(),
});

export const comentarTicketSchema = z.object({
  cuerpo: z.string().trim().min(1, "El comentario no puede estar vacío").max(5000),
  esNotaInterna: boolDesdeForm,
});

export const reabrirTicketSchema = z.object({
  motivo: z.string().trim().min(5, "Indica por qué reabres el ticket").max(1000),
});

export const calificarTicketSchema = z.object({
  calificacion: z.coerce.number().int().min(1).max(5),
  comentario: z.string().trim().max(1000).optional(),
});

export const listarMisTicketsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  estatus: z
    .enum(["NUEVO", "ASIGNADO", "EN_PROGRESO", "ESPERANDO_CLIENTE", "RESUELTO", "CERRADO", "CANCELADO"])
    .optional(),
  categoria: z.enum(CATEGORIAS).optional(),
  q: z.string().trim().max(120).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// STAFF (Fase 2)
// ─────────────────────────────────────────────────────────────────────────────

const PRIORIDADES = ["BAJA", "MEDIA", "ALTA", "URGENTE"] as const;
const ESTATUS = [
  "NUEVO",
  "ASIGNADO",
  "EN_PROGRESO",
  "ESPERANDO_CLIENTE",
  "RESUELTO",
  "CERRADO",
  "CANCELADO",
] as const;

export const asignarTicketSchema = z.object({
  agenteId: z.string().uuid("agenteId inválido"),
  prioridad: z.enum(PRIORIDADES).optional(),
});

export const cambiarPrioridadSchema = z.object({
  prioridad: z.enum(PRIORIDADES),
});

export const cambiarCategoriaSchema = z.object({
  categoria: z.enum(CATEGORIAS),
});

/** El agente solo mueve el ticket entre estos estados; cerrar/reabrir tienen su propia ruta. */
export const cambiarEstatusSchema = z.object({
  estatus: z.enum(["EN_PROGRESO", "ESPERANDO_CLIENTE", "RESUELTO"]),
  motivo: z.string().trim().max(1000).optional(),
});

export const cancelarTicketSchema = z.object({
  motivo: z.string().trim().min(5, "Indica por qué cancelas el ticket").max(1000),
});

export const listarTicketsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  estatus: z.enum(ESTATUS).optional(),
  prioridad: z.enum(PRIORIDADES).optional(),
  categoria: z.enum(CATEGORIAS).optional(),
  agenteId: z.string().uuid().optional(),
  solicitanteId: z.string().uuid().optional(),
  sinAsignar: z.coerce.boolean().optional(),
  sla: z.enum(["ok", "en_riesgo", "vencido"]).optional(),
  desde: z.string().datetime().optional(),
  hasta: z.string().datetime().optional(),
  q: z.string().trim().max(120).optional(),
});

export const actualizarSlaPoliticaSchema = z.object({
  respuestaMinutos: z.coerce.number().int().positive().max(100000),
  resolucionMinutos: z.coerce.number().int().positive().max(500000),
  activa: z.boolean().optional(),
});

export type CrearTicketDto = z.infer<typeof crearTicketSchema>;
export type ComentarTicketDto = z.infer<typeof comentarTicketSchema>;
export type ReabrirTicketDto = z.infer<typeof reabrirTicketSchema>;
export type CalificarTicketDto = z.infer<typeof calificarTicketSchema>;
export type ListarMisTicketsQuery = z.infer<typeof listarMisTicketsQuerySchema>;
export type AsignarTicketDto = z.infer<typeof asignarTicketSchema>;
export type CambiarPrioridadDto = z.infer<typeof cambiarPrioridadSchema>;
export type CambiarCategoriaDto = z.infer<typeof cambiarCategoriaSchema>;
export type CambiarEstatusDto = z.infer<typeof cambiarEstatusSchema>;
export type CancelarTicketDto = z.infer<typeof cancelarTicketSchema>;
export type ActualizarSlaPoliticaDto = z.infer<typeof actualizarSlaPoliticaSchema>;
