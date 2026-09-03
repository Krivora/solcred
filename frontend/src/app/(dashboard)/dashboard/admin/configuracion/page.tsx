"use client";

// src/app/(dashboard)/dashboard/admin/page.tsx
import Link from "next/link";
import {
    Building2,
    FileBadge2,
    Users,
    ClipboardList,
    ChevronRight,
    Boxes,
} from "lucide-react";

interface ConfigCard {
    icon: React.ElementType;
    title: string;
    description: string;
    href: string;
    accent: string; // tailwind bg color for icon container
}

const configItems: ConfigCard[] = [
    {
        icon: Building2,
        title: "Programas",
        description:
            "Crea y administra los programas de financiamiento, sus condiciones, tasas y requisitos.",
        href: "/dashboard/admin/configuracion/programas",
        accent: "bg-cat-2-surface text-cat-2",
    },
    {
        icon: FileBadge2,
        title: "Documentos",
        description:
            "Define los tipos de documentos requeridos y su asignación por programa.",
        href: "/dashboard/admin/configuracion/documentos",
        accent: "bg-cat-1-surface text-cat-1",
    },
    {
        icon: Users,
        title: "Usuarios",
        description:
            "Consulta, edita y administra los usuarios del sistema y sus roles de acceso.",
        href: "/dashboard/admin/configuracion/usuarios",
        accent: "bg-cat-4-surface text-cat-4",
    },
    {
        icon: Boxes,
        title: "Grupos",
        description:
            "Define los tipos de documentos requeridos y su asignación por programa.",
        href: "/dashboard/admin/configuracion/grupos",
        accent: "bg-cat-3-surface text-cat-3",
    },
    {
        icon: ClipboardList,
        title: "Auditoría",
        description:
            "Revisa el historial de acciones y eventos registrados en la plataforma.",
        href: "/dashboard/admin/configuracion/logs",
        accent: "bg-cat-5-surface text-cat-5",
    },
];

export default function AdminPage() {
    return (
        <div className="mx-auto max-w-8xl space-y-8">
            {/* ── Header ── */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Gestión del Sistema
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                    Administra los módulos centrales de la plataforma.
                </p>
            </div>

            {/* ── Cards ── */}
            <div className="grid gap-3 sm:grid-cols-4">
                {configItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group relative flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-150 hover:border-primary/30 hover:shadow-sm hover:bg-accent/40"
                        >
                            {/* Icon */}
                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.accent} transition-transform duration-150 group-hover:scale-105`}
                            >
                                <Icon className="h-5 w-5" />
                            </div>

                            {/* Text */}
                            <div className="min-w-0 flex-1 pt-0.5">
                                <p className="text-sm font-medium text-foreground leading-tight">
                                    {item.title}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                    {item.description}
                                </p>
                            </div>

                            {/* Arrow */}
                            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-primary" />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}