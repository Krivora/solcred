import { z } from "zod";

export const asignarManualSchema = z.object({
    gestorId: z.string().uuid("ID de gestor inválido"),
    motivo: z.string().max(500).optional(),
});
export const ListarAsignacionQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    estatus: z.string().optional(),
    tipoPersona: z.string().optional(),
    sector: z.string().optional(),
    tamanoEmpresa: z.string().optional(),
    programaId: z.string().optional(),
    fechaDesde: z.string().optional(),
    fechaHasta: z.string().optional(),
    busqueda: z.string().optional(),
    asignacion: z.enum(["asignados", "sin_asignar"]).optional(),
    gestorId: z.string().uuid().optional(),
    grupoId: z.string().uuid().optional(),
});

export type ListarAsignacionQuery = z.infer<typeof ListarAsignacionQuerySchema>;
export type AsignarManualDto = z.infer<typeof asignarManualSchema>;