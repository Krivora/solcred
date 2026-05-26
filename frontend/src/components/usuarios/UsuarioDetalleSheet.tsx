"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  CreditCard,
  Calendar,
  Pencil,
  X,
  Save,
  User,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils/cn";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { RolBadge, TipoPersonaBadge, EstadoBadge } from "./UsuariosBadge";
import {
  actualizarUsuarioSchema,
  type ActualizarUsuarioForm,
} from "@/lib/schemas/usuario.schemas";
import type { Usuario } from "@/lib/types/usuario.types";

// ─── Utilidades ───────────────────────────────────────────────────────────────

function iniciales(nombre: string, apellido: string) {
  return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();
}

// ─── Sub-componente: sección con título ───────────────────────────────────────

function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        {titulo}
      </p>
      <div className="space-y-0 divide-y divide-border rounded-lg border bg-card overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// ─── Sub-componente: fila de datos ────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
  empty = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
  empty?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          empty ? "text-muted-foreground/40" : "text-muted-foreground"
        )}
      />
      <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
        <span className="text-xs text-muted-foreground shrink-0">{label}</span>
        <span
          className={cn(
            "text-sm truncate text-right",
            empty
              ? "text-muted-foreground/40 italic"
              : "text-foreground font-medium",
            mono && "font-mono tracking-wider text-xs"
          )}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

// ─── Sub-componente: campo de formulario ──────────────────────────────────────

function FormField({
  id,
  label,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface UsuarioDetalleSheetProps {
  usuario: Usuario | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuardar: (id: string, datos: ActualizarUsuarioForm) => Promise<boolean>;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function UsuarioDetalleSheet({
  usuario,
  open,
  onOpenChange,
  onGuardar,
}: UsuarioDetalleSheetProps) {
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ActualizarUsuarioForm>({
    resolver: zodResolver(actualizarUsuarioSchema),
  });

  const iniciarEdicion = () => {
    if (!usuario) return;
    reset({
      nombre: usuario.nombre,
      apellidoPaterno: usuario.apellidoPaterno,
      apellidoMaterno: usuario.apellidoMaterno,
      correo: usuario.correo,
      curp: usuario.curp ?? "",
      rfc: usuario.rfc ?? "",
      tipoPersona: usuario.tipoPersona,
    });
    setEditando(true);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    reset();
  };

  const onSubmit = async (datos: ActualizarUsuarioForm) => {
    if (!usuario) return;
    setGuardando(true);
    const ok = await onGuardar(usuario.id, datos);
    setGuardando(false);
    if (ok) setEditando(false);
  };

  if (!usuario) return null;

  const nombreCompleto = `${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0 overflow-hidden">

        {/* ── Hero header ─────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-b from-muted/80 to-muted/20 border-b px-6 pt-8 pb-6">
          <SheetHeader className="sr-only">
            <SheetTitle>
              {editando ? "Editar usuario" : "Detalle del usuario"}
            </SheetTitle>
            <SheetDescription>
              {editando
                ? "Modifica los datos del usuario y guarda los cambios."
                : "Información completa del usuario."}
            </SheetDescription>
          </SheetHeader>

          {/* Avatar + identidad */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-lg select-none border border-primary/10">
                {iniciales(usuario.nombre, usuario.apellidoPaterno)}
              </div>
              {/* punto de estado */}
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background",
                  usuario.activo ? "bg-green-500" : "bg-muted-foreground"
                )}
              />
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <p className="font-semibold text-foreground text-base leading-tight truncate">
                {nombreCompleto}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {usuario.correo}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <RolBadge rol={usuario.rol} />
                <TipoPersonaBadge tipoPersona={usuario.tipoPersona} />
                <EstadoBadge activo={usuario.activo} />
              </div>
            </div>

            {/* Botón editar — solo en vista detalle */}
            {!editando && (
              <Button
                variant="outline"
                size="sm"
                onClick={iniciarEdicion}
                className="shrink-0 h-8 px-3 text-xs"
              >
                <Pencil className="h-3 w-3 mr-1.5" />
                Editar
              </Button>
            )}
          </div>
        </div>

        {/* ── Cuerpo scrollable ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {!editando ? (
            /* ── Vista de solo lectura ── */
            <>
              <Seccion titulo="Contacto">
                <InfoRow icon={Mail} label="Correo" value={usuario.correo} />
              </Seccion>

              <Seccion titulo="Documentos de identidad">
                <InfoRow
                  icon={CreditCard}
                  label="CURP"
                  value={usuario.curp ?? "Sin registrar"}
                  mono={!!usuario.curp}
                  empty={!usuario.curp}
                />
                <InfoRow
                  icon={CreditCard}
                  label="RFC"
                  value={usuario.rfc ?? "Sin registrar"}
                  mono={!!usuario.rfc}
                  empty={!usuario.rfc}
                />
              </Seccion>

              <Seccion titulo="Registro en el sistema">
                <InfoRow
                  icon={Calendar}
                  label="Fecha de alta"
                  value={format(new Date(usuario.creadoEn), "dd 'de' MMMM yyyy", { locale: es })}
                />
                <InfoRow
                  icon={Calendar}
                  label="Última actualización"
                  value={format(new Date(usuario.actualizadoEn), "dd MMM yyyy, HH:mm", { locale: es })}
                />
              </Seccion>
            </>
          ) : (
            /* ── Formulario de edición ── */
            <form
              id="form-editar-usuario"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Nombre */}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Nombre completo
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    id="nombre"
                    label="Nombre(s)"
                    error={errors.nombre?.message}
                    className="col-span-2"
                  >
                    <Input id="nombre" {...register("nombre")} />
                  </FormField>
                  <FormField
                    id="apellidoPaterno"
                    label="Apellido paterno"
                    error={errors.apellidoPaterno?.message}
                  >
                    <Input id="apellidoPaterno" {...register("apellidoPaterno")} />
                  </FormField>
                  <FormField
                    id="apellidoMaterno"
                    label="Apellido materno"
                    error={errors.apellidoMaterno?.message}
                  >
                    <Input id="apellidoMaterno" {...register("apellidoMaterno")} />
                  </FormField>
                </div>
              </div>

              <Separator />

              {/* Contacto */}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Contacto
                </p>
                <FormField
                  id="correo"
                  label="Correo electrónico"
                  error={errors.correo?.message}
                >
                  <Input id="correo" type="email" {...register("correo")} />
                </FormField>
              </div>

              <Separator />

              {/* Identidad */}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Documentos de identidad
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <FormField id="curp" label="CURP" error={errors.curp?.message}>
                    <Input
                      id="curp"
                      {...register("curp")}
                      className="uppercase tracking-wider font-mono text-sm"
                      placeholder="18 caracteres"
                    />
                  </FormField>
                  <FormField id="rfc" label="RFC" error={errors.rfc?.message}>
                    <Input
                      id="rfc"
                      {...register("rfc")}
                      className="uppercase tracking-wider font-mono text-sm"
                      placeholder="12 o 13 caracteres"
                    />
                  </FormField>
                </div>
              </div>

              <Separator />

              {/* Tipo de persona */}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Clasificación
                </p>
                <FormField id="tipoPersona" label="Tipo de persona">
                  <Select
                    defaultValue={usuario.tipoPersona}
                    onValueChange={(v) =>
                      setValue("tipoPersona", v as "FISICA" | "MORAL")
                    }
                  >
                    <SelectTrigger id="tipoPersona" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FISICA">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Persona Física</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="MORAL">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Persona Moral</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </form>
          )}
        </div>

        {/* ── Footer fijo — solo en modo edición ──────────────────────────── */}
        {editando && (
          <div className="border-t bg-muted/20 px-6 py-4 flex items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={cancelarEdicion}
              disabled={guardando}
              className="text-muted-foreground"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Cancelar
            </Button>
            <Button
              type="submit"
              form="form-editar-usuario"
              size="sm"
              disabled={guardando}
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {guardando ? "Guardando…" : "Guardar cambios"}
            </Button>
          </div>
        )}

      </SheetContent>
    </Sheet>
  );
}