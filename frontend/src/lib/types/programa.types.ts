export type AplicaA = "FISICA" | "MORAL" | null;

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
    avalObligatorio: boolean;
    avalOpcional: boolean;
    garantiaObligatoria: boolean;
    garantiaOpcional: boolean;
    datosFinancierosCompletos: boolean;
    requiereCurp: boolean;
    requiereRfc: boolean;
    activo: boolean;
    documentos?: ProgramaDocumento[];
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
    avalObligatorio: boolean;
    avalOpcional: boolean;
    garantiaObligatoria: boolean;
    garantiaOpcional: boolean;
    datosFinancierosCompletos: boolean;
    requiereCurp: boolean;
    requiereRfc: boolean;
}

export interface ProgramasResponse {
    success: boolean;
    message: string;
    data: Programa[];
}

export interface ProgramaResponse {
    success: boolean;
    message: string;
    data: Programa;
}