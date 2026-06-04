import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import {
  CambiarEstatusDto,
  DevolverAlSolicitanteDto,
  EnviarAFinanciamientoDto,
  EnviarAAprobacionDto,
  CancelarDto,
  RechazarDto,
} from "./promocion.schema";
import { EstatusSolicitud } from "../../../../generated/prisma/client";
const ESTATUS_FINALES: EstatusSolicitud[] = ["APROBADO", "RECHAZADO", "CANCELADO"];

interface FiltrosPromocion {
  page: number
  limit: number
  estatus?: string
  tipoPersona?: string
  sector?: string
  tamanoEmpresa?: string
  programaId?: string
  fechaDesde?: string
  fechaHasta?: string
  busqueda?: string
  asignacion?: string
}
interface FiltrosMisCasos {
  gestorId: string
  page: number
  limit: number
  estatus?: string
  tipoPersona?: string
  sector?: string
  tamanoEmpresa?: string
  programaId?: string
  fechaDesde?: string
  fechaHasta?: string
  busqueda?: string
}
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
  documentos: {
    include: { tipoDocumento: true },
  },
};

const registrarHistorial = async (
  tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
  solicitudId: string,
  estatusAnterior: EstatusSolicitud,
  estatusNuevo: EstatusSolicitud,
  usuarioId: string,
  motivo?: string
) => {
  await tx.historialEstatus.create({
    data: {
      solicitudId,
      estatusAnterior,
      estatusNuevo,
      motivo,
      usuarioId,
    },
  })
}
const validarTransicion = async (solicitudId: string, estatusPermitidos?: EstatusSolicitud[]) => {
  const solicitud = await prisma.solicitud.findUnique({ where: { id: solicitudId } });
  if (!solicitud) throw new AppError("Solicitud no encontrada", 404);
  if (ESTATUS_FINALES.includes(solicitud.estatus)) {
    throw new AppError(`La solicitud ya tiene un estatus final: ${solicitud.estatus}`, 400);
  }
  if (estatusPermitidos && !estatusPermitidos.includes(solicitud.estatus)) {
    throw new AppError(
      `Acción no permitida. Estado actual: ${solicitud.estatus}. Se requiere: ${estatusPermitidos.join(", ")}`,
      422
    );
  }
  return solicitud;
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

export const listarPromocion = async (filtros: FiltrosPromocion) => {
  const {
    page,
    limit,
    estatus,
    tipoPersona,
    sector,
    tamanoEmpresa,
    programaId,
    fechaDesde,
    fechaHasta,
    busqueda,
    asignacion
  } = filtros;

  const skip = (page - 1) * limit;
  const where: any = {};
    const ESTATUS_PRICIPAL_PROMOCION: EstatusSolicitud[] = ['EN_REVISION', 'EN_CORRECION', 'PENDIENTE'];
  if (estatus) {
    const estatusArray = estatus.split(',').map(s => s.trim()) as EstatusSolicitud[];
    // Solo permite estatus válidos para mis casos
    const estatusFiltrados = estatusArray.filter(e => ESTATUS_PRICIPAL_PROMOCION.includes(e));
    const estatusAplicar = estatusFiltrados.length > 0 ? estatusFiltrados : ESTATUS_PRICIPAL_PROMOCION;
    where.estatus = estatusAplicar.length === 1
      ? estatusAplicar[0]
      : { in: estatusAplicar };
  } else {
    // Sin filtro explícito, siempre aplica el default
    where.estatus = { in: ESTATUS_PRICIPAL_PROMOCION };
  }
  if (tipoPersona) where.tipoPersona = tipoPersona;
  if (sector) where.sector = sector;
  if (tamanoEmpresa) where.tamanoEmpresa = tamanoEmpresa;
  if (programaId) where.programaId = programaId;

  if (fechaDesde || fechaHasta) {
    where.creadoEn = {};
    if (fechaDesde) where.creadoEn.gte = new Date(fechaDesde);
    if (fechaHasta) where.creadoEn.lte = new Date(fechaHasta + "T23:59:59");
  }

  if (busqueda) {
    where.OR = [
      {
        datosSolicitante: {
          OR: [
            { nombre: { contains: busqueda, mode: "insensitive" } },
            { apellidoPaterno: { contains: busqueda, mode: "insensitive" } },
            { rfc: { contains: busqueda, mode: "insensitive" } },
          ],
        },
      },
    ];
  }
  if (asignacion === 'asignados') {
    where.asignacion = { activa: true }
  }
  if (asignacion === 'sin_asignar') {
    where.asignacion = { is: null }
  }

  const [solicitudes, total] = await Promise.all([
    prisma.solicitud.findMany({
      where,
      skip,
      take: limit,
      orderBy: { creadoEn: "desc" },
      include: {
        programa: { select: { id: true, nombre: true } },
        datosSolicitante: {
          select: {
            id: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            rfc: true,
            correo: true,
            celular: true,
          },
        },
        asignacion: {
          where: { activa: true },
          select: {
            fechaAsignacion: true,
            gestor: {
              select: {
                id: true,
                nombre: true,
                apellidoPaterno: true,
                apellidoMaterno: true,
              }
            }
          }
        },
      },
    }),
    prisma.solicitud.count({ where }),
  ]);

  return {
    data: solicitudes,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const statsPromocion = async () => {
  const [total, borrador, pendiente, enRevision, aprobado, rechazado] =
    await Promise.all([
      prisma.solicitud.count(),
      prisma.solicitud.count({ where: { estatus: "BORRADOR" } }),
      prisma.solicitud.count({ where: { estatus: "PENDIENTE" } }),
      prisma.solicitud.count({ where: { estatus: "EN_REVISION" } }),
      prisma.solicitud.count({ where: { estatus: "APROBADO" } }),
      prisma.solicitud.count({ where: { estatus: "RECHAZADO" } }),
    ]);

  return { total, borrador, pendiente, enRevision, aprobado, rechazado };
};

export const listarMisCasos = async (filtros: FiltrosMisCasos) => {
  const {
    gestorId,
    page,
    limit,
    estatus,
    tipoPersona,
    sector,
    tamanoEmpresa,
    programaId,
    fechaDesde,
    fechaHasta,
    busqueda,
  } = filtros;

  const skip = (page - 1) * limit;
  const ESTATUS_MIS_CASOS: EstatusSolicitud[] = ['EN_REVISION', 'EN_CORRECION'];
  // Siempre filtra por el gestor autenticado con asignación activa
  const where: any = {
    asignacion: {
      gestorId,
      activa: true,
    },
  };

  if (estatus) {
    const estatusArray = estatus.split(',').map(s => s.trim()) as EstatusSolicitud[];
    // Solo permite estatus válidos para mis casos
    const estatusFiltrados = estatusArray.filter(e => ESTATUS_MIS_CASOS.includes(e));
    const estatusAplicar = estatusFiltrados.length > 0 ? estatusFiltrados : ESTATUS_MIS_CASOS;
    where.estatus = estatusAplicar.length === 1
      ? estatusAplicar[0]
      : { in: estatusAplicar };
  } else {
    // Sin filtro explícito, siempre aplica el default
    where.estatus = { in: ESTATUS_MIS_CASOS };
  }

  if (tipoPersona) where.tipoPersona = tipoPersona;
  if (sector) where.sector = sector;
  if (tamanoEmpresa) where.tamanoEmpresa = tamanoEmpresa;
  if (programaId) where.programaId = programaId;

  if (fechaDesde || fechaHasta) {
    where.creadoEn = {};
    if (fechaDesde) where.creadoEn.gte = new Date(fechaDesde);
    if (fechaHasta) where.creadoEn.lte = new Date(fechaHasta + "T23:59:59");
  }

  if (busqueda) {
    where.OR = [
      {
        datosSolicitante: {
          OR: [
            { nombre: { contains: busqueda, mode: "insensitive" } },
            { apellidoPaterno: { contains: busqueda, mode: "insensitive" } },
            { rfc: { contains: busqueda, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const [solicitudes, total] = await Promise.all([
    prisma.solicitud.findMany({
      where,
      skip,
      take: limit,
      orderBy: { creadoEn: "desc" },
      include: {
        programa: { select: { id: true, nombre: true } },
        datosSolicitante: {
          select: {
            id: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            rfc: true,
            correo: true,
            celular: true,
          },
        },
        asignacion: {
          where: { activa: true },
          select: {
            fechaAsignacion: true,
            gestor: {
              select: {
                id: true,
                nombre: true,
                apellidoPaterno: true,
                apellidoMaterno: true,
              },
            },
          },
        },
      },
    }),
    prisma.solicitud.count({ where }),
  ]);

  return {
    data: solicitudes,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const listarAprobacion = async (filtros: Omit<FiltrosPromocion, 'estatus' | 'asignacion'>) => {
  const { page, limit, tipoPersona, sector, tamanoEmpresa, programaId, fechaDesde, fechaHasta, busqueda } = filtros;
  const skip = (page - 1) * limit;

  const where: any = {
    estatus: { in: ["EN_APROBACION"] },
  };

  if (tipoPersona) where.tipoPersona = tipoPersona;
  if (sector) where.sector = sector;
  if (tamanoEmpresa) where.tamanoEmpresa = tamanoEmpresa;
  if (programaId) where.programaId = programaId;

  if (fechaDesde || fechaHasta) {
    where.creadoEn = {};
    if (fechaDesde) where.creadoEn.gte = new Date(fechaDesde);
    if (fechaHasta) where.creadoEn.lte = new Date(fechaHasta + "T23:59:59");
  }

  if (busqueda) {
    where.OR = [{
      datosSolicitante: {
        OR: [
          { nombre: { contains: busqueda, mode: "insensitive" } },
          { apellidoPaterno: { contains: busqueda, mode: "insensitive" } },
          { rfc: { contains: busqueda, mode: "insensitive" } },
        ],
      },
    }];
  }

  const [solicitudes, total] = await Promise.all([
    prisma.solicitud.findMany({
      where,
      skip,
      take: limit,
      orderBy: { creadoEn: "desc" },
      include: {
        programa: { select: { id: true, nombre: true } },
        datosSolicitante: {
          select: {
            id: true, nombre: true, apellidoPaterno: true,
            apellidoMaterno: true, rfc: true, correo: true, celular: true,
          },
        },
        asignacion: {
          where: { activa: true },
          select: {
            fechaAsignacion: true,
            gestor: {
              select: { id: true, nombre: true, apellidoPaterno: true, apellidoMaterno: true },
            },
          },
        },
      },
    }),
    prisma.solicitud.count({ where }),
  ]);

  return {
    data: solicitudes,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
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

export const devolverAlSolicitante = async (
  solicitudId: string,
  dto: DevolverAlSolicitanteDto,
  usuarioId: string
) => {
  const solicitud = await validarTransicion(solicitudId, ['PENDIENTE', 'EN_REVISION', 'EN_APROBACION'])

  return prisma.$transaction(async (tx) => {
    const actualizada = await tx.solicitud.update({
      where: { id: solicitudId },
      data: { estatus: 'EN_CORRECION' },
      include: incluyeTodo,
    })

    await registrarHistorial(tx, solicitudId, solicitud.estatus, 'EN_CORRECION', usuarioId, dto.motivo)

    return actualizada
  })
}

export const regresarAlPromotor = async (
  solicitudId: string,
  dto: DevolverAlSolicitanteDto,
  usuarioId: string
) => {
  const solicitud = await validarTransicion(solicitudId, ['EN_REVISION'])

  return prisma.$transaction(async (tx) => {
    const actualizada = await tx.solicitud.update({
      where: { id: solicitudId },
      data: { estatus: 'PENDIENTE' },
      include: incluyeTodo,
    })

    await registrarHistorial(tx, solicitudId, solicitud.estatus, 'PENDIENTE', usuarioId, dto.motivo)

    return actualizada
  })
}

export const enviarAAprobacion = async (
  solicitudId: string,
  dto: EnviarAAprobacionDto,
  usuarioId: string
) => {
  const solicitud = await validarTransicion(solicitudId, ['EN_REVISION'])

  return prisma.$transaction(async (tx) => {
    const actualizada = await tx.solicitud.update({
      where: { id: solicitudId },
      data: { estatus: 'EN_APROBACION' },
      include: incluyeTodo,
    })

    await registrarHistorial(tx, solicitudId, solicitud.estatus, 'EN_APROBACION', usuarioId, dto.motivo)

    return actualizada
  })
}

export const enviarAFinanciamiento = async (
  solicitudId: string,
  dto: EnviarAFinanciamientoDto,
  usuarioId: string
) => {
  const solicitud = await validarTransicion(solicitudId, ['EN_APROBACION'])

  return prisma.$transaction(async (tx) => {
    const actualizada = await tx.solicitud.update({
      where: { id: solicitudId },
      data: { estatus: 'EN_FINANCIAMIENTO' },
      include: incluyeTodo,
    })

    await registrarHistorial(tx, solicitudId, solicitud.estatus, 'EN_FINANCIAMIENTO', usuarioId, dto.motivo)

    return actualizada
  })
}

export const cancelar = async (
  solicitudId: string,
  dto: CancelarDto,
  usuarioId: string
) => {
  const solicitud = await validarTransicion(solicitudId, ['PENDIENTE', 'EN_REVISION', 'EN_APROBACION'])

  return prisma.$transaction(async (tx) => {
    const actualizada = await tx.solicitud.update({
      where: { id: solicitudId },
      data: { estatus: 'CANCELADO' },
      include: incluyeTodo,
    })

    await registrarHistorial(tx, solicitudId, solicitud.estatus, 'CANCELADO', usuarioId, dto.motivo)

    return actualizada
  })
}

export const rechazar = async (
  solicitudId: string,
  dto: RechazarDto,
  usuarioId: string
) => {
  const solicitud = await validarTransicion(solicitudId, ['EN_REVISION', 'EN_APROBACION', 'EN_FINANCIAMIENTO'])

  return prisma.$transaction(async (tx) => {
    const actualizada = await tx.solicitud.update({
      where: { id: solicitudId },
      data: { estatus: 'RECHAZADO' },
      include: incluyeTodo,
    })

    await registrarHistorial(tx, solicitudId, solicitud.estatus, 'RECHAZADO', usuarioId, dto.motivo)

    return actualizada
  })
}