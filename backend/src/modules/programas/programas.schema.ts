import { z } from "zod";
const programaBaseSchema = z.object({
  nombre: z
    .string({ message: "El nombre es requerido" })
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .trim(),
  descripcion: z
    .string({ message: "La descripción es requerida" })
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .trim(),
  objetivo: z
    .string({ message: "El objetivo es requerido" })
    .min(10, "El objetivo debe tener al menos 10 caracteres")
    .trim(),
  permitePersonaFisica: z.boolean().default(true),
  permitePersonaMoral: z.boolean().default(true),
  montoMinimo: z
    .number({ message: "El monto mínimo es requerido" })
    .positive("El monto mínimo debe ser mayor a 0"),
  montoMaximo: z
    .number({ message: "El monto máximo es requerido" })
    .positive("El monto máximo debe ser mayor a 0"),
  tasaOrdinaria: z
    .number({ message: "La tasa ordinaria es requerida" })
    .min(0).max(100),
  tasaMoratoria: z
    .number({ message: "La tasa moratoria es requerida" })
    .min(0).max(100),
  tasaAnual: z
    .number({ message: "La tasa anual es requerida" })
    .min(0).max(100),
  plazoMinimoMeses: z
    .number({ message: "El plazo mínimo es requerido" })
    .int().positive(),
  plazoMaximoMeses: z
    .number({ message: "El plazo máximo es requerido" })
    .int().positive(),
  avalObligatorio: z.boolean().default(false),
  avalOpcional: z.boolean().default(false),
  garantiaObligatoria: z.boolean().default(false),
  garantiaOpcional: z.boolean().default(false),
  datosFinancierosCompletos: z.boolean().default(false),
  requiereCurp: z.boolean().default(true),
  requiereRfc: z.boolean().default(true),
});

export const crearProgramaSchema = programaBaseSchema
  .refine((data) => data.montoMaximo > data.montoMinimo, {
    message: "El monto máximo debe ser mayor al monto mínimo",
    path: ["montoMaximo"],
  })
  .refine((data) => data.plazoMaximoMeses > data.plazoMinimoMeses, {
    message: "El plazo máximo debe ser mayor al plazo mínimo",
    path: ["plazoMaximoMeses"],
  })
  .refine((data) => data.permitePersonaFisica || data.permitePersonaMoral, {
    message: "El programa debe permitir al menos un tipo de persona",
    path: ["permitePersonaFisica"],
  });

export const actualizarProgramaSchema = programaBaseSchema
  .partial()
  .refine(
    (data) =>
      data.montoMaximo === undefined ||
      data.montoMinimo === undefined ||
      data.montoMaximo > data.montoMinimo,
    {
      message: "El monto máximo debe ser mayor al monto mínimo",
      path: ["montoMaximo"],
    }
  )
  .refine(
    (data) =>
      data.plazoMaximoMeses === undefined ||
      data.plazoMinimoMeses === undefined ||
      data.plazoMaximoMeses > data.plazoMinimoMeses,
    {
      message: "El plazo máximo debe ser mayor al plazo mínimo",
      path: ["plazoMaximoMeses"],
    }
  );

export const agregarDocumentoSchema = z.object({
  tipoDocumentoId: z
    .string({ message: "El tipo de documento es requerido" })
    .uuid("ID de documento inválido"),
  esObligatorio: z.boolean().default(true),
  aplicaA: z.enum(["FISICA", "MORAL"]).optional(),
});

export const crearTipoDocumentoSchema = z.object({
  nombre: z
    .string({ message: "El nombre es requerido" })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .trim(),
  descripcion: z.string().trim().optional(),
});

export type CrearProgramaDto = z.infer<typeof crearProgramaSchema>;
export type ActualizarProgramaDto = z.infer<typeof actualizarProgramaSchema>;
export type AgregarDocumentoDto = z.infer<typeof agregarDocumentoSchema>;
export type CrearTipoDocumentoDto = z.infer<typeof crearTipoDocumentoSchema>;