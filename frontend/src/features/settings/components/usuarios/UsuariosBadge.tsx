import { Badge } from "@/shared/components/ui/badge";
import type { TipoPersona } from "@/features/settings/types/usuario.types";
import type { RolAplicacion } from "@/shared/types/auth.types";

// Cada rol → un categórico distinto (mismo criterio que UsuarioRolDialog).
const rolConfig: Record<RolAplicacion, { label: string; className: string }> = {
  ADMIN: {
    label: "Admin",
    className: "bg-brand text-brand-contrast border-brand font-medium",
  },
  SUPERVISOR: {
    label: "Supervisor",
    className: "bg-brand-surface text-brand-ink border-brand/25 font-medium",
  },
  GESTOR: {
    label: "Gestor",
    className: "bg-cat-2-surface text-cat-2 border-cat-2/25",
  },
  ANALISTA: {
    label: "Analista",
    className: "bg-cat-3-surface text-cat-3 border-cat-3/25",
  },
  ENCARGADO_PROMOCION: {
    label: "Enc. Promoción",
    className: "bg-cat-4-surface text-cat-4 border-cat-4/25",
  },
  ENCARGADO_FINANCIAMIENTO: {
    label: "Enc. Financiamiento",
    className: "bg-cat-5-surface text-cat-5 border-cat-5/25",
  },
  MESA_CONTROL: {
    label: "Mesa de Control",
    className: "bg-cat-6-surface text-cat-6 border-cat-6/25",
  },
  SOPORTE: {
    label: "Soporte",
    className: "bg-surface-sunken text-ink-muted border-hairline",
  },
  CLIENTE: {
    label: "Cliente",
    className: "bg-surface-sunken text-ink-subtle border-transparent",
  },
};

const tipoPersonaConfig: Record<TipoPersona, { label: string; className: string }> = {
  FISICA: {
    label: "Persona Física",
    className: "bg-surface-sunken text-ink-muted border-hairline",
  },
  MORAL: {
    label: "Persona Moral",
    className: "bg-accent text-ink border-hairline",
  },
};

interface RolBadgeProps { rol: RolAplicacion }
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
    <Badge variant="outline" className="bg-ok-surface text-ok-ink border-ok/20">
      Activo
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-surface-sunken text-ink-muted border-hairline">
      Inactivo
    </Badge>
  );
}
