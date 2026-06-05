import { z } from "zod";

// ─── Subir documento (Cliente) ────────────────────────────────────────────────
export const subirDocumentoSchema = z.object({
    tipoDocumentoId: z.string().uuid("ID de tipo de documento inválido"),
    urlArchivo: z.string().url("URL de archivo inválida"),
    nombreArchivo: z.string().trim().min(1, "El nombre del archivo es requerido"),
});

// ─── Validar documento (Gestor) ───────────────────────────────────────────────
export const validarDocumentoSchema = z.discriminatedUnion("estatus", [
    z.object({
        estatus: z.literal("APROBADO"),
        motivoRechazo: z.undefined(),
    }),
    z.object({
        estatus: z.literal("RECHAZADO"),
        motivoRechazo: z.string().trim().min(10, "El motivo debe tener al menos 10 caracteres"),
    }),
]);

// ─── Types ────────────────────────────────────────────────────────────────────
export type SubirDocumentoDto = z.infer<typeof subirDocumentoSchema>;
export type ValidarDocumentoDto = z.infer<typeof validarDocumentoSchema>;