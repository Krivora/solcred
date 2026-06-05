import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import { SubirDocumentoDto, ValidarDocumentoDto } from "./expediente.schema";
import { EstatusDocumento } from "../../../generated/prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS INTERNOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verifica que la solicitud exista y que el usuario tenga acceso a ella.
 * - Cliente: solo sus propias solicitudes
 * - Gestor: solo las solicitudes que tiene asignadas
 * - Admin / Analista: cualquier solicitud
 */
const verificarAcceso = async (
    solicitudId: string,
    usuarioId: string,
    rol: string
) => {
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
        include: {
            asignacion: { select: { gestorId: true } },
        },
    });

    if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

    if (rol === "CLIENTE" && solicitud.solicitanteId !== usuarioId) {
        throw new AppError("No tienes permisos para acceder a este expediente", 403);
    }

    if (rol === "GESTOR" && solicitud.asignacion?.gestorId !== usuarioId) {
        throw new AppError("Este expediente no está asignado a ti", 403);
    }

    return solicitud;
};

/**
 * Verifica que el gestor sea exactamente el asignado a la solicitud.
 * Se usa antes de validar documentos.
 */
const verificarGestorAsignado = async (
    solicitudId: string,
    gestorId: string
) => {
    const asignacion = await prisma.asignacionSolicitud.findUnique({
        where: { solicitudId },
        select: { gestorId: true, activa: true },
    });

    if (!asignacion || !asignacion.activa) {
        throw new AppError("Esta solicitud no tiene un gestor asignado activo", 400);
    }

    if (asignacion.gestorId !== gestorId) {
        throw new AppError("Solo el gestor asignado puede validar documentos", 403);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPEDIENTE — VISTA GENERAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retorna toda la información del expediente:
 * - Datos generales de la solicitud
 * - Documentos requeridos por el programa (con su estatus actual)
 * - Historial de validaciones
 */
export const obtenerExpediente = async (
    solicitudId: string,
    usuarioId: string,
    rol: string
) => {
    const solicitud = await verificarAcceso(solicitudId, usuarioId, rol);

    const expediente = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
        include: {
            // Datos generales
            programa: {
                select: {
                    id: true,
                    nombre: true,
                    aval: true,
                    documentosRequeridos: {
                        include: {
                            tipoDocumento: { select: { id: true, nombre: true, descripcion: true } },
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
            // Solo documentos activos (la versión más reciente de cada tipo)
            documentos: {
                where: { activo: true },
                include: {
                    tipoDocumento: { select: { id: true, nombre: true } },
                    validadoPor: {
                        select: {
                            id: true,
                            nombre: true,
                            apellidoPaterno: true,
                            apellidoMaterno: true,
                        },
                    },
                },
                orderBy: { subidoEn: "desc" },
            },
            asignacion: {
                select: {
                    gestor: {
                        select: {
                            id: true,
                            nombre: true,
                            apellidoPaterno: true,
                            apellidoMaterno: true,
                        },
                    },
                    fechaAsignacion: true,
                },
            },
        },
    });

    if (!expediente) throw new AppError("Expediente no encontrado", 404);

    // ── Construimos el resumen de documentos (requeridos vs subidos) ──────────
    const docsRequeridos = expediente.programa.documentosRequeridos;
    const docsSubidos = expediente.documentos;

    const resumenDocumentos = docsRequeridos
        .filter((dr) => {
            // Filtramos por tipo de persona si aplica
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

    return {
        // Datos generales
        id: expediente.id,
        folio: expediente.folio,
        estatus: expediente.estatus,
        tipoPersona: expediente.tipoPersona,
        sector: expediente.sector,
        tamanoEmpresa: expediente.tamanoEmpresa,
        montoSolicitado: expediente.montoSolicitado,
        plazoSolicitado: expediente.plazoSolicitado,
        creadoEn: expediente.creadoEn,
        actualizadoEn: expediente.actualizadoEn,

        // Partes involucradas
        programa: { id: expediente.programa.id, nombre: expediente.programa.nombre },
        solicitante: expediente.solicitante,
        datosSolicitante: expediente.datosSolicitante,
        gestor: expediente.asignacion?.gestor ?? null,
        fechaAsignacion: expediente.asignacion?.fechaAsignacion ?? null,

        // Documentos
        documentos: resumenDocumentos,

        // Métricas rápidas
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
// DOCUMENTOS — CLIENTE SUBE
// ─────────────────────────────────────────────────────────────────────────────

export const subirDocumento = async (
    solicitudId: string,
    clienteId: string,
    dto: SubirDocumentoDto
) => {
    // 1. Verificar que la solicitud pertenece al cliente
    const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
        include: {
            programa: {
                include: {
                    documentosRequeridos: {
                        where: { tipoDocumentoId: dto.tipoDocumentoId },
                    },
                },
            },
        },
    });

    if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

    if (solicitud.solicitanteId !== clienteId) {
        throw new AppError("No puedes subir documentos a esta solicitud", 403);
    }

    // 2. Verificar que el estatus permite subir documentos
    const estatusPermitidos = ["BORRADOR", "PENDIENTE", "EN_CORRECION"];
    if (!estatusPermitidos.includes(solicitud.estatus)) {
        throw new AppError(
            `No se pueden subir documentos con estatus: ${solicitud.estatus}`,
            422
        );
    }

    // 3. Verificar que el tipo de documento es válido para este programa
    const docRequerido = solicitud.programa.documentosRequeridos[0];
    if (!docRequerido) {
        throw new AppError(
            "Este tipo de documento no pertenece al programa de esta solicitud",
            400
        );
    }

    return await prisma.$transaction(async (tx) => {
        // 4. Obtener versión actual activa (si existe) para calcular nueva versión
        const docActual = await tx.documentoSolicitud.findFirst({
            where: {
                solicitudId,
                tipoDocumentoId: dto.tipoDocumentoId,
                activo: true,
            },
            select: { id: true, version: true, estatus: true },
        });

        // 5. Si hay un doc activo que no fue rechazado, no permitir resubida
        if (docActual && docActual.estatus === "APROBADO") {
            throw new AppError(
                "Este documento ya fue aprobado y no puede ser reemplazado",
                422
            );
        }

        if (docActual && docActual.estatus === "PENDIENTE") {
            throw new AppError(
                "Este documento ya está en revisión. Espera la respuesta del gestor",
                422
            );
        }

        // 6. Desactivar el documento anterior (si existe)
        if (docActual) {
            await tx.documentoSolicitud.update({
                where: { id: docActual.id },
                data: { activo: false },
            });
        }

        // 7. Crear nueva versión
        const nuevaVersion = (docActual?.version ?? 0) + 1;

        const nuevoDocumento = await tx.documentoSolicitud.create({
            data: {
                solicitudId,
                tipoDocumentoId: dto.tipoDocumentoId,
                urlArchivo: dto.urlArchivo,
                nombreArchivo: dto.nombreArchivo,
                version: nuevaVersion,
                activo: true,
                estatus: "PENDIENTE",
            },
            include: {
                tipoDocumento: { select: { id: true, nombre: true } },
            },
        });

        return nuevoDocumento;
    });
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
    // 1. Verificar que el gestor es el asignado
    await verificarGestorAsignado(solicitudId, gestorId);

    // 2. Obtener el documento
    const documento = await prisma.documentoSolicitud.findFirst({
        where: {
            id: documentoId,
            solicitudId,
            activo: true,
        },
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

    // 3. Actualizar estatus del documento
    const documentoActualizado = await prisma.documentoSolicitud.update({
        where: { id: documentoId },
        data: {
            estatus: dto.estatus as EstatusDocumento,
            validadoPorId: gestorId,
            fechaValidacion: new Date(),
            motivoRechazo: dto.estatus === "RECHAZADO" ? dto.motivoRechazo : null,
        },
        include: {
            tipoDocumento: { select: { id: true, nombre: true } },
            validadoPor: {
                select: {
                    id: true,
                    nombre: true,
                    apellidoPaterno: true,
                    apellidoMaterno: true,
                },
            },
        },
    });

    return documentoActualizado;
};

// ─────────────────────────────────────────────────────────────────────────────
// HISTORIAL DE VERSIONES — GESTOR / ADMIN
// ─────────────────────────────────────────────────────────────────────────────

export const obtenerHistorialDocumento = async (
    solicitudId: string,
    tipoDocumentoId: string,
    usuarioId: string,
    rol: string
) => {
    // Verificar acceso general al expediente
    await verificarAcceso(solicitudId, usuarioId, rol);

    const historial = await prisma.documentoSolicitud.findMany({
        where: { solicitudId, tipoDocumentoId },
        include: {
            tipoDocumento: { select: { id: true, nombre: true } },
            validadoPor: {
                select: {
                    id: true,
                    nombre: true,
                    apellidoPaterno: true,
                    apellidoMaterno: true,
                },
            },
        },
        orderBy: { version: "desc" },
    });

    if (historial.length === 0) {
        throw new AppError("No se encontraron versiones para este documento", 404);
    }

    return historial;
};