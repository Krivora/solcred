/** Lockup institucional: tile de marca + nombre del sistema. Centrado, sobrio. */
export function AuthBrand() {
  return (
    <div className="mb-8 flex flex-col items-center gap-3 text-center">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1M4.22 4.22l.707.707m12.728 12.728.707.707M1 12h1m20 0h1M4.22 19.78l.707-.707M18.657 5.343l.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z"
          />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold tracking-tight text-foreground">SolCred</p>
        <p className="text-xs text-muted-foreground">Sistema de solicitudes de crédito</p>
      </div>
    </div>
  );
}
