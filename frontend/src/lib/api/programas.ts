import { apiAuth } from "./client";
import type {
    Programa,
    ProgramaFormData,
    TipoDocumento,
} from "@/lib/types/programa.types";

export async function getProgramas(): Promise<Programa[]> {
    return apiAuth<Programa[]>("/programas");
}

export async function getPrograma(id: string): Promise<Programa> {
    return apiAuth<Programa>(`/programas/${id}`);
}

export async function crearPrograma(data: ProgramaFormData): Promise<Programa> {
    return apiAuth<Programa>("/programas", { method: "POST", body: data });
}

export async function actualizarPrograma(id: string, data: ProgramaFormData): Promise<Programa> {
    return apiAuth<Programa>(`/programas/${id}`, { method: "PUT", body: data });
}

export async function activarPrograma(id: string): Promise<Programa> {
    return apiAuth<Programa>(`/programas/${id}/activar`, { method: "PATCH" });
}

export async function desactivarPrograma(id: string): Promise<Programa> {
    return apiAuth<Programa>(`/programas/${id}/desactivar`, { method: "PATCH" });
}

export async function getTiposDocumento(): Promise<TipoDocumento[]> {
    return apiAuth<TipoDocumento[]>("/programas/tipos-documento");
}

export async function crearTipoDocumento(data: {
    nombre: string;
    descripcion?: string;
}): Promise<TipoDocumento> {
    return apiAuth<TipoDocumento>("/programas/tipos-documento", { method: "POST", body: data });
}

export async function agregarDocumento(
    programaId: string,
    data: { tipoDocumentoId: string; esObligatorio: boolean; aplicaA?: "FISICA" | "MORAL" | null }
): Promise<void> {
    return apiAuth(`/programas/${programaId}/documentos`, { method: "POST", body: data });
}

export async function quitarDocumento(programaId: string, tipoDocumentoId: string): Promise<void> {
    return apiAuth(`/programas/${programaId}/documentos/${tipoDocumentoId}`, { method: "DELETE" });
}