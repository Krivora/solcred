import type { Step } from '@/features/solicitudes/hooks/useSolicitudForm'
import type { ProgramaSeccion, SeccionSolicitud } from '@/features/solicitudes/types/solicitud.types'

// Pasos que no dependen de una sección del programa (siempre presentes).
const PASOS_FIJOS_INICIO: Step[] = ['programa', 'general']
const PASOS_FIJOS_FIN: Step[] = ['resumen']

// Mapa Step ↔ SeccionSolicitud — única fuente de verdad para la relación.
const STEP_A_SECCION: Partial<Record<Step, SeccionSolicitud>> = {
    solicitante: 'SOLICITANTE',
    aval: 'AVAL',
    credito: 'CREDITO',
    garantia: 'GARANTIA',
    negocio: 'NEGOCIO',
    mercado: 'MERCADO',
    bancarios: 'BANCARIOS',
}

const PASOS_DINAMICOS = Object.keys(STEP_A_SECCION) as Step[]

function obtenerRequerimiento(
    secciones: ProgramaSeccion[],
    step: Step
): Requerimiento | undefined {
    const seccionEnum = STEP_A_SECCION[step]
    if (!seccionEnum) return undefined
    return secciones.find((s) => s.seccion === seccionEnum)?.requerimiento
}

import type { Requerimiento } from '@/features/solicitudes/types/solicitud.types'

/** Lista ordenada de pasos activos según lo que el programa requiere/permite. */
export function obtenerPasosActivos(secciones: ProgramaSeccion[] | undefined): Step[] {
    if (!secciones) return PASOS_FIJOS_INICIO // aún no hay programa cargado

    const dinamicos = PASOS_DINAMICOS.filter((step) => {
        const req = obtenerRequerimiento(secciones, step)
        return req && req !== 'NO_REQUIERE'
    })

    return [...PASOS_FIJOS_INICIO, ...dinamicos, ...PASOS_FIJOS_FIN]
}

/** true si el paso actual puede omitirse (OPCIONAL en el programa). */
export function esPasoOmitible(secciones: ProgramaSeccion[] | undefined, step: Step): boolean {
    if (!secciones) return false
    return obtenerRequerimiento(secciones, step) === 'OPCIONAL'
}