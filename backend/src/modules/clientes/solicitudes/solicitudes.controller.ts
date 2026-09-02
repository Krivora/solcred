import { Response, NextFunction } from "express";
import { RequestAutenticado } from "@middlewares/auth.middleware";
import { registrarLog } from "@utils/audit";
import { AccionLog, ModuloLog } from "../../../../generated/prisma/client";
import * as solicitudesService from "./solicitudes.service";
import { ok } from "@utils/response";
import { generarPDFDesdeHTML } from '../../../shared/pdf/pdf.service';
import { solicitudTemplate } from '../../../shared/pdf/templates/solicitud.template';
import { mapearSolicitudAPDF } from "./solicitudes.service";
import { AppError } from "@/middlewares/error.middleware";

// ─────────────────────────────────────────
// FACTORY: sub-formularios de "guardar datos"
//
// Los 7 endpoints (solicitante, aval, credito, garantia, negocio,
// mercado, bancarios) comparten forma exacta: tomar params.id + body,
// llamar al service con (id, dto, usuarioId), loggear, responder.
// Un solo punto de mantenimiento en vez de 7 copias divergentes.
// ─────────────────────────────────────────

type ServicioGuardado<TDto> = (
    solicitudId: string,
    dto: TDto,
    usuarioId: string
) => Promise<unknown>;

function crearControladorGuardado<TDto>(
    servicio: ServicioGuardado<TDto>,
    etiqueta: string,       // ej. "Datos del aval" — para mensajes y logs
    mensajeExito: string    // ej. "Datos del aval guardados"
) {
    return async (
        req: RequestAutenticado,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const solicitudId = req.params.id as string;

            const datos = await servicio(solicitudId, req.body, req.usuario!.id);

            await registrarLog({
                accion: AccionLog.ACTUALIZAR,
                modulo: ModuloLog.SOLICITUDES,
                descripcion: `${etiqueta} guardados en solicitud: ${solicitudId}`,
                usuarioId: req.usuario!.id,
                entidadId: solicitudId,
                req,
            });

            res.status(200).json(ok(mensajeExito, datos));
        } catch (error) {
            next(error);
        }
    };
}

// ─────────────────────────────────────────
// LECTURA
// ─────────────────────────────────────────

export const listar = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
        const pageSize = Math.max(1, parseInt(req.query.pageSize as string, 10) || 20);

        const resultado = await solicitudesService.listarSolicitudes(
            req.usuario!.id,
            req.usuario!.rol,
            { page, pageSize }
        );

        await registrarLog({
            accion: AccionLog.CONSULTAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: "Listado de solicitudes consultado",
            usuarioId: req.usuario!.id,
            req,
        });

        res.status(200).json(ok("Solicitudes obtenidas", resultado));
    } catch (error) {
        next(error);
    }
};

export const obtenerPorId = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const solicitud = await solicitudesService.obtenerSolicitudPorId(
            req.params.id as string,
            req.usuario!.id,
            req.usuario!.rol
        );

        await registrarLog({
            accion: AccionLog.CONSULTAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Solicitud consultada: ${solicitud!.id}`,
            usuarioId: req.usuario!.id,
            entidadId: solicitud!.id,
            req,
        });

        res.status(200).json(ok("Solicitud obtenida", solicitud));
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────
// CREACIÓN
// ─────────────────────────────────────────

export const crear = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const solicitud = await solicitudesService.crearSolicitud(
            req.body,
            req.usuario!.id
        );

        await registrarLog({
            accion: AccionLog.CREAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Solicitud creada para programa: ${req.body.programaId}`,
            usuarioId: req.usuario!.id,
            entidadId: solicitud.id,
            req,
            // Nota: req.body aquí ya pasó por Zod (crearSolicitudSchema),
            // así que solo contiene programaId — seguro para el log.
            metadata: { solicitud: req.body },
        });

        res.status(201).json(ok("Solicitud creada", solicitud));
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────
// SUB-FORMULARIOS — una línea cada uno gracias a la factory
// ─────────────────────────────────────────

export const guardarDatosGenerales = crearControladorGuardado(
    solicitudesService.guardarDatosGenerales,
    "Datos generales",
    "Datos generales guardados"
);

export const guardarDatosSolicitante = crearControladorGuardado(
    solicitudesService.guardarDatosSolicitante,
    "Datos del solicitante",
    "Datos del solicitante guardados"
);

export const guardarDatosAval = crearControladorGuardado(
    solicitudesService.guardarDatosAval,
    "Datos del aval",
    "Datos del aval guardados"
);

export const guardarDatosCredito = crearControladorGuardado(
    solicitudesService.guardarDatosCredito,
    "Datos del crédito",
    "Datos del crédito guardados"
);

export const guardarDatosGarantia = crearControladorGuardado(
    solicitudesService.guardarDatosGarantia,
    "Datos de garantía",
    "Datos de garantía guardados"
);

export const guardarDatosNegocio = crearControladorGuardado(
    solicitudesService.guardarDatosNegocio,
    "Datos del negocio",
    "Datos del negocio guardados"
);

export const guardarDatosMercado = crearControladorGuardado(
    solicitudesService.guardarDatosMercado,
    "Datos de mercado",
    "Datos de mercado guardados"
);

export const guardarDatosBancarios = crearControladorGuardado(
    solicitudesService.guardarDatosBancarios,
    "Datos bancarios",
    "Datos bancarios guardados"
);

// ─────────────────────────────────────────
// ENVÍO Y CAMBIO DE ESTATUS
// ─────────────────────────────────────────

export const enviar = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const solicitud = await solicitudesService.enviarSolicitud(
            req.params.id as string,
            req.usuario!.id
        );

        await registrarLog({
            accion: AccionLog.ACTUALIZAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Solicitud enviada a revisión: ${req.params.id}`,
            usuarioId: req.usuario!.id,
            entidadId: solicitud.id,
            req,
        });

        res.status(200).json(ok("Solicitud enviada a revisión", solicitud));
    } catch (error) {
        next(error);
    }
};

export const cambiarEstatus = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const solicitud = await solicitudesService.cambiarEstatus(
            req.params.id as string,
            req.body,
            req.usuario!.id // requerido por HistorialEstatus.usuarioId (no-nullable)
        );

        await registrarLog({
            accion: AccionLog.ACTUALIZAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Estatus de solicitud cambiado a ${req.body.estatus}: ${req.params.id}`,
            usuarioId: req.usuario!.id,
            entidadId: solicitud.id,
            req,
            metadata: { estatus: req.body.estatus, motivo: req.body.motivo },
        });

        res.status(200).json(ok("Estatus actualizado", solicitud));
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────
// PDF
// ─────────────────────────────────────────

export const descargarPDF = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const solicitud = await solicitudesService.obtenerSolicitudParaPDF(
            req.params.id as string,
            req.usuario!.id,
            req.usuario!.rol
        );
        if (!solicitud) {
            throw new AppError("Solicitud no encontrada", 404);
        }
        const data = mapearSolicitudAPDF(solicitud);
        const html = solicitudTemplate(data);
        const pdfBuffer = await generarPDFDesdeHTML(html);

        await registrarLog({
            accion: AccionLog.CONSULTAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `PDF generado para solicitud: ${solicitud.id}`,
            usuarioId: req.usuario!.id,
            entidadId: solicitud.id,
            req,
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="solicitud-${data.folio}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length.toString());
        res.status(200).send(pdfBuffer);
    } catch (error) {
        next(error);
    }
};