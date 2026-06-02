'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import type { Solicitud } from '@/shared/lib/types/solicitudes.types'

interface SolicitudEnviarDialogProps {
  solicitud: Solicitud | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmar: (id: string) => Promise<boolean>
}

export function SolicitudEnviarDialog({
  solicitud,
  open,
  onOpenChange,
  onConfirmar,
}: SolicitudEnviarDialogProps) {
  const [procesando, setProcesando] = useState(false)

  const handleConfirmar = async () => {
    if (!solicitud) return
    setProcesando(true)
    const ok = await onConfirmar(solicitud.id)
    setProcesando(false)
    if (ok) onOpenChange(false)
  }

  if (!solicitud) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Send className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle>Enviar solicitud</DialogTitle>
          </div>
          <DialogDescription>
            ¿Estás seguro de que deseas enviar la solicitud del programa{' '}
            <span className="font-medium text-foreground">
              {solicitud.programa.nombre}
            </span>
            ? Una vez enviada no podrás realizar cambios.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={procesando}
          >
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={procesando}>
            {procesando ? 'Enviando...' : 'Sí, enviar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}