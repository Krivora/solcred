import { apiAuth } from "@/shared/api/client";
import type {
    Programa,
    TipoDocumento,
} from "@/features/settings/types/programa.types";

export async function getProgramas(): Promise<Programa[]> {
    return apiAuth<Programa[]>("/admin/programas");
}

export async function getPrograma(id: string): Promise<Programa> {
    return apiAuth<Programa>(`/admin/programas/${id}`);
}


export async function getTiposDocumento(): Promise<TipoDocumento[]> {
    return apiAuth<TipoDocumento[]>("/admin/programas/tipos-documento");
}
