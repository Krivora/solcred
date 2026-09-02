'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Paperclip, X, LifeBuoy } from 'lucide-react'
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
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  CATEGORIAS_CREACION,
  PRIORIDADES_SUGERIBLES,
  formatearBytes,
} from '@/features/soporte/lib/soporte.config'
import { useCrearTicket } from '@/features/soporte/hooks/useAccionesTicket'
import type { TicketCategoria } from '@/features/soporte/types/soporte.types'

const TIPOS_OK = ['image/png', 'image/jpeg', 'application/pdf']
const MAX_ARCHIVOS = 5
const MAX_BYTES = 10 * 1024 * 1024

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function NuevoTicketDialog({ open, onOpenChange }: Props) {
  const router = useRouter()
  const inputArchivo = useRef<HTMLInputElement>(null)

  const [titulo, setTitulo] = useState('')
  const [categoria, setCategoria] = useState<TicketCategoria | ''>('')
  const [prioridad, setPrioridad] = useState<'BAJA' | 'MEDIA' | 'ALTA'>('MEDIA')
  const [descripcion, setDescripcion] = useState('')
  const [archivos, setArchivos] = useState<File[]>([])
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)

  const reset = () => {
    setTitulo('')
    setCategoria('')
    setPrioridad('MEDIA')
    setDescripcion('')
    setArchivos([])
    setErrorArchivo(null)
  }

  const crear = useCrearTicket((id) => {
    reset()
    onOpenChange(false)
    router.push(`/dashboard/soporte/tickets/${id}`)
  })

  const agregarArchivos = (lista: FileList | null) => {
    if (!lista) return
    setErrorArchivo(null)
    const nuevos: File[] = []
    for (const f of Array.from(lista)) {
      if (!TIPOS_OK.includes(f.type)) {
        setErrorArchivo(`"${f.name}": solo se aceptan PNG, JPEG o PDF`)
        continue
      }
      if (f.size > MAX_BYTES) {
        setErrorArchivo(`"${f.name}": supera los 10 MB`)
        continue
      }
      nuevos.push(f)
    }
    setArchivos((prev) => [...prev, ...nuevos].slice(0, MAX_ARCHIVOS))
  }

  const puedeEnviar =
    titulo.trim().length >= 4 && categoria !== '' && descripcion.trim().length >= 10

  const onSubmit = () => {
    if (categoria === '' || !puedeEnviar) return
    crear.mutate({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      categoria,
      prioridadSugerida: prioridad,
      adjuntos: archivos,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!crear.isPending) onOpenChange(v) }}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
              <LifeBuoy className="size-4 text-primary" />
            </div>
            <DialogTitle className="text-sm font-semibold">Nuevo ticket de soporte</DialogTitle>
          </div>
          <DialogDescription>
            Cuéntanos qué necesitas. Un agente lo revisará y te responderá aquí mismo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="tk-titulo">Título</Label>
            <Input
              id="tk-titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Resume el problema en una frase"
              maxLength={160}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select value={categoria} onValueChange={(v) => setCategoria(v as TicketCategoria)}>
                <SelectTrigger>
                  <SelectValue placeholder="Elige una…" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_CREACION.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categoria !== '' && (
                <p className="text-[11px] text-muted-foreground">
                  {CATEGORIAS_CREACION.find((c) => c.value === categoria)?.ayuda}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Prioridad</Label>
              <Select value={prioridad} onValueChange={(v) => setPrioridad(v as 'BAJA' | 'MEDIA' | 'ALTA')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORIDADES_SUGERIBLES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Un agente la confirma al tomar el ticket.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tk-desc">Descripción</Label>
            <Textarea
              id="tk-desc"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="¿Qué pasó? ¿Qué esperabas que pasara? ¿En qué pantalla?"
              rows={5}
              maxLength={5000}
            />
          </div>

          <div className="space-y-2">
            <Label>Adjuntos <span className="font-normal text-muted-foreground">(opcional — PNG, JPEG o PDF)</span></Label>
            <input
              ref={inputArchivo}
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              multiple
              className="hidden"
              onChange={(e) => { agregarArchivos(e.target.files); e.target.value = '' }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={archivos.length >= MAX_ARCHIVOS}
              onClick={() => inputArchivo.current?.click()}
            >
              <Paperclip className="size-3.5" />
              Agregar archivo
            </Button>
            {errorArchivo && <p className="text-[11px] text-destructive">{errorArchivo}</p>}
            {archivos.length > 0 && (
              <ul className="space-y-1">
                {archivos.map((f, i) => (
                  <li key={i} className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-2.5 py-1.5 text-xs">
                    <span className="truncate">{f.name}</span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      {formatearBytes(f.size)}
                      <button
                        type="button"
                        onClick={() => setArchivos((prev) => prev.filter((_, j) => j !== i))}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Quitar ${f.name}`}
                      >
                        <X className="size-3.5" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={crear.isPending}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={!puedeEnviar || crear.isPending}>
            {crear.isPending ? 'Creando…' : 'Crear ticket'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
