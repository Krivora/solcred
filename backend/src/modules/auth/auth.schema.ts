import { z } from "zod";

export const loginSchema = z.object({
  correo: z
    .string({ message: "El correo es requerido" })
    .email("Correo inválido")
    .toLowerCase()
    .trim(),
  contrasena: z
    .string({ message: "La contraseña es requerida" })
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const registroSchema = z.object({
  correo: z
    .string({ message: "El correo es requerido" })
    .email("Correo inválido")
    .toLowerCase()
    .trim(),
  contrasena: z
    .string({ message: "La contraseña es requerida" })
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[^a-zA-Z0-9]/, "Debe contener al menos un carácter especial"),
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