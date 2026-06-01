import { AlertCircle } from "lucide-react";
import { Label } from "@/shared/components/ui/label";

interface Props {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    children: React.ReactNode;
}

export function FieldRow({ label, error, hint, required, children }: Props) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground/75">
                {label}{required && <span className="ml-0.5 text-destructive">*</span>}
            </Label>
            {children}
            {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
            {error && (
                <p className="flex items-center gap-1 text-xs text-destructive font-medium">
                    <AlertCircle className="h-3 w-3 shrink-0" />{error}
                </p>
            )}
        </div>
    );
}