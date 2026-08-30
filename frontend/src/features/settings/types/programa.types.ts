// Enums de dominio: fuente única generada desde Prisma (`npm run gen:enums`).
import type { Requerimiento, SeccionSolicitud, TipoPersonaDocumento } from "@/shared/types/domain.enums";
export type { Requerimiento, SeccionSolicitud };

export type AplicaA = TipoPersonaDocumento;

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
    SOLICITANTE: "Solicitante",
    AVAL: "Aval",
    CREDITO: "Crédito",
    GARANTIA: "Garantía",
    NEGOCIO: "Negocio",
    MERCADO: "Mercado",
    BANCARIOS: "Bancarios",
};

export const REQUERIMIENTO_LABELS: Record<Requerimiento, string> = {
    NO_REQUIERE: "No aplica",
    OPCIONAL: "Opcional",
    OBLIGATORIO: "Obligatorio",
};