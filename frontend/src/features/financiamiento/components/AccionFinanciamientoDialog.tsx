'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'

export type AccionFinTipo =
  | 'regresar_aprobacion'
  | 'pasar_asignacion'
  | 'enviar_validacion'
  | 'regresar_analista'
  | 'enviar_comite'
  | 'regresar_validacion'
  | 'aprobar'
  | 'rechazar'
  | 'cancelar'

interface ConfigAccion {
  titulo: string
  descripcion: string
  labelBoton: string
  variante: 'default' | 'destructive'
  requiereMotivo: boolean
}

const CONFIG: Record<AccionFinTipo, ConfigAccion> = {
  regresar_aprobacion: {
    titulo: 'Regresar a Aprobación',
    descripcion: 'La solicitud vuelve al comité de aprobación de Promoción. Indica el motivo.',
    labelBoton: 'Regresar', variante: 'default', requiereMotivo: true,
  },
  pasar_asignacion: {
    titulo: 'Pasar a Asignación',
    descripcion: 'La solicitud pasa a la cola de asignación de analista. Puedes agregar un comentario.',
    labelBoton: 'Pasar', variante: 'default', requiereMotivo: false,
  },
  enviar_validacion: {
    titulo: 'Enviar a Validación',
    descripcion: 'El análisis pasa a validación del supervisor. Puedes agregar un comentario.',
    labelBoton: 'Enviar', variante: 'default', requiereMotivo: false,
  },
  regresar_analista: {
    titulo: 'Regresar al Analista',
    descripcion: 'La solicitud vuelve al analista para ajustar el análisis. Indica el motivo.',
    labelBoton: 'Regresar', variante: 'default', requiereMotivo: true,
  },
  enviar_comite: {
    titulo: 'Enviar al Comité',
    descripcion: 'La solicitud pasa al comité de crédito. Puedes agregar un comentario.',
    labelBoton: 'Enviar', variante: 'default', requiereMotivo: false,
  },
  regresar_validacion: {
    titulo: 'Regresar a Validación',
    descripcion: 'La solicitud vuelve a validación. Indica el motivo.',
    labelBoton: 'Regresar', variante: 'default', requiereMotivo: true,
  },
  aprobar: {
    titulo: 'Aprobar Solicitud',
    descripcion: 'El comité aprueba el crédito. La solicitud queda en estatus APROBADO. Puedes agregar un comentario.',
    labelBoton: 'Aprobar', variante: 'default', requiereMotivo: false,
  },
  rechazar: {
    titulo: 'Rechazar Solicitud',
    descripcion: 'Decisión de crédito negativa. Indica el motivo del rechazo.',
    labelBoton: 'Rechazar', variante: 'destructive', requiereMotivo: true,
  },
  cancelar: {
    titulo: 'Cancelar Solicitud',
    descripcion: 'Esta acción cancela la solicitud. Indica el motivo de la cancelación.',
    labelBoton: 'Cancelar Solicitud', variante: 'destructive', requiereMotivo: true,
  },
}

interface Props {
  open: boolean
  accion: AccionFinTipo | null
  loading: boolean
  onConfirmar: (motivo: string) => void
  onCerrar: () => void
}

export function AccionFinanciamientoDialog({ open, accion, loading, onConfirmar, onCerrar }: Props) {
  const [motivo, setMotivo] = useState('')

  if (!accion) return null
  const config = CONFIG[accion]
  const puedeConfirmar = config.requiereMotivo ? motivo.trim().length > 0 : true

  const cerrar = () => { setMotivo(''); onCerrar() }
  const confirmar = () => { onConfirmar(motivo.trim()); setMotivo('') }

  return (
    <Dialog open={open} onOpenChange={cerrar}>
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
          <Button variant="outline" size="sm" onClick={cerrar} disabled={loading}>
            Cerrar
          </Button>
          <Button
            variant={config.variante}
            size="sm"
            disabled={!puedeConfirmar || loading}
            onClick={confirmar}
          >
            {loading ? 'Procesando...' : config.labelBoton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
