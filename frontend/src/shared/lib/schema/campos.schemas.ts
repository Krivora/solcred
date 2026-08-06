/**
 * campos.schemas.ts
 * Piezas de validación (Zod) reutilizables entre TODOS los steps del
 * formulario de solicitud (y cualquier otro formulario: usuarios, aval, etc).
 *
 * Uso típico dentro de un schema de step:
 *
 *   import { z } from "zod";
 *   import { telefonoSchema, codigoPostalSchema, correoSchema, montoSchema } from "@/shared/lib/schema/campos.schemas";
 *
 *   export const datosNegocioSchema = z.object({
 *     telefonoFijoNegocio: telefonoSchema.optional().or(z.literal("")),
 *     codigoPostalLocal: codigoPostalSchema.optional().or(z.literal("")),
 *     ...
 *   });
 */

import { z } from "zod";

// ─────────────────────────────────────────
// TELÉFONO — exactamente 10 dígitos (se valida sobre el valor "limpio",
// el input ya se encarga de que el usuario no pueda escribir más)
// ─────────────────────────────────────────
export const telefonoSchema = z
  .string()
  .refine((val) => /^\d{10}$/.test(val.replace(/\D/g, "")), {
    message: "El teléfono debe tener 10 dígitos",
  })
  .transform((val) => val.replace(/\D/g, "")); // guardamos solo dígitos en el payload

/** Versión opcional lista para usar (campo vacío o teléfono válido) */
export const telefonoOpcionalSchema = z
  .string()
  .optional()
  .refine((val) => !val || /^\d{10}$/.test(val.replace(/\D/g, "")), {
    message: "El teléfono debe tener 10 dígitos",
  });

// ─────────────────────────────────────────
// CÓDIGO POSTAL — exactamente 5 dígitos
// ─────────────────────────────────────────
export const codigoPostalSchema = z
  .string()
  .regex(/^\d{5}$/, "El código postal debe tener 5 dígitos");

export const codigoPostalOpcionalSchema = z
  .string()
  .optional()
  .refine((val) => !val || /^\d{5}$/.test(val), {
    message: "El código postal debe tener 5 dígitos",
  });

// ─────────────────────────────────────────
// CORREO ELECTRÓNICO
// ─────────────────────────────────────────
export const correoSchema = z
  .string()
  .min(1, "El correo es requerido")
  .email("Correo electrónico inválido");

export const correoOpcionalSchema = z
  .string()
  .optional()
  .refine((val) => !val || z.string().email().safeParse(val).success, {
    message: "Correo electrónico inválido",
  });

// ─────────────────────────────────────────
// MONTO EN PESOS — se guarda como string "crudo" (ej "1234.5") desde el
// input, aquí lo convertimos a number y validamos límites opcionales.
// Usa una factory para poder pasar min/max según el campo (ej. montoMinimo
// / montoMaximo del Programa).
// ─────────────────────────────────────────
export function crearMontoSchema(opts?: { min?: number; max?: number; requerido?: boolean }) {
  const { min, max, requerido = true } = opts ?? {};

  let base = z
    .string()
    .transform((val) => {
      const limpio = val.replace(/[^\d.]/g, "");
      return limpio === "" ? null : parseFloat(limpio);
    })
    .refine((val) => !requerido || val !== null, {
      message: "El monto es requerido",
    })
    .refine((val) => val === null || val >= 0, {
      message: "El monto no puede ser negativo",
    });

  if (min !== undefined) {
    base = base.refine((val) => val === null || val >= min, {
      message: `El monto mínimo es $${min.toLocaleString("es-MX")}`,
    });
  }
  if (max !== undefined) {
    base = base.refine((val) => val === null || val <= max, {
      message: `El monto máximo es $${max.toLocaleString("es-MX")}`,
    });
  }

  return base;
}

/** Monto simple, requerido, sin límites — para el caso general */
export const montoSchema = crearMontoSchema();