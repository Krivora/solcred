import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils/cn";
import type { ElementType } from "react";

interface Props {
    label: string;
    description: string;
    icon: ElementType;
    checked: boolean;
    onChange: (v: boolean) => void;
}

export function ToggleCard({ label, description, icon: Icon, checked, onChange }: Props) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={cn(
                "group flex w-full items-start gap-3 rounded-lg border p-4 text-left",
                "transition-colors duration-150 cursor-pointer",
                checked
                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:border-border hover:bg-muted/40",
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
                    {label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
            <div className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                checked ? "border-primary bg-primary" : "border-muted-foreground/30"
            )}>
                {checked && <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />}
            </div>
        </button>
    );
}