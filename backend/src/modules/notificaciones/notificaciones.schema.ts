import { z } from "zod";

export const listarNotificacionesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  soloNoLeidas: z.coerce.boolean().optional(),
});

export type ListarNotificacionesQuery = z.infer<
  typeof listarNotificacionesQuerySchema
>;
