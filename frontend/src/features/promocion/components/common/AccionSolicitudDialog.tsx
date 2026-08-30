'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'

export type AccionTipo =
  | 'devolver'
  | 'regresar_promotor'
  | 'aprobacion'
  | 'financiamiento'
  | 'cancelar'

interface ConfigAccion {
  titulo: string
  descripcion: string
  labelBoton: string
  variante: 'default' | 'destructive'
  requiereMotivo: boolean
}

const CONFIG: Record<AccionTipo, ConfigAccion> = {
  devolver: {
    titulo: 'Devolver al Solicitante',
    descripcion: 'Indica el motivo por el cual se regresa la solicitud para correcciones.',
    labelBoton: 'Devolver',
    variante: 'default',
    requiereMotivo: true,
  },
  regresar_promotor: {
    titulo: 'Regresar al Promotor',
    descripcion: 'Indica el motivo por el cual se regresa la solicitud al promotor.',
    labelBoton: 'Regresar',
    variante: 'default',
    requiereMotivo: true,
  },
  aprobacion: {
    titulo: 'Enviar a Aprobación',
    descripcion: 'La solicitud será enviada al responsable de promocion. Puedes agregar un comentario opcional.',
    labelBoton: 'Enviar',
    variante: 'default',
    requiereMotivo: false,
  },
  financiamiento: {
    titulo: 'Enviar a Financiamiento',
    descripcion: 'La solicitud será enviada al area de financiamiento. Puedes agregar un comentario opcional.',
    labelBoton: 'Enviar',
    variante: 'default',
    requiereMotivo: false,
  },
  cancelar: {
    titulo: 'Cancelar Solicitud',
    descripcion: 'Esta acción cancelará la solicitud. Indica el motivo de la cancelación.',
    labelBoton: 'Cancelar Solicitud',
    variante: 'destructive',
    requiereMotivo: true,
  },
}

interface Props {
  open: boolean
  accion: AccionTipo | null
  loading: boolean
  onConfirmar: (motivo: string) => void
  onCerrar: () => void
}

export function AccionSolicitudDialog({ open, accion, loading, onConfirmar, onCerrar }: Props) {
  const [motivo, setMotivo] = useState('')

  if (!accion) return null

  const config = CONFIG[accion]
  const puedeConfirmar = config.requiereMotivo ? motivo.trim().length > 0 : true

  const handleConfirmar = () => {
    onConfirmar(motivo.trim())
    setMotivo('')
  }

  const handleCerrar = () => {
    setMotivo('')
    onCerrar()
  }

  return (
    <Dialog open={open} onOpenChange={handleCerrar}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{config.titulo}</DialogTitle>
          <DialogDescription>{config.descripcion}</DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Label className="text-xs font-medium text-foreground mb-2 block">
            {config.requiereMotivo ? 'Motivo *' : 'Comentario (opcional)'}
          </Label>
          <Textarea
            placeholder={config.requiereMotivo ? 'Escribe el motivo...' : 'Agrega un comentario si lo deseas...'}
            className="resize-none text-sm min-h-[100px]"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
          />
          {config.requiereMotivo && motivo.trim().length === 0 && (
            <p className="text-[11px] text-muted-foreground mt-1.5">* Este campo es requerido</p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={handleCerrar} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant={config.variante}
            size="sm"
            disabled={!puedeConfirmar || loading}
            onClick={handleConfirmar}
          >
            {loading ? 'Procesando...' : config.labelBoton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}