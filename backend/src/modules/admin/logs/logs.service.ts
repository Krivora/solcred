import prisma from "@config/db";
import { FiltrosLogDto } from "./logs.schema";
import { AppError } from "@middlewares/error.middleware";
export const listarLogs = async (filtros: FiltrosLogDto) => {
  const { accion, modulo, usuarioId, fechaInicio, fechaFin, pagina, limite } =
    filtros;

  const where = {
    ...(accion && { accion }),
    ...(modulo && { modulo }),
    ...(usuarioId && { usuarioId }),
    ...(fechaInicio || fechaFin
      ? {
          creadoEn: {
            ...(fechaInicio && { gte: new Date(fechaInicio) }),
            ...(fechaFin && { lte: new Date(fechaFin) }),
          },
        }
      : {}),
  };

  const total = await prisma.logAuditoria.count({ where });

  const logs = await prisma.logAuditoria.findMany({
    where,
    orderBy: { creadoEn: "desc" },
    skip: (pagina - 1) * limite,
    take: limite,
    include: {
      usuario: {
        select: {
          id: true,
          correo: true,
          nombre: true,
          apellidoPaterno: true,
          // ── FIX: rol ya no vive en Usuario, se anida vía Personal ──────
          personal: { select: { rol: true } },
        },
      },
    },
  });

  return {
    logs,
    total,
    pagina,
    limite,
    totalPaginas: Math.ceil(total / limite),
  };
};

export const obtenerLogPorId = async (id: string) => {
  const log = await prisma.logAuditoria.findUnique({
    where: { id },
    include: {
      usuario: {
        select: {
          id: true,
          correo: true,
          nombre: true,
          apellidoPaterno: true,
          personal: { select: { rol: true } },
        },
      },
    },
  });

  if (!log) throw new AppError("Log no encontrado", 404); // ── FIX ──

  return log;
};

export const obtenerResumen = async () => {
  const [totalAcciones, totalErrores, accionesPorModulo, accionesPorDia] =
    await Promise.all([
      prisma.logAuditoria.count(),
      prisma.logAuditoria.count({ where: { accion: "ERROR" } }),
      prisma.logAuditoria.groupBy({
        by: ["modulo"],
        _count: { modulo: true },
        orderBy: { _count: { modulo: "desc" } },
      }),
      prisma.logAuditoria.groupBy({
        by: ["accion"],
        _count: { accion: true },
        orderBy: { _count: { accion: "desc" } },
      }),
    ]);

  return {
    totalAcciones,
    totalErrores,
    accionesPorModulo,
    accionesPorDia,
  };
};