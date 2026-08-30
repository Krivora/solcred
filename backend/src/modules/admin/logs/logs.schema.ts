import { z } from "zod";

export const filtrosLogSchema = z.object({
  accion: z
    .enum(["CREAR", "ACTUALIZAR", "ELIMINAR", "CONSULTAR", "LOGIN", "LOGOUT", "ERROR"])
    .optional(),
  modulo: z
    .enum(["AUTH", "USUARIOS", "PROGRAMAS", "SOLICITUDES", "DOCUMENTOS"])
    .optional(),
  usuarioId: z.string().uuid("ID de usuario inválido").optional(),
  fechaInicio: z.string().datetime("Fecha inicio inválida").optional(),
  fechaFin: z.string().datetime("Fecha fin inválida").optional(),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().positive().max(100).default(20),
});

export type FiltrosLogDto = z.infer<typeof filtrosLogSchema>;