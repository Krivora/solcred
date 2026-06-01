import { z } from "zod";



export const cambiarEstatusSchema = z.object({
  estatus: z.enum(["PENDIENTE", "EN_REVISION", "APROBADO", "RECHAZADO"], {
    message: "Estatus inválido",
  }),
  motivo: z.string().trim().optional(),
});

export type CambiarEstatusDto = z.infer<typeof cambiarEstatusSchema>;