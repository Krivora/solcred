import type { RolAplicacion } from '@/shared/types/auth.types'
import { useAuthStore } from '@/shared/stores/auth.store'

/**
 * El rol `SUPERVISOR` es un "ADMIN de solo lectura": ve exactamente lo mismo
 * que un administrador pero no puede ejecutar ninguna acción. El backend lo
 * bloquea de raíz (middleware `soloLecturaSupervisor`); en el frontend se usa
 * este helper para ocultar/deshabilitar los controles de acción.
 */
export const esRolSoloLectura = (rol: RolAplicacion | null | undefined): boolean =>
  rol === 'SUPERVISOR'

/** Hook: ¿el usuario actual está en modo solo lectura? */
export const useEsSoloLectura = (): boolean =>
  useAuthStore((s) => esRolSoloLectura(s.rol))
