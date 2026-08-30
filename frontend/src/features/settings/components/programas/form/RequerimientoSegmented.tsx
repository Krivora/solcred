import { cn } from "@/shared/lib/cn";
import type { Requerimiento } from "@/features/settings/types/programa.types";

const options: { value: Requerimiento; label: string }[] = [
    { value: "NO_REQUIERE", label: "No" },
    { value: "OPCIONAL", label: "Opcional" },
    { value: "OBLIGATORIO", label: "Obligatorio" },
];

interface Props {
    value: Requerimiento;
    onChange: (v: Requerimiento) => void;
}

export function RequerimientoSegmented({ value, onChange }: Props) {
    return (
        <div className="inline-flex items-center rounded-full border border-border bg-muted/40 p-0.5">
            {options.map((opt) => {
                const checked = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "relative rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap",
                            "transition-colors duration-150 cursor-pointer",
                            checked
                                ? "bg-background text-primary shadow-sm ring-1 ring-primary/20"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}