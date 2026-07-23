import { Response, NextFunction } from "express";
import { RequestAutenticado } from "@middlewares/auth.middleware";
import { registrarLog } from "@utils/audit";
import { AccionLog, ModuloLog } from "../../../../generated/prisma/client";
import * as solicitudesService from "./solicitudes.service";
import { ok } from "@utils/response";
import { generarPDFDesdeHTML } from '../../../shared/pdf/pdf.service';
import { solicitudTemplate } from '../../../shared/pdf/templates/solicitud.template';
import { mapearSolicitudAPDF } from "./solicitudes.service";

export const listar = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const solicitudes = await solicitudesService.listarSolicitudes(
            req.usuario!.id,
            req.usuario!.rol
        );

        await registrarLog({
            accion: AccionLog.CONSULTAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: "Listado de solicitudes consultado",
            usuarioId: req.usuario!.id,
            req,
        });

        res.status(200).json(ok("Solicitudes obtenidas", solicitudes));
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
            descripcion: `Solicitud consultada: ${solicitud.id}`,
            usuarioId: req.usuario!.id,
            entidadId: solicitud.id,
            req,
        });

        res.status(200).json(ok("Solicitud obtenida", solicitud));
    } catch (error) {
        next(error);
    }
};

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
            metadata: { solicitud: req.body },
        });

        res.status(201).json(ok("Solicitud creada", solicitud));
    } catch (error) {
        next(error);
    }
};

export const guardarDatosGenerales = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const datos = await solicitudesService.guardarDatosGenerales(
            req.params.id as string,
            req.body,
            req.usuario!.id,
            req.usuario!.rol
        );

        await registrarLog({
            accion: AccionLog.ACTUALIZAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Datos generales guardados en solicitud: ${req.params.id}`,
            usuarioId: req.usuario!.id,
            entidadId: req.params.id as string,
            req,
        });

        res.status(200).json(ok("Datos generales guardados", datos));
    } catch (error) {
        next(error);
    }
};
export const guardarDatosSolicitante = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const datos = await solicitudesService.guardarDatosSolicitante(
            req.params.id as string,
            req.body,
            req.usuario!.id,
            req.usuario!.rol
        );

        await registrarLog({
            accion: AccionLog.ACTUALIZAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Datos del solicitante guardados en solicitud: ${req.params.id}`,
            usuarioId: req.usuario!.id,
            entidadId: req.params.id as string,
            req,
        });

        res.status(200).json(ok("Datos del solicitante guardados", datos));
    } catch (error) {
        next(error);
    }
};

export const guardarDatosAval = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const datos = await solicitudesService.guardarDatosAval(
            req.params.id as string,
            req.body,
            req.usuario!.id,
            req.usuario!.rol
        );

        await registrarLog({
            accion: AccionLog.ACTUALIZAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Datos del aval guardados en solicitud: ${req.params.id}`,
            usuarioId: req.usuario!.id,
            entidadId: req.params.id as string,
            req,
        });

        res.status(200).json(ok("Datos del aval guardados", datos));
    } catch (error) {
        next(error);
    }
};

export const guardarDatosCredito = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const datos = await solicitudesService.guardarDatosCredito(
            req.params.id as string,
            req.body,
            req.usuario!.id,
            req.usuario!.rol
        );

        await registrarLog({
            accion: AccionLog.ACTUALIZAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Datos del crédito guardados en solicitud: ${req.params.id}`,
            usuarioId: req.usuario!.id,
            entidadId: req.params.id as string,
            req,
        });

        res.status(200).json(ok("Datos del crédito guardados", datos));
    } catch (error) {
        next(error);
    }
};

export const guardarDatosGarantia = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const datos = await solicitudesService.guardarDatosGarantia(
            req.params.id as string,
            req.body,
            req.usuario!.id,
            req.usuario!.rol
        );

        await registrarLog({
            accion: AccionLog.ACTUALIZAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Datos de garantía guardados en solicitud: ${req.params.id}`,
            usuarioId: req.usuario!.id,
            entidadId: req.params.id as string,
            req,
        });

        res.status(200).json(ok("Datos de garantía guardados", datos));
    } catch (error) {
        next(error);
    }
};

export const guardarDatosNegocio = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const datos = await solicitudesService.guardarDatosNegocio(
            req.params.id as string,
            req.body,
            req.usuario!.id,
            req.usuario!.rol
        );

        await registrarLog({
            accion: AccionLog.ACTUALIZAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Datos del negocio guardados en solicitud: ${req.params.id}`,
            usuarioId: req.usuario!.id,
            entidadId: req.params.id as string,
            req,
        });

        res.status(200).json(ok("Datos del negocio guardados", datos));
    } catch (error) {
        next(error);
    }
};

export const guardarDatosMercado = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const datos = await solicitudesService.guardarDatosMercado(
            req.params.id as string,
            req.body,
            req.usuario!.id,
            req.usuario!.rol
        );

        await registrarLog({
            accion: AccionLog.ACTUALIZAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Datos de mercado guardados en solicitud: ${req.params.id}`,
            usuarioId: req.usuario!.id,
            entidadId: req.params.id as string,
            req,
        });

        res.status(200).json(ok("Datos de mercado guardados", datos));
    } catch (error) {
        next(error);
    }
};

export const guardarDatosBancarios = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const datos = await solicitudesService.guardarDatosBancarios(
            req.params.id as string,
            req.body,
            req.usuario!.id,
            req.usuario!.rol
        );

        await registrarLog({
            accion: AccionLog.ACTUALIZAR,
            modulo: ModuloLog.SOLICITUDES,
            descripcion: `Datos bancarios guardados en solicitud: ${req.params.id}`,
            usuarioId: req.usuario!.id,
            entidadId: req.params.id as string,
            req,
        });

        res.status(200).json(ok("Datos bancarios guardados", datos));
    } catch (error) {
        next(error);
    }
};

export const enviar = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const solicitud = await solicitudesService.enviarSolicitud(
            req.params.id as string,
            req.usuario!.id,
            req.usuario!.rol
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
            req.body
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

export const descargarPDF = async (
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