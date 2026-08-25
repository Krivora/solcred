export type AplicaA = "FISICA" | "MORAL" | "AMBOS";

export enum Requerimiento {
    NO_REQUIERE = "NO_REQUIERE",
    OPCIONAL = "OPCIONAL",
    OBLIGATORIO = "OBLIGATORIO",
}

export enum SeccionSolicitud {
    SOLICITANTE = "SOLICITANTE",
    AVAL = "AVAL",
    CREDITO = "CREDITO",
    GARANTIA = "GARANTIA",
    NEGOCIO = "NEGOCIO",
    MERCADO = "MERCADO",
    BANCARIOS = "BANCARIOS",
}

export interface TipoDocumento {
    id: string;
    nombre: string;
    descripcion?: string | null;
    creadoEn?: string;
}

export interface ProgramaDocumento {
    id: string;
    programaId: string;
    tipoDocumentoId: string;
    esObligatorio: boolean;
    aplicaA: AplicaA;
    tipoDocumento: TipoDocumento;
}

export interface ProgramaSeccion {
    id: string;
    programaId: string;
    seccion: SeccionSolicitud;
    requerimiento: Requerimiento;
}

export interface Programa {
    id: string;
    nombre: string;
    descripcion: string;
    objetivo: string;
    permitePersonaFisica: boolean;
    permitePersonaMoral: boolean;
    montoMinimo: number;
    montoMaximo: number;
    tasaOrdinaria: number;
    tasaMoratoria: number;
    tasaAnual: number;
    plazoMinimoMeses: number;
    plazoMaximoMeses: number;
    datosFinancierosCompletos: boolean;
    activo: boolean;
    documentosRequeridos?: ProgramaDocumento[];
    secciones?: ProgramaSeccion[];
    creadoEn?: string;
    actualizadoEn?: string;
}

export interface SeccionProgramaFormData {
    seccion: SeccionSolicitud;
    requerimiento: Requerimiento;
}

export interface ProgramaFormData {
    nombre: string;
    descripcion: string;
    objetivo: string;

    permitePersonaFisica: boolean;
    permitePersonaMoral: boolean;

    montoMinimo: number;
    montoMaximo: number;

    tasaOrdinaria: number;
    tasaMoratoria: number;
    tasaAnual: number;

    plazoMinimoMeses: number;
    plazoMaximoMeses: number;

    datosFinancierosCompletos: boolean;

    secciones: SeccionProgramaFormData[];
}

// Útil para renderizar el checklist en el form (label legible por sección)
export const SECCION_LABELS: Record<SeccionSolicitud, string> = {
    [SeccionSolicitud.SOLICITANTE]: "Solicitante",
    [SeccionSolicitud.AVAL]: "Aval",
    [SeccionSolicitud.CREDITO]: "Crédito",
    [SeccionSolicitud.GARANTIA]: "Garantía",
    [SeccionSolicitud.NEGOCIO]: "Negocio",
    [SeccionSolicitud.MERCADO]: "Mercado",
    [SeccionSolicitud.BANCARIOS]: "Bancarios",
};

export const REQUERIMIENTO_LABELS: Record<Requerimiento, string> = {
    [Requerimiento.NO_REQUIERE]: "No aplica",
    [Requerimiento.OPCIONAL]: "Opcional",
    [Requerimiento.OBLIGATORIO]: "Obligatorio",
};