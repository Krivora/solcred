'use client'

import { useEffect, useState } from 'react'
import { FileText, ImageOff, Loader2, Download } from 'lucide-react'
import { soporteApi } from '@/features/soporte/api/soporte.api'
import { formatearBytes } from '@/features/soporte/lib/soporte.config'
import type { AdjuntoResumen } from '@/features/soporte/types/soporte.types'

/** Descarga el adjunto autenticado y devuelve un object URL (revocado al desmontar). */
function useAdjuntoBlob(ticketId: string, adjuntoId: string, activo: boolean) {
  const [url, setUrl] = useState<string | null>(null)
  const [estado, setEstado] = useState<'cargando' | 'error' | 'listo'>('cargando')

  useEffect(() => {
    if (!activo || url) return
    let revocar: string | null = null
    let vivo = true
    soporteApi
      .descargarAdjunto(ticketId, adjuntoId)
      .then((blob) => {
        if (!vivo) return
        revocar = URL.createObjectURL(blob as Blob)
        setUrl(revocar)
        setEstado('listo')
      })
      .catch(() => {
        if (vivo) setEstado('error')
      })
    return () => {
      vivo = false
      if (revocar) URL.revokeObjectURL(revocar)
    }
  }, [ticketId, adjuntoId, activo, url])

  return { url, estado }
}

export function AdjuntoView({ ticketId, adjunto }: { ticketId: string; adjunto: AdjuntoResumen }) {
  const esImagen = adjunto.tipoMime.startsWith('image/')
  const { url, estado } = useAdjuntoBlob(ticketId, adjunto.id, esImagen)

  if (esImagen) {
    return (
      <a
        href={url ?? undefined}
        target="_blank"
        rel="noreferrer"
        className="group relative block size-24 overflow-hidden rounded-md border border-border/60 bg-muted"
        title={adjunto.nombreOriginal}
      >
        {estado === 'listo' && url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={adjunto.nombreOriginal} className="size-full object-cover" />
        ) : estado === 'error' ? (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-5" />
          </span>
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
          </span>
        )}
      </a>
    )
  }

  return (
    <a
      href={soporteApi.urlAdjunto(ticketId, adjunto.id)}
      target="_blank"
      rel="noreferrer"
      onClick={async (e) => {
        // Abre el PDF autenticado en una pestaña nueva vía blob.
        e.preventDefault()
        try {
          const blob = await soporteApi.descargarAdjunto(ticketId, adjunto.id)
          window.open(URL.createObjectURL(blob as Blob), '_blank', 'noopener')
        } catch {
          /* toast lo maneja apiAuth si es 401; otros errores: silencио */
        }
      }}
      className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-2.5 py-1.5 text-xs hover:bg-muted"
    >
      <FileText className="size-3.5 text-muted-foreground" />
      <span className="max-w-[180px] truncate">{adjunto.nombreOriginal}</span>
      <span className="text-muted-foreground">{formatearBytes(adjunto.tamanoBytes)}</span>
      <Download className="size-3 text-muted-foreground" />
    </a>
  )
}
