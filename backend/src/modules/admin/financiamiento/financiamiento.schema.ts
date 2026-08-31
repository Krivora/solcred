import { z } from "zod";

/** Acción con motivo obligatorio (regresos / rechazos). */
export const accionConMotivoSchema = z.object({
  motivo: z.string().trim().min(1, "El motivo es requerido"),
});

/** Acción con motivo opcional (avanzar en el flujo). */
export const accionOpcionalSchema = z.object({
  motivo: z.string().trim().optional(),
});

/** Asignar analista a una solicitud en EN_ASIGNACION. */
export const asignarAnalistaSchema = z.object({
  analistaId: z.string().uuid("ID de analista inválido"),
  motivo: z.string().trim().optional(),
});

export type AccionConMotivoDto = z.infer<typeof accionConMotivoSchema>;
export type AccionOpcionalDto = z.infer<typeof accionOpcionalSchema>;
export type AsignarAnalistaDto = z.infer<typeof asignarAnalistaSchema>;
