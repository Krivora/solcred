'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/components/ui/sheet'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { useAuthStore } from '@/shared/stores/auth.store'
import { NotificacionesLista } from '@/features/notificaciones/components/NotificacionesLista'
import { useContadorNoLeidas, useNotificaciones } from '@/features/notificaciones/hooks/useNotificaciones'
import { useAccionesNotificacion } from '@/features/notificaciones/hooks/useAccionesNotificacion'

const MAX_RECIENTES = 10

function EncabezadoPanel({
  count,
  onMarcarTodas,
  marcando,
}: {
  count: number
  onMarcarTodas: () => void
  marcando: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-hairline px-3 py-2.5">
      <div className="flex items-baseline gap-2">
        <h2 className="text-body-sm font-semibold text-foreground">Notificaciones</h2>
        {count > 0 && (
          <span className="text-caption text-ink-subtle">
            {count > 9 ? '9+' : count} sin leer
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-caption disabled:opacity-50"
        disabled={count === 0 || marcando}
        onClick={onMarcarTodas}
      >
        Marcar todas como leídas
      </Button>
    </div>
  )
}

/**
 * Campana del Header: envuelve el botón existente con un `Popover` (≥ lg) o
 * un `Sheet` inferior (< lg) — no `side="left"`, ese lado ya lo usa el
 * `Sidebar` y confundiría cuál drawer es cuál. Mismo contenido en ambos.
 */
export function NotificacionesMenu() {
  const [abierto, setAbierto] = useState(false)
  const esEscritorio = useMediaQuery('(min-width: 1024px)')
  const rol = useAuthStore((s) => s.rol) ?? undefined

  const { data: contador } = useContadorNoLeidas()
  const count = contador?.count ?? 0

  const { data, isLoading, refetch } = useNotificaciones({ pageSize: MAX_RECIENTES }, abierto)
  const { marcarTodasLeidas } = useAccionesNotificacion()

  useEffect(() => {
    if (abierto) refetch()
  }, [abierto, refetch])

  // Anuncia el conteo por lector de pantalla solo cuando cambia (no en cada
  // poll si el número es igual), para el caso de que llegue una notificación
  // mientras el usuario está enfocado en otra parte de la página.
  const anuncioRef = useRef<string>('')
  const [anuncio, setAnuncio] = useState('')
  useEffect(() => {
    if (count > 0) {
      const texto = `Tienes ${count} notificación${count === 1 ? '' : 'es'} nueva${count === 1 ? '' : 's'}`
      if (anuncioRef.current !== texto) {
        anuncioRef.current = texto
        setAnuncio(texto)
      }
    }
  }, [count])

  const ariaLabel = count > 0 ? `Notificaciones, ${count} sin leer` : 'Notificaciones'
  const notificaciones = data?.data ?? []

  const cuerpo = (
    <>
      <EncabezadoPanel
        count={count}
        marcando={marcarTodasLeidas.isPending}
        onMarcarTodas={() => marcarTodasLeidas.mutate()}
      />
      <div className="max-h-[60vh] overflow-y-auto lg:max-h-96">
        <NotificacionesLista
          notificaciones={notificaciones}
          cargando={isLoading}
          rol={rol}
          onNavegar={() => setAbierto(false)}
        />
      </div>
      <div className="border-t border-hairline p-2">
        <Link
          href="/dashboard/notificaciones"
          onClick={() => setAbierto(false)}
          className="block rounded-md px-2 py-1.5 text-center text-caption font-medium text-primary hover:bg-hover"
        >
          Ver todas las notificaciones
        </Link>
      </div>
    </>
  )

  const boton = (
    <Button
      variant="ghost"
      size="icon"
      aria-label={ariaLabel}
      className="relative h-8 w-8"
    >
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary"
        />
      )}
    </Button>
  )

  return (
    <>
      <span aria-live="polite" className="sr-only">
        {anuncio}
      </span>

      {esEscritorio ? (
        <Popover open={abierto} onOpenChange={setAbierto}>
          <PopoverTrigger asChild>{boton}</PopoverTrigger>
          <PopoverContent
            align="end"
            role="region"
            aria-label="Notificaciones"
            className="w-80 p-0"
          >
            {cuerpo}
          </PopoverContent>
        </Popover>
      ) : (
        <Sheet open={abierto} onOpenChange={setAbierto}>
          <SheetTrigger asChild>{boton}</SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] p-0" aria-label="Notificaciones">
            <SheetHeader className="sr-only">
              <SheetTitle>Notificaciones</SheetTitle>
            </SheetHeader>
            {cuerpo}
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
