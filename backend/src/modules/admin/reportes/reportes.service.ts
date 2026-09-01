import prisma from "@config/db";
import ExcelJS from "exceljs";
import { calcularMetricas } from "@modules/admin/_shared/solicitud-estado";
import { EstatusSolicitud } from "../../../../generated/prisma/client";
import type { FiltrosReporteDto } from "./reportes.schema";

/**
 * Reporte de solicitudes: agrupa lo que un directivo o administrador
 * necesita para sacar datos de negocio a Excel — con todos los filtros
 * posibles combinables entre sí y, dentro de cada uno, selección múltiple
 * (ej. sector Tecnología + Comercial + Agropecuario a la vez).
 *
 * El límite de filas (`MAX_FILAS_EXPORT`) y el tope de la vista previa
 * (`previsualizarReporteSchema.pageSize`) existen para que un filtro casi
 * vacío no dispare una descarga de decenas de miles de filas por error.
 */

const FINALES: EstatusSolicitud[] = ["APROBADO", "RECHAZADO", "CANCELADO"];
const MS_DIA = 86_400_000;
export const MAX_FILAS_EXPORT = 20_000;

const nombre = (u: { nombre: string; apellidoPaterno: string; apellidoMaterno: string }) =>
  `${u.nombre} ${u.apellidoPaterno} ${u.apellidoMaterno}`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// Catálogos para poblar los selectores del frontend
// ─────────────────────────────────────────────────────────────────────────────

export async function obtenerCatalogos() {
  const [programas, gestores, analistas, grupos] = await Promise.all([
    prisma.programa.findMany({
      where: { activo: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.personal.findMany({
      where: { rol: "GESTOR", activo: true },
      select: { id: true, usuario: { select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true } } },
    }),
    prisma.personal.findMany({
      where: { rol: "ANALISTA", activo: true },
      select: { id: true, usuario: { select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true } } },
    }),
    prisma.grupoGestion.findMany({
      where: { activo: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  const armar = (rows: { id: string; usuario: Parameters<typeof nombre>[0] }[]) =>
    rows.map((r) => ({ id: r.id, nombre: nombre(r.usuario) })).sort((a, b) => a.nombre.localeCompare(b.nombre));

  return { programas, gestores: armar(gestores), analistas: armar(analistas), grupos };
}

// ─────────────────────────────────────────────────────────────────────────────
// Construcción del `where` de Prisma a partir de los filtros
// ─────────────────────────────────────────────────────────────────────────────

/** IDs de solicitud cuyo monto total (suma de conceptos) cae en el rango pedido. */
async function idsPorMonto(min?: number, max?: number): Promise<string[]> {
  const [sumas, datosCredito] = await Promise.all([
    prisma.conceptoCredito.groupBy({ by: ["datosCreditoId"], _sum: { monto: true } }),
    prisma.datosCredito.findMany({ select: { id: true, solicitudId: true } }),
  ]);

  const solicitudPorDatosCredito = new Map(datosCredito.map((d) => [d.id, d.solicitudId]));
  const ids: string[] = [];

  for (const s of sumas) {
    const total = s._sum.monto ?? 0;
    if (min != null && total < min) continue;
    if (max != null && total > max) continue;
    const solicitudId = solicitudPorDatosCredito.get(s.datosCreditoId);
    if (solicitudId) ids.push(solicitudId);
  }
  return ids;
}

async function construirWhere(f: FiltrosReporteDto): Promise<Record<string, unknown>> {
  const where: Record<string, unknown> = {};

  where.estatus = f.estatus?.length ? { in: f.estatus } : { not: "BORRADOR" };
  if (f.sector?.length) where.sector = { in: f.sector };
  if (f.tamanoEmpresa?.length) where.tamanoEmpresa = { in: f.tamanoEmpresa };
  if (f.tipoPersona?.length) where.tipoPersona = { in: f.tipoPersona };
  if (f.programaId?.length) where.programaId = { in: f.programaId };

  if (f.gestorId?.length || f.grupoId?.length) {
    where.asignaciones = {
      some: {
        activa: true,
        ...(f.gestorId?.length ? { gestorId: { in: f.gestorId } } : {}),
        ...(f.grupoId?.length ? { grupoId: { in: f.grupoId } } : {}),
      },
    };
  }
  if (f.analistaId?.length) {
    where.asignacionesFinanciamiento = { some: { activa: true, analistaId: { in: f.analistaId } } };
  }

  if (f.fechaDesde || f.fechaHasta) {
    const rango: Record<string, Date> = {};
    if (f.fechaDesde) rango.gte = new Date(f.fechaDesde);
    if (f.fechaHasta) rango.lte = new Date(`${f.fechaHasta}T23:59:59.999`);
    where.creadoEn = rango;
  }

  if (f.fechaResueltaDesde || f.fechaResueltaHasta) {
    const rango: Record<string, Date> = {};
    if (f.fechaResueltaDesde) rango.gte = new Date(f.fechaResueltaDesde);
    if (f.fechaResueltaHasta) rango.lte = new Date(`${f.fechaResueltaHasta}T23:59:59.999`);
    where.historialEstatus = { some: { estatusNuevo: { in: FINALES }, creadoEn: rango } };
  }

  if (f.montoMin != null || f.montoMax != null) {
    where.id = { in: await idsPorMonto(f.montoMin, f.montoMax) };
  }

  if (f.busqueda) {
    const q = f.busqueda;
    where.OR = [
      { folio: { contains: q, mode: "insensitive" } },
      {
        datosSolicitante: {
          OR: [
            { nombre: { contains: q, mode: "insensitive" } },
            { apellidoPaterno: { contains: q, mode: "insensitive" } },
            { apellidoMaterno: { contains: q, mode: "insensitive" } },
            { rfc: { contains: q, mode: "insensitive" } },
            { curp: { contains: q, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  return where;
}

async function sumaMontoConWhere(where: Record<string, unknown>): Promise<number> {
  const r = await prisma.conceptoCredito.aggregate({
    _sum: { monto: true },
    where: { datosCredito: { solicitud: where } },
  });
  return r._sum.monto ?? 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Include + mapeo de cada fila
// ─────────────────────────────────────────────────────────────────────────────

const INCLUDE_REPORTE = {
  programa: {
    select: {
      nombre: true,
      documentosRequeridos: {
        where: { esObligatorio: true },
        select: { tipoDocumentoId: true, esObligatorio: true, aplicaA: true },
      },
    },
  },
  datosSolicitante: {
    select: {
      nombre: true, apellidoPaterno: true, apellidoMaterno: true,
      rfc: true, curp: true, telefono: true, celular: true, correo: true,
    },
  },
  datosNegocio: { select: { razonSocial: true, rfcNegocio: true, nombreNegocio: true } },
  datosCredito: {
    select: { plazoMeses: true, mesesGracia: true, conceptos: { select: { monto: true } } },
  },
  datosGarantia: { select: { garantias: { select: { valor: true } } } },
  documentos: { where: { activo: true }, select: { tipoDocumentoId: true, estatus: true, activo: true } },
  asignaciones: {
    where: { activa: true },
    take: 1,
    select: {
      gestor: { select: { usuario: { select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true } } } },
      grupo: { select: { nombre: true } },
    },
  },
  asignacionesFinanciamiento: {
    where: { activa: true },
    take: 1,
    select: {
      analista: { select: { usuario: { select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true } } } },
    },
  },
  historialEstatus: {
    orderBy: { creadoEn: "desc" as const },
    take: 1,
    select: { motivo: true, creadoEn: true },
  },
} as const;

export interface FilaReporte {
  folio: string;
  fechaSolicitud: Date;
  estatus: string;
  tipoPersona: string | null;
  sector: string | null;
  tamanoEmpresa: string | null;
  programa: string;
  nombreSolicitante: string | null;
  rfc: string | null;
  curp: string | null;
  telefono: string | null;
  correo: string | null;
  montoSolicitado: number;
  plazoMeses: number | null;
  mesesGracia: number | null;
  numGarantias: number;
  valorGarantias: number;
  gestor: string | null;
  grupo: string | null;
  analista: string | null;
  documentosRequeridos: number;
  documentosAprobados: number;
  documentosPendientes: number;
  documentosRechazados: number;
  porcentajeExpediente: number;
  actualizadoEn: Date;
  diasEnTramite: number;
  ultimoMotivo: string | null;
}

function mapearFila(s: any): FilaReporte {
  const metricas = calcularMetricas(s);
  const montoSolicitado = (s.datosCredito?.conceptos ?? []).reduce((acc: number, c: { monto: number }) => acc + c.monto, 0);
  const garantias = s.datosGarantia?.garantias ?? [];
  const valorGarantias = garantias.reduce((acc: number, g: { valor: number }) => acc + g.valor, 0);

  const asignacionGestor = s.asignaciones[0] ?? null;
  const asignacionAnalista = s.asignacionesFinanciamiento[0] ?? null;
  const ultimoHistorial = s.historialEstatus[0] ?? null;

  const finalizada = FINALES.includes(s.estatus);
  const finDeReferencia = finalizada && ultimoHistorial ? ultimoHistorial.creadoEn.getTime() : Date.now();
  const diasEnTramite = Math.max(0, Math.round((finDeReferencia - s.creadoEn.getTime()) / MS_DIA));

  return {
    folio: s.folio,
    fechaSolicitud: s.creadoEn,
    estatus: s.estatus,
    tipoPersona: s.tipoPersona,
    sector: s.sector,
    tamanoEmpresa: s.tamanoEmpresa,
    programa: s.programa.nombre,
    nombreSolicitante: s.datosSolicitante
      ? nombre(s.datosSolicitante)
      : (s.datosNegocio?.razonSocial ?? s.datosNegocio?.nombreNegocio ?? null),
    rfc: s.datosSolicitante?.rfc ?? s.datosNegocio?.rfcNegocio ?? null,
    curp: s.datosSolicitante?.curp ?? null,
    telefono: s.datosSolicitante?.telefono ?? s.datosSolicitante?.celular ?? null,
    correo: s.datosSolicitante?.correo ?? null,
    montoSolicitado,
    plazoMeses: s.datosCredito?.plazoMeses ?? null,
    mesesGracia: s.datosCredito?.mesesGracia ?? null,
    numGarantias: garantias.length,
    valorGarantias,
    gestor: asignacionGestor ? nombre(asignacionGestor.gestor.usuario) : null,
    grupo: asignacionGestor?.grupo?.nombre ?? null,
    analista: asignacionAnalista ? nombre(asignacionAnalista.analista.usuario) : null,
    documentosRequeridos: metricas.totalRequeridos,
    documentosAprobados: metricas.totalAprobados,
    documentosPendientes: metricas.totalPendientes + metricas.totalNoSubidos,
    documentosRechazados: metricas.totalRechazados,
    porcentajeExpediente: metricas.porcentajeCompletado,
    actualizadoEn: s.actualizadoEn,
    diasEnTramite,
    ultimoMotivo: ultimoHistorial?.motivo ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Resumen (para la vista previa en pantalla)
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumenReporte {
  totalSolicitudes: number;
  montoTotal: number;
  montoPromedio: number;
  porEstatus: { estatus: string; total: number }[];
}

async function calcularResumen(where: Record<string, unknown>): Promise<ResumenReporte> {
  const [total, montoTotal, porEstatus] = await Promise.all([
    prisma.solicitud.count({ where }),
    sumaMontoConWhere(where),
    prisma.solicitud.groupBy({ by: ["estatus"], where, _count: { _all: true } }),
  ]);

  return {
    totalSolicitudes: total,
    montoTotal,
    montoPromedio: total > 0 ? montoTotal / total : 0,
    porEstatus: porEstatus
      .map((r) => ({ estatus: r.estatus, total: r._count._all }))
      .sort((a, b) => b.total - a.total),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Vista previa (paginada)
// ─────────────────────────────────────────────────────────────────────────────

export async function previsualizar(filtros: FiltrosReporteDto, page: number, pageSize: number) {
  const where = await construirWhere(filtros);

  const [total, solicitudes, resumen] = await Promise.all([
    prisma.solicitud.count({ where }),
    prisma.solicitud.findMany({
      where,
      include: INCLUDE_REPORTE,
      orderBy: { creadoEn: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    calcularResumen(where),
  ]);

  return {
    data: solicitudes.map(mapearFila),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    resumen,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Exportación a Excel
// ─────────────────────────────────────────────────────────────────────────────

const COLUMNAS: { header: string; key: keyof FilaReporte; width: number; numFmt?: string }[] = [
  { header: "Folio", key: "folio", width: 16 },
  { header: "Fecha de solicitud", key: "fechaSolicitud", width: 18, numFmt: "dd/mm/yyyy" },
  { header: "Estatus", key: "estatus", width: 18 },
  { header: "Tipo de persona", key: "tipoPersona", width: 14 },
  { header: "Sector", key: "sector", width: 14 },
  { header: "Tamaño de empresa", key: "tamanoEmpresa", width: 16 },
  { header: "Programa", key: "programa", width: 22 },
  { header: "Solicitante / razón social", key: "nombreSolicitante", width: 30 },
  { header: "RFC", key: "rfc", width: 14 },
  { header: "CURP", key: "curp", width: 20 },
  { header: "Teléfono", key: "telefono", width: 14 },
  { header: "Correo", key: "correo", width: 24 },
  { header: "Monto solicitado", key: "montoSolicitado", width: 16, numFmt: '"$"#,##0.00' },
  { header: "Plazo (meses)", key: "plazoMeses", width: 12 },
  { header: "Meses de gracia", key: "mesesGracia", width: 12 },
  { header: "Garantías", key: "numGarantias", width: 10 },
  { header: "Valor garantías", key: "valorGarantias", width: 16, numFmt: '"$"#,##0.00' },
  { header: "Gestor asignado", key: "gestor", width: 22 },
  { header: "Grupo de gestión", key: "grupo", width: 20 },
  { header: "Analista asignado", key: "analista", width: 22 },
  { header: "Documentos requeridos", key: "documentosRequeridos", width: 12 },
  { header: "Documentos aprobados", key: "documentosAprobados", width: 12 },
  { header: "Documentos pendientes", key: "documentosPendientes", width: 12 },
  { header: "Documentos rechazados", key: "documentosRechazados", width: 12 },
  { header: "% Expediente", key: "porcentajeExpediente", width: 12, numFmt: '0"%"' },
  { header: "Última actualización", key: "actualizadoEn", width: 18, numFmt: "dd/mm/yyyy hh:mm" },
  { header: "Días en trámite", key: "diasEnTramite", width: 12 },
  { header: "Último motivo registrado", key: "ultimoMotivo", width: 34 },
];

const COLOR_MARCA = "FF4E5BD6"; // indigo del design system (--primary)
const ESTATUS_LABEL: Record<string, string> = {
  BORRADOR: "Borrador", PENDIENTE: "Pendiente", EN_REVISION: "En revisión",
  EN_CORRECCION: "En corrección", EN_APROBACION: "En aprobación",
  EN_FINANCIAMIENTO: "Mesa de control", EN_ASIGNACION: "Por asignar analista",
  EN_ANALISIS: "En análisis", EN_VALIDACION: "En validación", EN_COMITE: "En comité",
  APROBADO: "Aprobado", RECHAZADO: "Rechazado", CANCELADO: "Cancelado",
};

export interface ContextoExportacion {
  generadoPor: string;
  filtrosTexto: string[];
  truncado: boolean;
}

export async function generarExcelReporte(
  filas: FilaReporte[],
  resumen: ResumenReporte,
  contexto: ContextoExportacion,
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "SolCred";
  wb.created = new Date();

  // ── Hoja Resumen ──────────────────────────────────────────────────────────
  const wsR = wb.addWorksheet("Resumen");
  wsR.columns = [{ width: 30 }, { width: 46 }];

  wsR.mergeCells("A1:B1");
  wsR.getCell("A1").value = "Reporte de solicitudes de crédito — SolCred";
  wsR.getCell("A1").font = { size: 14, bold: true, color: { argb: COLOR_MARCA } };

  wsR.addRow([]);
  wsR.addRow(["Generado por", contexto.generadoPor]);
  wsR.addRow(["Fecha de generación", new Date().toLocaleString("es-MX")]);
  wsR.addRow(["Filtros aplicados", contexto.filtrosTexto.length ? contexto.filtrosTexto.join(" · ") : "Ninguno (todas las solicitudes)"]);
  wsR.addRow([]);

  const filaTitulo = wsR.addRow(["Indicadores del reporte"]);
  filaTitulo.font = { bold: true };
  wsR.addRow(["Total de solicitudes", resumen.totalSolicitudes]);
  wsR.addRow(["Monto total solicitado", resumen.montoTotal]).getCell(2).numFmt = '"$"#,##0.00';
  wsR.addRow(["Monto promedio", resumen.montoPromedio]).getCell(2).numFmt = '"$"#,##0.00';
  wsR.addRow(["Filas incluidas en el detalle", filas.length]);
  if (contexto.truncado) {
    const aviso = wsR.addRow([`⚠ El reporte excede ${MAX_FILAS_EXPORT.toLocaleString("es-MX")} filas: se truncó. Acota los filtros para verlo completo.`]);
    aviso.font = { italic: true, color: { argb: "FFB5790A" } };
  }
  wsR.addRow([]);

  const filaDesglose = wsR.addRow(["Desglose por estatus"]);
  filaDesglose.font = { bold: true };
  for (const e of resumen.porEstatus) {
    wsR.addRow([ESTATUS_LABEL[e.estatus] ?? e.estatus, e.total]);
  }

  // ── Hoja Detalle ──────────────────────────────────────────────────────────
  const wsD = wb.addWorksheet("Detalle");
  wsD.columns = COLUMNAS.map((c) => ({ header: c.header, key: c.key, width: c.width }));

  const headerRow = wsD.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_MARCA } };
  headerRow.alignment = { vertical: "middle" };
  headerRow.height = 20;

  for (const fila of filas) {
    const datos: Record<string, unknown> = {
      ...fila,
      estatus: ESTATUS_LABEL[fila.estatus] ?? fila.estatus,
    };
    const row = wsD.addRow(datos);
    for (const c of COLUMNAS) {
      if (c.numFmt) row.getCell(c.key).numFmt = c.numFmt;
    }
  }

  wsD.autoFilter = { from: "A1", to: `${wsD.getColumn(COLUMNAS.length).letter}1` };
  wsD.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function obtenerFilasParaExportar(
  filtros: FiltrosReporteDto,
): Promise<{ filas: FilaReporte[]; resumen: ResumenReporte; truncado: boolean }> {
  const where = await construirWhere(filtros);

  const [solicitudes, resumen] = await Promise.all([
    prisma.solicitud.findMany({
      where,
      include: INCLUDE_REPORTE,
      orderBy: { creadoEn: "desc" },
      take: MAX_FILAS_EXPORT + 1,
    }),
    calcularResumen(where),
  ]);

  const truncado = solicitudes.length > MAX_FILAS_EXPORT;
  const filas = solicitudes.slice(0, MAX_FILAS_EXPORT).map(mapearFila);

  return { filas, resumen, truncado };
}

/** Texto legible de los filtros aplicados, para la hoja de Resumen y el log de auditoría. */
export function describirFiltros(f: FiltrosReporteDto): string[] {
  const partes: string[] = [];
  if (f.estatus?.length) partes.push(`Estatus: ${f.estatus.map((e) => ESTATUS_LABEL[e] ?? e).join(", ")}`);
  if (f.sector?.length) partes.push(`Sector: ${f.sector.join(", ")}`);
  if (f.tamanoEmpresa?.length) partes.push(`Tamaño: ${f.tamanoEmpresa.join(", ")}`);
  if (f.tipoPersona?.length) partes.push(`Tipo de persona: ${f.tipoPersona.join(", ")}`);
  if (f.programaId?.length) partes.push(`Programas: ${f.programaId.length}`);
  if (f.gestorId?.length) partes.push(`Gestores: ${f.gestorId.length}`);
  if (f.analistaId?.length) partes.push(`Analistas: ${f.analistaId.length}`);
  if (f.grupoId?.length) partes.push(`Grupos: ${f.grupoId.length}`);
  if (f.fechaDesde || f.fechaHasta) partes.push(`Solicitadas: ${f.fechaDesde ?? "…"} a ${f.fechaHasta ?? "…"}`);
  if (f.fechaResueltaDesde || f.fechaResueltaHasta) partes.push(`Resueltas: ${f.fechaResueltaDesde ?? "…"} a ${f.fechaResueltaHasta ?? "…"}`);
  if (f.montoMin != null || f.montoMax != null) partes.push(`Monto: ${f.montoMin ?? 0} a ${f.montoMax ?? "∞"}`);
  if (f.busqueda) partes.push(`Búsqueda: "${f.busqueda}"`);
  return partes;
}
