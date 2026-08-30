"use client";

// src/components/layout/Header.tsx
import { usePathname } from "next/navigation";
import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useAuthStore } from "@/shared/stores/auth.store";
import { cn } from "@/shared/lib/cn";

const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: "Inicio",
  promocion: "Promoción",
  solicitudes: "Lista de Solicitudes",
  pendientes: "Pendientes de Aprobación",
  "mis-casos": "Mis Casos",
  financiamiento: "Financiamiento",
  "mesa-control": "Mesa de Control",
  asignacion: "Asignación a Promotores",
  comite: "Comité de Crédito",
  admin: "Gestión del Sistema",
  programas: "Programas de Crédito",
  documentos: "Documentos",
  usuarios: "Usuarios",
  logs: "Logs de Auditoría",
  nueva: "Nueva Solicitud",
  expediente: "Expediente digital",
  editar: "Editar",
};

// Segmentos que son identificadores (uuid / cuid / hash) — no aportan al breadcrumb
const ID_SEGMENT = /^[0-9a-f]{8,}$|^[0-9a-f]{8}-[0-9a-f]{4}-/i;

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const parts = pathname.split("/").filter(Boolean);
  return parts
    .map((part, i) => ({
      part,
      label: BREADCRUMB_MAP[part] ?? part,
      href: "/" + parts.slice(0, i + 1).join("/"),
    }))
    .filter(({ part }) => !ID_SEGMENT.test(part))
    .map(({ label, href }) => ({ label, href }));
}

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const { usuario } = useAuthStore();
  const breadcrumbs = getBreadcrumbs(pathname);
  const currentPage = breadcrumbs[breadcrumbs.length - 1];

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-3 sm:px-6 gap-2 sm:gap-4">
      {/* Left: hamburger (mobile) + page title / breadcrumb */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 lg:hidden"
          onClick={onOpenMobileMenu}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-semibold text-foreground truncate">
            {currentPage?.label ?? "Dashboard"}
          </h1>
          {breadcrumbs.length > 1 && (
            <nav className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1">
                  {i > 0 && <span>/</span>}
                  <span
                    className={cn(
                      i === breadcrumbs.length - 1
                        ? "text-foreground font-medium"
                        : "hover:text-foreground cursor-pointer"
                    )}
                  >
                    {crumb.label}
                  </span>
                </span>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Search */}
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex items-center gap-2 text-muted-foreground h-8 px-3 text-xs"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Buscar...</span>
          <kbd className="ml-1 rounded border border-border bg-muted px-1 text-[10px] font-mono">
            ⌘K
          </kbd>
        </Button>

        {/* Search icon only (mobile/tablet) */}
        <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>

        {/* Avatar */}
        {usuario && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
            {usuario.nombre[0]}{usuario.apellidoPaterno[0]}
          </div>
        )}
      </div>
    </header>
  );
}