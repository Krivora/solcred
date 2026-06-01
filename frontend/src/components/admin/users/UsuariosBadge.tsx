import { Badge } from "@/components/ui/badge";
import type { Rol, TipoPersona } from "@/lib/types/usuario.types";

// ─────────────────────────────────────────────────────────────────────────────
// Todos los estilos usan exclusivamente tokens del CSS global (via Tailwind).
// No hay colores hardcodeados. El mapping semántico es:
//
//   ADMIN      → primary   (acción de máximo peso en el sistema)
//   ANALISTA   → secondary + ring para diferenciarlo
//   CLIENTE    → muted     (rol base, menor jerarquía)
//   FISICA     → accent    (variante neutra del secondary)
//   MORAL      → foreground invertido (contraste fuerte, persona jurídica)
//   Activo     → primary/10 con texto primary
//   Inactivo   → muted con texto muted-foreground
// ─────────────────────────────────────────────────────────────────────────────

const rolConfig: Record<Rol, { label: string; className: string }> = {
  ADMIN: {
    label: "Admin",
    // primary tenue: bg usa opacidad del token, borde y texto en primary
    className: [
      "bg-primary/10 text-primary border-primary/20",
      "hover:bg-primary/15",
    ].join(" "),
  },
  ANALISTA: {
    label: "Analista",
    // secondary con foreground de secondary — zona media de jerarquía
    className: [
      "bg-secondary text-secondary-foreground border-border",
      "hover:bg-secondary",
    ].join(" "),
  },
   GESTOR: {
    label: "Gestor",
    // secondary con foreground de secondary — zona media de jerarquía
    className: [
      "bg-secondary text-secondary-foreground border-border",
      "hover:bg-secondary",
    ].join(" "),
  },
  CLIENTE: {
    label: "Cliente",
    // muted: rol base, visualmente discreto
    className: [
      "bg-muted text-muted-foreground border-border",
      "hover:bg-muted",
    ].join(" "),
  },
};

const tipoPersonaConfig: Record<TipoPersona, { label: string; className: string }> = {
  FISICA: {
    label: "Persona Física",
    // accent es sinónimo de secondary en este tema — tono neutro diferenciado
    className: [
      "bg-accent text-accent-foreground border-border",
      "hover:bg-accent",
    ].join(" "),
  },
  MORAL: {
    label: "Persona Moral",
    // foreground invertido: máximo contraste para distinguir persona jurídica
    className: [
      "bg-foreground/8 text-foreground border-foreground/15",
      "hover:bg-foreground/12",
    ].join(" "),
  },
};

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface RolBadgeProps      { rol: Rol }
interface TipoPersonaBadgeProps { tipoPersona: TipoPersona }

// ─── Componentes ─────────────────────────────────────────────────────────────

export function RolBadge({ rol }: RolBadgeProps) {
  const { label, className } = rolConfig[rol];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

export function TipoPersonaBadge({ tipoPersona }: TipoPersonaBadgeProps) {
  const { label, className } = tipoPersonaConfig[tipoPersona];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

export function EstadoBadge({ activo }: { activo: boolean }) {
  return activo ? (
    <Badge
      variant="outline"
      className="bg-primary/8 text-primary border-primary/15 hover:bg-primary/12"
    >
      Activo
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-muted text-muted-foreground border-border hover:bg-muted"
    >
      Inactivo
    </Badge>
  );
}