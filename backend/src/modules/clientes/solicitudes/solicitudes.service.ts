import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import { RolAplicacion } from "@middlewares/roles.middleware"; // ajustar si la ruta real difiere
import { generarFolio } from "./helper/generar-folio"; // reutilizando el helper que ya existe
import {
    CambiarEstatusDto,
    CrearSolicitudDto,
    GuardarDatosGeneralesDto,
    GuardarDatosAvalDto,
    GuardarDatosSolicitanteDto,
    GuardarDatosCreditoDto,
    GuardarDatosGarantiaDto,
    GuardarDatosNegocioDto,
    GuardarDatosMercadoDto,
    GuardarDatosBancariosDto,
} from "./solicitudes.schema";
import { EstatusSolicitud, Prisma, Requerimiento, SeccionSolicitud } from "../../../../generated/prisma/client";
import { SolicitudPDFData, DatosPersonaPDF } from "../../../shared/pdf/pdf.types";

// Agregar al incluyeTodo existente:
const incluyeTodo = {
    programa: {
        include: {
            documentosRequeridos: {
                include: { tipoDocumento: true, },

            },
            secciones: true,
        },
    },
    datosSolicitante: true,
    datosAval: true,
    datosCredito: {
        include: { conceptos: true },
    },
    datosGarantia: {
        include: { garantias: true },
    },
    datosNegocio: true,
    datosMercado: true,
    datosBancarios: true,
    documentos: {
        include: { tipoDocumento: true },
    },
    // Solo la asignación activa; una solicitud no debería tener más de una,
    // pero take:1 protege el shape aunque la regla de negocio falle algún día.
    asignaciones: {
        where: { activa: true },
        take: 1,
        include: {
            gestor: {
                select: {
                    id: true,
                    usuario: {
                        select: {
                            nombre: true,
                            apellidoPaterno: true,
                            apellidoMaterno: true,
                        },
                    },
                },
            },
        },
    },
} satisfies Prisma.SolicitudInclude;

// Helper de transformación — reutilizable en obtenerSolicitudPorId y listarSolicitudes
type AsignacionConGestor = {
    gestor: {
        id: string;
        usuario: {
            nombre: string;
            apellidoPaterno: string;
            apellidoMaterno: string;
        };
    };
};

const mapearGestorAsignado = (
    asignaciones: AsignacionConGestor[]
): { id: string; nombre: string } | null => {
    const activa = asignaciones[0];
    if (!activa) return null;

    return {
        id: activa.gestor.id,
        nombre: `${activa.gestor.usuario.nombre} ${activa.gestor.usuario.apellidoPaterno} ${activa.gestor.usuario.apellidoMaterno}`,
    };
};

const ESTATUS_FINALES: EstatusSolicitud[] = ["CANCELADO", "RECHAZADO", "APROBADO"];
const ESTATUS_EDITABLES: EstatusSolicitud[] = ["BORRADOR", "EN_CORRECCION"];

// ─────────────────────────────────────────
// AUTORIZACIÓN
//
// Regla del negocio confirmada: SOLO el cliente dueño puede editar
// su solicitud. Ningún rol de staff (ADMIN, ANALISTA, GESTOR) tiene
// excepción aquí — su acceso de escritura, si existe, vive en otro
// módulo (ej. cambiarEstatus, validación de documentos), no en estos
// formularios. El rol solo determina qué puede VER, no qué puede EDITAR.
// ─────────────────────────────────────────

/** Ver: staff ve cualquier solicitud, cliente solo la suya. 404 si no aplica (anti-IDOR). */
const obtenerSolicitudVisible = async (
    solicitudId: string,
    usuarioId: string,
    rol: RolAplicacion
) => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
    });

    const esDueno = solicitud?.solicitanteId === usuarioId;
    if (!solicitud || (rol === "CLIENTE" && !esDueno)) {
        throw new AppError("Solicitud no encontrada", 404);
    }

    return solicitud;
};

const validarPropiedadYEstatus = (
    solicitud: { solicitanteId: string; estatus: EstatusSolicitud } | null,
    usuarioId: string
) => {
    if (!solicitud || solicitud.solicitanteId !== usuarioId) {
        throw new AppError("Solicitud no encontrada", 404);
    }
    if (!ESTATUS_EDITABLES.includes(solicitud.estatus)) {
        throw new AppError(
            "Solo se pueden modificar solicitudes en borrador o en corrección",
            400
        );
    }
};

/** Variante que además trae el programa, para validar reglas cruzadas (aval/garantía/montos/plazos). */
const obtenerSolicitudEditableConPrograma = async (
    solicitudId: string,
    usuarioId: string
) => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
        include: {
            programa: {
                include: { secciones: true },
            },
        },
    });

    validarPropiedadYEstatus(solicitud, usuarioId);
    return solicitud!;
};

/** Editar: exclusivamente el dueño, sin importar el rol. */
const obtenerSolicitudEditable = async (solicitudId: string, usuarioId: string) => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
    });

    validarPropiedadYEstatus(solicitud, usuarioId);
    return solicitud!;
};

type ProgramaConSecciones = {
    secciones: { seccion: SeccionSolicitud; requerimiento: Requerimiento }[];
};

const obtenerRequerimiento = (
    programa: ProgramaConSecciones,
    seccion: SeccionSolicitud
): Requerimiento => {
    return (
        programa.secciones.find((s) => s.seccion === seccion)?.requerimiento ??
        "NO_REQUIERE"
    );
};

const validarSeccionRequerida = (
    programa: ProgramaConSecciones,
    seccion: SeccionSolicitud,
    mensaje: string
) => {
    if (obtenerRequerimiento(programa, seccion) === "NO_REQUIERE") {
        throw new AppError(mensaje, 400);
    }
};

/**
 * Factory para sub-formularios de upsert plano (1 a 1 con Solicitud):
 * datosSolicitante, datosAval, datosNegocio, datosMercado, datosBancarios.
 * datosCredito y datosGarantia no la usan: necesitan transacción propia
 * para reemplazar arreglos anidados (conceptos/garantias).
 */
function crearGuardadorSubrecurso<TDto extends Record<string, unknown>>(
    delegate: {
        upsert: (args: {
            where: { solicitudId: string };
            create: any;
            update: any;
        }) => Promise<any>;
    },
    seccion: SeccionSolicitud,
    mensajeNoRequerido: string
) {
    return async (
        solicitudId: string,
        dto: TDto,
        usuarioId: string
    ) => {
        const solicitud = await obtenerSolicitudEditableConPrograma(solicitudId, usuarioId);
        validarSeccionRequerida(solicitud.programa, seccion, mensajeNoRequerido);

        return delegate.upsert({
            where: { solicitudId },
            create: { ...dto, solicitudId },
            update: dto,
        });
    };
}

// ─────────────────────────────────────────
// LECTURA
// ─────────────────────────────────────────

export interface PaginacionParams {
    page?: number;
    pageSize?: number;
}

export const listarSolicitudes = async (
    usuarioId: string,
    rol: RolAplicacion,
    { page = 1, pageSize = 20 }: PaginacionParams = {}
) => {
    const where: Prisma.SolicitudWhereInput =
        rol === "CLIENTE" ? { solicitanteId: usuarioId } : {};

    const take = Math.min(Math.max(pageSize, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;

    const [solicitudes, total] = await prisma.$transaction([
        prisma.solicitud.findMany({
            where,
            include: {
                programa: { select: { id: true, nombre: true } },
                datosSolicitante: {
                    select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true },
                },
                datosCredito: {
                    include: { conceptos: true },
                },
            },
            orderBy: { creadoEn: "desc" },
            take,
            skip,
        }),
        prisma.solicitud.count({ where }),
    ]);

    return {
        data: solicitudes,
        pagination: { page, pageSize: take, total, totalPages: Math.ceil(total / take) },
    };
};

export const obtenerSolicitudPorId = async (
    id: string,
    usuarioId: string,
    rol: RolAplicacion
) => {
    await obtenerSolicitudVisible(id, usuarioId, rol);

    return prisma.solicitud.findUnique({
        where: { id },
        include: incluyeTodo,
    });
};

// ─────────────────────────────────────────
// CREACIÓN
// ─────────────────────────────────────────

export const crearSolicitud = async (
    dto: CrearSolicitudDto,
    solicitanteId: string
) => {
    const programa = await prisma.programa.findUnique({
        where: { id: dto.programaId },
    });

    if (!programa) throw new AppError('Programa no encontrado', 404);
    if (!programa.activo) throw new AppError('El programa no está disponible', 400);

    const solicitudActiva = await prisma.solicitud.findFirst({
        where: {
            solicitanteId,
            estatus: { notIn: ESTATUS_FINALES },
        },
    });

    if (solicitudActiva) {
        throw new AppError(
            `Ya tienes una solicitud activa (folio ${solicitudActiva.folio}). Debe estar cancelada, rechazada o aprobada para crear una nueva.`,
            409
        );
    }

    const folio = await generarFolio(prisma);

    try {
        return await prisma.solicitud.create({
            data: {
                folio,
                programaId: dto.programaId,
                solicitanteId,
            },
            include: {
                programa: {
                    select: {
                        id: true,
                        nombre: true,
                        secciones: true,
                    },
                },
            },
        });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            throw new AppError("Ya tienes una solicitud activa. Intenta de nuevo.", 409);
        }
        throw err;
    }
};

// ─────────────────────────────────────────
// SUB-FORMULARIOS PLANOS
// ─────────────────────────────────────────

export const guardarDatosGenerales = async (
    solicitudId: string,
    dto: GuardarDatosGeneralesDto,
    usuarioId: string
) => {
    await obtenerSolicitudEditable(solicitudId, usuarioId);

    return prisma.solicitud.update({
        where: { id: solicitudId },
        data: dto,
        include: {
            programa: {
                select: {
                    id: true,
                    nombre: true,
                    secciones: true,
                },
            },
        },
    });
};
export const guardarDatosSolicitante = crearGuardadorSubrecurso<GuardarDatosSolicitanteDto>(
    prisma.datosSolicitante,
    "SOLICITANTE",
    "Este programa no requiere datos del solicitante"
);

export const guardarDatosAval = async (
    solicitudId: string,
    dto: GuardarDatosAvalDto,
    usuarioId: string
) => {
    const solicitud = await obtenerSolicitudEditableConPrograma(solicitudId, usuarioId);
    validarSeccionRequerida(solicitud.programa, "AVAL", "Este programa no requiere aval");

    return prisma.datosAval.upsert({
        where: { solicitudId },
        create: { ...dto, solicitudId },
        update: dto,
    });
};

export const guardarDatosCredito = async (
    solicitudId: string,
    dto: GuardarDatosCreditoDto,
    usuarioId: string
) => {
    const solicitud = await obtenerSolicitudEditableConPrograma(solicitudId, usuarioId);
    validarSeccionRequerida(solicitud.programa, "CREDITO", "Este programa no requiere datos de crédito");

    if (
        dto.plazoMeses < solicitud.programa.plazoMinimoMeses ||
        dto.plazoMeses > solicitud.programa.plazoMaximoMeses
    ) {
        throw new AppError(
            `El plazo debe estar entre ${solicitud.programa.plazoMinimoMeses} y ${solicitud.programa.plazoMaximoMeses} meses`,
            400
        );
    }

    const montoTotal = dto.conceptos.reduce((sum, c) => sum + c.monto, 0);

    if (
        montoTotal < solicitud.programa.montoMinimo ||
        montoTotal > solicitud.programa.montoMaximo
    ) {
        throw new AppError(
            `El monto total debe estar entre ${solicitud.programa.montoMinimo} y ${solicitud.programa.montoMaximo}`,
            400
        );
    }

    return prisma.$transaction(async (tx) => {
        const datosCredito = await tx.datosCredito.upsert({
            where: { solicitudId },
            create: {
                solicitudId,
                plazoMeses: dto.plazoMeses,
                mesesGracia: dto.mesesGracia,
            },
            update: {
                plazoMeses: dto.plazoMeses,
                mesesGracia: dto.mesesGracia,
            },
        });

        await tx.conceptoCredito.deleteMany({
            where: { datosCreditoId: datosCredito.id },
        });

        await tx.conceptoCredito.createMany({
            data: dto.conceptos.map((c) => ({
                datosCreditoId: datosCredito.id,
                categoria: c.categoria,
                concepto: c.concepto,
                monto: c.monto,
            })),
        });

        return tx.datosCredito.findUnique({
            where: { id: datosCredito.id },
            include: { conceptos: true },
        });
    });
};

export const guardarDatosGarantia = async (
    solicitudId: string,
    dto: GuardarDatosGarantiaDto,
    usuarioId: string
) => {
    const solicitud = await obtenerSolicitudEditableConPrograma(solicitudId, usuarioId);
    validarSeccionRequerida(solicitud.programa, "GARANTIA", "Este programa no requiere garantía");

    return prisma.$transaction(async (tx) => {
        const datosGarantia = await tx.datosGarantia.upsert({
            where: { solicitudId },
            create: { solicitudId },
            update: {},
        });

        await tx.garantia.deleteMany({
            where: { datosGarantiaId: datosGarantia.id },
        });

        await tx.garantia.createMany({
            data: dto.garantias.map((g) => ({
                datosGarantiaId: datosGarantia.id,
                tipo: g.tipo,
                nombrePropietario: g.nombrePropietario,
                valor: g.valor,
                descripcion: g.descripcion,
                marca: g.marca,
                modelo: g.modelo,
                anio: g.anio,
                numeroSerie: g.numeroSerie,
                calle: g.calle,
                numeroExterior: g.numeroExterior,
                numeroInterior: g.numeroInterior,
                colonia: g.colonia,
                ciudad: g.ciudad,
                estado: g.estado,
                codigoPostal: g.codigoPostal,
                numeroEscritura: g.numeroEscritura,
                folioReal: g.folioReal,
            })),
        });

        return tx.datosGarantia.findUnique({
            where: { id: datosGarantia.id },
            include: { garantias: true },
        });
    });
};

export const guardarDatosNegocio = crearGuardadorSubrecurso<GuardarDatosNegocioDto>(
    prisma.datosNegocio,
    "NEGOCIO",
    "Este programa no requiere datos del negocio"
);

export const guardarDatosMercado = crearGuardadorSubrecurso<GuardarDatosMercadoDto>(
    prisma.datosMercado,
    "MERCADO",
    "Este programa no requiere datos de mercado"
);

export const guardarDatosBancarios = crearGuardadorSubrecurso<GuardarDatosBancariosDto>(
    prisma.datosBancarios,
    "BANCARIOS",
    "Este programa no requiere datos bancarios"
);

// ─────────────────────────────────────────
// ENVÍO Y CAMBIO DE ESTATUS
// ─────────────────────────────────────────

export const enviarSolicitud = async (
    solicitudId: string,
    usuarioId: string
) => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
        include: {
            datosSolicitante: true,
            datosCredito: true,
            datosAval: true,
            datosGarantia: { include: { garantias: true } },
            documentos: true,
            programa: { include: { documentosRequeridos: true } },
        },
    });

    validarPropiedadYEstatus(solicitud, usuarioId);
    const s = solicitud!;

    if (!s.datosSolicitante) {
        throw new AppError("Debes completar los datos del solicitante antes de enviar", 400);
    }
    if (!s.datosCredito) {
        throw new AppError("Debes completar los datos del crédito antes de enviar", 400);
    }

    return prisma.$transaction(async (tx) => {
        const actualizada = await tx.solicitud.update({
            where: { id: solicitudId },
            data: { estatus: "PENDIENTE" },
            include: incluyeTodo,
        });

        await tx.historialEstatus.create({
            data: {
                solicitudId,
                estatusAnterior: s.estatus,
                estatusNuevo: "PENDIENTE",
                usuarioId,
                motivo: "Envío de solicitud por el cliente",
            },
        });

        return actualizada;
    });
};

/**
 * Cambio de estatus por parte de staff (ADMIN/ANALISTA/GESTOR).
 * La autorización de ROL vive en el middleware de la ruta, no aquí —
 * esta función asume que quien la invoca ya pasó ese filtro.
 * usuarioId se usa únicamente para dejar rastro en HistorialEstatus.
 */
const ESTATUS_PROHIBIDOS_STAFF: EstatusSolicitud[] = ["BORRADOR"];

export const cambiarEstatus = async (
    solicitudId: string,
    dto: CambiarEstatusDto,
    usuarioId: string
) => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
    });

    if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

    if (ESTATUS_FINALES.includes(solicitud.estatus)) {
        throw new AppError("La solicitud ya tiene un estatus final", 400);
    }

    if (ESTATUS_PROHIBIDOS_STAFF.includes(dto.estatus)) {
        throw new AppError("No se puede regresar la solicitud a borrador manualmente", 400);
    }

    if (dto.estatus === solicitud.estatus) {
        throw new AppError("La solicitud ya se encuentra en ese estatus", 400);
    }

    return prisma.$transaction(async (tx) => {
        const actualizada = await tx.solicitud.update({
            where: { id: solicitudId },
            data: { estatus: dto.estatus },
            include: incluyeTodo,
        });

        await tx.historialEstatus.create({
            data: {
                solicitudId,
                estatusAnterior: solicitud.estatus,
                estatusNuevo: dto.estatus,
                usuarioId,
                motivo: dto.motivo,
            },
        });

        return actualizada;
    });
};
const construirDomicilio = (d: {
    calle?: string | null;
    numeroExterior?: string | null;
    numeroInterior?: string | null;
    colonia?: string | null;
    ciudad?: string | null;
    estado?: string | null;
    codigoPostal?: string | null;
}): string => {
    const partes = [
        d.calle,
        d.numeroExterior ? `#${d.numeroExterior}` : null,
        d.numeroInterior ? `Int. ${d.numeroInterior}` : null,
        d.colonia,
        d.ciudad,
        d.estado,
        d.codigoPostal ? `C.P. ${d.codigoPostal}` : null,
    ].filter(Boolean);

    return partes.length > 0 ? partes.join(", ") : "";
};

const mapearPersona = (p: {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    curp: string | null;
    rfc: string | null;
    telefono: string | null;
    celular: string | null;
    correo: string | null;
    calle: string | null;
    numeroExterior: string | null;
    numeroInterior: string | null;
    colonia: string | null;
    ciudad: string | null;
    estado: string | null;
    codigoPostal: string | null;
    nivelEstudio: string | null;
    universidad: string | null;
    estadoCivil: string | null;
    nombreConyuge: string | null;
    numeroINE: string | null;
    tipoVivienda: string | null;
    aniosDomicilioActual: number | null;
    aniosDomicilioAnterior: number | null;
}): DatosPersonaPDF => ({
    nombreCompleto: `${p.nombre} ${p.apellidoPaterno} ${p.apellidoMaterno}`,
    curp: p.curp,
    rfc: p.rfc,
    telefono: p.telefono,
    celular: p.celular,
    correo: p.correo,
    domicilio: construirDomicilio(p),
    nivelEstudio: p.nivelEstudio,
    universidad: p.universidad,
    estadoCivil: p.estadoCivil,
    nombreConyuge: p.nombreConyuge,
    numeroINE: p.numeroINE,
    tipoVivienda: p.tipoVivienda,
    aniosDomicilioActual: p.aniosDomicilioActual,
    aniosDomicilioAnterior: p.aniosDomicilioAnterior,
});

const formatearFecha = (fecha: Date | null): string | null =>
    fecha ? fecha.toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" }) : null;

export const mapearSolicitudAPDF = (
    solicitud: NonNullable<Awaited<ReturnType<typeof obtenerSolicitudPorId>>>
): SolicitudPDFData => {
    return {
        folio: solicitud.folio,
        estatus: solicitud.estatus,
        programa: solicitud.programa.nombre,
        fechaSolicitud: formatearFecha(solicitud.creadoEn) ?? "",
        tipoPersona: solicitud.tipoPersona,
        sector: solicitud.sector,
        tamanoEmpresa: solicitud.tamanoEmpresa,

        datosSolicitante: solicitud.datosSolicitante
            ? mapearPersona(solicitud.datosSolicitante)
            : null,

        datosAval: solicitud.datosAval
            ? mapearPersona(solicitud.datosAval)
            : null,

        datosNegocio: solicitud.datosNegocio
            ? {
                razonSocial: solicitud.datosNegocio.razonSocial,
                rfcNegocio: solicitud.datosNegocio.rfcNegocio,
                nombreNegocio: solicitud.datosNegocio.nombreNegocio,
                domicilioNegocio: [
                    solicitud.datosNegocio.domicilioNegocio,
                    solicitud.datosNegocio.numeroExteriorNegocio ? `#${solicitud.datosNegocio.numeroExteriorNegocio}` : null,
                    solicitud.datosNegocio.numeroInteriorNegocio ? `Int. ${solicitud.datosNegocio.numeroInteriorNegocio}` : null,
                    solicitud.datosNegocio.coloniaLocal,
                    solicitud.datosNegocio.municipioLocal,
                    solicitud.datosNegocio.estadoLocal,
                    solicitud.datosNegocio.codigoPostalLocal ? `C.P. ${solicitud.datosNegocio.codigoPostalLocal}` : null,
                ].filter(Boolean).join(", "),
                actividadNegocio: solicitud.datosNegocio.actividadNegocio,
                areaNegocio: solicitud.datosNegocio.areaNegocio,
                empleosConservados: solicitud.datosNegocio.empleosConservados,
                empleosNuevos: solicitud.datosNegocio.empleosNuevos,
                fechaInicioOperaciones: formatearFecha(solicitud.datosNegocio.fechaInicioOperaciones),
                antiguedadNegocio: solicitud.datosNegocio.antiguedadNegocio,
                tipoLocal: solicitud.datosNegocio.tipoLocal,
                experienciaActividadSolicitante: solicitud.datosNegocio.experienciaActividadSolicitante,
                experienciaEmpresarioSolicitante: solicitud.datosNegocio.experienciaEmpresarioSolicitante,
                actualExporta: solicitud.datosNegocio.actualExporta,
                telefonoRecadosNegocio: solicitud.datosNegocio.telefonoRecadosNegocio,
                telefonoFijoNegocio: solicitud.datosNegocio.telefonoFijoNegocio,
            }
            : null,

        datosCredito: solicitud.datosCredito
            ? {
                plazoMeses: solicitud.datosCredito.plazoMeses,
                mesesGracia: solicitud.datosCredito.mesesGracia,
                montoTotal: solicitud.datosCredito.conceptos.reduce((sum, c) => sum + c.monto, 0),
                conceptos: solicitud.datosCredito.conceptos.map((c) => ({
                    categoria: c.categoria,
                    concepto: c.concepto,
                    monto: c.monto,
                })),
            }
            : null,

        datosGarantia:
            solicitud.datosGarantia && solicitud.datosGarantia.garantias.length > 0
                ? solicitud.datosGarantia.garantias.map((g) => ({
                    tipo: g.tipo,
                    nombrePropietario: g.nombrePropietario,
                    valor: g.valor,
                    descripcion: g.descripcion,
                    marca: g.marca,
                    modelo: g.modelo,
                    anio: g.anio,
                    numeroSerie: g.numeroSerie,
                    domicilio:
                        g.tipo === "HIPOTECARIA"
                            ? construirDomicilio(g)
                            : null,
                    numeroEscritura: g.numeroEscritura,
                    folioReal: g.folioReal,
                }))
                : null,

        datosMercado: solicitud.datosMercado
            ? {
                principalesProductos: solicitud.datosMercado.principalesProductos,
                distribucionClientes: [
                    { label: "Mayoristas", valor: solicitud.datosMercado.porcentajeMayoristas },
                    { label: "Detallistas", valor: solicitud.datosMercado.porcentajeDetallistas },
                    { label: "Cliente final", valor: solicitud.datosMercado.porcentajeClienteFinal },
                ],
                coberturaGeografica: [
                    { label: "Local", valor: solicitud.datosMercado.coberturaLocal },
                    { label: "Regional", valor: solicitud.datosMercado.coberturaRegional },
                    { label: "Estatal", valor: solicitud.datosMercado.coberturaEstatal },
                    { label: "Nacional", valor: solicitud.datosMercado.coberturaNacional },
                    { label: "Exportación", valor: solicitud.datosMercado.coberturaExportacion },
                ],
            }
            : null,

        datosBancarios: solicitud.datosBancarios
            ? {
                banco: solicitud.datosBancarios.banco,
                numeroCuenta: solicitud.datosBancarios.numeroCuenta,
                clabe: solicitud.datosBancarios.clabe,
            }
            : null,

        documentos:
            solicitud.documentos.length > 0
                ? solicitud.documentos.map((d) => ({
                    nombreArchivo: d.nombreArchivo,
                    tipoDocumento: d.tipoDocumento.nombre,
                    estatus: d.estatus,
                    fechaCarga: formatearFecha(d.subidoEn) ?? "",
                }))
                : null,
    };
};
