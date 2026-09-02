import { Badge } from "@/shared/components/ui/badge";
import type { TipoPersona } from "@/features/settings/types/usuario.types";
import type { RolAplicacion } from "@/shared/types/auth.types";

const rolConfig: Record<RolAplicacion, { label: string; className: string }> = {
  ADMIN: {
    label: "Admin",
    className: [
      "bg-primary text-primary-foreground border-primary",
      "font-medium shadow-xs hover:bg-primary/90",
    ].join(" "),
  },
  SUPERVISOR: {
    label: "Supervisor",
    className: [
      "bg-primary/10 text-primary border-primary/30",
      "font-medium hover:bg-primary/15",
    ].join(" "),
  },
  ENCARGADO_PROMOCION: {
    label: "Enc. Promoción",
    className: ["bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25", "hover:bg-teal-500/15"].join(" "),
  },
  ENCARGADO_FINANCIAMIENTO: {
    label: "Enc. Financiamiento",
    className: ["bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/25", "hover:bg-cyan-500/15"].join(" "),
  },
  MESA_CONTROL: {
    label: "Mesa de Control",
    className: ["bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25", "hover:bg-rose-500/15"].join(" "),
  },
  SOPORTE: {
    label: "Soporte",
    className: ["bg-muted text-muted-foreground border-border", "hover:bg-muted"].join(" "),
  },
  GESTOR: {
    label: "Gestor",
    className: [
      "bg-info/10 text-info border-info/25",
      "hover:bg-info/15",
    ].join(" "),
  },
  ANALISTA: {
    label: "Analista",
    className: [
      "bg-secondary text-secondary-foreground border-border",
      "hover:bg-secondary",
    ].join(" "),
  },
  CLIENTE: {
    label: "Cliente",
    className: [
      "bg-muted/60 text-muted-foreground border-transparent",
      "hover:bg-muted",
    ].join(" "),
  },
};

const tipoPersonaConfig: Record<TipoPersona, { label: string; className: string }> = {
  FISICA: {
    label: "Persona Física",
    className: ["bg-accent text-accent-foreground border-border", "hover:bg-accent"].join(" "),
  },
  MORAL: {
    label: "Persona Moral",
    className: ["bg-foreground/8 text-foreground border-foreground/15", "hover:bg-foreground/12"].join(" "),
  },
};

interface RolBadgeProps { rol: RolAplicacion } // ── FIX ──
interface TipoPersonaBadgeProps { tipoPersona: TipoPersona }

export function RolBadge({ rol }: RolBadgeProps) {
  const { label, className } = rolConfig[rol];
  return <Badge variant="outline" className={className}>{label}</Badge>;
}

export function TipoPersonaBadge({ tipoPersona }: TipoPersonaBadgeProps) {
  const { label, className } = tipoPersonaConfig[tipoPersona];
  return <Badge variant="outline" className={className}>{label}</Badge>;
}

export function EstadoBadge({ activo }: { activo: boolean }) {
  return activo ? (
    <Badge variant="outline" className="bg-primary/8 text-primary border-primary/15 hover:bg-primary/12">
      Activo
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-muted text-muted-foreground border-border hover:bg-muted">
      Inactivo
    </Badge>
  );
}