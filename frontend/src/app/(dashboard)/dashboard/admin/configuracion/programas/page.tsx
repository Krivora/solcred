"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Building2, Search, SlidersHorizontal, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getProgramas, activarPrograma, desactivarPrograma } from "@/features/settings/api/programas.api";
import { ProgramaCard } from "@/features/settings/components/programas/ProgramaCard";
import type { Programa } from "@/features/settings/types/programa.types";
import { PageHeader } from "@/shared/components/common/PageHeader";

export default function ProgramasPage() {
    const [programas, setProgramas] = useState<Programa[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filtro, setFiltro] = useState<"todos" | "activos" | "inactivos">("todos");
    const [toggling, setToggling] = useState<string | null>(null);
    const cargar = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getProgramas();
            setProgramas(data);
        } catch {
            setError("No se pudieron cargar los programas.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {cargar();}, [cargar]);

    const handleToggleActivo = async (id: string, activo: boolean) => {
        setToggling(id);
        try {
            if (activo) {
                await desactivarPrograma(id);
            } else {
                await activarPrograma(id);
            }
            await cargar();
        } catch {
            // silenciar, podría mostrar un toast
        } finally {
            setToggling(null);
        }
    };

    const programasFiltrados = programas
        .filter((p) => {
            if (filtro === "activos") return p.activo;
            if (filtro === "inactivos") return !p.activo;
            return true;
        })
        .filter((p) =>
            p.nombre.toLowerCase().includes(search.toLowerCase()) ||
            p.descripcion.toLowerCase().includes(search.toLowerCase())
        );

    return (
        <div className="mx-auto max-w-8xl space-y-6">
            <PageHeader
                title="Gestión de Programas"
                description="Administra los programas registrados en el sistema"
                backHref="/dashboard/admin/configuracion"
            />
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar programas..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select
                    value={filtro}
                    onValueChange={(v) => setFiltro(v as typeof filtro)}
                >
                    <SelectTrigger className="w-full sm:w-44">
                        <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="activos">Activos</SelectItem>
                        <SelectItem value="inactivos">Inactivos</SelectItem>
                    </SelectContent>
                </Select>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/dashboard/admin/configuracion/programas/nuevo">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo programa
                    </Link>
                </Button>
            </div>
            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-64 rounded-xl" />
                    ))}
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <p className="text-sm text-destructive">{error}</p>
                    <Button variant="outline" onClick={cargar}>
                        Reintentar
                    </Button>
                </div>
            ) : programasFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-medium">Sin resultados</p>
                        <p className="text-sm text-muted-foreground">
                            {search ? "Ningún programa coincide con tu búsqueda." : "Aún no hay programas registrados."}
                        </p>
                    </div>
                    {!search && (
                        <Button asChild size="sm">
                            <Link href="/dashboard/admin/configuracion/programas/nuevo">Crear primer programa</Link>
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    <p className="text-xs text-muted-foreground">
                        {programasFiltrados.length} programa{programasFiltrados.length !== 1 ? "s" : ""}
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {programasFiltrados.map((programa) => (
                            <ProgramaCard
                                key={programa.id}
                                programa={programa}
                                onToggleActivo={handleToggleActivo}
                                isToggling={toggling === programa.id}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}