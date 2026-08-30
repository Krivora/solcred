import { z } from 'zod'

// ─────────────────────────────────────────
// GARANTÍA
// ─────────────────────────────────────────
const garantiaSchema = z
    .object({
        tipo: z.enum(['PRENDARIA', 'HIPOTECARIA'], {
            error: 'El tipo de garantía es requerido',
        }),

        nombrePropietario: z
            .string({ error: 'El nombre del propietario es requerido' })
            .min(2, 'El nombre debe tener al menos 2 caracteres')
            .trim(),

        valor: z
            .number({ error: 'El valor debe ser un número' })
            .positive('El valor debe ser mayor a 0'),

        descripcion: z.string().trim().optional(),

        // Prendaria
        marca: z.string().trim().optional(),
        modelo: z.string().trim().optional(),
        anio: z
            .number()
            .int('El año debe ser un número entero')
            .min(2015, 'El año debe ser 2015 o posterior')
            .max(new Date().getFullYear() + 1, 'Año inválido')
            .optional(),
        numeroSerie: z.string().trim().optional(),

        // Hipotecaria
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
        if (data.tipo === 'PRENDARIA') {
            if (!data.marca) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'La marca es requerida para garantías prendarias',
                    path: ['marca'],
                })
            }
            if (!data.numeroSerie) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'El número de serie es requerido para garantías prendarias',
                    path: ['numeroSerie'],
                })
            }
        }

        if (data.tipo === 'HIPOTECARIA') {
            if (!data.calle) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'La calle es requerida para garantías hipotecarias',
                    path: ['calle'],
                })
            }
            if (!data.ciudad) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'La ciudad es requerida para garantías hipotecarias',
                    path: ['ciudad'],
                })
            }
            if (!data.estado) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'El estado es requerido para garantías hipotecarias',
                    path: ['estado'],
                })
            }
            if (!data.codigoPostal) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'El código postal es requerido para garantías hipotecarias',
                    path: ['codigoPostal'],
                })
            }
            if (!data.numeroEscritura) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'El número de escritura es requerido para garantías hipotecarias',
                    path: ['numeroEscritura'],
                })
            }
        }
    })

export const guardarDatosGarantiaSchema = z.object({
    garantias: z.array(garantiaSchema).min(1, 'Debe agregar al menos una garantía'),
})

export type GuardarDatosGarantiaDto = z.infer<typeof guardarDatosGarantiaSchema>

// ─────────────────────────────────────────
// NEGOCIO
// ─────────────────────────────────────────
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
        .length(5, 'El código postal debe tener 5 dígitos')
        .regex(/^\d+$/, 'El código postal debe ser numérico')
        .optional(),
    municipioLocal: z.string().trim().optional(),
    estadoLocal: z.string().trim().optional(),

    actividadNegocio: z.string().trim().optional(),
    areaNegocio: z.string().trim().optional(),

    empleosConservados: z
        .number()
        .int('Debe ser un número entero')
        .min(0, 'No puede ser negativo')
        .optional(),
    empleosNuevos: z
        .number()
        .int('Debe ser un número entero')
        .min(0, 'No puede ser negativo')
        .optional(),

    fechaInicioOperaciones: z.string().optional(),
    antiguedadNegocio: z
        .number()
        .int('Debe ser un número entero')
        .min(0, 'No puede ser negativo')
        .optional(),

    tipoLocal: z.enum(['PROPIO', 'RENTADO', 'FAMILIAR', 'OTRO']).optional(),

    experienciaActividadSolicitante: z
        .number()
        .int('Debe ser un número entero')
        .min(0, 'No puede ser negativo')
        .optional(),
    experienciaEmpresarioSolicitante: z
        .number()
        .int('Debe ser un número entero')
        .min(0, 'No puede ser negativo')
        .optional(),

    actualExporta: z.boolean().optional(),
    obtuvoExperiencia: z.boolean().optional(),
    negocioConsidera: z.string().trim().optional(),

    telefonoRecadosNegocio: z.string().trim().optional(),
    telefonoFijoNegocio: z.string().trim().optional(),
})

export type GuardarDatosNegocioDto = z.infer<typeof guardarDatosNegocioSchema>

// ─────────────────────────────────────────
// MERCADO
// ─────────────────────────────────────────
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
        ].filter((v) => v !== undefined) as number[]

        if (clientes.length > 0) {
            const total = clientes.reduce((sum, v) => sum + v, 0)
            if (Math.round(total) !== 100) {
                ctx.addIssue({
                    code: 'custom',
                    message: `La distribución de clientes debe sumar 100% (actual: ${total}%)`,
                    path: ['porcentajeMayoristas'],
                })
            }
        }

        const cobertura = [
            data.coberturaLocal,
            data.coberturaRegional,
            data.coberturaEstatal,
            data.coberturaNacional,
            data.coberturaExportacion,
        ].filter((v) => v !== undefined) as number[]

        if (cobertura.length > 0) {
            const total = cobertura.reduce((sum, v) => sum + v, 0)
            if (Math.round(total) !== 100) {
                ctx.addIssue({
                    code: 'custom',
                    message: `La cobertura geográfica debe sumar 100% (actual: ${total}%)`,
                    path: ['coberturaLocal'],
                })
            }
        }
    })

export type GuardarDatosMercadoDto = z.infer<typeof guardarDatosMercadoSchema>

// ─────────────────────────────────────────
// BANCARIOS
// ─────────────────────────────────────────
export const guardarDatosBancariosSchema = z.object({
    banco: z
        .string({ error: 'El banco es requerido' })
        .max(255, 'El banco no puede exceder 255 caracteres')
        .trim(),

    numeroCuenta: z
        .string()
        .regex(/^\d{10,18}$/, 'El número de cuenta debe tener entre 10 y 18 dígitos')
        .optional(),

    clabe: z
        .string({ error: 'La CLABE es requerida' })
        .length(18, 'La CLABE debe tener exactamente 18 dígitos')
        .regex(/^\d+$/, 'La CLABE debe ser numérica'),
})

export type GuardarDatosBancariosDto = z.infer<typeof guardarDatosBancariosSchema>