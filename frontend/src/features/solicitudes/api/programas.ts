import { apiAuth } from "@/shared/lib/client";
import type {
    Programa,
    TipoDocumento,
} from "@/shared/lib/types/programa";

export async function getProgramas(): Promise<Programa[]> {
    return apiAuth<Programa[]>("/admin/programas");
}

export async function getPrograma(id: string): Promise<Programa> {
    return apiAuth<Programa>(`/admin/programas/${id}`);
}


export async function getTiposDocumento(): Promise<TipoDocumento[]> {
    return apiAuth<TipoDocumento[]>("/admin/programas/tipos-documento");
}
