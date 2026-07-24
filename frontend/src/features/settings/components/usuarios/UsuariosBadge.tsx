import { Badge } from "@/shared/components/ui/badge";
import type { TipoPersona } from "../../types/usuario.types";
import type { RolAplicacion } from "@/shared/lib/types/auth.types";

const rolConfig: Record<RolAplicacion, { label: string; className: string }> = {
  ADMIN: {
    label: "Admin",
    className: ["bg-primary/10 text-primary border-primary/20", "hover:bg-primary/15"].join(" "),
  },
  ANALISTA: {
    label: "Analista",
    className: ["bg-secondary text-secondary-foreground border-border", "hover:bg-secondary"].join(" "),
  },
  GESTOR: {
    label: "Gestor",
    className: ["bg-secondary text-secondary-foreground border-border", "hover:bg-secondary"].join(" "),
  },
  // ── NUEVO: faltaba, Rol ahora incluye SUPERVISOR ────────────────────────
  SUPERVISOR: {
    label: "Supervisor",
    className: ["bg-secondary text-secondary-foreground border-border", "hover:bg-secondary"].join(" "),
  },
  CLIENTE: {
    label: "Cliente",
    className: ["bg-muted text-muted-foreground border-border", "hover:bg-muted"].join(" "),
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