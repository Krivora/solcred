"use client";

import { useState } from "react";
import {
    ChevronsUpDown,
    Monitor,
    Palette,
    HelpCircle,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    FileText,
    BookOpen,
    Info,
    LifeBuoy,
    Keyboard,
    Sparkles,
} from "lucide-react";
import { cn } from "@/shared/lib/utils/cn";
import { useAuthStore } from "@/shared/lib/store/auth.store";
import { Rol } from "@/shared/lib/types/auth.types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ROLE_CONFIG } from "./role-config";
import { ThemeSwitcherDialog } from "./ThemeSwitcherDialog";

interface BrandMenuProps {
    collapsed: boolean;
    onToggleSidebar: () => void;
}

export function BrandMenu({ collapsed, onToggleSidebar }: BrandMenuProps) {
    const { usuario, clearAuth: logout } = useAuthStore();
    const [themeDialogOpen, setThemeDialogOpen] = useState(false);
    const role = usuario?.rol as Rol | undefined;
    const roleConfig = role ? ROLE_CONFIG[role] : null;

    const trigger = (
        <button
            className={cn(
                "flex h-16 w-full shrink-0 items-center border-b border-sidebar-border transition-colors duration-150 hover:bg-sidebar-accent",
                collapsed ? "justify-center px-3" : "gap-2.5 px-4"
            )}
        >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold tracking-tight shadow-sm">
                SC
            </div>
            {!collapsed && (
                <>
                    <div className="min-w-0 flex-1 text-left leading-tight">
                        {roleConfig && (
                            <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-sidebar-primary">
                                {roleConfig.label}
                            </p>
                        )}
                        <p className="truncate text-sm font-semibold text-sidebar-foreground tracking-tight">
                            Krivora - SolCred
                        </p>
                    </div>
                    <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/30" />
                </>
            )}
        </button>
    );

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="bottom" className="w-56">
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Monitor className="h-4 w-4" />
                            <span>Apariencia</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => setThemeDialogOpen(true)}>
                                <Palette className="h-4 w-4" />
                                <span>Tema</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={onToggleSidebar}>
                                {collapsed ? (
                                    <PanelLeftOpen className="h-4 w-4" />
                                ) : (
                                    <PanelLeftClose className="h-4 w-4" />
                                )}
                                <span>{collapsed ? "Expandir panel" : "Colapsar panel"}</span>
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <HelpCircle className="h-4 w-4" />
                            <span>Ayuda</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem>
                                <FileText className="h-4 w-4" />
                                <span>Documentación</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                                <BookOpen className="h-4 w-4" />
                                <span>Manuales</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                                <Info className="h-4 w-4" />
                                <span>Información</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                                <LifeBuoy className="h-4 w-4" />
                                <span>Soporte</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem>
                                <Keyboard className="h-4 w-4" />
                                <span>Atajos de teclado</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                                <Sparkles className="h-4 w-4" />
                                <span>Novedades</span>
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuItem
                        onClick={logout}
                        className="text-destructive focus:text-destructive"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ThemeSwitcherDialog open={themeDialogOpen} onOpenChange={setThemeDialogOpen} />
        </>
    );
}