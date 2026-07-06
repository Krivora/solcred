import { z } from "zod";

// ─── Dominios autorizados para archivos ───────────────────────────────────────
// Ajusta estas URLs a tu proveedor de almacenamiento real (S3, GCS, Cloudinary, etc.)
const DOMINIOS_AUTORIZADOS = [
    "http://localhost:3000/",
    "https://s3.amazonaws.com/tu-bucket/",
];

const esUrlAutorizada = (url: string) =>
    DOMINIOS_AUTORIZADOS.some((dominio) => url.startsWith(dominio));

// ─── Subir documento (Cliente) ────────────────────────────────────────────────
export const subirDocumentoSchema = z.object({
    tipoDocumentoId: z.string().uuid("ID de tipo de documento inválido"),

    urlArchivo: z
        .string()
        .url("URL de archivo inválida")
        .refine(esUrlAutorizada, {
            message: "La URL debe apuntar al almacenamiento autorizado",
        }),

    nombreArchivo: z
        .string()
        .trim()
        .min(1, "El nombre del archivo es requerido")
        .max(255, "El nombre del archivo no puede exceder 255 caracteres")
        .regex(
            /^[\w\-. ]+$/,
            "El nombre del archivo contiene caracteres no permitidos"
        ),
});

// ─── Validar documento (Gestor) ───────────────────────────────────────────────
export const validarDocumentoSchema = z.discriminatedUnion("estatus", [
    z.object({
        estatus: z.literal("APROBADO"),
        motivoRechazo: z.never().optional(),
    }),

    z.object({
        estatus: z.literal("RECHAZADO"),
        motivoRechazo: z
            .string()
            .trim()
            .min(10, "El motivo debe tener al menos 10 caracteres")
            .max(1000, "El motivo no puede exceder 1000 caracteres"),
    }),
]);

// ─── Types ────────────────────────────────────────────────────────────────────
export type SubirDocumentoDto = z.infer<typeof subirDocumentoSchema>;
export type ValidarDocumentoDto = z.infer<typeof validarDocumentoSchema>;