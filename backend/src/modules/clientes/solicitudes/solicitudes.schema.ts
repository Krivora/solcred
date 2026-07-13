import { z } from "zod";

export const crearSolicitudSchema = z.object({
    programaId: z
        .string({ message: "El programa es requerido" })
        .uuid("ID de programa inválido"),
});

export const guardarDatosGeneralesSchema = z.object({
    tipoPersona: z.enum(['FISICA', 'MORAL']),
    sector: z.enum(['AGROPECUARIO', 'INDUSTRIAL', 'COMERCIAL', 'SERVICIOS', 'TECNOLOGIA', 'OTRO']),
    tamanoEmpresa: z.enum(['MICRO', 'PEQUENA', 'MEDIANA', 'GRANDE']).optional(),
})


const datosPersonaSchema = z.object({
    nombre: z
        .string({ message: "El nombre es requerido" })
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .trim(),

    apellidoPaterno: z
        .string({ message: "El apellido paterno es requerido" })
        .min(2, "Debe tener al menos 2 caracteres")
        .trim(),

    apellidoMaterno: z
        .string({ message: "El apellido materno es requerido" })
        .min(2, "Debe tener al menos 2 caracteres")
        .trim(),

    curp: z
        .string()
        .length(18, "La CURP debe tener 18 caracteres")
        .regex(
            /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$/,
            "CURP inválida"
        )
        .optional(),

    rfc: z
        .string()
        .regex(
            /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/,
            "RFC inválido"
        )
        .optional(),

    telefono: z
        .string()
        .regex(/^[0-9]{10}$/, "El teléfono debe tener 10 dígitos")
        .optional(),

    celular: z
        .string()
        .regex(/^[0-9]{10}$/, "El celular debe tener 10 dígitos")
        .optional(),

    correo: z
        .string()
        .email("Correo inválido")
        .optional(),

    calle: z.string().trim().optional(),
    numeroExterior: z.string().trim().optional(),
    numeroInterior: z.string().trim().optional(),
    colonia: z.string().trim().optional(),
    ciudad: z.string().trim().optional(),
    estado: z.string().trim().optional(),

    codigoPostal: z
        .string()
        .regex(/^[0-9]{5}$/, "El código postal debe tener 5 dígitos")
        .optional(),

    nivelEstudio: z
        .enum(["PRIMARIA", "SECUNDARIA", "PREPARATORIA", "TECNICO", "LICENCIATURA", "MAESTRIA", "DOCTORADO",])
        .optional(),

    universidad: z.string().trim().optional(),

    estadoCivil: z
        .enum(["SOLTERO", "CASADO", "DIVORCIADO", "VIUDO", "UNION_LIBRE",])
        .optional(),

    // nuevos campos
    nombreConyuge: z
        .string()
        .trim()
        .optional(),

    numeroINE: z
        .string()
        .trim()
        .optional(),

    tipoVivienda: z
        .enum(["PROPIA", "RENTADA", "PAGANDO",])
        .optional(),

    aniosDomicilioActual: z
        .number({
            error: "Debe ser un número",
        })
        .int("Debe ser un número entero")
        .min(0, "No puede ser negativo")
        .optional(),

    aniosDomicilioAnterior: z
        .number({
            error: "Debe ser un número",
        })
        .int("Debe ser un número entero")
        .min(0, "No puede ser negativo")
        .optional(),
});

const conceptoCreditoSchema = z.object({
    categoria: z.enum(["CAPITAL", "MAQUINARIA_EQUIPO", "REMODELACION"], {
        message: "La categoría es requerida",
    }),

    concepto: z
        .string({ message: "El concepto es requerido" })
        .min(2, "El concepto debe tener al menos 2 caracteres")
        .trim(),

    monto: z
        .number({ error: "El monto debe ser un número" })
        .positive("El monto debe ser mayor a 0"),
});
export const guardarDatosSolicitanteSchema = datosPersonaSchema;
export const guardarDatosAvalSchema = datosPersonaSchema;

export const cambiarEstatusSchema = z.object({
    estatus: z.enum(["PENDIENTE", "EN_REVISION", "APROBADO", "RECHAZADO"], {
        message: "Estatus inválido",
    }),
    motivo: z.string().trim().optional(),
});

export const guardarDatosCreditoSchema = z
    .object({
        plazoMeses: z
            .number({ error: "El plazo debe ser un número" })
            .int("El plazo debe ser un número entero")
            .positive("El plazo debe ser mayor a 0"),

        mesesGracia: z
            .number({ error: "Los meses de gracia deben ser un número" })
            .int("Los meses de gracia deben ser un número entero")
            .min(0, "No puede ser negativo")
            .default(0),

        conceptos: z
            .array(conceptoCreditoSchema)
            .min(1, "Debe agregar al menos un concepto"),
    })
    .refine((data) => data.mesesGracia <= data.plazoMeses, {
        message: "El periodo de gracia no puede ser mayor al plazo total",
        path: ["mesesGracia"],
    });

const garantiaSchema = z
    .object({
        tipo: z.enum(["PRENDARIA", "HIPOTECARIA"], {
            message: "El tipo de garantía es requerido",
        }),

        nombrePropietario: z
            .string({ message: "El nombre del propietario es requerido" })
            .min(2, "El nombre debe tener al menos 2 caracteres")
            .trim(),

        valor: z
            .number({ error: "El valor debe ser un número" })
            .positive("El valor debe ser mayor a 0"),

        descripcion: z.string().trim().optional(),

        // ── Solo PRENDARIA ──
        marca: z.string().trim().optional(),
        modelo: z.string().trim().optional(),
        anio: z
            .number()
            .int("El año debe ser un número entero")
            .min(1900, "Año inválido")
            .max(new Date().getFullYear() + 1, "Año inválido")
            .optional(),
        numeroSerie: z.string().trim().optional(),

        // ── Solo HIPOTECARIA ──
        calle: z.string().trim().optional(),
        numeroExterior: z.string().trim().optional(),
        numeroInterior: z.string().trim().optional(),
        colonia: z.string().trim().optional(),
        ciudad: z.string().trim().optional(),
        estado: z.string().trim().optional(),
        codigoPostal: z.string().trim().optional(),
        numeroEscritura: z.string().trim().optional(),
        folioReal: z.string().trim().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.tipo === "PRENDARIA") {
            if (!data.marca) {
                ctx.addIssue({
                    code: "custom",
                    message: "La marca es requerida para garantías prendarias",
                    path: ["marca"],
                });
            }
            if (!data.numeroSerie) {
                ctx.addIssue({
                    code: "custom",
                    message: "El número de serie es requerido para garantías prendarias",
                    path: ["numeroSerie"],
                });
            }
        }

        if (data.tipo === "HIPOTECARIA") {
            if (!data.calle) {
                ctx.addIssue({
                    code: "custom",
                    message: "La calle es requerida para garantías hipotecarias",
                    path: ["calle"],
                });
            }
            if (!data.ciudad) {
                ctx.addIssue({
                    code: "custom",
                    message: "La ciudad es requerida para garantías hipotecarias",
                    path: ["ciudad"],
                });
            }
            if (!data.estado) {
                ctx.addIssue({
                    code: "custom",
                    message: "El estado es requerido para garantías hipotecarias",
                    path: ["estado"],
                });
            }
            if (!data.numeroEscritura) {
                ctx.addIssue({
                    code: "custom",
                    message: "El número de escritura es requerido para garantías hipotecarias",
                    path: ["numeroEscritura"],
                });
            }
        }
    });

export const guardarDatosGarantiaSchema = z.object({
    garantias: z
        .array(garantiaSchema)
        .min(1, "Debe agregar al menos una garantía"),
});
export const guardarDatosNegocioSchema = z.object({
    razonSocial: z.string().trim().optional(),
    rfcNegocio: z.string().trim().optional(),
    nombreNegocio: z.string().trim().optional(),

    domicilioNegocio: z.string().trim().optional(),
    numeroExteriorNegocio: z.string().trim().optional(),
    numeroInteriorNegocio: z.string().trim().optional(),
    coloniaLocal: z.string().trim().optional(),
    codigoPostalLocal: z
        .string()
        .length(5, "El código postal debe tener 5 dígitos")
        .regex(/^\d+$/, "El código postal debe ser numérico")
        .optional(),
    municipioLocal: z.string().trim().optional(),
    estadoLocal: z.string().trim().optional(),

    actividadNegocio: z.string().trim().optional(),
    areaNegocio: z.string().trim().optional(),

    empleosConservados: z
        .number()
        .int("Debe ser un número entero")
        .min(0, "No puede ser negativo")
        .optional(),
    empleosNuevos: z
        .number()
        .int("Debe ser un número entero")
        .min(0, "No puede ser negativo")
        .optional(),

    fechaInicioOperaciones: z.coerce.date().optional(),
    antiguedadNegocio: z
        .number()
        .int("Debe ser un número entero")
        .min(0, "No puede ser negativo")
        .optional(),

    tipoLocal: z.enum(["PROPIO", "RENTADO", "FAMILIAR", "OTRO"]).optional(),

    experienciaActividadSolicitante: z
        .number()
        .int("Debe ser un número entero")
        .min(0, "No puede ser negativo")
        .optional(),
    experienciaEmpresarioSolicitante: z
        .number()
        .int("Debe ser un número entero")
        .min(0, "No puede ser negativo")
        .optional(),

    actualExporta: z.boolean().optional(),
    obtuvoExperiencia: z.boolean().optional(),
    negocioConsidera: z.string().trim().optional(),

    telefonoRecadosNegocio: z.string().trim().optional(),
    telefonoFijoNegocio: z.string().trim().optional(),
});
export const guardarDatosMercadoSchema = z
    .object({
        principalesProductos: z.string().trim().optional(),

        porcentajeMayoristas: z.number().min(0).max(100).optional(),
        porcentajeDetallistas: z.number().min(0).max(100).optional(),
        porcentajeClienteFinal: z.number().min(0).max(100).optional(),

        coberturaLocal: z.number().min(0).max(100).optional(),
        coberturaRegional: z.number().min(0).max(100).optional(),
        coberturaEstatal: z.number().min(0).max(100).optional(),
        coberturaNacional: z.number().min(0).max(100).optional(),
        coberturaExportacion: z.number().min(0).max(100).optional(),
    })
    .superRefine((data, ctx) => {
        const clientes = [
            data.porcentajeMayoristas,
            data.porcentajeDetallistas,
            data.porcentajeClienteFinal,
        ].filter((v) => v !== undefined) as number[];

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
        ].filter((v) => v !== undefined) as number[];

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

export const guardarDatosBancariosSchema = z.object({
    banco: z
        .string({ message: "El banco es requerido" })
        .max(255, "El banco no puede exceder 255 caracteres")
        .trim(),

    numeroCuenta: z
        .string()
        .regex(/^\d{10,18}$/, "El número de cuenta debe tener entre 10 y 18 dígitos")
        .optional(),

    clabe: z
        .string({ message: "La CLABE es requerida" })
        .length(18, "La CLABE debe tener exactamente 18 dígitos")
        .regex(/^\d+$/, "La CLABE debe ser numérica"),
});

export type GuardarDatosBancariosDto = z.infer<typeof guardarDatosBancariosSchema>;
export type GuardarDatosMercadoDto = z.infer<typeof guardarDatosMercadoSchema>;
export type GuardarDatosNegocioDto = z.infer<typeof guardarDatosNegocioSchema>;
export type CrearSolicitudDto = z.infer<typeof crearSolicitudSchema>;
export type GuardarDatosGeneralesDto = z.infer<typeof guardarDatosGeneralesSchema>;
export type GuardarDatosSolicitanteDto = z.infer<typeof guardarDatosSolicitanteSchema>;
export type GuardarDatosAvalDto = z.infer<typeof guardarDatosAvalSchema>;
export type CambiarEstatusDto = z.infer<typeof cambiarEstatusSchema>;
export type GuardarDatosCreditoDto = z.infer<typeof guardarDatosCreditoSchema>;
export type GuardarDatosGarantiaDto = z.infer<typeof guardarDatosGarantiaSchema>;