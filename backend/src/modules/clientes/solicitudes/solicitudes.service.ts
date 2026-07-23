import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
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
import { EstatusSolicitud } from "../../../../generated/prisma/client";
import { SolicitudPDFData, DatosPersonaPDF } from "../../../shared/pdf/pdf.types";

const incluyeTodo = {
    programa: {
        include: {
            documentosRequeridos: {
                include: { tipoDocumento: true },
            },
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
};
const ESTATUS_FINALES: EstatusSolicitud[] = ["CANCELADO", "RECHAZADO", "APROBADO"];
const ESTATUS_EDITABLES: EstatusSolicitud[] = ["BORRADOR", "EN_CORRECCION"];

const validarEditable = (solicitud: { estatus: EstatusSolicitud }) => {
    if (!ESTATUS_EDITABLES.includes(solicitud.estatus)) {
        throw new AppError(
            "Solo se pueden modificar solicitudes en borrador o en corrección",
            400
        );
    }
};
export const listarSolicitudes = async (
    usuarioId: string,
    rol: string
) => {
    // Admin y analista ven todas, cliente solo las suyas
    const where = rol === "CLIENTE" ? { solicitanteId: usuarioId } : {};

    return prisma.solicitud.findMany({
        where,
        include: {
            programa: { select: { id: true, nombre: true } },
            datosSolicitante: {
                select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true },
            },
        },
        orderBy: { creadoEn: "desc" },
    });
};

export const obtenerSolicitudPorId = async (
    id: string,
    usuarioId: string,
    rol: string
) => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id },
        include: incluyeTodo,
    });

    if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

    // El cliente solo puede ver sus propias solicitudes
    if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
        throw new AppError("No tienes permisos para ver esta solicitud", 403);
    }

    return solicitud;
};

const generarFolio = async (): Promise<string> => {
    const result = await prisma.$queryRaw<[{ nextval: bigint }]>`
    SELECT nextval('solicitud_folio_seq')
    `;
    return String(Number(result[0].nextval)).padStart(5, '0');
};

export const crearSolicitud = async (
    dto: CrearSolicitudDto,
    solicitanteId: string
) => {

    const solicitudActiva = await prisma.solicitud.findFirst({
        where: {
            solicitanteId,
            estatus: { notIn: ESTATUS_FINALES },
        },
    });

    if (solicitudActiva) {
        throw new AppError(
            `Ya tienes una solicitud activa (folio ${solicitudActiva.folio}). Debe estar cancelada, rechazada, caducada o aprobada para crear una nueva.`,
            409
        );
    }
    const programa = await prisma.programa.findUnique({
        where: { id: dto.programaId },
    });

    if (!programa) throw new AppError('Programa no encontrado', 404);
    if (!programa.activo) throw new AppError('El programa no está disponible', 400);

    const folio = await generarFolio();

    return prisma.solicitud.create({
        data: {
            folio,
            programaId: dto.programaId,
            solicitanteId,
        },
    });
};

export const guardarDatosGenerales = async (
    solicitudId: string,
    dto: GuardarDatosGeneralesDto,
    usuarioId: string,
    rol: string
) => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
    });

    if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

    if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
        throw new AppError("No tienes permisos para modificar esta solicitud", 403);
    }

    validarEditable(solicitud);

    return prisma.solicitud.update({
        where: { id: solicitudId },
        data: dto,
    });
};
export const guardarDatosSolicitante = async (
    solicitudId: string,
    dto: GuardarDatosSolicitanteDto,
    usuarioId: string,
    rol: string
) => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
    });

    if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

    if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
        throw new AppError("No tienes permisos para modificar esta solicitud", 403);
    }

    validarEditable(solicitud);

    return prisma.datosSolicitante.upsert({
        where: { solicitudId },
        create: { ...dto, solicitudId },
        update: dto,
    });
};

export const guardarDatosAval = async (
    solicitudId: string,
    dto: GuardarDatosAvalDto,
    usuarioId: string,
    rol: string
) => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
        include: { programa: true },
    });

    if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

    if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
        throw new AppError("No tienes permisos para modificar esta solicitud", 403);
    }

    validarEditable(solicitud);

    if (solicitud.programa.aval === "NO_REQUIERE") {
        throw new AppError("Este programa no requiere aval", 400);
    }

    return prisma.datosAval.upsert({
        where: { solicitudId },
        create: { ...dto, solicitudId },
        update: dto,
    });
};

export const guardarDatosCredito = async (
    solicitudId: string,
    dto: GuardarDatosCreditoDto,
    usuarioId: string,
    rol: string
) => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
        include: { programa: true },
    });

    if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

    if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
        throw new AppError("No tienes permisos para modificar esta solicitud", 403);
    }

    validarEditable(solicitud);

    // Validar plazo contra el programa
    if (
        dto.plazoMeses < solicitud.programa.plazoMinimoMeses ||
        dto.plazoMeses > solicitud.programa.plazoMaximoMeses
    ) {
        throw new AppError(
            `El plazo debe estar entre ${solicitud.programa.plazoMinimoMeses} y ${solicitud.programa.plazoMaximoMeses} meses`,
            400
        );
    }

    // Validar monto total contra el programa
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

        // Reemplaza los conceptos por completo: borra los anteriores y crea los nuevos
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
    usuarioId: string,
    rol: string
) => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
    });

    if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

    if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
        throw new AppError("No tienes permisos para modificar esta solicitud", 403);
    }

    validarEditable(solicitud);

    return prisma.$transaction(async (tx) => {
        const datosGarantia = await tx.datosGarantia.upsert({
            where: { solicitudId },
            create: { solicitudId },
            update: {},
        });

        // Reemplaza las garantías por completo: borra las anteriores y crea las nuevas
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

export const guardarDatosNegocio = async (
    solicitudId: string,
    dto: GuardarDatosNegocioDto,
    usuarioId: string,
    rol: string
) => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
    });

    if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

    if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
        throw new AppError("No tienes permisos para modificar esta solicitud", 403);
    }

    validarEditable(solicitud);

    return prisma.datosNegocio.upsert({
        where: { solicitudId },
        create: {
            solicitudId,
            ...dto,
        },
        update: {
            ...dto,
        },
    });
};

export const guardarDatosMercado = async (
    solicitudId: string,
    dto: GuardarDatosMercadoDto,
    usuarioId: string,
    rol: string
) => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
    });

    if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

    if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
        throw new AppError("No tienes permisos para modificar esta solicitud", 403);
    }

    validarEditable(solicitud);

    return prisma.datosMercado.upsert({
        where: { solicitudId },
        create: {
            solicitudId,
            ...dto,
        },
        update: {
            ...dto,
        },
    });
};

export const guardarDatosBancarios = async (
    solicitudId: string,
    dto: GuardarDatosBancariosDto,
    usuarioId: string,
    rol: string
) => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
    });

    if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

    if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
        throw new AppError("No tienes permisos para modificar esta solicitud", 403);
    }

    validarEditable(solicitud);

    return prisma.datosBancarios.upsert({
        where: { solicitudId },
        create: {
            solicitudId,
            ...dto,
        },
        update: {
            ...dto,
        },
    });
};
export const enviarSolicitud = async (
    solicitudId: string,
    usuarioId: string,
    rol: string
) => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
        include: { datosSolicitante: true, datosCredito: true },
    });

    if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

    if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
        throw new AppError("No tienes permisos para enviar esta solicitud", 403);
    }

    validarEditable(solicitud);

    if (!solicitud.datosSolicitante) {
        throw new AppError("Debes completar los datos del solicitante antes de enviar", 400);
    }
    if (!solicitud.datosCredito) {
        throw new AppError("Debes completar los datos del crédito antes de enviar", 400);
    }

    return prisma.solicitud.update({
        where: { id: solicitudId },
        data: { estatus: 'PENDIENTE' },
        include: incluyeTodo,
    });
};

export const cambiarEstatus = async (
    solicitudId: string,
    dto: CambiarEstatusDto
) => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
    });

    if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

    if (solicitud.estatus === "APROBADO" || solicitud.estatus === "RECHAZADO") {
        throw new AppError("La solicitud ya tiene un estatus final", 400);
    }

    return prisma.solicitud.update({
        where: { id: solicitudId },
        data: {
            estatus: dto.estatus,
        },
        include: incluyeTodo,
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
    solicitud: Awaited<ReturnType<typeof obtenerSolicitudPorId>>
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