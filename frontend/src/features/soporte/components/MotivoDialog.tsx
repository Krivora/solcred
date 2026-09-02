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
import { Textarea } from '@/shared/components/ui/textarea'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  titulo: string
  descripcion: string
  etiquetaConfirmar: string
  destructivo?: boolean
  cargando?: boolean
  onConfirmar: (motivo: string) => void
}

export function MotivoDialog({
  open,
  onOpenChange,
  titulo,
  descripcion,
  etiquetaConfirmar,
  destructivo,
  cargando,
  onConfirmar,
}: Props) {
  const [motivo, setMotivo] = useState('')

  const cerrar = (v: boolean) => {
    if (!v) setMotivo('')
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={cerrar}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">{titulo}</DialogTitle>
          <DialogDescription>{descripcion}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Escribe el motivo…"
          rows={4}
          maxLength={1000}
          autoFocus
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => cerrar(false)} disabled={cargando}>
            Cancelar
          </Button>
          <Button
            variant={destructivo ? 'destructive' : 'default'}
            disabled={motivo.trim().length < 5 || cargando}
            onClick={() => onConfirmar(motivo.trim())}
          >
            {cargando ? 'Guardando…' : etiquetaConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
