import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils/cn";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    prefix?: string;
    suffix?: string;
    error?: boolean;
}

export function NumberInput({ prefix, suffix, error, className, ...props }: Props) {
    return (
        <div className="relative">
            {prefix && (
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    {prefix}
                </span>
            )}
            <Input
                type="number"
                className={cn(
                    "bg-background",
                    prefix && "pl-7",
                    suffix && "pr-14",
                    error && "border-destructive ring-destructive/20 focus-visible:ring-destructive/30",
                    className
                )}
                {...props}
            />
            {suffix && (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    {suffix}
                </span>
            )}
        </div>
    );
}