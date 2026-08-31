'use client'

import { useSearchParams } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'

/** Aviso de éxito tras registrarse — `useAuth.register` redirige a
 *  `/login?registered=true`. */
export function RegisteredNotice() {
  const registered = useSearchParams().get('registered') === 'true'
  if (!registered) return null

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
