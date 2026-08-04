'use client'

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/shared/components/ui/sheet'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { EstatusDocumentoBadge } from './Estatusdocumentobadge'
import { FileText, Clock, User, ExternalLink } from 'lucide-react'
import type { DocumentoConValidacionRaw } from '@/shared/lib/types/expediente.types'

interface HistorialDocumentoSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tipoNombre: string
    historial: DocumentoConValidacionRaw[]
    loading: boolean
}

const formatFecha = (fecha: string) =>
    new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(fecha))

export const HistorialDocumentoSheet = ({
    open,
    onOpenChange,
    tipoNombre,
    historial,
    loading,
}: HistorialDocumentoSheetProps) => {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader className="pb-4">
                    <SheetTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Historial de versiones
                    </SheetTitle>
                    <SheetDescription>{tipoNombre}</SheetDescription>
                </SheetHeader>

                {loading ? (
                    <div className="space-y-4 pt-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-2 p-4 rounded-lg border">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3 pt-4">
                        {historial.map((doc, index) => (
                            <div
                                key={doc.id}
                                className={`relative p-4 rounded-lg border transition-colors ${doc.activo
                                        ? 'border-primary/30 bg-primary/5'
                                        : 'border-border bg-muted/30'
                                    }`}
                            >
                                {/* Versión + activo badge */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-mono text-xs">
                                            v{doc.version}
                                        </Badge>
                                        {doc.activo && (
                                            <Badge className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                                                Actual
                                            </Badge>
                                        )}
                                    </div>
                                    <EstatusDocumentoBadge estatus={doc.estatus} />
                                </div>

                                {/* Nombre del archivo */}
                                <a
                                    href={doc.urlArchivo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mb-3"
                                >
                                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{doc.nombreArchivo}</span>
                                </a>

                                {/* Fechas */}
                                <div className="space-y-1.5 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3 w-3 shrink-0" />
                                        <span>Subido: {formatFecha(doc.subidoEn)}</span>
                                    </div>

                                    {doc.fechaValidacion && doc.validadoPor && (
                                        <div className="flex items-center gap-1.5">
                                            <User className="h-3 w-3 shrink-0" />
                                            <span>
                                                {doc.estatus === 'APROBADO' ? 'Aprobado' : 'Revisado'} por{' '}
                                                {doc.validadoPor.usuario.nombre} {doc.validadoPor.usuario.apellidoPaterno} —{' '}
                                                {formatFecha(doc.fechaValidacion)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Motivo de rechazo */}
                                {doc.estatus === 'RECHAZADO' && doc.motivoRechazo && (
                                    <div className="mt-3 p-2.5 rounded-md bg-red-50 border border-red-100">
                                        <p className="text-xs font-medium text-red-700 mb-0.5">Motivo de rechazo</p>
                                        <p className="text-xs text-red-600">{doc.motivoRechazo}</p>
                                    </div>
                                )}

                                {/* Línea conectora entre versiones */}
                                {index < historial.length - 1 && (
                                    <div className="absolute -bottom-3 left-6 w-px h-3 bg-border" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}