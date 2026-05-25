export type AplicaA = "FISICA" | "MORAL" | "AMBOS";

export enum Requerimiento {
    NO_REQUIERE = "NO_REQUIERE",
    OPCIONAL = "OPCIONAL",
    OBLIGATORIO = "OBLIGATORIO",
}

export interface TipoDocumento {
    id: string;
    nombre: string;
    descripcion?: string | null;
}

export interface ProgramaDocumento {
    id: string;
    programaId: string;
    tipoDocumentoId: string;
    esObligatorio: boolean;
    aplicaA: AplicaA;
    tipoDocumento: TipoDocumento;
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
    aval: Requerimiento;
    garantia: Requerimiento;
    datosFinancierosCompletos: boolean;
    activo: boolean;
    documentosRequeridos?: ProgramaDocumento[];
    creadoEn?: string;
    actualizadoEn?: string;
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

    aval: Requerimiento;
    garantia: Requerimiento;

    datosFinancierosCompletos: boolean;
}