export type EstatusDocumento = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'

export type AplicaA = "FISICA" | "MORAL" | "AMBOS";
export enum Requerimiento {
    NO_REQUIERE = "NO_REQUIERE",
    OPCIONAL = "OPCIONAL",
    OBLIGATORIO = "OBLIGATORIO",
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