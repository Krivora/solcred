import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import { Prisma } from "../../../../generated/prisma/client";
import type { AnalisisTab } from "./analisis.schema";

const GARANTIA_CAMPOS = {
  tipo: true,
  nombrePropietario: true,
  valor: true,
  descripcion: true,
  marca: true,
  modelo: true,
  anio: true,
  numeroSerie: true,
  calle: true,
  numeroExterior: true,
  numeroInterior: true,
  colonia: true,
  ciudad: true,
  estado: true,
  codigoPostal: true,
  numeroEscritura: true,
  folioReal: true,
} satisfies Prisma.GarantiaSelect;

const SELECT_SOLICITUD = {
  id: true,
  folio: true,
  estatus: true,
  tipoPersona: true,
  programa: {
    select: {
      nombre: true,
      montoMinimo: true,
      montoMaximo: true,
      plazoMinimoMeses: true,
      plazoMaximoMeses: true,
      tasaOrdinaria: true,
      tasaMoratoria: true,
      tasaAnual: true,
    },
  },
  datosSolicitante: {
    select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true },
  },
  datosCredito: {
    select: {
      plazoMeses: true,
      mesesGracia: true,
      conceptos: {
        select: { categoria: true, concepto: true, monto: true },
        orderBy: { creadoEn: "asc" },
      },
    },
  },
  datosGarantia: {
    select: { garantias: { select: GARANTIA_CAMPOS, orderBy: { creadoEn: "asc" } } },
  },
  asignacionesFinanciamiento: {
    where: { activa: true },
    select: { analistaId: true, activa: true },
  },
} satisfies Prisma.SolicitudSelect;

type SolicitudParaAnalisis = Prisma.SolicitudGetPayload<{ select: typeof SELECT_SOLICITUD }>;

function construirContexto(s: SolicitudParaAnalisis) {
  const ds = s.datosSolicitante;
  return {
    folio: s.folio,
    estatus: s.estatus,
    tipoPersona: s.tipoPersona,
    programa: s.programa.nombre,
    razonSocial: ds
      ? `${ds.nombre} ${ds.apellidoPaterno} ${ds.apellidoMaterno}`.replace(/\s+/g, " ").trim()
      : null,
    montoSolicitado: s.datosCredito
      ? s.datosCredito.conceptos.reduce((acc, c) => acc + c.monto, 0)
      : null,
    plazoSolicitado: s.datosCredito?.plazoMeses ?? null,
  };
}

/**
 * Datos "de origen" para la pestaña Ajustes del Crédito: lo que pidió el cliente
 * + los límites del programa. El frontend precarga con esto y guarda la versión
 * ajustada del analista en `analisis.ajustesCredito`.
 */
function construirOrigen(s: SolicitudParaAnalisis) {
  const p = s.programa;
  return {
    ajustesCredito: {
      condiciones: {
        plazoMeses: s.datosCredito?.plazoMeses ?? p.plazoMinimoMeses,
        mesesGracia: s.datosCredito?.mesesGracia ?? 0,
        tasaAnual: p.tasaAnual,
      },
      programa: {
        montoMinimo: p.montoMinimo,
        montoMaximo: p.montoMaximo,
        plazoMinimoMeses: p.plazoMinimoMeses,
        plazoMaximoMeses: p.plazoMaximoMeses,
        tasaOrdinaria: p.tasaOrdinaria,
        tasaMoratoria: p.tasaMoratoria,
        tasaAnual: p.tasaAnual,
      },
      conceptos: (s.datosCredito?.conceptos ?? []).map((c) => ({
        categoria: c.categoria,
        concepto: c.concepto,
        monto: c.monto,
      })),
      garantias: (s.datosGarantia?.garantias ?? []).map((g) => ({ ...g })),
    },
  };
}

/**
 * Backstop de la "validación dura" que ya hace el cliente: el monto y el plazo
 * ajustados deben caber en el rango del programa. Tolerante: solo valida los
 * campos que vengan presentes (el autoguardado manda estados parciales).
 */
function validarAjustesCredito(data: unknown, s: SolicitudParaAnalisis) {
  if (!data || typeof data !== "object") return;
  const d = data as {
    condiciones?: { plazoMeses?: unknown; mesesGracia?: unknown };
    conceptos?: unknown;
  };
  const p = s.programa;

  if (Array.isArray(d.conceptos)) {
    const total = d.conceptos.reduce(
      (acc: number, c) => acc + (Number((c as { monto?: unknown })?.monto) || 0),
      0
    );
    if (total < p.montoMinimo || total > p.montoMaximo) {
      throw new AppError(
        `El monto ajustado (${total}) está fuera del rango del programa (${p.montoMinimo}–${p.montoMaximo})`,
        422
      );
    }
  }

  const plazo = Number(d.condiciones?.plazoMeses);
  if (Number.isFinite(plazo) && plazo > 0) {
    if (plazo < p.plazoMinimoMeses || plazo > p.plazoMaximoMeses) {
      throw new AppError(
        `El plazo ajustado (${plazo}) está fuera del rango del programa (${p.plazoMinimoMeses}–${p.plazoMaximoMeses} meses)`,
        422
      );
    }
    const gracia = Number(d.condiciones?.mesesGracia);
    if (Number.isFinite(gracia) && gracia > plazo) {
      throw new AppError("Los meses de gracia no pueden superar el plazo", 422);
    }
  }
}

function esEditable(
  s: Pick<SolicitudParaAnalisis, "estatus" | "asignacionesFinanciamiento">,
  rol: string,
  personalId: string | undefined
): boolean {
  if (rol === "ADMIN") return true;
  if (s.estatus !== "EN_ANALISIS") return false;
  if (!personalId) return false;
  const asig = s.asignacionesFinanciamiento.find((a) => a.activa);
  return !!asig && asig.analistaId === personalId;
}

async function cargarSolicitud(solicitudId: string): Promise<SolicitudParaAnalisis> {
  const solicitud = await prisma.solicitud.findUnique({
    where: { id: solicitudId },
    select: SELECT_SOLICITUD,
  });
  if (!solicitud) throw new AppError("Solicitud no encontrada", 404);
  return solicitud;
}

/**
 * Devuelve el análisis de la solicitud. Lo crea vacío en el primer acceso si el
 * caller puede editarlo (analista asignado con la solicitud EN_ANALISIS).
 */
export const obtenerAnalisis = async (
  solicitudId: string,
  rol: string,
  personalId: string | undefined
) => {
  const solicitud = await cargarSolicitud(solicitudId);
  const editable = esEditable(solicitud, rol, personalId);

  let analisis = await prisma.analisis.findUnique({ where: { solicitudId } });

  // Solo se materializa la fila en el primer acceso del **analista asignado**
  // (con la solicitud EN_ANALISIS). Un ADMIN que abre el análisis para revisarlo
  // no debe crear un registro ni quedar registrado como analista.
  const asignacionActiva = solicitud.asignacionesFinanciamiento.find((a) => a.activa);
  const esAnalistaAsignado =
    !!personalId && solicitud.estatus === "EN_ANALISIS" && asignacionActiva?.analistaId === personalId;

  if (!analisis && esAnalistaAsignado) {
    analisis = await prisma.analisis.create({
      data: { solicitudId, analistaId: personalId },
    });
  }

  return {
    analisis: analisis ?? {
      solicitudId,
      situacionFinanciera: null,
      ajustesCredito: null,
      criteriosEvaluacion: null,
      amortizacion: null,
      comentario: null,
    },
    editable,
    contexto: construirContexto(solicitud),
    origen: construirOrigen(solicitud),
  };
};

/** Upsert de una pestaña. Solo si el caller puede editar el análisis. */
export const guardarTab = async (
  solicitudId: string,
  tab: AnalisisTab,
  data: unknown,
  rol: string,
  personalId: string | undefined
) => {
  const solicitud = await cargarSolicitud(solicitudId);
  if (!esEditable(solicitud, rol, personalId)) {
    throw new AppError("No puedes editar este análisis", 403);
  }

  if (tab === "ajustesCredito") validarAjustesCredito(data, solicitud);

  // El dueño del análisis es siempre el analista asignado; `personalId` (que
  // para un ADMIN es su propio id) solo es fallback si no hay asignación activa.
  const analistaId =
    solicitud.asignacionesFinanciamiento.find((a) => a.activa)?.analistaId ?? personalId;
  if (!analistaId) throw new AppError("No hay analista asignado a esta solicitud", 422);

  const valor = data as Prisma.InputJsonValue;

  return prisma.analisis.upsert({
    where: { solicitudId },
    create: { solicitudId, analistaId, [tab]: valor },
    update: { [tab]: valor },
  });
};
