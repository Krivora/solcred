import prisma from "@config/db";
import { AppError } from "@middlewares/error.middleware";
import { Prisma } from "../../../../generated/prisma/client";
import type { AnalisisTab, InformeEjecutivoInput } from "./analisis.schema";
import type { InformeEjecutivoPDFData } from "@/shared/pdf/pdf.types";
import { FIRMANTES_INFORME_EJECUTIVO } from "./informe-firmas.config";

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

// ─────────────────────────────────────────────────────────────────────────────
// Informe Ejecutivo de Crédito
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIA_LABEL: Record<string, string> = {
  CAPITAL: "Capital de trabajo",
  MAQUINARIA_EQUIPO: "Maquinaria y equipo",
  REMODELACION: "Remodelación",
};

const NOMBRE_PERSONAL = {
  select: {
    usuario: { select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true } },
  },
} as const;

const SELECT_INFORME = {
  id: true,
  folio: true,
  estatus: true,
  tipoPersona: true,
  solicitanteId: true,
  programa: {
    select: {
      nombre: true,
      objetivo: true,
      tasaOrdinaria: true,
      tasaMoratoria: true,
      tasaAnual: true,
      plazoMinimoMeses: true,
      secciones: { select: { seccion: true, requerimiento: true } },
    },
  },
  datosSolicitante: {
    select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true, rfc: true },
  },
  datosAval: {
    select: { nombre: true, apellidoPaterno: true, apellidoMaterno: true },
  },
  datosNegocio: {
    select: {
      nombreNegocio: true,
      actividadNegocio: true,
      municipioLocal: true,
      estadoLocal: true,
      antiguedadNegocio: true,
      experienciaActividadSolicitante: true,
      experienciaEmpresarioSolicitante: true,
      empleosConservados: true,
      empleosNuevos: true,
    },
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
  asignaciones: { where: { activa: true }, take: 1, select: { gestor: NOMBRE_PERSONAL } },
  asignacionesFinanciamiento: {
    where: { activa: true },
    take: 1,
    select: { analista: NOMBRE_PERSONAL },
  },
} satisfies Prisma.SolicitudSelect;

type SolicitudInforme = Prisma.SolicitudGetPayload<{ select: typeof SELECT_INFORME }>;

const nombreCompleto = (
  u: { nombre: string; apellidoPaterno: string; apellidoMaterno: string } | null | undefined,
): string | null =>
  u ? `${u.nombre} ${u.apellidoPaterno} ${u.apellidoMaterno}`.replace(/\s+/g, " ").trim() : null;

interface CondicionesJSON {
  plazoMeses: number;
  mesesGracia: number;
  tasaAnual: number;
}
interface ConceptoJSON {
  categoria: string;
  concepto: string;
  monto: number;
}
type GarantiaJSON = Prisma.GarantiaGetPayload<{ select: typeof GARANTIA_CAMPOS }>;
interface AjustesJSON {
  condiciones: CondicionesJSON;
  conceptos: ConceptoJSON[];
  garantias: GarantiaJSON[];
}

/** Ajustes guardados por el analista, o —si aún no hay— lo que pidió el cliente. */
function resolverAjustes(s: SolicitudInforme, ajustesCredito: unknown): AjustesJSON {
  const guardado = ajustesCredito as Partial<AjustesJSON> | null;
  if (guardado && guardado.condiciones && Array.isArray(guardado.conceptos)) {
    return {
      condiciones: guardado.condiciones,
      conceptos: guardado.conceptos,
      garantias: Array.isArray(guardado.garantias) ? guardado.garantias : [],
    };
  }
  return {
    condiciones: {
      plazoMeses: s.datosCredito?.plazoMeses ?? s.programa.plazoMinimoMeses,
      mesesGracia: s.datosCredito?.mesesGracia ?? 0,
      tasaAnual: s.programa.tasaAnual,
    },
    conceptos: (s.datosCredito?.conceptos ?? []).map((c) => ({
      categoria: c.categoria,
      concepto: c.concepto,
      monto: c.monto,
    })),
    garantias: (s.datosGarantia?.garantias ?? []).map((g) => ({ ...g })),
  };
}

function detalleGarantia(g: GarantiaJSON): string | null {
  const partes =
    g.tipo === "PRENDARIA"
      ? [g.marca, g.modelo, g.anio ? String(g.anio) : null, g.numeroSerie ? `Serie ${g.numeroSerie}` : null]
      : [
          [g.calle, g.numeroExterior && `#${g.numeroExterior}`, g.colonia].filter(Boolean).join(" "),
          [g.ciudad, g.estado].filter(Boolean).join(", "),
          g.numeroEscritura ? `Escritura ${g.numeroEscritura}` : null,
          g.folioReal ? `Folio real ${g.folioReal}` : null,
        ];
  const txt = partes.filter(Boolean).join(" · ");
  return txt || null;
}

export const armarInformeEjecutivo = async (
  solicitudId: string,
  input: InformeEjecutivoInput,
): Promise<InformeEjecutivoPDFData> => {
  const solicitud = await prisma.solicitud.findUnique({
    where: { id: solicitudId },
    select: SELECT_INFORME,
  });
  if (!solicitud) throw new AppError("Solicitud no encontrada", 404);

  const analisis = await prisma.analisis.findUnique({ where: { solicitudId } });
  const ajustes = resolverAjustes(solicitud, analisis?.ajustesCredito ?? null);
  const comentario = (analisis?.comentario ?? {}) as Record<string, string | undefined>;

  const conceptosOriginales = solicitud.datosCredito?.conceptos ?? [];
  const montoSolicitado = conceptosOriginales.reduce((a, c) => a + c.monto, 0);
  const montoAjustado = ajustes.conceptos.reduce((a, c) => a + (c.monto || 0), 0);

  const antecedentes = await prisma.solicitud.count({
    where: { solicitanteId: solicitud.solicitanteId, estatus: "APROBADO", id: { not: solicitudId } },
  });

  const dn = solicitud.datosNegocio;
  const ubicacion = [dn?.municipioLocal, dn?.estadoLocal].filter(Boolean).join(", ") || null;
  const anios = (n: number | null | undefined) =>
    n != null ? `${n} ${n === 1 ? "año" : "años"}` : null;
  const antiguedad = anios(dn?.antiguedadNegocio);
  const experiencia = anios(
    dn?.experienciaActividadSolicitante ?? dn?.experienciaEmpresarioSolicitante,
  );

  const categorias = [...new Set(ajustes.conceptos.map((c) => c.categoria))];
  const destino =
    categorias.map((c) => CATEGORIA_LABEL[c] ?? c).join(", ") || "No especificado";

  const filasInversion = ajustes.conceptos.map((c) => ({
    categoria: CATEGORIA_LABEL[c.categoria] ?? c.categoria,
    concepto: c.concepto || "—",
    monto: c.monto || 0,
    participacion: montoAjustado > 0 ? ((c.monto || 0) / montoAjustado) * 100 : 0,
  }));

  const seccionGarantia = solicitud.programa.secciones.find((x) => x.seccion === "GARANTIA");
  const programaNoRequiereGarantia = seccionGarantia?.requerimiento === "NO_REQUIERE";

  const valorGarantias = ajustes.garantias.reduce((a, g) => a + (g.valor || 0), 0);
  const garantia: InformeEjecutivoPDFData["garantia"] =
    ajustes.garantias.length === 0
      ? {
          requiere: false,
          nota: programaNoRequiereGarantia
            ? `El programa ${solicitud.programa.nombre} no requiere garantía.`
            : "No se registraron garantías para esta operación.",
        }
      : {
          requiere: true,
          valorTotal: valorGarantias,
          cobertura: montoAjustado > 0 ? valorGarantias / montoAjustado : null,
          filas: ajustes.garantias.map((g) => ({
            tipo: g.tipo === "PRENDARIA" ? "Prendaria" : "Hipotecaria",
            propietario: g.nombrePropietario,
            valor: g.valor || 0,
            descripcion: g.descripcion,
            detalle: detalleGarantia(g),
          })),
        };

  return {
    folio: solicitud.folio,
    fecha: new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" }),
    programa: solicitud.programa.nombre,
    estatus: solicitud.estatus,

    identificacion: {
      solicitante: nombreCompleto(solicitud.datosSolicitante) ?? "—",
      nombreComercial: dn?.nombreNegocio ?? null,
      rfc: solicitud.datosSolicitante?.rfc ?? null,
      tipoPersona: solicitud.tipoPersona === "MORAL" ? "Persona moral" : solicitud.tipoPersona === "FISICA" ? "Persona física" : null,
      actividad: dn?.actividadNegocio ?? null,
      ubicacion,
      asesor: nombreCompleto(solicitud.asignaciones[0]?.gestor?.usuario),
      analista: nombreCompleto(solicitud.asignacionesFinanciamiento[0]?.analista?.usuario),
      antiguedadNegocio: antiguedad,
      experiencia,
      empleosActuales: dn?.empleosConservados ?? null,
      empleosNuevos: dn?.empleosNuevos ?? null,
      conAntecedentes: antecedentes > 0,
    },

    aval: {
      tiene: !!solicitud.datosAval,
      nombre: nombreCompleto(solicitud.datosAval),
    },

    objetivo: {
      destino,
      objetivoPrograma: solicitud.programa.objetivo,
      montoSolicitado,
      montoAjustado,
    },

    condiciones: {
      monto: montoAjustado,
      plazoMeses: ajustes.condiciones.plazoMeses,
      mesesGracia: ajustes.condiciones.mesesGracia,
      tasaAnual: ajustes.condiciones.tasaAnual,
      tasaOrdinaria: solicitud.programa.tasaOrdinaria,
      tasaMoratoria: solicitud.programa.tasaMoratoria,
      pagoMensual: input.amortizacion?.pagoOrdinario ?? null,
      totalPagar: input.amortizacion?.totalPagado ?? null,
      totalIntereses: input.amortizacion?.totalIntereses ?? null,
    },

    programaInversion: { filas: filasInversion, total: montoAjustado },

    situacion: input.situacion,

    garantia,

    comentarios: {
      antecedentes: comentario.antecedentes ?? null,
      buroCredito: comentario.buroCredito ?? null,
      situacionFinanciera: comentario.situacionFinanciera ?? null,
      visita: comentario.visita ?? null,
      opinionAnalista: comentario.opinionAnalista ?? null,
    },

    firmas: FIRMANTES_INFORME_EJECUTIVO.map((fm) => ({ ...fm })),
  };
};
