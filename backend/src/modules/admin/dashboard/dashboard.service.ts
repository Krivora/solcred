import prisma from "@config/db";
import { EstatusSolicitud } from "../../../../generated/prisma/client";

/**
 * Panorama ejecutivo (dashboard de Inicio, solo ADMIN).
 *
 * Una sola llamada (`obtenerPanorama`) arma todo el tablero: KPIs con su
 * variación contra el periodo anterior, embudo por etapa, resolución,
 * tendencia semanal/mensual, tiempo por etapa (cuellos de botella), cartera
 * por programa, composición de la demanda, carga del equipo, alertas y
 * actividad reciente. Los montos salen de `ConceptoCredito`; los tiempos, del
 * `HistorialEstatus`.
 */

export type RangoDashboard = "7d" | "30d" | "90d" | "12m";

const DIAS: Record<RangoDashboard, number> = { "7d": 7, "30d": 30, "90d": 90, "12m": 365 };
const MS_DIA = 86_400_000;

const ACTIVOS: EstatusSolicitud[] = [
  "PENDIENTE", "EN_REVISION", "EN_CORRECCION", "EN_APROBACION", "EN_FINANCIAMIENTO",
  "EN_ASIGNACION", "EN_ANALISIS", "EN_VALIDACION", "EN_COMITE",
];
const PROMO_ACTIVOS: EstatusSolicitud[] = ["PENDIENTE", "EN_REVISION", "EN_CORRECCION", "EN_APROBACION"];
const ANALISTA_ACTIVOS: EstatusSolicitud[] = ["EN_ANALISIS", "EN_VALIDACION", "EN_COMITE"];
const DICTAMEN: EstatusSolicitud[] = ["APROBADO", "RECHAZADO"];
const FINALES: EstatusSolicitud[] = ["APROBADO", "RECHAZADO", "CANCELADO"];

/** Etapas del proceso cuyo tiempo de permanencia se reporta. */
const ETAPAS_TIEMPO: { estatus: EstatusSolicitud; label: string }[] = [
  { estatus: "EN_REVISION", label: "En revisión" },
  { estatus: "EN_APROBACION", label: "En aprobación" },
  { estatus: "EN_FINANCIAMIENTO", label: "Mesa de control" },
  { estatus: "EN_ASIGNACION", label: "Asignación" },
  { estatus: "EN_ANALISIS", label: "En análisis" },
  { estatus: "EN_VALIDACION", label: "Validación" },
  { estatus: "EN_COMITE", label: "Comité" },
];

const CAP_GESTOR = 15;
const CAP_ANALISTA = 10;
const SLA_ETAPA_DIAS = 3;
const SLA_RESOLUCION_DIAS = 25;
const DIAS_ESTANCADA = 7;
const DIAS_ANALISIS_LARGO = 10;

const ms = (d: Date) => d.getTime();

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function sumaMonto(solicitudWhere: Record<string, unknown>): Promise<number> {
  const r = await prisma.conceptoCredito.aggregate({
    _sum: { monto: true },
    where: { datosCredito: { solicitud: solicitudWhere } },
  });
  return r._sum.monto ?? 0;
}

/** Variación porcentual segura (null si no hay base). */
function variacion(actual: number, previo: number): number | null {
  if (previo === 0) return actual === 0 ? 0 : null;
  return ((actual - previo) / previo) * 100;
}

interface Bucket { inicio: Date; fin: Date; label: string }

function construirBuckets(rango: RangoDashboard): { modo: "semanal" | "mensual"; buckets: Bucket[] } {
  const n = 12;
  const ahora = new Date();
  const mensual = rango === "12m";
  const buckets: Bucket[] = [];

  if (mensual) {
    for (let i = n - 1; i >= 0; i--) {
      const inicio = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const fin = new Date(ahora.getFullYear(), ahora.getMonth() - i + 1, 1);
      buckets.push({ inicio, fin, label: inicio.toLocaleDateString("es-MX", { month: "short" }) });
    }
  } else {
    const finBase = new Date();
    finBase.setHours(23, 59, 59, 999);
    for (let i = n - 1; i >= 0; i--) {
      const fin = new Date(ms(finBase) - i * 7 * MS_DIA);
      const inicio = new Date(ms(fin) - 7 * MS_DIA);
      buckets.push({ inicio, fin, label: `S${n - i}` });
    }
  }
  return { modo: mensual ? "mensual" : "semanal", buckets };
}

function indiceBucket(buckets: Bucket[], fecha: Date): number {
  const t = ms(fecha);
  for (let i = 0; i < buckets.length; i++) {
    if (t >= ms(buckets[i].inicio) && t < ms(buckets[i].fin)) return i;
  }
  return -1;
}

const nombre = (u: { nombre: string; apellidoPaterno: string; apellidoMaterno: string }) =>
  `${u.nombre} ${u.apellidoPaterno} ${u.apellidoMaterno}`.trim();

// ─────────────────────────────────────────────────────────────────────────────
// KPIs
// ─────────────────────────────────────────────────────────────────────────────

async function contarDictamen(gte: Date, lt: Date) {
  const rows = await prisma.historialEstatus.groupBy({
    by: ["estatusNuevo"],
    where: { estatusNuevo: { in: DICTAMEN }, creadoEn: { gte, lt } },
    _count: { _all: true },
  });
  const get = (e: EstatusSolicitud) => rows.find((r) => r.estatusNuevo === e)?._count._all ?? 0;
  return { aprobadas: get("APROBADO"), rechazadas: get("RECHAZADO") };
}

async function tiempoResolucion(gte: Date, lt: Date): Promise<number | null> {
  const rows = await prisma.historialEstatus.findMany({
    where: { estatusNuevo: { in: DICTAMEN }, creadoEn: { gte, lt } },
    select: { creadoEn: true, solicitud: { select: { creadoEn: true } } },
  });
  if (rows.length === 0) return null;
  const total = rows.reduce((s, r) => s + (ms(r.creadoEn) - ms(r.solicitud.creadoEn)), 0);
  return total / rows.length / MS_DIA;
}

async function calcularKpis(desde: Date, prevDesde: Date, ahora: Date) {
  const noBorrador = { not: "BORRADOR" as EstatusSolicitud };

  const [
    activas,
    recibidas, recibidasPrev,
    montoPipeline,
    montoAprobado, montoAprobadoPrev,
    dictamen, dictamenPrev,
    resolucionDias, resolucionDiasPrev,
  ] = await Promise.all([
    prisma.solicitud.count({ where: { estatus: { in: ACTIVOS } } }),
    prisma.solicitud.count({ where: { estatus: noBorrador, creadoEn: { gte: desde } } }),
    prisma.solicitud.count({ where: { estatus: noBorrador, creadoEn: { gte: prevDesde, lt: desde } } }),
    sumaMonto({ estatus: { in: ACTIVOS } }),
    sumaMonto({ estatus: "APROBADO", creadoEn: { gte: desde } }),
    sumaMonto({ estatus: "APROBADO", creadoEn: { gte: prevDesde, lt: desde } }),
    contarDictamen(desde, ahora),
    contarDictamen(prevDesde, desde),
    tiempoResolucion(desde, ahora),
    tiempoResolucion(prevDesde, desde),
  ]);

  const tasa = (d: { aprobadas: number; rechazadas: number }) =>
    d.aprobadas + d.rechazadas === 0 ? null : (d.aprobadas / (d.aprobadas + d.rechazadas)) * 100;

  const tasaActual = tasa(dictamen);
  const tasaPrev = tasa(dictamenPrev);

  return {
    activas: { valor: activas, delta: null as number | null, deltaTipo: "neutro" as const },
    recibidas: {
      valor: recibidas,
      delta: variacion(recibidas, recibidasPrev),
      deltaTipo: "positivo" as const,
    },
    tasaAprobacion: {
      valor: tasaActual,
      delta: tasaActual !== null && tasaPrev !== null ? tasaActual - tasaPrev : null,
      deltaTipo: "positivo" as const,
    },
    tiempoResolucion: {
      valor: resolucionDias,
      delta:
        resolucionDias !== null && resolucionDiasPrev !== null
          ? resolucionDias - resolucionDiasPrev
          : null,
      deltaTipo: "negativo" as const, // menos días = mejor
    },
    montoPipeline: { valor: montoPipeline, delta: null as number | null, deltaTipo: "neutro" as const },
    montoAprobado: {
      valor: montoAprobado,
      delta: variacion(montoAprobado, montoAprobadoPrev),
      deltaTipo: "positivo" as const,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Embudo
// ─────────────────────────────────────────────────────────────────────────────

async function calcularEmbudo(desde: Date) {
  const [porEstatus, aprobadasPeriodo] = await Promise.all([
    prisma.solicitud.groupBy({
      by: ["estatus"],
      where: { estatus: { in: ACTIVOS } },
      _count: { _all: true },
    }),
    prisma.historialEstatus.count({
      where: { estatusNuevo: "APROBADO", creadoEn: { gte: desde } },
    }),
  ]);

  const c = (e: EstatusSolicitud) => porEstatus.find((r) => r.estatus === e)?._count._all ?? 0;

  const promocion = [
    { estatus: "PENDIENTE", label: "Pendiente", valor: c("PENDIENTE") },
    { estatus: "EN_REVISION", label: "En revisión", valor: c("EN_REVISION") + c("EN_CORRECCION") },
    { estatus: "EN_APROBACION", label: "En aprobación", valor: c("EN_APROBACION") },
  ];
  const financiamiento = [
    { estatus: "EN_FINANCIAMIENTO", label: "Mesa de control", valor: c("EN_FINANCIAMIENTO") },
    { estatus: "EN_ASIGNACION", label: "Asignación", valor: c("EN_ASIGNACION") },
    { estatus: "EN_ANALISIS", label: "En análisis", valor: c("EN_ANALISIS") },
    { estatus: "EN_VALIDACION", label: "Validación", valor: c("EN_VALIDACION") },
    { estatus: "EN_COMITE", label: "Comité", valor: c("EN_COMITE") },
  ];

  return { promocion, financiamiento, aprobadasPeriodo };
}

// ─────────────────────────────────────────────────────────────────────────────
// Resolución (últimos N días)
// ─────────────────────────────────────────────────────────────────────────────

async function calcularResolucion(desde: Date) {
  const rows = await prisma.historialEstatus.groupBy({
    by: ["estatusNuevo"],
    where: { estatusNuevo: { in: FINALES }, creadoEn: { gte: desde } },
    _count: { _all: true },
  });
  const get = (e: EstatusSolicitud) => rows.find((r) => r.estatusNuevo === e)?._count._all ?? 0;
  const aprobadas = get("APROBADO");
  const rechazadas = get("RECHAZADO");
  const canceladas = get("CANCELADO");
  return {
    aprobadas,
    rechazadas,
    canceladas,
    total: aprobadas + rechazadas + canceladas,
    tasaAprobacion: aprobadas + rechazadas === 0 ? null : (aprobadas / (aprobadas + rechazadas)) * 100,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tendencia + sparklines
// ─────────────────────────────────────────────────────────────────────────────

async function calcularTendencia(rango: RangoDashboard) {
  const { modo, buckets } = construirBuckets(rango);
  const origen = buckets[0].inicio;

  const [recibidasRows, resueltasRows] = await Promise.all([
    prisma.solicitud.findMany({
      where: { estatus: { not: "BORRADOR" }, creadoEn: { gte: origen } },
      select: { creadoEn: true },
    }),
    prisma.historialEstatus.findMany({
      where: { estatusNuevo: { in: FINALES }, creadoEn: { gte: origen } },
      select: { creadoEn: true, estatusNuevo: true, solicitud: { select: { creadoEn: true } } },
    }),
  ]);

  const puntos = buckets.map((b) => ({
    label: b.label,
    recibidas: 0,
    resueltas: 0,
    _aprob: 0,
    _rech: 0,
    _resolMs: 0,
  }));

  for (const r of recibidasRows) {
    const i = indiceBucket(buckets, r.creadoEn);
    if (i >= 0) puntos[i].recibidas++;
  }
  for (const r of resueltasRows) {
    const i = indiceBucket(buckets, r.creadoEn);
    if (i < 0) continue;
    puntos[i].resueltas++;
    if (r.estatusNuevo === "APROBADO") {
      puntos[i]._aprob++;
      puntos[i]._resolMs += ms(r.creadoEn) - ms(r.solicitud.creadoEn);
    } else if (r.estatusNuevo === "RECHAZADO") {
      puntos[i]._rech++;
      puntos[i]._resolMs += ms(r.creadoEn) - ms(r.solicitud.creadoEn);
    }
  }

  const ultimos8 = <T,>(arr: T[]) => arr.slice(-8);

  const sparklines = {
    recibidas: ultimos8(puntos.map((p) => p.recibidas)),
    tasaAprobacion: ultimos8(
      puntos.map((p) => (p._aprob + p._rech === 0 ? null : (p._aprob / (p._aprob + p._rech)) * 100)),
    ),
    tiempoResolucion: ultimos8(
      puntos.map((p) => (p._aprob + p._rech === 0 ? null : p._resolMs / (p._aprob + p._rech) / MS_DIA)),
    ),
  };

  return {
    modo,
    puntos: puntos.map((p) => ({ label: p.label, recibidas: p.recibidas, resueltas: p.resueltas })),
    sparklines,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tiempo por etapa (cuellos de botella)
// ─────────────────────────────────────────────────────────────────────────────

async function calcularTiempoPorEtapa() {
  const origen = new Date(Date.now() - 120 * MS_DIA);

  const rows = await prisma.historialEstatus.findMany({
    where: { creadoEn: { gte: origen } },
    select: {
      solicitudId: true,
      estatusAnterior: true,
      creadoEn: true,
      solicitud: { select: { creadoEn: true } },
    },
    orderBy: [{ solicitudId: "asc" }, { creadoEn: "asc" }],
  });

  const acum = new Map<EstatusSolicitud, { sum: number; n: number }>();
  let solicitudActual: string | null = null;
  let ultimoInstante = 0;

  for (const r of rows) {
    if (r.solicitudId !== solicitudActual) {
      solicitudActual = r.solicitudId;
      ultimoInstante = ms(r.solicitud.creadoEn);
    }
    const dur = ms(r.creadoEn) - ultimoInstante;
    if (dur > 0) {
      const prev = acum.get(r.estatusAnterior) ?? { sum: 0, n: 0 };
      prev.sum += dur;
      prev.n += 1;
      acum.set(r.estatusAnterior, prev);
    }
    ultimoInstante = ms(r.creadoEn);
  }

  const etapas = ETAPAS_TIEMPO.map(({ estatus, label }) => {
    const a = acum.get(estatus);
    return {
      estatus,
      label,
      dias: a && a.n > 0 ? a.sum / a.n / MS_DIA : 0,
      muestras: a?.n ?? 0,
    };
  });

  const peor = etapas.reduce((max, e) => (e.dias > max.dias ? e : max), etapas[0]);

  return { etapas, slaDias: SLA_ETAPA_DIAS, peorEtapa: peor.dias > SLA_ETAPA_DIAS ? peor.estatus : null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cartera por programa
// ─────────────────────────────────────────────────────────────────────────────

async function calcularCartera(desde: Date) {
  const rows = await prisma.conceptoCredito.findMany({
    where: {
      datosCredito: {
        solicitud: { creadoEn: { gte: desde }, estatus: { notIn: ["BORRADOR", "CANCELADO"] } },
      },
    },
    select: {
      monto: true,
      datosCredito: {
        select: {
          solicitud: {
            select: { estatus: true, programa: { select: { id: true, nombre: true } } },
          },
        },
      },
    },
  });

  const mapa = new Map<string, { programa: string; solicitado: number; aprobado: number }>();
  for (const r of rows) {
    const p = r.datosCredito.solicitud.programa;
    const entry = mapa.get(p.id) ?? { programa: p.nombre, solicitado: 0, aprobado: 0 };
    entry.solicitado += r.monto;
    if (r.datosCredito.solicitud.estatus === "APROBADO") entry.aprobado += r.monto;
    mapa.set(p.id, entry);
  }

  return [...mapa.values()].sort((a, b) => b.solicitado - a.solicitado).slice(0, 6);
}

// ─────────────────────────────────────────────────────────────────────────────
// Composición de la demanda
// ─────────────────────────────────────────────────────────────────────────────

async function calcularComposicion(desde: Date) {
  const where = { estatus: { not: "BORRADOR" as EstatusSolicitud }, creadoEn: { gte: desde } };

  const [sector, tamano, persona] = await Promise.all([
    prisma.solicitud.groupBy({ by: ["sector"], where, _count: { _all: true } }),
    prisma.solicitud.groupBy({ by: ["tamanoEmpresa"], where, _count: { _all: true } }),
    prisma.solicitud.groupBy({ by: ["tipoPersona"], where, _count: { _all: true } }),
  ]);

  const mapear = (rows: { _count: { _all: number } }[], key: string) =>
    rows
      .map((r) => ({ clave: (r as Record<string, unknown>)[key] ?? "SIN_DATO", valor: r._count._all }))
      .filter((r) => r.valor > 0)
      .sort((a, b) => b.valor - a.valor);

  return {
    sector: mapear(sector, "sector"),
    tamano: mapear(tamano, "tamanoEmpresa"),
    persona: mapear(persona, "tipoPersona"),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Carga del equipo
// ─────────────────────────────────────────────────────────────────────────────

async function calcularEquipo() {
  const [gestores, analistas, cargaGestores, cargaAnalistas] = await Promise.all([
    prisma.personal.findMany({
      where: { rol: "GESTOR", activo: true },
      select: { id: true, usuario: { select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true } } },
    }),
    prisma.personal.findMany({
      where: { rol: "ANALISTA", activo: true },
      select: { id: true, usuario: { select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true } } },
    }),
    prisma.asignacionSolicitud.groupBy({
      by: ["gestorId"],
      where: { activa: true, solicitud: { estatus: { in: PROMO_ACTIVOS } } },
      _count: { _all: true },
    }),
    prisma.asignacionFinanciamiento.groupBy({
      by: ["analistaId"],
      where: { activa: true, solicitud: { estatus: { in: ANALISTA_ACTIVOS } } },
      _count: { _all: true },
    }),
  ]);

  const mapaG = new Map(cargaGestores.map((c) => [c.gestorId, c._count._all]));
  const mapaA = new Map(cargaAnalistas.map((c) => [c.analistaId, c._count._all]));

  const armar = (
    personas: { id: string; usuario: { nombre: string; apellidoPaterno: string; apellidoMaterno: string } }[],
    mapa: Map<string, number>,
    capacidad: number,
  ) =>
    personas
      .map((p) => ({ nombre: nombre(p.usuario), carga: mapa.get(p.id) ?? 0, capacidad }))
      .sort((a, b) => b.carga - a.carga);

  return {
    gestores: armar(gestores, mapaG, CAP_GESTOR),
    analistas: armar(analistas, mapaA, CAP_ANALISTA),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Alertas
// ─────────────────────────────────────────────────────────────────────────────

async function calcularAlertas(ahora: Date) {
  const hace7 = new Date(ms(ahora) - DIAS_ESTANCADA * MS_DIA);
  const hace10 = new Date(ms(ahora) - DIAS_ANALISIS_LARGO * MS_DIA);
  const hace25 = new Date(ms(ahora) - SLA_RESOLUCION_DIAS * MS_DIA);

  const [estancadas, docsRechazados, analisisLargos, slaVencido] = await Promise.all([
    prisma.solicitud.count({ where: { estatus: { in: ACTIVOS }, actualizadoEn: { lt: hace7 } } }),
    prisma.documentoSolicitud.count({ where: { estatus: "RECHAZADO", activo: true } }),
    prisma.solicitud.count({ where: { estatus: "EN_ANALISIS", actualizadoEn: { lt: hace10 } } }),
    prisma.solicitud.count({ where: { estatus: { in: ACTIVOS }, creadoEn: { lt: hace25 } } }),
  ]);

  return [
    {
      id: "estancadas",
      nivel: "warning" as const,
      total: estancadas,
      titulo: `Sin avance más de ${DIAS_ESTANCADA} días`,
      detalle: "Solicitudes activas sin cambio de estatus",
    },
    {
      id: "docs-rechazados",
      nivel: "warning" as const,
      total: docsRechazados,
      titulo: "Documentos rechazados sin reemplazar",
      detalle: "El solicitante aún no sube una nueva versión",
    },
    {
      id: "analisis-largos",
      nivel: "critico" as const,
      total: analisisLargos,
      titulo: `En análisis más de ${DIAS_ANALISIS_LARGO} días`,
      detalle: "Casos que llevan demasiado tiempo con el analista",
    },
    {
      id: "sla-resolucion",
      nivel: "critico" as const,
      total: slaVencido,
      titulo: `Supera el SLA de resolución (${SLA_RESOLUCION_DIAS} días)`,
      detalle: "Solicitudes activas por encima del tiempo objetivo",
    },
  ].filter((a) => a.total > 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Actividad reciente
// ─────────────────────────────────────────────────────────────────────────────

async function calcularActividad() {
  const rows = await prisma.historialEstatus.findMany({
    orderBy: { creadoEn: "desc" },
    take: 8,
    select: {
      estatusAnterior: true,
      estatusNuevo: true,
      motivo: true,
      creadoEn: true,
      solicitud: { select: { folio: true } },
      usuario: { select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true } },
    },
  });

  return rows.map((r) => ({
    folio: r.solicitud.folio,
    estatusAnterior: r.estatusAnterior,
    estatusNuevo: r.estatusNuevo,
    motivo: r.motivo,
    usuario: nombre(r.usuario),
    fecha: r.creadoEn.toISOString(),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Orquestador
// ─────────────────────────────────────────────────────────────────────────────

export async function obtenerPanorama(rango: RangoDashboard) {
  const dias = DIAS[rango];
  const ahora = new Date();
  const desde = new Date(ms(ahora) - dias * MS_DIA);
  const prevDesde = new Date(ms(desde) - dias * MS_DIA);

  const [
    kpis, embudo, resolucion, tendencia, tiempoPorEtapa, cartera, composicion, equipo, alertas, actividad,
  ] = await Promise.all([
    calcularKpis(desde, prevDesde, ahora),
    calcularEmbudo(desde),
    calcularResolucion(desde),
    calcularTendencia(rango),
    calcularTiempoPorEtapa(),
    calcularCartera(desde),
    calcularComposicion(desde),
    calcularEquipo(),
    calcularAlertas(ahora),
    calcularActividad(),
  ]);

  return {
    rango,
    generadoEn: ahora.toISOString(),
    kpis,
    embudo,
    resolucion,
    tendencia,
    tiempoPorEtapa,
    cartera,
    composicion,
    equipo,
    alertas,
    actividad,
  };
}

export type Panorama = Awaited<ReturnType<typeof obtenerPanorama>>;
