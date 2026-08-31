import type { ReactNode } from 'react';

/** Tarjeta de acceso: borde sobrio, acento superior fino de marca, sin sombra
 *  marcada. Contiene el título del paso y el formulario. */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border border-t-[3px] border-t-primary bg-card p-6 shadow-sm sm:p-7">
      <div className="mb-6">
        <h1 className="text-base font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
