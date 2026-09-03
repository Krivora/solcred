'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
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

/** Convierte un ISO a `yyyy-MM-ddTHH:mm` para `<input type="datetime-local">`. */
const aLocalInput = (iso: string): string => {
  const d = new Date(iso)
  const off = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - off).toISOString().slice(0, 16)
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

  // El estado se siembra una vez al montar. El padre remonta el diálogo
  // (via `key`) al alternar entre "nueva" y "editar", así que no hace falta
  // sincronizar con un efecto.
  const [tipo, setTipo] = useState<ComunicacionTipo | ''>(comunicacion?.tipo ?? '')
  const [motivo, setMotivo] = useState<ComunicacionMotivo | ''>(comunicacion?.motivo ?? '')
  const [resultado, setResultado] = useState<ComunicacionResultado | ''>(
    comunicacion?.resultado ?? '',
  )
  const [fechaContacto, setFechaContacto] = useState(
    comunicacion ? aLocalInput(comunicacion.fechaContacto) : '',
  )
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
      editar.mutate(
        { id: comunicacion.id, input: base },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      registrar.mutate(
        { solicitudId, ...base },
        { onSuccess: () => onOpenChange(false) },
      )
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!enviando) onOpenChange(v)
      }}
    >
      <DialogContent className="sm:max-w-140">
        <DialogHeader>
          <DialogTitle className="text-heading">
            {editando ? 'Editar comunicación' : 'Registrar comunicación'}
          </DialogTitle>
          <DialogDescription className="text-body-sm">
            Deja constancia del contacto con el cliente: qué tipo fue, por qué y en qué quedó.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Tipo de comunicación</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as ComunicacionTipo)}>
                <SelectTrigger>
                  <SelectValue placeholder="Elige una…" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_COMUNICACION.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="crm-fecha">Fecha y hora</Label>
              <Input
                id="crm-fecha"
                type="datetime-local"
                value={fechaContacto}
                max={aLocalInput(new Date().toISOString())}
                onChange={(e) => setFechaContacto(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Si lo dejas vacío se usa el momento actual.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Motivo</Label>
            <Select value={motivo} onValueChange={(v) => setMotivo(v as ComunicacionMotivo)}>
              <SelectTrigger>
                <SelectValue placeholder="Elige un motivo…" />
              </SelectTrigger>
              <SelectContent>
                {MOTIVOS_COMUNICACION.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Resultado</Label>
            <Select
              value={resultado}
              onValueChange={(v) => setResultado(v as ComunicacionResultado)}
            >
              <SelectTrigger>
                <SelectValue placeholder="¿En qué quedó?" />
              </SelectTrigger>
              <SelectContent>
                {RESULTADOS_COMUNICACION.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="crm-obs">
              Observaciones <span className="font-normal text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="crm-obs"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Qué se conversó, qué se acordó, qué quedó pendiente…"
              rows={4}
              maxLength={4000}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={enviando}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={!puedeEnviar || enviando}>
            {enviando
              ? 'Guardando…'
              : editando
                ? 'Guardar cambios'
                : 'Registrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
