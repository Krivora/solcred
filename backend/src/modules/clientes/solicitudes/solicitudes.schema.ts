import { z } from "zod";
import {
  EstatusSolicitud,
  TipoPersona,
  Sector,
  TamanoEmpresa,
  NivelEstudio,
  EstadoCivil,
  TipoVivienda,
  CategoriaCredito,
  TipoGarantia,
  TipoLocal,
} from "../../../../generated/prisma/client";

// ─────────────────────────────────────────
// PRIMITIVOS COMPARTIDOS
// Única fuente de verdad para reglas repetidas.
// Cambiar una regla aquí la cambia en todos los formularios.
// ─────────────────────────────────────────

/** Texto corto obligatorio: recorta ANTES de validar longitud. */
const textoRequerido = (min = 2, max = 100, label = "Este campo") =>
  z
    .string({ message: `${label} es requerido` })
    .trim()
    .min(min, `${label} debe tener al menos ${min} caracteres`)
    .max(max, `${label} no puede exceder ${max} caracteres`);

/** Texto corto opcional. "" y solo-espacios se normalizan a undefined. */
const textoOpcional = (max = 100) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(max, `No puede exceder ${max} caracteres`).optional()
  );

/** Texto libre largo (direcciones, descripciones) con tope anti-DoS. */
const textoLargoOpcional = (max = 500) => textoOpcional(max);

const curpSchema = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toUpperCase() : v),
  z
    .string()
    .length(18, "La CURP debe tener 18 caracteres")
    .regex(/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$/, "CURP inválida")
    .optional()
);

const rfcSchema = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toUpperCase() : v),
  z
    .string()
    .regex(/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/, "RFC inválido")
    .optional()
);

/** Acepta formatos humanos (555-123-4567, (555) 123 4567) y limpia a 10 dígitos. */
const telefonoSchema = z.preprocess(
  (v) => (typeof v === "string" ? v.replace(/[\s\-().]/g, "") : v),
  z.string().regex(/^[0-9]{10}$/, "Debe tener 10 dígitos").optional()
);

const correoSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(255, "El correo no puede exceder 255 caracteres")
  .email("Correo inválido")
  .optional();

const codigoPostalSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{5}$/, "El código postal debe tener 5 dígitos")
  .optional();

/** Dinero: finito, positivo y con tope razonable contra overflow/errores de captura. */
const montoSchema = (max = 100_000_000) =>
  z
    .number({ error: "Debe ser un número" })
    .finite("El valor debe ser un número válido")
    .positive("Debe ser mayor a 0")
    .max(max, `No puede exceder ${max.toLocaleString("es-MX")}`);

const enteroNoNegativo = (max = 200) =>
  z
    .number({ error: "Debe ser un número entero" })
    .int("Debe ser un número entero")
    .min(0, "No puede ser negativo")
    .max(max, `No puede exceder ${max}`)
    .optional();

/** Valida el dígito verificador real del algoritmo CLABE (18 posiciones). */
function clabeChecksumValido(clabe: string): boolean {
  const pesos = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];
  const digitos = clabe.split("").map(Number);
  const suma = digitos
    .slice(0, 17)
    .reduce((acc, d, i) => acc + ((d * pesos[i]) % 10), 0);
  const digitoVerificador = (10 - (suma % 10)) % 10;
  return digitoVerificador === digitos[17];
}

// ─────────────────────────────────────────
// SOLICITUD / DATOS GENERALES
// ─────────────────────────────────────────

export const crearSolicitudSchema = z.object({
  programaId: z
    .string({ message: "El programa es requerido" })
    .uuid("ID de programa inválido"),
});

export const guardarDatosGeneralesSchema = z.object({
  tipoPersona: z.nativeEnum(TipoPersona, {
    message: "Tipo de persona inválido",
  }),
  sector: z.nativeEnum(Sector, { message: "Sector inválido" }),
  tamanoEmpresa: z.nativeEnum(TamanoEmpresa).optional(),
});

// ─────────────────────────────────────────
// DATOS PERSONA (SOLICITANTE / AVAL)
// ─────────────────────────────────────────

const datosPersonaSchema = z.object({
  nombre: textoRequerido(2, 100, "El nombre"),
  apellidoPaterno: textoRequerido(2, 100, "El apellido paterno"),
  apellidoMaterno: textoRequerido(2, 100, "El apellido materno"),

  curp: curpSchema,
  rfc: rfcSchema,

  telefono: telefonoSchema,
  celular: telefonoSchema,
  correo: correoSchema,

  calle: textoOpcional(150),
  numeroExterior: textoOpcional(20),
  numeroInterior: textoOpcional(20),
  colonia: textoOpcional(100),
  ciudad: textoOpcional(100),
  estado: textoOpcional(100),
  codigoPostal: codigoPostalSchema,

  nivelEstudio: z.nativeEnum(NivelEstudio).optional(),
  universidad: textoOpcional(150),
  estadoCivil: z.nativeEnum(EstadoCivil).optional(),

  nombreConyuge: textoOpcional(150),
  numeroINE: textoOpcional(30),

  tipoVivienda: z.nativeEnum(TipoVivienda).optional(),

  aniosDomicilioActual: enteroNoNegativo(100),
  aniosDomicilioAnterior: enteroNoNegativo(100),
})
  // RFC: 13 posiciones para persona física, 12 para moral.
  .superRefine((data, ctx) => {
    if (data.rfc) {
      const esFisica = /^[A-ZÑ&]{4}/.test(data.rfc) && data.rfc.length === 13;
      const esMoral = /^[A-ZÑ&]{3}/.test(data.rfc) && data.rfc.length === 12;
      if (!esFisica && !esMoral) {
        ctx.addIssue({
          code: "custom",
          message: "El RFC no corresponde a un formato válido de persona física o moral",
          path: ["rfc"],
        });
      }
    }
  });

export const guardarDatosSolicitanteSchema = datosPersonaSchema;
export const guardarDatosAvalSchema = datosPersonaSchema;

// ─────────────────────────────────────────
// ESTATUS
// Derivado del enum de Prisma: nunca hay drift entre schema de validación
// y el schema de base de datos.
// ─────────────────────────────────────────

export const cambiarEstatusSchema = z.object({
  estatus: z.nativeEnum(EstatusSolicitud, { message: "Estatus inválido" }),
  motivo: textoOpcional(500),
});

// ─────────────────────────────────────────
// DATOS DE CRÉDITO
// ─────────────────────────────────────────

const conceptoCreditoSchema = z.object({
  categoria: z.nativeEnum(CategoriaCredito, {
    message: "La categoría es requerida",
  }),
  concepto: textoRequerido(2, 200, "El concepto"),
  monto: montoSchema(),
});

export const guardarDatosCreditoSchema = z
  .object({
    plazoMeses: z
      .number({ error: "El plazo debe ser un número" })
      .int("El plazo debe ser un número entero")
      .positive("El plazo debe ser mayor a 0")
      .max(360, "El plazo no puede exceder 360 meses"),

    mesesGracia: z
      .number({ error: "Los meses de gracia deben ser un número" })
      .int("Los meses de gracia deben ser un número entero")
      .min(0, "No puede ser negativo")
      .default(0),

    conceptos: z
      .array(conceptoCreditoSchema)
      .min(1, "Debe agregar al menos un concepto")
      .max(50, "No puede agregar más de 50 conceptos"),
  })
  .refine((data) => data.mesesGracia <= data.plazoMeses, {
    message: "El periodo de gracia no puede ser mayor al plazo total",
    path: ["mesesGracia"],
  });

// ─────────────────────────────────────────
// GARANTÍAS
// ─────────────────────────────────────────

const garantiaSchema = z
  .object({
    tipo: z.nativeEnum(TipoGarantia, {
      message: "El tipo de garantía es requerido",
    }),
    nombrePropietario: textoRequerido(2, 150, "El nombre del propietario"),
    valor: montoSchema(),
    descripcion: textoLargoOpcional(500),

    // ── Solo PRENDARIA ──
    marca: textoOpcional(100),
    modelo: textoOpcional(100),
    anio: z
      .number()
      .int("El año debe ser un número entero")
      .min(2015, "El año debe ser 2015 o posterior")
      .max(new Date().getFullYear() + 1, "Año inválido")
      .optional(),
    numeroSerie: textoOpcional(50),

    // ── Solo HIPOTECARIA ──
    calle: textoOpcional(150),
    numeroExterior: textoOpcional(20),
    numeroInterior: textoOpcional(20),
    colonia: textoOpcional(100),
    ciudad: textoOpcional(100),
    estado: textoOpcional(100),
    codigoPostal: z.preprocess(
  (v) => (v === '' ? undefined : v),
  codigoPostalSchema.optional()
),
    numeroEscritura: textoOpcional(50),
    folioReal: textoOpcional(50),
  })
  .superRefine((data, ctx) => {
    if (data.tipo === "PRENDARIA") {
      if (!data.marca) {
        ctx.addIssue({ code: "custom", message: "La marca es requerida para garantías prendarias", path: ["marca"] });
      }
      if (!data.numeroSerie) {
        ctx.addIssue({ code: "custom", message: "El número de serie es requerido para garantías prendarias", path: ["numeroSerie"] });
      }
    }
    if (data.tipo === "HIPOTECARIA") {
      if (!data.calle) {
        ctx.addIssue({ code: "custom", message: "La calle es requerida para garantías hipotecarias", path: ["calle"] });
      }
      if (!data.ciudad) {
        ctx.addIssue({ code: "custom", message: "La ciudad es requerida para garantías hipotecarias", path: ["ciudad"] });
      }
      if (!data.estado) {
        ctx.addIssue({ code: "custom", message: "El estado es requerido para garantías hipotecarias", path: ["estado"] });
      }
      if (!data.codigoPostal) {
        ctx.addIssue({ code: "custom", message: "El código postal es requerido para garantías hipotecarias", path: ["codigoPostal"] });
      }
      if (!data.numeroEscritura) {
        ctx.addIssue({ code: "custom", message: "El número de escritura es requerido para garantías hipotecarias", path: ["numeroEscritura"] });
      }
    }
  });

export const guardarDatosGarantiaSchema = z.object({
  garantias: z
    .array(garantiaSchema)
    .min(1, "Debe agregar al menos una garantía")
    .max(20, "No puede agregar más de 20 garantías"),
});

// ─────────────────────────────────────────
// NEGOCIO
// ─────────────────────────────────────────

export const guardarDatosNegocioSchema = z.object({
  razonSocial: textoOpcional(200),
  rfcNegocio: rfcSchema,
  nombreNegocio: textoOpcional(200),

  domicilioNegocio: textoOpcional(150),
  numeroExteriorNegocio: textoOpcional(20),
  numeroInteriorNegocio: textoOpcional(20),
  coloniaLocal: textoOpcional(100),
  codigoPostalLocal: codigoPostalSchema,
  municipioLocal: textoOpcional(100),
  estadoLocal: textoOpcional(100),

  actividadNegocio: textoOpcional(200),
  areaNegocio: textoOpcional(200),

  empleosConservados: enteroNoNegativo(100_000),
  empleosNuevos: enteroNoNegativo(100_000),

  fechaInicioOperaciones: z.coerce
    .date()
    .max(new Date(), "La fecha no puede ser futura")
    .optional(),
  antiguedadNegocio: enteroNoNegativo(150),

  tipoLocal: z.nativeEnum(TipoLocal).optional(),

  experienciaActividadSolicitante: enteroNoNegativo(80),
  experienciaEmpresarioSolicitante: enteroNoNegativo(80),

  actualExporta: z.boolean().optional(),
  obtuvoExperiencia: z.boolean().optional(),
  negocioConsidera: textoLargoOpcional(1000),

  telefonoRecadosNegocio: telefonoSchema,
  telefonoFijoNegocio: telefonoSchema,
});

// ─────────────────────────────────────────
// MERCADO
// ─────────────────────────────────────────

const porcentaje = () => z.number().min(0).max(100).optional();

export const guardarDatosMercadoSchema = z
  .object({
    principalesProductos: textoLargoOpcional(1000),

    porcentajeMayoristas: porcentaje(),
    porcentajeDetallistas: porcentaje(),
    porcentajeClienteFinal: porcentaje(),

    coberturaLocal: porcentaje(),
    coberturaRegional: porcentaje(),
    coberturaEstatal: porcentaje(),
    coberturaNacional: porcentaje(),
    coberturaExportacion: porcentaje(),
  })
  .superRefine((data, ctx) => {
    const clientes = [
      data.porcentajeMayoristas,
      data.porcentajeDetallistas,
      data.porcentajeClienteFinal,
    ].filter((v): v is number => v !== undefined);

    if (clientes.length > 0) {
      const total = clientes.reduce((sum, v) => sum + v, 0);
      if (Math.round(total) !== 100) {
        ctx.addIssue({
          code: "custom",
          message: `La distribución de clientes debe sumar 100% (actual: ${total}%)`,
          path: ["porcentajeMayoristas"],
        });
      }
    }

    const cobertura = [
      data.coberturaLocal,
      data.coberturaRegional,
      data.coberturaEstatal,
      data.coberturaNacional,
      data.coberturaExportacion,
    ].filter((v): v is number => v !== undefined);

    if (cobertura.length > 0) {
      const total = cobertura.reduce((sum, v) => sum + v, 0);
      if (Math.round(total) !== 100) {
        ctx.addIssue({
          code: "custom",
          message: `La cobertura geográfica debe sumar 100% (actual: ${total}%)`,
          path: ["coberturaLocal"],
        });
      }
    }
  });

// ─────────────────────────────────────────
// DATOS BANCARIOS
// ─────────────────────────────────────────

export const guardarDatosBancariosSchema = z.object({
  banco: textoRequerido(2, 255, "El banco"),

  numeroCuenta: z
    .string()
    .regex(/^\d{10,18}$/, "El número de cuenta debe tener entre 10 y 18 dígitos")
    .optional(),

  clabe: z
    .string({ message: "La CLABE es requerida" })
    .length(18, "La CLABE debe tener exactamente 18 dígitos")
    .regex(/^\d+$/, "La CLABE debe ser numérica")
    .refine(clabeChecksumValido, "CLABE inválida (dígito verificador incorrecto)"),
});

// ─────────────────────────────────────────
// TIPOS INFERIDOS
// ─────────────────────────────────────────

export type CrearSolicitudDto = z.infer<typeof crearSolicitudSchema>;
export type GuardarDatosGeneralesDto = z.infer<typeof guardarDatosGeneralesSchema>;
export type GuardarDatosSolicitanteDto = z.infer<typeof guardarDatosSolicitanteSchema>;
export type GuardarDatosAvalDto = z.infer<typeof guardarDatosAvalSchema>;
export type CambiarEstatusDto = z.infer<typeof cambiarEstatusSchema>;
export type GuardarDatosCreditoDto = z.infer<typeof guardarDatosCreditoSchema>;
export type GuardarDatosGarantiaDto = z.infer<typeof guardarDatosGarantiaSchema>;
export type GuardarDatosNegocioDto = z.infer<typeof guardarDatosNegocioSchema>;
export type GuardarDatosMercadoDto = z.infer<typeof guardarDatosMercadoSchema>;
export type GuardarDatosBancariosDto = z.infer<typeof guardarDatosBancariosSchema>;