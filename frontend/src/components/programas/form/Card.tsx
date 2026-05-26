import { cn } from "@/lib/utils/cn";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("rounded-xl border border-border bg-card p-6 shadow-sm", className)}>
            {children}
        </div>
    );
}