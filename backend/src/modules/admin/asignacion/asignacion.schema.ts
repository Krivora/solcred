import { z } from "zod";

export const asignarManualSchema = z.object({
    gestorId: z.string().uuid("ID de gestor inválido"),
    motivo: z.string().max(500).optional(),
});

export type AsignarManualDto = z.infer<typeof asignarManualSchema>;