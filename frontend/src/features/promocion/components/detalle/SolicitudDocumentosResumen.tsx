// SolicitudDocumentosResumen.tsx
import { Card } from '@/shared/components/ui/card'
import { FileCheck, FileClock, FileX, CircleDashed } from 'lucide-react'
import { formatFecha } from '@/shared/config/solicitudes.config'
import type { DocumentoDetalle } from '@/shared/lib/types/solicitudes.types'

interface DocumentoRequerido {
    id: string
    tipoDocumento: {
        id: string
        nombre: string
    }
}

interface Props {
    documentos: DocumentoDetalle[]
    documentosRequeridos: DocumentoRequerido[]
}

function EstatusIcon({ estatus }: { estatus: DocumentoDetalle['estatus'] }) {
    if (estatus === 'APROBADO') return <FileCheck className="h-3.5 w-3.5 text-primary" />
    if (estatus === 'RECHAZADO') return <FileX className="h-3.5 w-3.5 text-destructive" />
    return <FileClock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
}

function estatusClass(estatus: DocumentoDetalle['estatus']) {
    if (estatus === 'APROBADO') return 'bg-primary/10 text-primary border-primary/20'
    if (estatus === 'RECHAZADO') return 'bg-destructive/10 text-destructive border-destructive/20'
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
}

export function SolicitudDocumentosResumen({ documentos, documentosRequeridos }: Props) {
    const tiposSubidosIds = new Set(documentos.map((d) => d.tipoDocumento.id))
    const faltantes = documentosRequeridos.filter(
        (req) => !tiposSubidosIds.has(req.tipoDocumento.id)
    )

    const totalRequeridos = documentosRequeridos.length
    const aprobados = documentos.filter((d) => d.estatus === 'APROBADO').length
    const rechazados = documentos.filter((d) => d.estatus === 'RECHAZADO').length
    const pendientes = documentos.length - aprobados - rechazados
    const faltantesCount = faltantes.length

    return (
        <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground">
                    Documentos
                </h2>
                {totalRequeridos > 0 && (
                    <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                        {aprobados}/{totalRequeridos} completos
                    </span>
                )}
            </div>

            {totalRequeridos > 0 && (
                <div className="mb-5">
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden flex gap-[1px]">
                        {aprobados > 0 && (
                            <div className="h-full bg-primary" style={{ width: `${(aprobados / totalRequeridos) * 100}%` }} />
                        )}
                        {rechazados > 0 && (
                            <div className="h-full bg-destructive" style={{ width: `${(rechazados / totalRequeridos) * 100}%` }} />
                        )}
                        {pendientes > 0 && (
                            <div className="h-full bg-amber-500" style={{ width: `${(pendientes / totalRequeridos) * 100}%` }} />
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                        {aprobados > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                {aprobados} aprobado{aprobados !== 1 && 's'}
                            </span>
                        )}
                        {pendientes > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                {pendientes} en revisión
                            </span>
                        )}
                        {rechazados > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                                {rechazados} rechazado{rechazados !== 1 && 's'}
                            </span>
                        )}
                        {faltantesCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <span className="h-1.5 w-1.5 rounded-full border border-muted-foreground/40" />
                                {faltantesCount} pendiente{faltantesCount !== 1 && 's'} de subir
                            </span>
                        )}
                    </div>
                </div>
            )}

            {totalRequeridos === 0 ? (
                <p className="text-xs text-muted-foreground/60 text-center py-6">
                    Este programa no tiene documentos requeridos
                </p>
            ) : (
                <div className="flex flex-col gap-4">
                    {documentos.length > 0 && (
                        <div className="flex flex-col divide-y divide-border/40">
                            {documentos.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 rounded-md -mx-2 px-2 transition-colors hover:bg-muted/40"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <EstatusIcon estatus={doc.estatus} />
                                        <div className="flex flex-col gap-0 min-w-0">
                                            <span className="text-xs font-medium text-foreground truncate">
                                                {doc.tipoDocumento.nombre}
                                                {doc.version > 1 && (
                                                    <span className="text-muted-foreground font-normal"> · v{doc.version}</span>
                                                )}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                Subido {formatFecha(doc.subidoEn)}
                                                {doc.validadoPor && ` · Validado por ${doc.validadoPor.nombre} ${doc.validadoPor.apellidoPaterno}`}
                                            </span>
                                            {doc.estatus === 'RECHAZADO' && doc.motivoRechazo && (
                                                <span className="text-[11px] text-destructive mt-0.5">
                                                    Motivo: {doc.motivoRechazo}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`shrink-0 inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border ${estatusClass(doc.estatus)}`}>
                                        {doc.estatus}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {faltantes.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            {documentos.length > 0 && (
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 mb-1">
                                    Documentos por subir
                                </p>
                            )}
                            {faltantes.map((req) => (
                                <div
                                    key={req.id}
                                    className="flex items-center gap-2.5 py-2 px-2 rounded-md border border-dashed border-border/70"
                                >
                                    <CircleDashed className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                                    <span className="text-xs font-medium text-muted-foreground/80 truncate">
                                        {req.tipoDocumento.nombre}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Card>
    )
}