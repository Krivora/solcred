"use client";

import { useTheme } from "next-themes";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";

interface ThemeSwitcherDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const THEMES = [
    { value: "light", label: "Claro" },
    { value: "dark", label: "Oscuro" },
    { value: "system", label: "Automático" },
] as const;

// Preview en miniatura de cada tema, usando tu paleta real
function ThemePreview({ mode }: { mode: "light" | "dark" | "system" }) {
    if (mode === "system") {
        return (
            <div className="flex h-24 w-full overflow-hidden rounded-lg border border-border">
                <div className="flex-1 bg-[oklch(1_0_267.51)] p-2.5">
                    <div className="h-2 w-10 rounded-full bg-[oklch(0.92_0_0)]" />
                </div>
                <div className="flex-1 bg-[oklch(0.2103_0_267.51)] p-2.5">
                    <div className="h-2 w-10 rounded-full bg-[oklch(0.32_0_0)]" />
                </div>
            </div>
        );
    }

    const isDark = mode === "dark";
    return (
        <div
            className={cn(
                "h-24 w-full rounded-lg border p-2.5",
                isDark
                    ? "bg-[oklch(0.2103_0_267.51)] border-border"
                    : "bg-[oklch(1_0_267.51)] border-border"
            )}
        >
            <div
                className={cn(
                    "h-2 w-10 rounded-full",
                    isDark ? "bg-[oklch(0.32_0_0)]" : "bg-[oklch(0.92_0_0)]"
                )}
            />
        </div>
    );
}

export function ThemeSwitcherDialog({ open, onOpenChange }: ThemeSwitcherDialogProps) {
    const { theme, setTheme } = useTheme();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Cambiar tema</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-4 pt-2">
                    {THEMES.map((t) => {
                        const isSelected = theme === t.value;
                        return (
                            <button
                                key={t.value}
                                onClick={() => {
                                    setTheme(t.value);
                                }}
                                className="group flex flex-col items-center gap-2"
                            >
                                <div
                                    className={cn(
                                        "relative w-full rounded-lg ring-2 ring-offset-2 ring-offset-background transition-all",
                                        isSelected
                                            ? "ring-primary"
                                            : "ring-transparent group-hover:ring-border"
                                    )}
                                >
                                    <ThemePreview mode={t.value} />
                                    {isSelected && (
                                        <div className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                                            <Check className="h-3.5 w-3.5" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-foreground">
                                    {t.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}