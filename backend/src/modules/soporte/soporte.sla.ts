import prisma from "@config/db";
import { TicketPrioridad } from "../../../generated/prisma/client";

/**
 * Cálculo de SLA. Dos relojes: primera respuesta y resolución. El reloj arranca
 * cuando un ADMIN asigna el ticket (ahí `slaArrancadoEn`), se pausa mientras el
 * ticket está en `ESPERANDO_CLIENTE` (acumulado en `pausadoSegundos`) y el
 * incumplimiento se detecta de forma perezosa al leer el ticket. Calendario 24/7.
 */

const MIN = 60 * 1000;

export interface LimitesSla {
  slaRespuestaLimite: Date;
  slaResolucionLimite: Date;
}

const politicaDe = async (prioridad: TicketPrioridad) => {
  const politica = await prisma.ticketSlaPolitica.findUnique({ where: { prioridad } });
  // Respaldo por si alguien desactivó/borró la fila: MEDIA por defecto.
  return politica ?? { respuestaMinutos: 480, resolucionMinutos: 4320 };
};

/**
 * Límites de SLA para un ticket cuya cuenta arrancó en `arrancadoEn`,
 * con `pausadoSegundos` ya acumulados de pausas previas.
 */
export const calcularLimites = async (
  prioridad: TicketPrioridad,
  arrancadoEn: Date,
  pausadoSegundos: number
): Promise<LimitesSla> => {
  const { respuestaMinutos, resolucionMinutos } = await politicaDe(prioridad);
  const base = arrancadoEn.getTime() + pausadoSegundos * 1000;
  return {
    slaRespuestaLimite: new Date(base + respuestaMinutos * MIN),
    slaResolucionLimite: new Date(base + resolucionMinutos * MIN),
  };
};

// ── Estado derivado (para pintar chips sin escribir en BD) ──────────────────

export type EstadoSla = "sin_iniciar" | "cumplido" | "en_curso" | "en_riesgo" | "vencido";

interface CampoSla {
  limite: Date | null;
  cumplida: boolean | null;
  hitoAlcanzado: boolean; // ¿ya respondió / ya se resolvió?
}

/** Umbral de "en riesgo": queda menos del 25 % del tiempo total del objetivo. */
const FRACCION_RIESGO = 0.25;

export const estadoDeCampo = (campo: CampoSla, arrancadoEn: Date | null): EstadoSla => {
  if (!campo.limite || !arrancadoEn) return "sin_iniciar";
  if (campo.cumplida === true) return "cumplido";
  if (campo.cumplida === false) return "vencido";
  if (campo.hitoAlcanzado) return "cumplido";

  const ahora = Date.now();
  if (ahora > campo.limite.getTime()) return "vencido";

  const total = campo.limite.getTime() - arrancadoEn.getTime();
  const restante = campo.limite.getTime() - ahora;
  return restante <= total * FRACCION_RIESGO ? "en_riesgo" : "en_curso";
};

/** ¿El ticket tiene algún reloj vencido o en riesgo ahora mismo? (para filtros/stats). */
export const ticketEnRiesgoOVencido = (t: {
  slaArrancadoEn: Date | null;
  slaRespuestaLimite: Date | null;
  slaResolucionLimite: Date | null;
  primeraRespuestaEn: Date | null;
  slaRespuestaCumplida: boolean | null;
  slaResolucionCumplida: boolean | null;
  resueltoEn: Date | null;
}): { respuesta: EstadoSla; resolucion: EstadoSla; alerta: boolean } => {
  const respuesta = estadoDeCampo(
    {
      limite: t.slaRespuestaLimite,
      cumplida: t.slaRespuestaCumplida,
      hitoAlcanzado: t.primeraRespuestaEn !== null,
    },
    t.slaArrancadoEn
  );
  const resolucion = estadoDeCampo(
    {
      limite: t.slaResolucionLimite,
      cumplida: t.slaResolucionCumplida,
      hitoAlcanzado: t.resueltoEn !== null,
    },
    t.slaArrancadoEn
  );
  const alerta =
    respuesta === "en_riesgo" ||
    respuesta === "vencido" ||
    resolucion === "en_riesgo" ||
    resolucion === "vencido";
  return { respuesta, resolucion, alerta };
};
