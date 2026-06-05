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

export const guardarDatosSolicitanteSchema = datosPersonaSchema;
export const guardarDatosAvalSchema = datosPersonaSchema;

export const cambiarEstatusSchema = z.object({
    estatus: z.enum(["PENDIENTE", "EN_REVISION", "APROBADO", "RECHAZADO"], {
        message: "Estatus inválido",
    }),
    motivo: z.string().trim().optional(),
});

export type CrearSolicitudDto = z.infer<typeof crearSolicitudSchema>;
export type GuardarDatosGeneralesDto = z.infer<typeof guardarDatosGeneralesSchema>;
export type GuardarDatosSolicitanteDto = z.infer<typeof guardarDatosSolicitanteSchema>;
export type GuardarDatosAvalDto = z.infer<typeof guardarDatosAvalSchema>;
export type CambiarEstatusDto = z.infer<typeof cambiarEstatusSchema>;