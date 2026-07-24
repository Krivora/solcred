import { z } from "zod";

export const actualizarUsuarioSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .trim()
    .optional(),
  apellidoPaterno: z
    .string()
    .min(2, "El apellido paterno debe tener al menos 2 caracteres")
    .trim()
    .optional(),
  apellidoMaterno: z
    .string()
    .min(2, "El apellido materno debe tener al menos 2 caracteres")
    .trim()
    .optional(),
  curp: z
    .string()
    .length(18, "La CURP debe tener 18 caracteres")
    .regex(/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$/, "CURP inválida")
    .optional(),
  rfc: z
    .string()
    .regex(/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/, "RFC inválido")
    .optional(),
});

export const cambiarRolSchema = z.object({
  rol: z.enum(["ADMIN", "ANALISTA", "GESTOR", "SUPERVISOR"], {
    message: "Rol inválido",
  }),
});

export type ActualizarUsuarioDto = z.infer<typeof actualizarUsuarioSchema>;
export type CambiarRolDto = z.infer<typeof cambiarRolSchema>;