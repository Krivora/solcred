'use client'

import * as React from 'react'
import { useState } from 'react'
import { Mail, MessageSquare, MoreHorizontal, Phone, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { cn } from '@/shared/lib/cn'
import {
  MOTIVOS_COMUNICACION,
  RESULTADOS_COMUNICACION,
  TIPOS_COMUNICACION,
} from '@/features/crm/lib/crm.config'
import { useAccionesComunicacion } from '@/features/crm/hooks/useAccionesComunicacion'
import type {
  Comunicacion,
  ComunicacionMotivo,
  ComunicacionResultado,
  ComunicacionTipo,
} from '@/features/crm/types/crm.types'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  solicitudId: string
  /** Si viene, el diálogo edita esa comunicación en lugar de crear una nueva. */
  comunicacion?: Comunicacion | null
}

const MAX_OBS = 4000

const ICONO_TIPO: Record<ComunicacionTipo, React.ElementType> = {
  LLAMADA: Phone,
  CORREO: Mail,
  MENSAJE: MessageSquare,
  PRESENCIAL: Users,
  OTRO: MoreHorizontal,
}

/** Convierte un ISO a `yyyy-MM-ddTHH:mm` para `<input type="datetime-local">`. */
const aLocalInput = (iso: string): string => {
  const d = new Date(iso)
  const off = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - off).toISOString().slice(0, 16)
}

// ── Campo: label + marcador + control ────────────────────────────────────────
function Campo({
  label,
  htmlFor,
  requerido,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  requerido?: boolean
  hint?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1 text-label text-ink select-none"
      >
        {label}
        {requerido ? (
          <span className="text-danger-ink" aria-hidden>
            *
          </span>
        ) : (
          <span className="font-normal text-ink-subtle">· opcional</span>
        )}
      </label>
      {children}
      {hint && <p className="text-caption text-ink-subtle">{hint}</p>}
    </div>
  )
}

export function RegistrarComunicacionDialog({
  open,
  onOpenChange,
  solicitudId,
  comunicacion,
}: Props) {
  const editando = !!comunicacion
  const { registrar, editar } = useAccionesComunicacion(solicitudId)
  const enviando = registrar.isPending || editar.isPending

  // El estado se siembra una vez al montar. El padre remonta el diálogo (via
  // `key`) al alternar entre "nueva" y "editar", así que no hace falta un efecto.
  const [tipo, setTipo] = useState<ComunicacionTipo | ''>(comunicacion?.tipo ?? '')
  const [motivo, setMotivo] = useState<ComunicacionMotivo | ''>(comunicacion?.motivo ?? '')
  const [resultado, setResultado] = useState<ComunicacionResultado | ''>(
    comunicacion?.resultado ?? '',
  )
  const [fechaContacto, setFechaContacto] = useState(
    comunicacion ? aLocalInput(comunicacion.fechaContacto) : '',
  )
  const [ajustarFecha, setAjustarFecha] = useState(editando)
  const [observaciones, setObservaciones] = useState(comunicacion?.observaciones ?? '')

  const puedeEnviar = tipo !== '' && motivo !== '' && resultado !== ''

  const onSubmit = () => {
    if (!puedeEnviar) return
    const fechaIso = fechaContacto ? new Date(fechaContacto).toISOString() : undefined
    const base = {
      tipo,
      motivo,
      resultado,
      observaciones: observaciones.trim() || undefined,
      fechaContacto: fechaIso,
    }

    if (editando && comunicacion) {
      editar.mutate({ id: comunicacion.id, input: base }, { onSuccess: () => onOpenChange(false) })
    } else {
      registrar.mutate({ solicitudId, ...base }, { onSuccess: () => onOpenChange(false) })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!enviando) onOpenChange(v)
      }}
    >
      <DialogContent className="gap-0 p-0 sm:max-w-120">
        <DialogHeader className="px-5 pt-5 pr-12 pb-4">
          <DialogTitle>{editando ? 'Editar comunicación' : 'Registrar comunicación'}</DialogTitle>
          <DialogDescription className="text-body-sm text-ink-muted">
            Qué tipo de contacto fue, por qué y en qué quedó.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[62vh] min-h-0 space-y-4 overflow-y-auto border-t border-hairline px-5 py-5">
          {/* Tipo — chips */}
          <Campo label="Tipo de comunicación" requerido>
            <div className="flex flex-wrap gap-1.5">
              {TIPOS_COMUNICACION.map((o) => {
                const Icon = ICONO_TIPO[o.value]
                const activo = tipo === o.value
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setTipo(o.value)}
                    aria-pressed={activo}
                    className={cn(
                      'inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-body-sm font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                      activo
                        ? 'border-brand bg-brand-surface text-brand-ink'
                        : 'border-hairline text-ink hover:border-line-strong hover:bg-hover',
                    )}
                  >
                    <Icon
                      className={cn('size-3.5 shrink-0', activo ? 'text-brand-ink' : 'text-ink-subtle')}
                    />
                    {o.short}
                  </button>
                )
              })}
            </div>
          </Campo>

          {/* Motivo */}
          <Campo label="Motivo del contacto" htmlFor="crm-motivo" requerido>
            <Select value={motivo} onValueChange={(v) => setMotivo(v as ComunicacionMotivo)}>
              <SelectTrigger id="crm-motivo" className="h-9 w-full">
                <SelectValue placeholder="¿Por qué se contactó al cliente?" />
              </SelectTrigger>
              <SelectContent>
                {MOTIVOS_COMUNICACION.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          {/* Resultado */}
          <Campo label="Resultado" htmlFor="crm-resultado" requerido>
            <Select
              value={resultado}
              onValueChange={(v) => setResultado(v as ComunicacionResultado)}
            >
              <SelectTrigger id="crm-resultado" className="h-9 w-full">
                <SelectValue placeholder="¿En qué quedó la comunicación?" />
              </SelectTrigger>
              <SelectContent>
                {RESULTADOS_COMUNICACION.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          {/* Fecha */}
          <div className="space-y-1.5">
            <span className="flex items-center gap-1 text-label text-ink select-none">
              Fecha y hora del contacto
            </span>
            {ajustarFecha ? (
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  id="crm-fecha"
                  type="datetime-local"
                  value={fechaContacto}
                  max={aLocalInput(new Date().toISOString())}
                  onChange={(e) => setFechaContacto(e.target.value)}
                  className="h-9 w-full sm:w-60"
                />
                <button
                  type="button"
                  className="text-caption font-medium text-brand-ink hover:underline"
                  onClick={() => {
                    setFechaContacto('')
                    setAjustarFecha(false)
                  }}
                >
                  Usar la hora actual
                </button>
              </div>
            ) : (
              <p className="text-body-sm text-ink-muted">
                Se registra con la fecha y hora actuales.{' '}
                <button
                  type="button"
                  className="font-medium text-brand-ink hover:underline"
                  onClick={() => setAjustarFecha(true)}
                >
                  Ajustar
                </button>
              </p>
            )}
          </div>

          {/* Observaciones */}
          <Campo label="Observaciones" htmlFor="crm-obs">
            <Textarea
              id="crm-obs"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value.slice(0, MAX_OBS))}
              placeholder="Qué se conversó, qué se acordó, qué quedó pendiente…"
              className="min-h-24"
            />
            <p className="text-right text-caption text-ink-subtle tabular-nums">
              {observaciones.length}/{MAX_OBS}
            </p>
          </Campo>
        </div>

        <DialogFooter className="mx-0 mb-0 rounded-none">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={enviando}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={!puedeEnviar || enviando}>
            {enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Registrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
