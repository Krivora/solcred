import prisma from "@config/db";
import ExcelJS from "exceljs";
import { FiltrosLogDto } from "./logs.schema";
import { AppError } from "@middlewares/error.middleware";
import { paginado } from "@utils/pagination";
import { Prisma } from "../../../../generated/prisma/client";

/** Tope de filas de una exportación: evita que un filtro casi vacío dispare
 * una descarga de decenas de miles de filas por error (mismo criterio que
 * `admin/reportes`). */
export const MAX_FILAS_EXPORT_LOGS = 20_000;

const construirWhereLogs = (
  filtros: Pick<FiltrosLogDto, "accion" | "modulo" | "usuarioId" | "fechaInicio" | "fechaFin">
): Prisma.LogAuditoriaWhereInput => {
  const { accion, modulo, usuarioId, fechaInicio, fechaFin } = filtros;

  return {
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
};

const INCLUDE_USUARIO_LOG = {
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
} satisfies Prisma.LogAuditoriaInclude;

export const listarLogs = async (filtros: FiltrosLogDto) => {
  const { page, pageSize } = filtros;
  const where = construirWhereLogs(filtros);

  const total = await prisma.logAuditoria.count({ where });

  const logs = await prisma.logAuditoria.findMany({
    where,
    orderBy: { creadoEn: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: INCLUDE_USUARIO_LOG,
  });

  return paginado(logs, page, pageSize, total);
};

export const obtenerLogPorId = async (id: string) => {
  const log = await prisma.logAuditoria.findUnique({
    where: { id },
    include: INCLUDE_USUARIO_LOG,
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

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTAR A EXCEL
//
// El log de auditoría es en sí mismo un registro con datos personales (correo,
// IP) en bloque — misma razón por la que `admin/reportes` topa y limita su
// exportación. Aquí se replica el mismo criterio.
// ─────────────────────────────────────────────────────────────────────────────

const nombreUsuario = (u: { nombre: string; apellidoPaterno: string } | null | undefined) =>
  u ? `${u.nombre} ${u.apellidoPaterno}`.trim() : "";

export const exportarLogs = async (
  filtros: Pick<FiltrosLogDto, "accion" | "modulo" | "usuarioId" | "fechaInicio" | "fechaFin">
): Promise<{ buffer: Buffer; totalFilas: number; truncado: boolean }> => {
  const where = construirWhereLogs(filtros);

  const logs = await prisma.logAuditoria.findMany({
    where,
    orderBy: { creadoEn: "desc" },
    take: MAX_FILAS_EXPORT_LOGS + 1,
    include: INCLUDE_USUARIO_LOG,
  });

  const truncado = logs.length > MAX_FILAS_EXPORT_LOGS;
  const filas = truncado ? logs.slice(0, MAX_FILAS_EXPORT_LOGS) : logs;

  const wb = new ExcelJS.Workbook();
  wb.creator = "SolCred";
  wb.created = new Date();

  const ws = wb.addWorksheet("Log de auditoría");
  ws.columns = [
    { header: "Fecha", key: "fecha", width: 20 },
    { header: "Acción", key: "accion", width: 14 },
    { header: "Módulo", key: "modulo", width: 14 },
    { header: "Descripción", key: "descripcion", width: 50 },
    { header: "Usuario", key: "usuario", width: 26 },
    { header: "Correo", key: "correo", width: 28 },
    { header: "Rol", key: "rol", width: 16 },
    { header: "ID de entidad", key: "entidadId", width: 24 },
    { header: "IP", key: "ip", width: 16 },
    { header: "User-Agent", key: "userAgent", width: 40 },
  ];

  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } };
  headerRow.alignment = { vertical: "middle" };
  headerRow.height = 20;

  for (const log of filas) {
    ws.addRow({
      fecha: log.creadoEn.toLocaleString("es-MX"),
      accion: log.accion,
      modulo: log.modulo,
      descripcion: log.descripcion,
      usuario: nombreUsuario(log.usuario) || (log.usuarioId ?? "—"),
      correo: log.usuario?.correo ?? "",
      rol: log.usuario?.personal?.rol ?? (log.usuario ? "CLIENTE" : ""),
      entidadId: log.entidadId ?? "",
      ip: log.ip ?? "",
      userAgent: log.userAgent ?? "",
    });
  }

  ws.autoFilter = { from: "A1", to: `${ws.getColumn(10).letter}1` };
  ws.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await wb.xlsx.writeBuffer();
  return { buffer: Buffer.from(buffer), totalFilas: filas.length, truncado };
};
