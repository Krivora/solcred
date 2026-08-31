import { Response, NextFunction } from "express";
import { RequestAutenticado } from "@middlewares/auth.middleware";
import { registrarLog } from "@utils/audit";
import { AccionLog, ModuloLog } from "../../../../generated/prisma/client";
import { ok } from "@utils/response";
import { AppError } from "@middlewares/error.middleware";
import { parsearPaginacionQuery } from "@utils/pagination";
import * as financiamientoService from "./financiamiento.service";
import type { FiltrosFinanciamiento } from "./financiamiento.service";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function parseFiltros(req: RequestAutenticado): FiltrosFinanciamiento {
  const { tipoPersona, sector, tamanoEmpresa, programaId, fechaDesde, fechaHasta, busqueda } =
    req.query;

  return {
    ...parsearPaginacionQuery(req.query),
    tipoPersona: tipoPersona as string | undefined,
    sector: sector as string | undefined,
    tamanoEmpresa: tamanoEmpresa as string | undefined,
    programaId: programaId as string | undefined,
    fechaDesde: fechaDesde as string | undefined,
    fechaHasta: fechaHasta as string | undefined,
    busqueda: busqueda as string | undefined,
  };
}

const registrarConsulta = (req: RequestAutenticado, descripcion: string) =>
  registrarLog({
    accion: AccionLog.CONSULTAR,
    modulo: ModuloLog.SOLICITUDES,
    descripcion,
    usuarioId: req.usuario!.id,
    req,
  });

// ─────────────────────────────────────────────────────────────────────────────
// Listados
// ─────────────────────────────────────────────────────────────────────────────

export const listarMesaControl = async (req: RequestAutenticado, res: Response, next: NextFunction) => {
  try {
    const resultado = await financiamientoService.listarPorEtapa("EN_FINANCIAMIENTO", parseFiltros(req));
    await registrarConsulta(req, "Mesa de Control de financiamiento consultada");
    res.status(200).json(ok("Solicitudes en Mesa de Control obtenidas", resultado));
  } catch (error) {
    next(error);
  }
};

export const listarAsignacion = async (req: RequestAutenticado, res: Response, next: NextFunction) => {
  try {
    const resultado = await financiamientoService.listarPorEtapa("EN_ASIGNACION", parseFiltros(req));
    await registrarConsulta(req, "Cola de asignación de financiamiento consultada");
    res.status(200).json(ok("Solicitudes por asignar obtenidas", resultado));
  } catch (error) {
    next(error);
  }
};

export const listarMisCasos = async (req: RequestAutenticado, res: Response, next: NextFunction) => {
  try {
    const { personalId } = req.usuario!;
    if (!personalId) {
      throw new AppError("Este usuario no tiene un perfil de Personal asociado", 403);
    }
    const resultado = await financiamientoService.listarPorEtapa("EN_ANALISIS", {
      ...parseFiltros(req),
      analistaId: personalId,
    });
    await registrarConsulta(req, "Analista consultó sus casos de financiamiento");
    res.status(200).json(ok("Casos asignados obtenidos", resultado));
  } catch (error) {
    next(error);
  }
};

export const listarValidacion = async (req: RequestAutenticado, res: Response, next: NextFunction) => {
  try {
    const resultado = await financiamientoService.listarPorEtapa("EN_VALIDACION", parseFiltros(req));
    await registrarConsulta(req, "Cola de validación de financiamiento consultada");
    res.status(200).json(ok("Solicitudes en validación obtenidas", resultado));
  } catch (error) {
    next(error);
  }
};

export const listarComite = async (req: RequestAutenticado, res: Response, next: NextFunction) => {
  try {
    const resultado = await financiamientoService.listarPorEtapa("EN_COMITE", parseFiltros(req));
    await registrarConsulta(req, "Comité de crédito consultado");
    res.status(200).json(ok("Solicitudes en comité obtenidas", resultado));
  } catch (error) {
    next(error);
  }
};

export const listarAnalistas = async (req: RequestAutenticado, res: Response, next: NextFunction) => {
  try {
    const analistas = await financiamientoService.analistasDisponibles();
    res.status(200).json(ok("Analistas disponibles obtenidos", analistas));
  } catch (error) {
    next(error);
  }
};

export const stats = async (req: RequestAutenticado, res: Response, next: NextFunction) => {
  try {
    const data = await financiamientoService.stats();
    res.status(200).json(ok("Estadísticas de financiamiento obtenidas", data));
  } catch (error) {
    next(error);
  }
};

export const obtenerPorId = async (req: RequestAutenticado, res: Response, next: NextFunction) => {
  try {
    const solicitud = await financiamientoService.obtenerSolicitudPorId(
      req.params.id as string,
      req.usuario!.id,
      req.usuario!.rol
    );
    await registrarConsulta(req, `Solicitud de financiamiento consultada: ${solicitud.id}`);
    res.status(200).json(ok("Solicitud obtenida", solicitud));
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Transiciones
// ─────────────────────────────────────────────────────────────────────────────

function accion(
  ejecutar: (id: string, motivo: string | undefined, usuarioId: string) => Promise<{ id: string }>,
  mensaje: string,
  estatusMeta: string
) {
  return async (req: RequestAutenticado, res: Response, next: NextFunction) => {
    try {
      const solicitud = await ejecutar(req.params.id as string, req.body.motivo, req.usuario!.id);
      await registrarLog({
        accion: AccionLog.ACTUALIZAR,
        modulo: ModuloLog.SOLICITUDES,
        descripcion: `${mensaje}: ${req.params.id}`,
        usuarioId: req.usuario!.id,
        entidadId: solicitud.id,
        req,
        metadata: { estatus: estatusMeta, motivo: req.body.motivo },
      });
      res.status(200).json(ok(mensaje, solicitud));
    } catch (error) {
      next(error);
    }
  };
}

export const regresarAAprobacion = accion(
  financiamientoService.regresarAAprobacion,
  "Solicitud regresada al área de aprobación",
  "EN_APROBACION"
);
export const pasarAAsignacion = accion(
  financiamientoService.pasarAAsignacion,
  "Solicitud pasada a asignación de analista",
  "EN_ASIGNACION"
);
export const enviarAValidacion = accion(
  financiamientoService.enviarAValidacion,
  "Análisis enviado a validación",
  "EN_VALIDACION"
);
export const regresarAAnalista = accion(
  financiamientoService.regresarAAnalista,
  "Solicitud regresada al analista",
  "EN_ANALISIS"
);
export const enviarAComite = accion(
  financiamientoService.enviarAComite,
  "Solicitud enviada al comité de crédito",
  "EN_COMITE"
);
export const regresarAValidacion = accion(
  financiamientoService.regresarAValidacion,
  "Solicitud regresada a validación",
  "EN_VALIDACION"
);
export const aprobar = accion(
  financiamientoService.aprobar,
  "Solicitud aprobada por el comité de crédito",
  "APROBADO"
);

export const asignarAnalista = async (req: RequestAutenticado, res: Response, next: NextFunction) => {
  try {
    const solicitud = await financiamientoService.asignarAnalista(
      req.params.id as string,
      req.body.analistaId,
      req.usuario!.personalId ?? null,
      req.body.motivo,
      req.usuario!.id
    );
    await registrarLog({
      accion: AccionLog.ACTUALIZAR,
      modulo: ModuloLog.SOLICITUDES,
      descripcion: `Analista asignado a solicitud de financiamiento: ${req.params.id}`,
      usuarioId: req.usuario!.id,
      entidadId: solicitud.id,
      req,
      metadata: { estatus: "EN_ANALISIS", analistaId: req.body.analistaId },
    });
    res.status(200).json(ok("Analista asignado", solicitud));
  } catch (error) {
    next(error);
  }
};
