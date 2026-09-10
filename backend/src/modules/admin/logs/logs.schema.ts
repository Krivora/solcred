import { z } from "zod";
import { AccionLog, ModuloLog } from "../../../../generated/prisma/client";

export const filtrosLogSchema = z.object({
  // Derivados de los enums de Prisma: un módulo nuevo (p. ej. CRM, SOPORTE)
  // queda disponible como filtro sin tener que recordar actualizar esta lista.
  accion: z.nativeEnum(AccionLog).optional(),
  modulo: z.nativeEnum(ModuloLog).optional(),
  usuarioId: z.string().uuid("ID de usuario inválido").optional(),
  fechaInicio: z.string().datetime("Fecha inicio inválida").optional(),
  fechaFin: z.string().datetime("Fecha fin inválida").optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type FiltrosLogDto = z.infer<typeof filtrosLogSchema>;
