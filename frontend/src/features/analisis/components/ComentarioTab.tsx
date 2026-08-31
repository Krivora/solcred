'use client'

import { useState } from 'react'
import { MessageSquareText } from 'lucide-react'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'

interface Props {
  inicial: string | null
  editable: boolean
  onGuardar: (texto: string) => void
}

export function ComentarioTab({ inicial, editable, onGuardar }: Props) {
  const [texto, setTexto] = useState(inicial ?? '')

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm space-y-2">
      <div className="flex items-center gap-2">
        <MessageSquareText className="h-4 w-4 text-primary" />
        <Label htmlFor="analisis-comentario" className="text-sm font-bold text-primary">
          Comentario del análisis
        </Label>
      </div>
      <p className="text-xs text-muted-foreground">
        Notas y conclusiones del analista sobre el caso. Se guarda automáticamente.
      </p>
      <Textarea
        id="analisis-comentario"
        value={texto}
        disabled={!editable}
        onChange={(e) => {
          setTexto(e.target.value)
          if (editable) onGuardar(e.target.value)
        }}
        placeholder="Escribe aquí tus observaciones…"
        className="min-h-[220px] resize-y text-sm"
      />
    </div>
  )
}
