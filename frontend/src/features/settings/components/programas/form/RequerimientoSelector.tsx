import { Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { Requerimiento } from "@/features/settings/types/programa.types";
import type { ElementType } from "react";

const options: { value: Requerimiento; label: string; description: string }[] = [
    { value: "NO_REQUIERE", label: "No requiere", description: "No es necesario para el trámite" },
    { value: "OPCIONAL",    label: "Opcional",    description: "Puede incluirse voluntariamente" },
    { value: "OBLIGATORIO", label: "Obligatorio", description: "Requisito indispensable" },
];

interface Props {
    label: string;
    icon: ElementType;
    value: Requerimiento;
    onChange: (v: Requerimiento) => void;
}

export function RequerimientoSelector({ label, icon: Icon, value, onChange }: Props) {
    return (
        <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
                {options.map((opt) => {
                    const checked = value === opt.value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onChange(opt.value)}
                            className={cn(
                                "group flex w-full items-start gap-3 rounded-lg border p-4 text-left",
                                "transition-colors duration-150 cursor-pointer",
                                checked
                                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                                    : "border-border bg-background hover:bg-muted/40",
                            )}
                        >
                            <div className={cn(
                                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                                checked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                            )}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn("text-sm font-medium leading-none", checked ? "text-primary" : "text-foreground")}>
                                    {opt.label}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{opt.description}</p>
                            </div>
                            <div className={cn(
                                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                                checked ? "border-primary bg-primary" : "border-muted-foreground/30"
                            )}>
                                {checked && <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}