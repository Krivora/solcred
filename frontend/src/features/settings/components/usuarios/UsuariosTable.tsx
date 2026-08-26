"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Search,
  RefreshCw,
  Shield,
  UserX,
  Eye,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ShieldOff,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

import { RolBadge, TipoPersonaBadge, EstadoBadge } from "./UsuariosBadge";
import type { Usuario, UsuarioFiltros, TipoPersona } from "../../types/usuario.types";
import type { RolAplicacion } from "@/shared/lib/types/auth.types";
import { obtenerRolEfectivo } from "@/shared/lib/types/auth.types";

type SortKey = "nombre" | "correo" | "rol" | "creadoEn";
type SortDir = "asc" | "desc";

interface UsuariosTableProps {
  usuarios: Usuario[];
  isLoading: boolean;
  onVerDetalle: (usuario: Usuario) => void;
  onCambiarRol: (usuario: Usuario) => void;
  onRevocarAcceso: (usuario: Usuario) => void; // ── NUEVO ──
  onDesactivar: (usuario: Usuario) => void;
  onRecargar: () => void;
}

export function UsuariosTable({
  usuarios = [],
  isLoading,
  onVerDetalle,
  onCambiarRol,
  onRevocarAcceso,
  onDesactivar,
  onRecargar,
}: UsuariosTableProps) {
  const [filtros, setFiltros] = useState<UsuarioFiltros>({
    busqueda: "",
    rol: "TODOS",
    tipoPersona: "TODOS",
    activo: "TODOS",
  });
  const [sortKey, setSortKey] = useState<SortKey>("creadoEn");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 10;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPagina(1);
  };

  const filtrados = usuarios
    .filter((u) => {
      const nombre = `${u.nombre} ${u.apellidoPaterno} ${u.apellidoMaterno}`.toLowerCase();
      const busqueda = filtros.busqueda?.toLowerCase() ?? "";
      if (busqueda && !nombre.includes(busqueda) && !u.correo.toLowerCase().includes(busqueda)) return false;
      if (filtros.rol !== "TODOS" && obtenerRolEfectivo(u) !== filtros.rol) return false;
      if (filtros.tipoPersona !== "TODOS" && u.tipoPersona !== filtros.tipoPersona) return false;
      if (filtros.activo !== "TODOS" && u.activo !== filtros.activo) return false;
      return true;
    })
    .sort((a, b) => {
      let av: string, bv: string;
      if (sortKey === "nombre") {
        av = `${a.apellidoPaterno} ${a.nombre}`;
        bv = `${b.apellidoPaterno} ${b.nombre}`;
      } else if (sortKey === "creadoEn") {
        return sortDir === "asc"
          ? new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime()
          : new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime();
      } else if (sortKey === "rol") {
        av = obtenerRolEfectivo(a);
        bv = obtenerRolEfectivo(b);
      } else {
        av = a[sortKey];
        bv = b[sortKey];
      }
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
  const paginados = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="h-3 w-3 ml-1 text-muted-foreground" />;
    return sortDir === "asc"
      ? <ChevronUp className="h-3 w-3 ml-1" />
      : <ChevronDown className="h-3 w-3 ml-1" />;
  };

  return (
    <div className="space-y-4">
      {/* Barra de filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o correo..."
            className="pl-9 h-9"
            value={filtros.busqueda}
            onChange={(e) => {
              setFiltros((f) => ({ ...f, busqueda: e.target.value }));
              setPagina(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={String(filtros.rol)}
            onValueChange={(v) => {
              setFiltros((f) => ({ ...f, rol: v as RolAplicacion | "TODOS" }));
            }}
          >
            <SelectTrigger className="h-9 w-36">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos los roles</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="ANALISTA">Analista</SelectItem>
              <SelectItem value="GESTOR">Gestor</SelectItem>
              <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
              <SelectItem value="CLIENTE">Cliente</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={String(filtros.tipoPersona)}
            onValueChange={(v) => {
              setFiltros((f) => ({ ...f, tipoPersona: v as TipoPersona | "TODOS" }));
              setPagina(1);
            }}
          >
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos los tipos</SelectItem>
              <SelectItem value="FISICA">Persona Física</SelectItem>
              <SelectItem value="MORAL">Persona Moral</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={String(filtros.activo)}
            onValueChange={(v) => {
              const val = v === "TODOS" ? "TODOS" : v === "true";
              setFiltros((f) => ({ ...f, activo: val }));
              setPagina(1);
            }}
          >
            <SelectTrigger className="h-9 w-32">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              <SelectItem value="true">Activos</SelectItem>
              <SelectItem value="false">Inactivos</SelectItem>
            </SelectContent>
          </Select>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={onRecargar}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Recargar usuarios</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                {[
                  { key: "nombre" as SortKey, label: "Nombre" },
                  { key: "correo" as SortKey, label: "Correo" },
                  { key: "rol" as SortKey, label: "Rol" },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    className="h-10 px-4 text-left font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                    onClick={() => handleSort(key)}
                  >
                    <span className="flex items-center">
                      {label}
                      <SortIcon col={key} />
                    </span>
                  </th>
                ))}
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Tipo</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Estado</th>
                <th
                  className="h-10 px-4 text-left font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => handleSort("creadoEn")}
                >
                  <span className="flex items-center">
                    Registro
                  </span>
                </th>
                <th className="h-10 px-4 text-right font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
                : paginados.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                        No se encontraron usuarios con los filtros aplicados.
                      </td>
                    </tr>
                  )
                  : paginados.map((usuario) => (
                    <tr
                      key={usuario.id}
                      className="border-b transition-colors hover:bg-muted/30 cursor-pointer"
                      onClick={() => onVerDetalle(usuario)}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {usuario.nombre} {usuario.apellidoPaterno}
                          </p>
                          {usuario.apellidoMaterno && (
                            <p className="text-xs text-muted-foreground">
                              {usuario.apellidoMaterno}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{usuario.correo}</td>
                      <td className="px-4 py-3">
                        <RolBadge rol={obtenerRolEfectivo(usuario)} />
                      </td>
                      <td className="px-4 py-3">
                        <TipoPersonaBadge tipoPersona={usuario.tipoPersona} />
                      </td>
                      <td className="px-4 py-3">
                        <EstadoBadge activo={usuario.activo} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {format(new Date(usuario.creadoEn), "dd MMM yyyy", { locale: es })}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menú</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                              Acciones
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onVerDetalle(usuario)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onCambiarRol(usuario)}>
                              <Shield className="mr-2 h-4 w-4" />
                              Cambiar rol
                            </DropdownMenuItem>
                             {usuario.personal && (
                              <DropdownMenuItem onClick={() => onRevocarAcceso(usuario)}>
                                <ShieldOff className="mr-2 h-4 w-4" />
                                Revocar acceso
                              </DropdownMenuItem>
                            )}
                            {usuario.activo && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => onDesactivar(usuario)}
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  Desactivar
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {!isLoading && filtrados.length > POR_PAGINA && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <p className="text-xs text-muted-foreground">
              {filtrados.length} usuarios · Página {pagina} de {totalPaginas}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={pagina === 1}
                onClick={() => setPagina((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={pagina === totalPaginas}
                onClick={() => setPagina((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}