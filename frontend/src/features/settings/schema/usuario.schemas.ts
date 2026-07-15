import { z } from "zod";

export const actualizarUsuarioSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "Máximo 80 caracteres")
    .optional(),
  apellidoPaterno: z
    .string()
    .min(2, "El apellido paterno debe tener al menos 2 caracteres")
    .max(80, "Máximo 80 caracteres")
    .optional(),
  apellidoMaterno: z
    .string()
    .min(2, "El apellido materno debe tener al menos 2 caracteres")
    .max(80, "Máximo 80 caracteres")
    .optional(),
  correo: z
    .string()
    .email("Correo electrónico inválido")
    .optional(),
  curp: z
    .string()
    .length(18, "La CURP debe tener 18 caracteres")
    .regex(
      /^[A-Z]{4}[0-9]{6}[HM][A-Z]{2}[A-Z0-9]{3}[0-9A-Z][0-9]$/,
      "Formato de CURP inválido"
    )
    .optional()
    .or(z.literal("")),
  rfc: z
    .string()
    .min(12, "El RFC debe tener entre 12 y 13 caracteres")
    .max(13, "El RFC debe tener entre 12 y 13 caracteres")
    .optional()
    .or(z.literal("")),
  tipoPersona: z.enum(["FISICA", "MORAL"]).optional(),
});

export const cambiarRolSchema = z.object({
  rol: z.enum(["ADMIN", "ANALISTA", "CLIENTE", "GESTOR"], {
    error: "El rol es obligatorio",
  }),
});
export type ActualizarUsuarioForm = z.infer<typeof actualizarUsuarioSchema>;
export type CambiarRolForm = z.infer<typeof cambiarRolSchema>;