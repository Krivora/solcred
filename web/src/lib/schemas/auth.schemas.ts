import { z } from 'zod';

const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
const RFC_REGEX = /^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{2,3}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;':",.<>?/`~\\])/;

export const loginSchema = z.object({
  correo: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo válido'),
  contrasena: z
    .string()
    .min(1, 'La contraseña es obligatoria'),
});

export const registerSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100),
  apellidoPaterno: z
    .string()
    .min(2, 'El apellido paterno es obligatorio')
    .max(100),
  apellidoMaterno: z
    .string()
    .min(2, 'El apellido materno es obligatorio')
    .max(100),
  correo: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo válido'),
  contrasena: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(PASSWORD_REGEX, 'Debe contener mayúscula, minúscula, número y símbolo'),
  tipoPersona: z.enum(['FISICA', 'MORAL'], {
    required_error: 'Selecciona el tipo de persona',
  }),
  curp: z
    .string()
    .regex(CURP_REGEX, 'CURP inválido (formato: XXXX000000XXXXXX00)')
    .optional()
    .or(z.literal('')),
  rfc: z
    .string()
    .regex(RFC_REGEX, 'RFC inválido')
    .optional()
    .or(z.literal('')),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;