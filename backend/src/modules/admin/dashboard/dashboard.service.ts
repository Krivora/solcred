import prisma from "@config/db";
import { EstatusSolicitud } from "../../../../generated/prisma/client";
import { ORDEN_PASOS_FORMULARIO, LABEL_PASO_FORMULARIO } from "../../../shared/paso-formulario";
import {
  SLA_RESOLUCION_DIAS,
  DIAS_ESTANCADA,
  DIAS_ANALISIS_LARGO,
  DIAS_DOC_PENDIENTE,
  diasUmbral,
  diasSinAvance,
  estadoEstancamiento,
} from "../../../shared/sla-solicitudes";
import { notificarSolicitudEstancada } from "@modules/notificaciones/notificaciones.service";

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
// Embudo de conversión del formulario (dónde abandonan el llenado)
//
// `ultimoPasoVisto` guarda el punto más lejano alcanzado por cada BORRADOR
// (nunca retrocede — ver `clientes/solicitudes.service.ts`). El embudo es
// acumulativo: "llegaron al menos a este paso" = enviadas del periodo + la
// suma de los borradores cuyo último paso visto es este o uno posterior.
// ─────────────────────────────────────────────────────────────────────────────

async function calcularEmbudoFormulario(desde: Date) {
  const [porPaso, totalEnviaron] = await Promise.all([
    prisma.solicitud.groupBy({
      by: ["ultimoPasoVisto"],
      where: { estatus: "BORRADOR", creadoEn: { gte: desde } },
      _count: { _all: true },
    }),
    prisma.solicitud.count({
      where: { estatus: { not: "BORRADOR" }, creadoEn: { gte: desde } },
    }),
  ]);

  const conteoPorPaso = new Map(
    porPaso.map((r) => [r.ultimoPasoVisto, r._count._all])
  );
  // Borradores creados pero aún sin el primer PATCH de paso-visto (carrera
  // entre crear la solicitud y que el front dispare el primer paso) — la fila
  // existe, así que como mínimo llegaron al primer paso.
  const sinInstrumentar = conteoPorPaso.get(null) ?? 0;

  const pasos = ORDEN_PASOS_FORMULARIO.map((paso) => ({
    paso,
    label: LABEL_PASO_FORMULARIO[paso],
    valor: 0,
  }));

  let acumulado = totalEnviaron;
  for (let i = pasos.length - 1; i >= 0; i--) {
    acumulado += conteoPorPaso.get(pasos[i].paso) ?? 0;
    pasos[i].valor = acumulado;
  }
  pasos[0].valor += sinInstrumentar;

  const totalIniciaron = pasos[0].valor;

  return {
    totalIniciaron,
    totalEnviaron,
    tasaConversion: totalIniciaron > 0 ? Math.round((totalEnviaron / totalIniciaron) * 100) : null,
    pasos,
  };
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

async function calcularTendencia(modo: "semanal" | "mensual", buckets: Bucket[]) {
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
            select: { id: true, estatus: true, programa: { select: { id: true, nombre: true } } },
          },
        },
      },
    },
  });

  interface EntradaCartera {
    programa: string;
    solicitado: number;
    aprobado: number;
    solicitudes: Set<string>;
    aprobadas: Set<string>;
    rechazadas: Set<string>;
  }
  const mapa = new Map<string, EntradaCartera>();
  for (const r of rows) {
    const s = r.datosCredito.solicitud;
    const p = s.programa;
    const entry = mapa.get(p.id) ?? {
      programa: p.nombre,
      solicitado: 0,
      aprobado: 0,
      solicitudes: new Set<string>(),
      aprobadas: new Set<string>(),
      rechazadas: new Set<string>(),
    };
    entry.solicitado += r.monto;
    entry.solicitudes.add(s.id);
    if (s.estatus === "APROBADO") {
      entry.aprobado += r.monto;
      entry.aprobadas.add(s.id);
    } else if (s.estatus === "RECHAZADO") {
      entry.rechazadas.add(s.id);
    }
    mapa.set(p.id, entry);
  }

  return [...mapa.values()]
    .map((e) => ({
      programa: e.programa,
      solicitado: e.solicitado,
      aprobado: e.aprobado,
      solicitudes: e.solicitudes.size,
      tasaAprobacion:
        e.aprobadas.size + e.rechazadas.size === 0
          ? null
          : (e.aprobadas.size / (e.aprobadas.size + e.rechazadas.size)) * 100,
    }))
    .sort((a, b) => b.solicitado - a.solicitado)
    .slice(0, 6);
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
// Tendencia de la tasa de aprobación por programa y por sector
//
// Igual que `calcularTendencia`, pero abre la serie de tasaAprobacion en una
// dimensión extra (programa / sector) en lugar de agregarla en una sola
// línea. Una sola consulta trae todos los dictámenes (APROBADO/RECHAZADO) del
// rango cubierto por `buckets` y de ahí se arman ambas agrupaciones.
//
// El tope de series sigue el mismo criterio que el resto del dashboard:
// las N más relevantes por volumen TOTAL de dictámenes en todo el rango (no
// por bucket individual), con el resto agrupado en "Otros" para no perder la
// serie completa. N=6 para programa (mismo tope que `calcularCartera`), N=5
// para sector (mismo tope — "TOP_N" — que usa `ComposicionDemanda.tsx` en el
// frontend para agrupar la cola larga).
// ─────────────────────────────────────────────────────────────────────────────

interface SerieTendenciaAprobacion {
  clave: string;
  porBucket: (number | null)[];
}

interface TendenciaAprobacion {
  periodos: string[];
  porPrograma: SerieTendenciaAprobacion[];
  porSector: SerieTendenciaAprobacion[];
}

const TOPE_PROGRAMA_TENDENCIA = 6; // igual que calcularCartera
const TOPE_SECTOR_TENDENCIA = 5; // igual que TOP_N en ComposicionDemanda.tsx

async function calcularTendenciaAprobacion(buckets: Bucket[]): Promise<TendenciaAprobacion> {
  const gte = buckets[0].inicio;
  const lt = buckets[buckets.length - 1].fin;

  const rows = await prisma.historialEstatus.findMany({
    where: { estatusNuevo: { in: DICTAMEN }, creadoEn: { gte, lt } },
    select: {
      creadoEn: true,
      estatusNuevo: true,
      solicitud: { select: { programa: { select: { nombre: true } }, sector: true } },
    },
  });

  type Fila = (typeof rows)[number];
  interface Conteo { aprobadas: number; rechazadas: number }

  const tasa = (c: Conteo): number | null =>
    c.aprobadas + c.rechazadas === 0 ? null : (c.aprobadas / (c.aprobadas + c.rechazadas)) * 100;

  function construirSeries(obtenerClave: (r: Fila) => string | null, tope: number): SerieTendenciaAprobacion[] {
    const vacio = (): Conteo[] => buckets.map(() => ({ aprobadas: 0, rechazadas: 0 }));
    const mapa = new Map<string, { total: number; porBucket: Conteo[] }>();

    for (const r of rows) {
      const clave = obtenerClave(r);
      if (clave === null) continue;
      const i = indiceBucket(buckets, r.creadoEn);
      if (i < 0) continue;
      const entry = mapa.get(clave) ?? { total: 0, porBucket: vacio() };
      entry.total += 1;
      if (r.estatusNuevo === "APROBADO") entry.porBucket[i].aprobadas++;
      else entry.porBucket[i].rechazadas++;
      mapa.set(clave, entry);
    }

    const ordenadas = [...mapa.entries()].sort((a, b) => b[1].total - a[1].total);

    if (ordenadas.length <= tope) {
      return ordenadas.map(([clave, e]) => ({ clave, porBucket: e.porBucket.map(tasa) }));
    }

    const principales = ordenadas.slice(0, tope);
    const resto = ordenadas.slice(tope);

    const otros = vacio();
    for (const [, e] of resto) {
      e.porBucket.forEach((c, i) => {
        otros[i].aprobadas += c.aprobadas;
        otros[i].rechazadas += c.rechazadas;
      });
    }

    return [
      ...principales.map(([clave, e]) => ({ clave, porBucket: e.porBucket.map(tasa) })),
      { clave: "Otros", porBucket: otros.map(tasa) },
    ];
  }

  return {
    periodos: buckets.map((b) => b.label),
    porPrograma: construirSeries((r) => r.solicitud.programa.nombre, TOPE_PROGRAMA_TENDENCIA),
    porSector: construirSeries((r) => r.solicitud.sector, TOPE_SECTOR_TENDENCIA),
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
  const haceDocPendiente = new Date(ms(ahora) - DIAS_DOC_PENDIENTE * MS_DIA);

  // `docsRechazados`/`docsPendientes` se acotan a solicitudes ACTIVAS: un
  // documento rechazado o sin validar en un expediente ya cerrado
  // (aprobado/rechazado/cancelado) no es una alerta accionable.
  const [estancadas, docsRechazados, docsPendientes, analisisLargos, slaVencido] = await Promise.all([
    prisma.solicitud.count({ where: { estatus: { in: ACTIVOS }, actualizadoEn: { lt: hace7 } } }),
    prisma.documentoSolicitud.count({
      where: { estatus: "RECHAZADO", activo: true, solicitud: { estatus: { in: ACTIVOS } } },
    }),
    prisma.documentoSolicitud.count({
      where: {
        estatus: "PENDIENTE",
        activo: true,
        subidoEn: { lt: haceDocPendiente },
        solicitud: { estatus: { in: ACTIVOS } },
      },
    }),
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
      id: "docs-pendientes",
      nivel: "warning" as const,
      total: docsPendientes,
      titulo: `Documentos sin validar más de ${DIAS_DOC_PENDIENTE} días`,
      detalle: "Esperan revisión del equipo de promoción",
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

/**
 * Barrido de solicitudes activas estancadas ("vencido", ver
 * `sla-solicitudes.ts`): notifica al gestor/analista dueño de cada una.
 * Best-effort en dos niveles — un fallo notificando una solicitud no debe
 * frenar las demás, y un fallo del barrido completo no debe tumbar el
 * cálculo del resto del panorama (se dispara junto a `calcularAlertas` en
 * `obtenerPanorama`, pero su resultado no forma parte de la respuesta).
 *
 * Deduplicación: no se crea una notificación nueva si ya existe una
 * `SOLICITUD_ESTANCADA` para esa solicitud dentro de la ventana de
 * `diasUmbral(estatus)` días — evita reenviar en cada carga del dashboard.
 */
export async function notificarSolicitudesEstancadas(ahora: Date): Promise<void> {
  try {
    const candidatas = await prisma.solicitud.findMany({
      where: { estatus: { in: ACTIVOS } },
      select: {
        id: true,
        folio: true,
        estatus: true,
        actualizadoEn: true,
        asignaciones: {
          where: { activa: true },
          take: 1,
          select: { gestor: { select: { userId: true } } },
        },
        asignacionesFinanciamiento: {
          where: { activa: true },
          take: 1,
          select: { analista: { select: { userId: true } } },
        },
      },
    });

    for (const s of candidatas) {
      try {
        if (estadoEstancamiento(s.estatus, s.actualizadoEn, ahora) !== "vencido") continue;

        const responsableUserId = PROMO_ACTIVOS.includes(s.estatus)
          ? (s.asignaciones[0]?.gestor.userId ?? null)
          : ANALISTA_ACTIVOS.includes(s.estatus)
            ? (s.asignacionesFinanciamiento[0]?.analista.userId ?? null)
            : null;
        if (!responsableUserId) continue;

        const ventana = new Date(ms(ahora) - diasUmbral(s.estatus) * MS_DIA);
        const yaNotificada = await prisma.notificacion.findFirst({
          where: { solicitudId: s.id, tipo: "SOLICITUD_ESTANCADA", creadoEn: { gte: ventana } },
          select: { id: true },
        });
        if (yaNotificada) continue;

        const dias = diasSinAvance(s.actualizadoEn, ahora);
        await prisma.$transaction((tx) =>
          notificarSolicitudEstancada(tx, responsableUserId, { id: s.id, folio: s.folio }, dias)
        );
      } catch {
        // no-op: ver comentario de la función — sigue con la siguiente solicitud
      }
    }
  } catch {
    // no-op: un fallo en el barrido no debe tumbar el resto del panorama
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Desempeño real de gestores y analistas (más allá de la carga actual)
//
// Gestores: se mide por "avances" — solicitudes que su gestión movió de
// Promoción a la Mesa de Control (EN_FINANCIAMIENTO) en el periodo. No se
// atribuyen rechazos/cancelaciones al gestor: esas decisiones ocurren en
// etapas posteriores (financiamiento), fuera de su control.
//
// Analistas: se mide por dictamen (APROBADO/RECHAZADO) en el periodo, con su
// tasa de aprobación y tiempo medio de resolución punta a punta.
//
// La atribución usa la asignación ACTIVA al momento de calcular (igual que
// `calcularEquipo`): si un caso se reasignó, el crédito completo va a quien
// lo tiene asignado hoy, no a un historial de coautoría.
// ─────────────────────────────────────────────────────────────────────────────

async function calcularDesempeno(desde: Date, ahora: Date) {
  const [avancesRows, dictaminadasRows] = await Promise.all([
    prisma.historialEstatus.findMany({
      where: { estatusNuevo: "EN_FINANCIAMIENTO", creadoEn: { gte: desde, lt: ahora } },
      select: {
        solicitud: {
          select: {
            asignaciones: {
              where: { activa: true },
              select: {
                gestor: { select: { usuario: { select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true } } } },
              },
            },
          },
        },
      },
    }),
    prisma.historialEstatus.findMany({
      where: { estatusNuevo: { in: DICTAMEN }, creadoEn: { gte: desde, lt: ahora } },
      select: {
        estatusNuevo: true,
        creadoEn: true,
        solicitud: {
          select: {
            creadoEn: true,
            asignacionesFinanciamiento: {
              where: { activa: true },
              select: {
                analista: { select: { usuario: { select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true } } } },
              },
            },
          },
        },
      },
    }),
  ]);

  const avancesPorGestor = new Map<string, number>();
  for (const r of avancesRows) {
    const asign = r.solicitud.asignaciones[0];
    if (!asign) continue;
    const key = nombre(asign.gestor.usuario);
    avancesPorGestor.set(key, (avancesPorGestor.get(key) ?? 0) + 1);
  }

  const acumAnalista = new Map<string, { aprobadas: number; rechazadas: number; sumMs: number }>();
  for (const r of dictaminadasRows) {
    const asign = r.solicitud.asignacionesFinanciamiento[0];
    if (!asign) continue;
    const key = nombre(asign.analista.usuario);
    const a = acumAnalista.get(key) ?? { aprobadas: 0, rechazadas: 0, sumMs: 0 };
    if (r.estatusNuevo === "APROBADO") a.aprobadas++;
    else a.rechazadas++;
    a.sumMs += ms(r.creadoEn) - ms(r.solicitud.creadoEn);
    acumAnalista.set(key, a);
  }

  const gestores = [...avancesPorGestor.entries()]
    .map(([nombre, avances]) => ({ nombre, avances }))
    .sort((a, b) => b.avances - a.avances);

  const analistas = [...acumAnalista.entries()]
    .map(([nombre, a]) => {
      const resueltas = a.aprobadas + a.rechazadas;
      return {
        nombre,
        resueltas,
        tasaAprobacion: resueltas === 0 ? null : (a.aprobadas / resueltas) * 100,
        tiempoPromedioDias: resueltas === 0 ? null : a.sumMs / resueltas / MS_DIA,
      };
    })
    .sort((a, b) => b.resueltas - a.resueltas);

  return { gestores, analistas };
}

// ─────────────────────────────────────────────────────────────────────────────
// Actividad reciente
// ─────────────────────────────────────────────────────────────────────────────

async function calcularActividad() {
  const rows = await prisma.historialEstatus.findMany({
    orderBy: { creadoEn: "desc" },
    take: 8,
    select: {
      solicitudId: true,
      estatusAnterior: true,
      estatusNuevo: true,
      motivo: true,
      creadoEn: true,
      solicitud: { select: { folio: true } },
      usuario: { select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true } },
    },
  });

  return rows.map((r) => ({
    solicitudId: r.solicitudId,
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
  const { modo, buckets } = construirBuckets(rango);

  const [
    kpis, embudo, embudoFormulario, resolucion, tendencia, tendenciaAprobacion, tiempoPorEtapa, cartera, composicion, equipo, desempeno, alertas, actividad,
  ] = await Promise.all([
    calcularKpis(desde, prevDesde, ahora),
    calcularEmbudo(desde),
    calcularEmbudoFormulario(desde),
    calcularResolucion(desde),
    calcularTendencia(modo, buckets),
    calcularTendenciaAprobacion(buckets),
    calcularTiempoPorEtapa(),
    calcularCartera(desde),
    calcularComposicion(desde),
    calcularEquipo(),
    calcularDesempeno(desde, ahora),
    calcularAlertas(ahora),
    calcularActividad(),
    notificarSolicitudesEstancadas(ahora),
  ]);

  return {
    rango,
    generadoEn: ahora.toISOString(),
    kpis,
    embudo,
    embudoFormulario,
    resolucion,
    tendencia,
    tendenciaAprobacion,
    tiempoPorEtapa,
    cartera,
    composicion,
    equipo,
    desempeno,
    alertas,
    actividad,
  };
}

export type Panorama = Awaited<ReturnType<typeof obtenerPanorama>>;
