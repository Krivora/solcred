import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import { ValidarDocumentoDto } from "./expediente.schema";
import { EstatusDocumento, Prisma } from "../../../generated/prisma/client";
import fs from "fs";
import path from "path";
import { UPLOADS_BASE_DIR } from "@config/multer.config";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const ROLES_PERMITIDOS = ["CLIENTE", "GESTOR", "ADMIN", "ANALISTA", "SUPERVISOR"] as const;
type RolPermitido = (typeof ROLES_PERMITIDOS)[number];

const ROLES_CON_ACCESO_HISTORIAL = ["GESTOR", "ADMIN", "ANALISTA", "SUPERVISOR", "CLIENTE"] as const;

const ESTATUS_PERMITIDOS_PARA_SUBIR = [
    "BORRADOR",
    "PENDIENTE",
    "EN_CORRECCION",
    "NO_SUBIDO",
    "EN_REVISION",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// SELECTS REUTILIZABLES
// Centralizados para no repetir el shape Personal -> usuario en cada query,
// y para que un cambio futuro en el schema solo se ajuste en un lugar.
// ─────────────────────────────────────────────────────────────────────────────

const SELECT_TIPO_DOCUMENTO = {
    id: true,
    nombre: true,
} satisfies Prisma.TipoDocumentoSelect;

const SELECT_PERSONAL_BASICO = {
    id: true,
    rol: true,
    usuario: {
        select: {
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
        },
    },
} satisfies Prisma.PersonalSelect;

const INCLUDE_DOCUMENTO_CON_VALIDACION = {
    tipoDocumento: { select: SELECT_TIPO_DOCUMENTO },
    validadoPor: { select: SELECT_PERSONAL_BASICO },
} satisfies Prisma.DocumentoSolicitudInclude;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS INTERNOS
// ─────────────────────────────────────────────────────────────────────────────

const verificarAcceso = async (
    solicitudId: string,
    usuarioId: string,
    rol: string
) => {
    if (!ROLES_PERMITIDOS.includes(rol as RolPermitido)) {
        throw new AppError("Rol no reconocido", 403);
    }

    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
        include: {
            asignaciones: { select: { gestorId: true } },
        },
    });

    if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

    if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
        throw new AppError("No tienes permisos para acceder a este expediente", 403);
    }

    // GESTOR, ANALISTA, ADMIN: acceso general permitido (confirmado por negocio).
    return solicitud;
};

const verificarGestorAsignado = async (
    solicitudId: string,
    gestorId: string
) => {
    const asignacion = await prisma.asignacionSolicitud.findFirst({
        where: { solicitudId, activa: true },
        select: { gestorId: true },
    });

    if (!asignacion) {
        throw new AppError("Esta solicitud no tiene un gestor asignado activo", 400);
    }

    if (asignacion.gestorId !== gestorId) {
        throw new AppError("Solo el gestor asignado puede validar documentos", 403);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPEDIENTE — VISTA GENERAL
// ─────────────────────────────────────────────────────────────────────────────

export const obtenerExpediente = async (
    solicitudId: string,
    usuarioId: string,
    rol: string
) => {
    await verificarAcceso(solicitudId, usuarioId, rol);

    const expediente = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
        include: {
            programa: {
            select: {
                id: true,
                nombre: true,
                secciones: true,
                documentosRequeridos: {
                    include: {
                        tipoDocumento: {
                            select: { ...SELECT_TIPO_DOCUMENTO, descripcion: true },
                        },
                    },
                },
            },
        },
            solicitante: {
                select: {
                    id: true,
                    nombre: true,
                    apellidoPaterno: true,
                    apellidoMaterno: true,
                    correo: true,
                },
            },
            datosSolicitante: {
                select: {
                    nombre: true,
                    apellidoPaterno: true,
                    apellidoMaterno: true,
                    celular: true,
                    correo: true,
                    telefono: true,
                },
            },
            // montoSolicitado/plazoSolicitado ya no viven en Solicitud,
            // se derivan desde DatosCredito.
            datosCredito: {
                select: {
                    plazoMeses: true,
                    mesesGracia: true,
                    conceptos: { select: { monto: true } },
                },
            },
            documentos: {
                where: { activo: true },
                include: INCLUDE_DOCUMENTO_CON_VALIDACION,
                orderBy: { subidoEn: "desc" },
            },
            asignaciones: {
                where: { activa: true },
                take: 1,
                select: {
                    gestor: { select: SELECT_PERSONAL_BASICO },
                    fechaAsignacion: true,
                },
            },
        },
    });

    if (!expediente) throw new AppError("Expediente no encontrado", 404);

    const docsRequeridos = expediente.programa.documentosRequeridos;
    const docsSubidos = expediente.documentos;

    const resumenDocumentos = docsRequeridos
        .filter((dr) => {
            if (!dr.aplicaA) return true;
            if (!expediente.tipoPersona) return true;
            return dr.aplicaA === expediente.tipoPersona || dr.aplicaA === "AMBOS";
        })
        .map((dr) => {
            const docSubido = docsSubidos.find(
                (d) => d.tipoDocumentoId === dr.tipoDocumentoId
            );
            return {
                tipoDocumento: dr.tipoDocumento,
                esObligatorio: dr.esObligatorio,
                aplicaA: dr.aplicaA,
                documentoActivo: docSubido ?? null,
                estatus: docSubido?.estatus ?? "NO_SUBIDO",
            };
        });

    const totalRequeridos = resumenDocumentos.filter((d) => d.esObligatorio).length;
    const totalAprobados = resumenDocumentos.filter((d) => d.estatus === "APROBADO").length;
    const totalPendientes = resumenDocumentos.filter((d) => d.estatus === "PENDIENTE").length;
    const totalRechazados = resumenDocumentos.filter((d) => d.estatus === "RECHAZADO").length;
    const totalNoSubidos = resumenDocumentos.filter((d) => d.estatus === "NO_SUBIDO").length;

    const asignacionActiva = expediente.asignaciones[0] ?? null;

    const montoSolicitado =
        expediente.datosCredito?.conceptos.reduce((sum, c) => sum + c.monto, 0) ?? null;
    const plazoSolicitado = expediente.datosCredito?.plazoMeses ?? null;

    // Aplana Personal -> usuario al mismo shape plano que consumía el frontend
    // antes del refactor, para no romper contratos existentes.
    const aplanarPersonal = (
        personal: { id: string; usuario: { nombre: string; apellidoPaterno: string; apellidoMaterno: string } } | null
    ) =>
        personal && {
            id: personal.id,
            nombre: personal.usuario.nombre,
            apellidoPaterno: personal.usuario.apellidoPaterno,
            apellidoMaterno: personal.usuario.apellidoMaterno,
        };

    return {
        id: expediente.id,
        folio: expediente.folio,
        estatus: expediente.estatus,
        tipoPersona: expediente.tipoPersona,
        sector: expediente.sector,
        tamanoEmpresa: expediente.tamanoEmpresa,
        montoSolicitado,
        plazoSolicitado,
        creadoEn: expediente.creadoEn,
        actualizadoEn: expediente.actualizadoEn,

        programa: { id: expediente.programa.id, nombre: expediente.programa.nombre },
        solicitante: expediente.solicitante,
        datosSolicitante: expediente.datosSolicitante,
        gestor: aplanarPersonal(asignacionActiva?.gestor ?? null),
        fechaAsignacion: asignacionActiva?.fechaAsignacion ?? null,

        documentos: resumenDocumentos.map((d) => ({
            ...d,
            documentoActivo: d.documentoActivo
                ? {
                    ...d.documentoActivo,
                    validadoPor: aplanarPersonal(d.documentoActivo.validadoPor),
                }
                : null,
        })),

        metricas: {
            totalRequeridos,
            totalAprobados,
            totalPendientes,
            totalRechazados,
            totalNoSubidos,
            porcentajeCompletado:
                totalRequeridos > 0
                    ? Math.round((totalAprobados / totalRequeridos) * 100)
                    : 0,
        },
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// CREAR VERSIÓN DE DOCUMENTO — usado internamente por uploads.controller.
// `urlArchivo` y `nombreArchivo` los genera el propio servidor, nunca vienen
// directo del cliente.
// ─────────────────────────────────────────────────────────────────────────────

interface CrearVersionDocumentoInput {
    solicitudId: string;
    usuarioId: string;
    rol: string;
    tipoDocumentoId: string;
    urlArchivo: string;
    nombreArchivo: string;
}

export const crearVersionDocumento = async ({
    solicitudId,
    usuarioId,
    rol,
    tipoDocumentoId,
    urlArchivo,
    nombreArchivo,
}: CrearVersionDocumentoInput) => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
        include: {
            programa: {
                include: {
                    documentosRequeridos: { where: { tipoDocumentoId } },
                },
            },
        },
    });

    if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

    // CLIENTE solo en la suya. GESTOR/ANALISTA/ADMIN sin restricción
    // (confirmado por negocio: pueden subir por cualquier cambio que necesiten).
    if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
        throw new AppError("No puedes subir documentos a esta solicitud", 403);
    }

    if (
        !ESTATUS_PERMITIDOS_PARA_SUBIR.includes(
            solicitud.estatus as (typeof ESTATUS_PERMITIDOS_PARA_SUBIR)[number]
        )
    ) {
        throw new AppError(
            `No se pueden subir documentos con estatus: ${solicitud.estatus}`,
            422
        );
    }

    const docRequerido = solicitud.programa.documentosRequeridos[0];
    if (!docRequerido) {
        throw new AppError(
            "Este tipo de documento no pertenece al programa de esta solicitud",
            400
        );
    }

    const resultado = await prisma.$transaction(async (tx) => {
        const docActual = await tx.documentoSolicitud.findFirst({
            where: { solicitudId, tipoDocumentoId, activo: true },
            select: { id: true, version: true, estatus: true, urlArchivo: true },
        });

        if (docActual?.estatus === "APROBADO") {
            throw new AppError(
                "Este documento ya fue aprobado y no puede ser reemplazado",
                422
            );
        }

        if (docActual?.estatus === "PENDIENTE") {
            throw new AppError(
                "Este documento ya está en revisión. Espera la respuesta del gestor",
                422
            );
        }

        if (docActual) {
            await tx.documentoSolicitud.update({
                where: { id: docActual.id },
                data: { activo: false },
            });
        }

        const nuevaVersion = (docActual?.version ?? 0) + 1;

        const nuevoDocumento = await tx.documentoSolicitud.create({
            data: {
                solicitudId,
                tipoDocumentoId,
                urlArchivo,
                nombreArchivo,
                version: nuevaVersion,
                activo: true,
                estatus: "PENDIENTE",
            },
            include: {
                tipoDocumento: { select: SELECT_TIPO_DOCUMENTO },
            },
        });

        return { nuevoDocumento, urlArchivoAnterior: docActual?.urlArchivo ?? null };
    });

    // Limpieza del archivo físico anterior — urlArchivo es SIEMPRE ruta relativa
    // ("solicitudId/nombre.pdf"), nunca una URL absoluta. No bloqueante:
    // si falla el borrado físico, no debe tumbar la respuesta al cliente.
    if (resultado.urlArchivoAnterior) {
        const rutaAnterior = path.join(UPLOADS_BASE_DIR, resultado.urlArchivoAnterior);
        fs.unlink(rutaAnterior, (err) => {
            if (err) {
                console.error(
                    `No se pudo eliminar el archivo anterior (${rutaAnterior}):`,
                    err
                );
            }
        });
    }

    return resultado.nuevoDocumento;
};

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTOS — GESTOR VALIDA
// ─────────────────────────────────────────────────────────────────────────────

export const validarDocumento = async (
    solicitudId: string,
    documentoId: string,
    gestorId: string,
    dto: ValidarDocumentoDto
) => {
    await verificarGestorAsignado(solicitudId, gestorId);

    // Todo dentro de una transacción: sin esto, dos requests casi simultáneos
    // podrían pasar ambos el chequeo de estatus "PENDIENTE" y sobrescribirse
    // el uno al otro. El lock implícito de la transacción evita esa condición
    // de carrera al validar el mismo documento dos veces.
    const documentoActualizado = await prisma.$transaction(async (tx) => {
        const documento = await tx.documentoSolicitud.findFirst({
            where: { id: documentoId, solicitudId, activo: true },
            select: { id: true, estatus: true },
        });

        if (!documento) {
            throw new AppError("Documento no encontrado o no está activo", 404);
        }

        if (documento.estatus !== "PENDIENTE") {
            throw new AppError(
                `Este documento ya fue ${documento.estatus.toLowerCase()}. Solo se pueden validar documentos en estado PENDIENTE`,
                422
            );
        }

        return tx.documentoSolicitud.update({
            where: { id: documentoId },
            data: {
                estatus: dto.estatus as EstatusDocumento,
                validadoPorId: gestorId,
                fechaValidacion: new Date(),
                motivoRechazo: dto.estatus === "RECHAZADO" ? dto.motivoRechazo ?? null : null,
            },
            include: INCLUDE_DOCUMENTO_CON_VALIDACION,
        });
    });

    return documentoActualizado;
};

// ─────────────────────────────────────────────────────────────────────────────
// HISTORIAL DE VERSIONES
// ─────────────────────────────────────────────────────────────────────────────

export const obtenerHistorialDocumento = async (
    solicitudId: string,
    tipoDocumentoId: string,
    usuarioId: string,
    rol: string
) => {
    if (!ROLES_CON_ACCESO_HISTORIAL.includes(rol as (typeof ROLES_CON_ACCESO_HISTORIAL)[number])) {
        throw new AppError("No tienes permisos para ver el historial de versiones", 403);
    }

    await verificarAcceso(solicitudId, usuarioId, rol);

    const historial = await prisma.documentoSolicitud.findMany({
        where: { solicitudId, tipoDocumentoId },
        include: INCLUDE_DOCUMENTO_CON_VALIDACION,
        orderBy: { version: "desc" },
    });

    if (historial.length === 0) {
        throw new AppError("No se encontraron versiones para este documento", 404);
    }

    return historial;
};