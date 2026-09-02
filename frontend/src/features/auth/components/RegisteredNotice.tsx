'use client'

import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Clock } from 'lucide-react'

/** Avisos en /login según el query param con que se llegó:
 *  - `registered=true`  → cuenta recién creada (`useAuth.register`)
 *  - `expired=true`     → la sesión expiró y no se pudo renovar (`apiAuth`) */
export function RegisteredNotice() {
  const params = useSearchParams()
  const registered = params.get('registered') === 'true'
  const expired = params.get('expired') === 'true'

  if (registered) {
    return (
      <div
        role="status"
        className="mb-5 flex items-start gap-2.5 rounded-lg border border-success/30 bg-success/10 px-3.5 py-3 text-success"
      >
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
        <p className="text-sm">
          Cuenta creada. Inicia sesión con tu correo y contraseña.
        </p>
      </div>
    )
  }

  if (expired) {
    return (
      <div
        role="status"
        className="mb-5 flex items-start gap-2.5 rounded-lg border border-border bg-muted px-3.5 py-3 text-muted-foreground"
      >
        <Clock className="mt-0.5 size-4 shrink-0" />
        <p className="text-sm">
          Tu sesión expiró por inactividad. Vuelve a iniciar sesión para continuar.
        </p>
      </div>
    )
  }

  return null
}
