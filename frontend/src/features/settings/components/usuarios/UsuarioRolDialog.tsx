"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, ChevronDown, Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import { cambiarRolSchema, type CambiarRolForm } from "@/features/settings/schemas/usuario.schema";
import type { Usuario } from "@/features/settings/types/usuario.types";
import type { RolAplicacion } from "@/shared/types/auth.types";
import { obtenerRolEfectivo } from "@/shared/types/auth.types";

// ─── Config de roles ──────────────────────────────────────────────────────────
// Para agregar más roles: solo añade objetos a este array.

type RolValue = CambiarRolForm["rol"];

interface RolConfig {
  value: RolValue;
  label: string;
  descripcion: string;
  colorClass: string;        // color del ícono
  pillClass: string;         // bg + text del badge
}

const ROLES: RolConfig[] = [
  {
    value: "ADMIN",
    label: "Administrador",
    descripcion: "Acceso completo al sistema, usuarios y configuración.",
    colorClass: "text-brand-ink",
    pillClass: "bg-brand-surface text-brand-ink border-brand/25",
  },
  {
    value: "GESTOR",
    label: "Gestor",
    descripcion: "Revisión, dictamen y gestión de solicitudes.",
    colorClass: "text-cat-2",
    pillClass: "bg-cat-2-surface text-cat-2 border-cat-2/25",
  },
  {
    value: "ANALISTA",
    label: "Analista",
    descripcion: "Revisión, dictamen y gestión de solicitudes.",
    colorClass: "text-cat-3",
    pillClass: "bg-cat-3-surface text-cat-3 border-cat-3/25",
  },
  {
    value: "SUPERVISOR",
    label: "Supervisor",
    descripcion: "Supervisión de equipos de gestión y reasignaciones.",
    colorClass: "text-cat-1",
    pillClass: "bg-cat-1-surface text-cat-1 border-cat-1/25",
  },
  {
    value: "ENCARGADO_PROMOCION",
    label: "Encargado de Promoción",
    descripcion: "Ve todas las solicitudes de Promoción, asigna y aprueba.",
    colorClass: "text-cat-4",
    pillClass: "bg-cat-4-surface text-cat-4 border-cat-4/25",
  },
  {
    value: "ENCARGADO_FINANCIAMIENTO",
    label: "Encargado de Financiamiento",
    descripcion: "Asigna analistas, valida y opera el Comité de Crédito.",
    colorClass: "text-cat-5",
    pillClass: "bg-cat-5-surface text-cat-5 border-cat-5/25",
  },
  {
    value: "MESA_CONTROL",
    label: "Mesa de Control",
    descripcion: "Solo revisa y despacha los casos en Mesa de Control.",
    colorClass: "text-cat-6",
    pillClass: "bg-cat-6-surface text-cat-6 border-cat-6/25",
  },
  {
    value: "SOPORTE",
    label: "Soporte",
    descripcion: "Usuario interno con acceso únicamente al módulo de Soporte.",
    colorClass: "text-ink-subtle",
    pillClass: "bg-surface-sunken text-ink-muted border-hairline",
  },
];

// ─── Utilidad: iniciales ──────────────────────────────────────────────────────

function iniciales(nombre: string, apellido: string) {
  return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
}

// ─── Sub-componente: Pill de rol ──────────────────────────────────────────────

function RolPill({ config }: { config: RolConfig }) {
  const { label, pillClass } = config;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        pillClass
      )}
    >
      {label}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface UsuarioRolDialogProps {
  usuario: Usuario | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmar: (id: string, datos: CambiarRolForm) => Promise<boolean>;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function UsuarioRolDialog({
  usuario,
  open,
  onOpenChange,
  onConfirmar,
}: UsuarioRolDialogProps) {
  const [guardando, setGuardando] = useState(false);

  const { handleSubmit, setValue, watch } = useForm<CambiarRolForm>({
    resolver: zodResolver(cambiarRolSchema),
    defaultValues: { rol: usuario?.personal?.rol },
  });
  const getRolConfig = (value?: RolValue | RolAplicacion) =>
  ROLES.find((r) => r.value === value) ?? null;
  const rolSeleccionado = watch("rol");
  const rolActual = usuario ? obtenerRolEfectivo(usuario) : undefined;
  const mismoRol = rolSeleccionado === rolActual;

  const configSeleccionado = getRolConfig(rolSeleccionado);
  const configActual = getRolConfig(rolActual);

  const onSubmit = async (datos: CambiarRolForm) => {
    if (!usuario) return;
    setGuardando(true);
    const ok = await onConfirmar(usuario.id, datos);
    setGuardando(false);
    if (ok) onOpenChange(false);
  };

  if (!usuario) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden gap-0">

        {/* ── Encabezado con gradiente suave ── */}
        <div className="bg-gradient-to-b from-muted/60 to-background px-6 pt-6 pb-5 border-b">
          <DialogHeader className="space-y-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                <Shield className="h-3.5 w-3.5 text-primary" />
              </div>
              <DialogTitle className="text-sm font-semibold tracking-tight">
                Cambiar rol de usuario
              </DialogTitle>
            </div>

            {/* Tarjeta de identidad del usuario */}
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm select-none">
                {iniciales(usuario.nombre, usuario.apellidoPaterno)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight truncate">
                  {usuario.nombre} {usuario.apellidoPaterno} {usuario.apellidoMaterno}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {usuario.correo}
                </p>
                <div className="mt-1.5">
                  {configActual && <RolPill config={configActual} />}
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* ── Cuerpo del formulario ── */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-5 space-y-4">

            {/* Selector de rol */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Nuevo rol
              </Label>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center justify-between gap-3",
                      "rounded-lg border bg-background px-3 py-2.5",
                      "text-sm transition-colors hover:bg-muted/50",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      "cursor-pointer"
                    )}
                  >
                    {configSeleccionado ? (
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-medium truncate">{configSeleccionado.label}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Selecciona un rol…</span>
                    )}
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className="w-[var(--radix-dropdown-menu-trigger-width)]"
                >
                  {ROLES.map((rol) => {
                    const isSelected = rolSeleccionado === rol.value;
                    const isCurrent = rolActual === rol.value;
                    return (
                      <DropdownMenuItem
                        key={rol.value}
                        onSelect={() => setValue("rol", rol.value)}
                        className="flex items-center gap-3 py-2.5 px-3 cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">{rol.label}</span>
                            {isCurrent && (
                              <span className="text-[10px] text-muted-foreground bg-muted rounded px-1 py-px">
                                actual
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-snug mt-0.5 truncate">
                            {rol.descripcion}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-auto" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Descripción contextual del rol seleccionado */}
            {configSeleccionado && (
              <div
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-xs leading-relaxed transition-all",
                  mismoRol
                    ? "bg-muted/40 text-muted-foreground border-border"
                    : "bg-muted/30 text-foreground border-border"
                )}
              >
                {mismoRol ? (
                  <span className="text-muted-foreground">
                    El usuario ya tiene el rol de{" "}
                    <strong className="font-medium">{configSeleccionado.label}</strong>. Selecciona
                    otro rol para continuar.
                  </span>
                ) : (
                  <>
                    <span className="font-medium">{configSeleccionado.label}:</span>{" "}
                    {configSeleccionado.descripcion}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/20">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={guardando}
              className="text-muted-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={guardando || !rolSeleccionado || mismoRol}
            >
              {guardando ? "Guardando…" : "Confirmar cambio"}
            </Button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
}