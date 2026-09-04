'use client'

import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { uploadsApi } from '@/shared/api/uploads.api'
import { ApiError } from '@/shared/api/client'
import { Loader2, ExternalLink, Download, FileWarning } from 'lucide-react'

interface VisorDocumentoDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    solicitudId: string
    documentoId: string
    nombre: string
}

export function VisorDocumentoDialog({
    open,
    onOpenChange,
    solicitudId,
    documentoId,
    nombre,
}: VisorDocumentoDialogProps) {
    const [url, setUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!open) return

        let cancelado = false
        let urlCreada: string | null = null

        uploadsApi
            .descargarArchivo(solicitudId, documentoId)
            .then((blob) => {
                if (cancelado) return
                urlCreada = URL.createObjectURL(blob)
                setUrl(urlCreada)
            })
            .catch((err) => {
                if (cancelado) return
                setError(
                    err instanceof ApiError ? err.message : 'No se pudo abrir el documento',
                )
            })

        return () => {
            cancelado = true
            if (urlCreada) URL.revokeObjectURL(urlCreada)
            setUrl(null)
            setError(null)
        }
    }, [open, solicitudId, documentoId])

    const fase: 'cargando' | 'listo' | 'error' = error
        ? 'error'
        : url
            ? 'listo'
            : 'cargando'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton
                className="flex h-screen w-[95vw] max-w-[95vw] sm:max-w-300 flex-col gap-0 p-0"
            >
                <DialogHeader className="flex-row items-center justify-between gap-3 border-b border-hairline py-3 pl-4 pr-12">
                    <DialogTitle className="truncate pr-8 text-sm font-medium">
                        {nombre}
                    </DialogTitle>
                    <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5"
                            disabled={!url}
                            onClick={() => url && window.open(url, '_blank', 'noopener')}
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Abrir en pestaña</span>
                        </Button>
                        {url ? (
                            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5">
                                <a href={url} download={nombre}>
                                    <Download className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Descargar</span>
                                </a>
                            </Button>
                        ) : (
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 mr-5" disabled>
                                <Download className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Descargar</span>
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <div className="relative flex-1 overflow-hidden rounded-b-lg bg-surface-sunken">
                    {fase === 'cargando' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <p className="text-xs">Cargando documento…</p>
                        </div>
                    )}

                    {fase === 'error' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                            <div className="rounded-2xl bg-danger-surface p-3">
                                <FileWarning className="h-6 w-6 text-danger-ink" />
                            </div>
                            <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                    )}

                    {fase === 'listo' && url && (
                        <iframe src={url} title={nombre} className="h-full w-full border-0" />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
