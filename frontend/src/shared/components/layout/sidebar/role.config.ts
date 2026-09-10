// Mismo criterio de color por rol que UsuariosBadge / UsuarioRolDialog.
export const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
    ADMIN: { label: "Admin", className: "bg-brand-surface text-brand-ink" },
    SUPERVISOR: { label: "Supervisor", className: "bg-cat-1-surface text-cat-1" },
    GESTOR: { label: "Gestor", className: "bg-cat-2-surface text-cat-2" },
    ANALISTA: { label: "Analista", className: "bg-cat-3-surface text-cat-3" },
    ENCARGADO_PROMOCION: { label: "Enc. Promoción", className: "bg-cat-4-surface text-cat-4" },
    ENCARGADO_FINANCIAMIENTO: { label: "Enc. Financiamiento", className: "bg-cat-5-surface text-cat-5" },
    MESA_CONTROL: { label: "Mesa de Control", className: "bg-cat-6-surface text-cat-6" },
    SOPORTE: { label: "Soporte", className: "bg-surface-sunken text-ink-muted" },
    CLIENTE: { label: "Cliente", className: "bg-surface-sunken text-ink-muted" },
};
