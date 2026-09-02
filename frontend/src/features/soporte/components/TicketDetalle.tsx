'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Play,
  PauseCircle,
  CheckCircle2,
  XCircle,
  UserPlus,
  RotateCcw,
  Lock,
  Star,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { AvatarIniciales } from '@/shared/components/common/AvatarIniciales'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/cn'
import { useAuthStore } from '@/shared/stores/auth.store'
import { useEsSoloLectura } from '@/shared/lib/permisos'
import { useTicketDetalle } from '@/features/soporte/hooks/useSoporteQueries'
import { useAccionesTicket } from '@/features/soporte/hooks/useAccionesTicket'
import type { TicketCategoria, TicketPrioridad } from '@/features/soporte/types/soporte.types'
import { tiempoRelativo } from '@/features/soporte/lib/soporte.config'
import { EstatusBadge, PrioridadBadge, CategoriaBadge } from './SoporteBadges'
import { ConversacionHilo } from './ConversacionHilo'
import { ComposerMensaje } from './ComposerMensaje'
import { PanelLateralTicket } from './PanelLateralTicket'
import { AsignarAgenteSheet } from './AsignarAgenteSheet'
import { MotivoDialog } from './MotivoDialog'
import { CalificarDialog } from './CalificarDialog'

const FINALES = ['CERRADO', 'CANCELADO']

export function TicketDetalle({ id }: { id: string }) {
  const router = useRouter()
  const rol = useAuthStore((s) => s.rol)
  const soloLectura = useEsSoloLectura()
  const { data: ticket, isLoading, isError } = useTicketDetalle(id)
  const acc = useAccionesTicket(id)

  const [sheetAsignar, setSheetAsignar] = useState(false)
  const [dialogReabrir, setDialogReabrir] = useState(false)
  const [dialogCancelar, setDialogCancelar] = useState(false)
  const [dialogCalificar, setDialogCalificar] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !ticket) {
    return (
      <ErrorState
        icon={XCircle}
        title="No se encontró el ticket"
        description="Puede que no exista o que no tengas acceso a él."
        actionHref="/dashboard/soporte/mis-tickets"
        actionLabel="Volver a mis tickets"
      />
    )
  }

  const esAdmin = rol === 'ADMIN'
  const esFinal = FINALES.includes(ticket.estatus)
  // SUPERVISOR: solo actúa si es su propio ticket. ADMIN: siempre. Otros: si es suyo.
  const puedeActuar = ticket.esSolicitante || (esAdmin)
  const puedeComentar = !esFinal && puedeActuar && (!soloLectura || ticket.esSolicitante)
  const mutando =
    acc.comentar.isPending || acc.estatus.isPending || acc.asignar.isPending ||
    acc.prioridad.isPending || acc.categoria.isPending

  // Acciones de agente disponibles según el estatus
  const accionesAgente: { label: string; icon: React.ElementType; estatus: string; variant?: 'default' | 'outline' }[] = []
  if (esAdmin && !esFinal) {
    if (ticket.estatus === 'NUEVO') {
      // Solo "Asignar" (botón aparte)
    } else if (ticket.estatus === 'ASIGNADO') {
      accionesAgente.push({ label: 'Empezar', icon: Play, estatus: 'EN_PROGRESO' })
    } else if (ticket.estatus === 'EN_PROGRESO') {
      accionesAgente.push({ label: 'Pedir información', icon: PauseCircle, estatus: 'ESPERANDO_CLIENTE', variant: 'outline' })
      accionesAgente.push({ label: 'Marcar resuelto', icon: CheckCircle2, estatus: 'RESUELTO' })
    } else if (ticket.estatus === 'ESPERANDO_CLIENTE') {
      accionesAgente.push({ label: 'Retomar', icon: Play, estatus: 'EN_PROGRESO', variant: 'outline' })
      accionesAgente.push({ label: 'Marcar resuelto', icon: CheckCircle2, estatus: 'RESUELTO' })
    }
  }

  const nombreSolicitante = `${ticket.solicitante.nombre} ${ticket.solicitante.apellidoPaterno}`
  const nombreAgente = ticket.agente
    ? `${ticket.agente.usuario.nombre} ${ticket.agente.usuario.apellidoPaterno}`
    : null
  const hayBarraAcciones =
    (puedeActuar && !soloLectura) || (soloLectura && ticket.esSolicitante)

  return (
    <div className="space-y-5">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 h-8 gap-1.5 text-muted-foreground hover:text-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" /> Volver
      </Button>

      {/* Cabecera — tarjeta */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div
          className={cn(
            'h-1 w-full',
            ticket.prioridad === 'URGENTE'
              ? 'bg-destructive'
              : ticket.prioridad === 'ALTA'
                ? 'bg-amber-500/80'
                : ticket.prioridad === 'MEDIA'
                  ? 'bg-sky-500/70'
                  : 'bg-border',
          )}
        />
        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
              {ticket.folio}
            </span>
            <EstatusBadge estatus={ticket.estatus} />
            <PrioridadBadge prioridad={ticket.prioridad} />
            <CategoriaBadge categoria={ticket.categoria} />
            {ticket.reabierto && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                <RotateCcw className="size-3" /> Reabierto
              </span>
            )}
          </div>

          <h1 className="text-lg font-semibold leading-tight tracking-tight text-foreground sm:text-xl">
            {ticket.titulo}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <AvatarIniciales nombre={nombreSolicitante} tamano="xs" />
              <span>
                <span className="text-muted-foreground/70">Solicitante · </span>
                <span className="font-medium text-foreground">{nombreSolicitante}</span>
              </span>
            </span>
            <span className="flex items-center gap-2">
              {nombreAgente ? (
                <>
                  <AvatarIniciales nombre={nombreAgente} tamano="xs" tono="primary" />
                  <span>
                    <span className="text-muted-foreground/70">Agente · </span>
                    <span className="font-medium text-foreground">{nombreAgente}</span>
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground/70">Sin agente asignado</span>
              )}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-muted-foreground/70">Abierto</span> {tiempoRelativo(ticket.creadoEn)}
            </span>
            {typeof ticket.calificacion === 'number' && (
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="size-3.5 fill-current" />
                <span className="font-medium">{ticket.calificacion}/5</span>
              </span>
            )}
          </div>

          {/* Barra de acciones */}
          {hayBarraAcciones && (
            <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
              {esAdmin && !esFinal && (
                <Button
                  size="sm"
                  variant={ticket.estatus === 'NUEVO' ? 'default' : 'outline'}
                  className="gap-1.5"
                  onClick={() => setSheetAsignar(true)}
                >
                  <UserPlus className="size-3.5" />
                  {ticket.agente ? 'Reasignar' : 'Asignar'}
                </Button>
              )}
              {accionesAgente.map((a) => (
                <Button
                  key={a.estatus + a.label}
                  size="sm"
                  variant={a.variant ?? 'default'}
                  className="gap-1.5"
                  disabled={acc.estatus.isPending}
                  onClick={() => acc.estatus.mutate({ estatus: a.estatus })}
                >
                  <a.icon className="size-3.5" />
                  {a.label}
                </Button>
              ))}

              {/* Solicitante / dueño */}
              {ticket.esSolicitante && ticket.estatus === 'RESUELTO' && (
                <Button size="sm" className="gap-1.5" disabled={acc.cerrar.isPending} onClick={() => acc.cerrar.mutate()}>
                  <CheckCircle2 className="size-3.5" /> Cerrar ticket
                </Button>
              )}
              {ticket.esSolicitante && ticket.estatus === 'RESUELTO' && (
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setDialogReabrir(true)}>
                  <RotateCcw className="size-3.5" /> Reabrir
                </Button>
              )}
              {ticket.esSolicitante && ticket.estatus === 'CERRADO' && ticket.calificacion === null && (
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setDialogCalificar(true)}>
                  <Star className="size-3.5" /> Calificar
                </Button>
              )}

              {esAdmin && !esFinal && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => setDialogCancelar(true)}
                >
                  <XCircle className="size-3.5" /> Cancelar
                </Button>
              )}
            </div>
          )}

          {soloLectura && !ticket.esSolicitante && (
            <p className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-700 dark:text-amber-300">
              <Lock className="size-3" /> Modo solo lectura — no puedes actuar sobre este ticket.
            </p>
          )}
        </div>
      </div>

      {/* Cuerpo */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <ConversacionHilo ticket={ticket} />
          {puedeComentar && (
            <ComposerMensaje
              puedeNotaInterna={esAdmin && !ticket.esSolicitante}
              enviando={acc.comentar.isPending}
              onEnviar={(v) => acc.comentar.mutate(v)}
            />
          )}
          {esFinal && (
            <p className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-center text-xs text-muted-foreground">
              Este ticket está {ticket.estatus === 'CERRADO' ? 'cerrado' : 'cancelado'}.
            </p>
          )}
        </div>

        <PanelLateralTicket
          ticket={ticket}
          esStaff={esAdmin}
          mutando={mutando}
          onPrioridad={(p: TicketPrioridad) => acc.prioridad.mutate(p)}
          onCategoria={(c: TicketCategoria) => acc.categoria.mutate(c)}
        />
      </div>

      {/* Diálogos — montaje condicional para que arranquen con estado limpio */}
      {sheetAsignar && (
        <AsignarAgenteSheet
          open
          onOpenChange={setSheetAsignar}
          prioridadActual={ticket.prioridad}
          agenteActualId={ticket.agente?.id}
          yaAsignado={!!ticket.agente}
          asignando={acc.asignar.isPending}
          onConfirmar={(agenteId, prioridad) => {
            acc.asignar.mutate({ agenteId, prioridad }, { onSuccess: () => setSheetAsignar(false) })
          }}
        />
      )}
      {dialogReabrir && (
        <MotivoDialog
          open
          onOpenChange={setDialogReabrir}
          titulo="Reabrir ticket"
          descripcion="Cuéntanos qué sigue pasando para que el agente lo retome."
          etiquetaConfirmar="Reabrir"
          cargando={acc.reabrir.isPending}
          onConfirmar={(motivo) => acc.reabrir.mutate(motivo, { onSuccess: () => setDialogReabrir(false) })}
        />
      )}
      {dialogCancelar && (
        <MotivoDialog
          open
          onOpenChange={setDialogCancelar}
          titulo="Cancelar ticket"
          descripcion="El ticket se cerrará sin resolución. Explica el motivo."
          etiquetaConfirmar="Cancelar ticket"
          destructivo
          cargando={acc.cancelar.isPending}
          onConfirmar={(motivo) => acc.cancelar.mutate(motivo, { onSuccess: () => setDialogCancelar(false) })}
        />
      )}
      {dialogCalificar && (
        <CalificarDialog
          open
          onOpenChange={setDialogCalificar}
          cargando={acc.calificar.isPending}
          onConfirmar={(calificacion, comentario) =>
            acc.calificar.mutate({ calificacion, comentario }, { onSuccess: () => setDialogCalificar(false) })
          }
        />
      )}
    </div>
  )
}
