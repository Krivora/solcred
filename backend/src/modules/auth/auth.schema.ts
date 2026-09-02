import { z } from "zod";

/**
 * Política de contraseñas del sistema. Fuente única: la usan el registro y
 * cualquier flujo futuro de alta/cambio de contraseña. En paridad con la del
 * frontend (`shared/schemas/auth.schema.ts`).
 *
 * El login NO la aplica a propósito: solo comprueba que venga una contraseña,
 * para no bloquear cuentas creadas antes de endurecer la política.
 */
export const contrasenaSchema = z
  .string({ message: "La contraseña es requerida" })
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(128, "La contraseña no puede exceder 128 caracteres")
  .regex(/[a-z]/, "Debe contener al menos una minúscula")
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
  .regex(/[0-9]/, "Debe contener al menos un número")
  .regex(/[^a-zA-Z0-9]/, "Debe contener al menos un carácter especial");

export const loginSchema = z.object({
  correo: z
    .string({ message: "El correo es requerido" })
    .email("Correo inválido")
    .toLowerCase()
    .trim(),
  contrasena: z
    .string({ message: "La contraseña es requerida" })
    .min(1, "La contraseña es requerida"),
});

export const registroSchema = z.object({
  correo: z
    .string({ message: "El correo es requerido" })
    .email("Correo inválido")
    .toLowerCase()
    .trim(),
  contrasena: contrasenaSchema,
  tipoPersona: z.enum(["FISICA", "MORAL"], {
    message: "El tipo de persona es requerido",
  }),
  nombre: z
    .string({ message: "El nombre es requerido" })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .trim(),
  apellidoPaterno: z
    .string({ message: "El apellido paterno es requerido" })
    .min(2, "El apellido paterno debe tener al menos 2 caracteres")
    .trim(),
  apellidoMaterno: z
    .string({ message: "El apellido materno es requerido" })
    .min(2, "El apellido materno debe tener al menos 2 caracteres")
    .trim(),
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

export type LoginDto = z.infer<typeof loginSchema>;
export type RegistroDto = z.infer<typeof registroSchema>;