// SolicitudDocumentosResumen.tsx
import { Card } from '@/shared/components/ui/card'
import { FileCheck, FileClock, FileX } from 'lucide-react'
import { formatFecha } from '@/shared/config/solicitudes.config'
import type { DocumentoDetalle } from '@/shared/lib/types/solicitudes.types'

interface Props {
    documentos: DocumentoDetalle[]
}

function EstatusIcon({ estatus }: { estatus: DocumentoDetalle['estatus'] }) {
    if (estatus === 'APROBADO') return <FileCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
    if (estatus === 'RECHAZADO') return <FileX className="h-3.5 w-3.5 text-destructive" />
    return <FileClock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
}

function estatusClass(estatus: DocumentoDetalle['estatus']) {
    if (estatus === 'APROBADO') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    if (estatus === 'RECHAZADO') return 'bg-destructive/10 text-destructive border-destructive/20'
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
}

export function SolicitudDocumentosResumen({ documentos }: Props) {
    const total = documentos.length
    const aprobados = documentos.filter((d) => d.estatus === 'APROBADO').length
    const rechazados = documentos.filter((d) => d.estatus === 'RECHAZADO').length
    const pendientes = total - aprobados - rechazados
    const pct = total > 0 ? Math.round((aprobados / total) * 100) : 0

    return (
        <Card className="p-5">
            <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold text-foreground">
                    Documentos ({total})
                </h2>
                {total > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                        {aprobados} de {total} aprobados
                    </span>
                )}
            </div>

            {total > 0 && (
                <div className="mb-4">
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden flex">
                        {aprobados > 0 && (
                            <div className="h-full bg-emerald-500" style={{ width: `${(aprobados / total) * 100}%` }} />
                        )}
                        {rechazados > 0 && (
                            <div className="h-full bg-destructive" style={{ width: `${(rechazados / total) * 100}%` }} />
                        )}
                        {pendientes > 0 && (
                            <div className="h-full bg-amber-500" style={{ width: `${(pendientes / total) * 100}%` }} />
                        )}
                    </div>
                </div>
            )}

            {total === 0 ? (
                <p className="text-xs text-muted-foreground/60 text-center py-6">
                    Aún no se han subido documentos
                </p>
            ) : (
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
        </Card>
    )
}