'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
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
import { cn } from '@/shared/lib/cn'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  cargando?: boolean
  onConfirmar: (calificacion: number, comentario?: string) => void
}

export function CalificarDialog({ open, onOpenChange, cargando, onConfirmar }: Props) {
  const [valor, setValor] = useState(0)
  const [hover, setHover] = useState(0)
  const [comentario, setComentario] = useState('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">¿Cómo fue la atención?</DialogTitle>
          <DialogDescription>Tu opinión nos ayuda a mejorar el soporte.</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-1 py-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setValor(n)}
              aria-label={`${n} estrellas`}
            >
              <Star
                className={cn(
                  'size-7 transition-colors',
                  (hover || valor) >= n ? 'fill-warn text-warn' : 'text-ink-subtle/50',
                )}
              />
            </button>
          ))}
        </div>

        <Textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Comentario (opcional)"
          rows={3}
          maxLength={1000}
        />

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={cargando}>
            Ahora no
          </Button>
          <Button
            disabled={valor === 0 || cargando}
            onClick={() => onConfirmar(valor, comentario.trim() || undefined)}
          >
            {cargando ? 'Enviando…' : 'Enviar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
