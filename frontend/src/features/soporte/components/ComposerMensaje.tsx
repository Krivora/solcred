'use client'

import { useRef, useState } from 'react'
import { Paperclip, Send, X, Lock } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { Switch } from '@/shared/components/ui/switch'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/lib/cn'
import { formatearBytes } from '@/features/soporte/lib/soporte.config'

const TIPOS_OK = ['image/png', 'image/jpeg', 'application/pdf']
const MAX_BYTES = 10 * 1024 * 1024

interface Props {
  puedeNotaInterna: boolean
  enviando: boolean
  onEnviar: (v: { cuerpo: string; esNotaInterna: boolean; archivos: File[] }) => void
}

export function ComposerMensaje({ puedeNotaInterna, enviando, onEnviar }: Props) {
  const inputArchivo = useRef<HTMLInputElement>(null)
  const [cuerpo, setCuerpo] = useState('')
  const [notaInterna, setNotaInterna] = useState(false)
  const [archivos, setArchivos] = useState<File[]>([])

  const agregar = (lista: FileList | null) => {
    if (!lista) return
    const nuevos = Array.from(lista).filter(
      (f) => TIPOS_OK.includes(f.type) && f.size <= MAX_BYTES,
    )
    setArchivos((prev) => [...prev, ...nuevos].slice(0, 5))
  }

  const enviar = () => {
    if (!cuerpo.trim() || enviando) return
    onEnviar({ cuerpo: cuerpo.trim(), esNotaInterna: notaInterna, archivos })
    setCuerpo('')
    setArchivos([])
    setNotaInterna(false)
  }

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-3',
        notaInterna ? 'border-warn/30 bg-warn-surface/40' : 'border-hairline',
      )}
    >
      <Textarea
        value={cuerpo}
        onChange={(e) => setCuerpo(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') enviar()
        }}
        placeholder={notaInterna ? 'Nota interna — no la ve el solicitante…' : 'Escribe tu respuesta…'}
        rows={3}
        maxLength={5000}
        className="resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
      />

      {archivos.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {archivos.map((f, i) => (
            <li key={i} className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 px-2 py-1 text-[11px]">
              <span className="max-w-[140px] truncate">{f.name}</span>
              <span className="text-muted-foreground">{formatearBytes(f.size)}</span>
              <button type="button" onClick={() => setArchivos((p) => p.filter((_, j) => j !== i))} aria-label="Quitar">
                <X className="size-3 text-muted-foreground hover:text-destructive" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex items-center justify-between gap-3 border-t border-border/40 pt-2">
        <div className="flex items-center gap-3">
          <input
            ref={inputArchivo}
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            multiple
            className="hidden"
            onChange={(e) => { agregar(e.target.files); e.target.value = '' }}
          />
          <button
            type="button"
            onClick={() => inputArchivo.current?.click()}
            disabled={archivos.length >= 5}
            className="text-muted-foreground hover:text-foreground disabled:opacity-40"
            aria-label="Adjuntar archivo"
          >
            <Paperclip className="size-4" />
          </button>
          {puedeNotaInterna && (
            <Label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground">
              <Switch checked={notaInterna} onCheckedChange={setNotaInterna} />
              <Lock className="size-3" />
              Nota interna
            </Label>
          )}
        </div>
        <Button size="sm" className="gap-1.5" onClick={enviar} disabled={!cuerpo.trim() || enviando}>
          <Send className="size-3.5" />
          {enviando ? 'Enviando…' : notaInterna ? 'Guardar nota' : 'Responder'}
        </Button>
      </div>
    </div>
  )
}
