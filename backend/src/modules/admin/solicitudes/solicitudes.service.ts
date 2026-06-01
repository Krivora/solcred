import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import {
  CambiarEstatusDto,
} from "./solicitudes.schema";

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
  asignacion?:string
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
  
  
  if (estatus) where.estatus = estatus;
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
