import { z } from "zod";

export const cambiarEstatusSchema = z.object({
  estatus: z.enum([
    "PENDIENTE",
    "EN_REVISION",
    "EN_CORRECION",
    "EN_FINANCIAMIENTO",
    "EN_APROBACION",
    "APROBADO",
    "RECHAZADO",
    "CANCELADO",
  ], { message: "Estatus inválido" }),
  motivo: z.string().trim().optional(),
});

export const devolverAlSolicitanteSchema = z.object({
  motivo: z.string().trim().min(1, "El motivo es requerido"),
});

export const enviarAFinanciamientoSchema = z.object({
  motivo: z.string().trim().optional(),
});

export const enviarAAprobacionSchema = z.object({
  motivo: z.string().trim().optional(),
});

export const cancelarSchema = z.object({
  motivo: z.string().trim().min(1, "El motivo es requerido"),
});

export const rechazarSchema = z.object({
  motivo: z.string().trim().min(1, "El motivo es requerido"),
});

export type CambiarEstatusDto         = z.infer<typeof cambiarEstatusSchema>;
export type DevolverAlSolicitanteDto  = z.infer<typeof devolverAlSolicitanteSchema>;
export type EnviarAFinanciamientoDto  = z.infer<typeof enviarAFinanciamientoSchema>;
export type EnviarAAprobacionDto      = z.infer<typeof enviarAAprobacionSchema>;
export type CancelarDto               = z.infer<typeof cancelarSchema>;
export type RechazarDto               = z.infer<typeof rechazarSchema>;