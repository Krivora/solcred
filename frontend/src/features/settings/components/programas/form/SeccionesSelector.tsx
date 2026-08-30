import {
    User, BadgeCheck, DollarSign, ShieldCheck,
    Building2, LineChart, Landmark,
} from "lucide-react";
import type { ElementType } from "react";
import { cn } from "@/shared/lib/cn";
import { RequerimientoSegmented } from "./RequerimientoSegmented";
import {
    SECCION_LABELS,
    type Requerimiento,
    type SeccionSolicitud,
    type SeccionProgramaFormData,
} from "@/features/settings/types/programa.types";

const SECCION_ICONS: Record<SeccionSolicitud, ElementType> = {
    SOLICITANTE: User,
    AVAL: BadgeCheck,
    CREDITO: DollarSign,
    GARANTIA: ShieldCheck,
    NEGOCIO: Building2,
    MERCADO: LineChart,
    BANCARIOS: Landmark,
};

export const ORDEN_SECCIONES: SeccionSolicitud[] = [
    "SOLICITANTE",
    "AVAL",
    "CREDITO",
    "GARANTIA",
    "NEGOCIO",
    "MERCADO",
    "BANCARIOS",
];

interface Props {
    value: SeccionProgramaFormData[];
    onChange: (secciones: SeccionProgramaFormData[]) => void;
}

export function SeccionesSelector({ value, onChange }: Props) {
    const getRequerimiento = (seccion: SeccionSolicitud): Requerimiento =>
        value.find((s) => s.seccion === seccion)?.requerimiento ?? "NO_REQUIERE";

    const setRequerimiento = (seccion: SeccionSolicitud, requerimiento: Requerimiento) => {
        const existe = value.some((s) => s.seccion === seccion);
        const actualizado = existe
            ? value.map((s) => (s.seccion === seccion ? { ...s, requerimiento } : s))
            : [...value, { seccion, requerimiento }];
        onChange(actualizado);
    };

    return (
        <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {ORDEN_SECCIONES.map((seccion) => {
                const Icon = SECCION_ICONS[seccion];
                const requerimiento = getRequerimiento(seccion);
                const activa = requerimiento !== "NO_REQUIERE";

                return (
                    <div
                        key={seccion}
                        className={cn(
                            "flex flex-wrap items-center justify-between gap-3 px-4 py-3",
                            "transition-colors duration-150",
                            activa ? "bg-primary/[0.03]" : "bg-background"
                        )}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                                activa ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                            )}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <span className={cn(
                                "text-sm font-medium truncate",
                                activa ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {SECCION_LABELS[seccion]}
                            </span>
                        </div>

                        <RequerimientoSegmented
                            value={requerimiento}
                            onChange={(v) => setRequerimiento(seccion, v)}
                        />
                    </div>
                );
            })}
        </div>
    );
}