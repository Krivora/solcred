'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/ui/table'
import { EstatusDocumentoBadge } from './EstatusDocumentoBadge'
import { ValidarDocumentoDialog } from './ValidarDocumentoDialog'
import {
    XCircle,
    ExternalLink,
    History,
    FileX,
    ShieldCheck,
    ThumbsUp,
    ThumbsDown,
    Upload,
    Loader2,
} from 'lucide-react'
import type {
    ResumenDocumento,
    ValidarDocumentoDto,
} from '@/features/expediente/types/expediente.types'
import { uploadsApi } from '@/shared/api/uploads.api'
import { ApiError } from '@/shared/api/client'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface TablaDocumentosProps {
    solicitudId: string
    documentos: ResumenDocumento[]
    validando: string | null
    subiendo: boolean
    rolUsuario: string
    gestorAsignadoId: string | null
    usuarioId: string
    onValidar: (documentoId: string, dto: ValidarDocumentoDto) => Promise<void>
    onSubir: (tipoDocumentoId: string, archivo: File) => Promise<any>
    onVerHistorial: (tipoDocumentoId: string, nombre: string) => void
}

interface DialogState {
    open: boolean
    documentoId: string
    nombreDocumento: string
    accion: 'APROBADO' | 'RECHAZADO'
}

const DIALOG_INICIAL: DialogState = {
    open: false,
    documentoId: '',
    nombreDocumento: '',
    accion: 'APROBADO',
}

const accentColor: Record<string, string> = {
    APROBADO: 'bg-emerald-400',
    PENDIENTE: 'bg-amber-400',
    RECHAZADO: 'bg-red-400',
    NO_SUBIDO: 'bg-border',
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componentes compartidos (usados en card y tabla)
// ─────────────────────────────────────────────────────────────────────────────

function MotivoRechazo({ motivo }: { motivo: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 max-w-full sm:max-w-45 cursor-help group">
                    <XCircle className="h-3 w-3 shrink-0 text-red-400" />
                    <p className="text-xs text-red-600 truncate group-hover:underline decoration-dashed underline-offset-2">
                        {motivo}
                    </p>
                </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-65 text-xs">
                {motivo}
            </TooltipContent>
        </Tooltip>
    )
}

function CeldaArchivo({
    solicitudId,
    documentoId,
    nombre,
}: {
    solicitudId: string
    documentoId: string
    nombre: string
}) {
    const [cargando, setCargando] = useState(false)

    const handleClick = async () => {
        setCargando(true)
        try {
            const blob = await uploadsApi.descargarArchivo(solicitudId, documentoId)
            const url = URL.createObjectURL(blob)
            const nuevaVentana = window.open(url, '_blank')

            if (!nuevaVentana) {
                URL.revokeObjectURL(url)
                return
            }

            const intervalo = setInterval(() => {
                if (nuevaVentana.closed) {
                    URL.revokeObjectURL(url)
                    clearInterval(intervalo)
                }
            }, 2000)
        } catch (err) {
            const msg = err instanceof ApiError ? err.message : 'No se pudo abrir el documento'
            console.error(msg)
        } finally {
            setCargando(false)
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={cargando}
            className="inline-flex items-center gap-1.5 max-w-full sm:max-w-50 text-xs text-primary font-medium hover:underline underline-offset-2 transition-opacity hover:opacity-80 disabled:opacity-50"
        >
            {cargando
                ? <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                : <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
            }
            <span className="truncate">{nombre}</span>
        </button>
    )
}

function BotonesValidacion({
    documentoId,
    nombreDocumento,
    cargando,
    onAbrir,
    size = 'sm',
}: {
    documentoId: string
    nombreDocumento: string
    cargando: boolean
    onAbrir: (id: string, nombre: string, accion: 'APROBADO' | 'RECHAZADO') => void
    size?: 'sm' | 'default'
}) {
    const dim = size === 'default' ? 'h-9 w-9' : 'h-7 w-7'
    const icon = size === 'default' ? 'h-4 w-4' : 'h-3.5 w-3.5'

    return (
        <div className="flex items-center gap-1.5">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="sm"
                        variant="outline"
                        className={`${dim} p-0 rounded-lg border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all`}
                        disabled={cargando}
                        onClick={() => onAbrir(documentoId, nombreDocumento, 'APROBADO')}
                        aria-label={`Aprobar ${nombreDocumento}`}
                    >
                        <ThumbsUp className={icon} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Aprobar</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="sm"
                        variant="outline"
                        className={`${dim} p-0 rounded-lg border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all`}
                        disabled={cargando}
                        onClick={() => onAbrir(documentoId, nombreDocumento, 'RECHAZADO')}
                        aria-label={`Rechazar ${nombreDocumento}`}
                    >
                        <ThumbsDown className={icon} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Rechazar</TooltipContent>
            </Tooltip>
        </div>
    )
}

function BotonSubir({
    tipoDocumentoId,
    cargando,
    onArchivo,
    size = 'sm',
}: {
    tipoDocumentoId: string
    cargando: boolean
    onArchivo: (tipoDocumentoId: string, file: File) => void
    size?: 'sm' | 'default'
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const dim = size === 'default' ? 'h-9 w-9' : 'h-7 w-7'
    const icon = size === 'default' ? 'h-4 w-4' : 'h-3.5 w-3.5'

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) onArchivo(tipoDocumentoId, file)
        e.target.value = ''
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleChange}
                aria-hidden
            />
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="sm"
                        variant="outline"
                        className={`${dim} p-0 rounded-lg border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all`}
                        disabled={cargando}
                        onClick={() => inputRef.current?.click()}
                        aria-label="Subir documento"
                    >
                        {cargando
                            ? <Loader2 className={`${icon} animate-spin`} />
                            : <Upload className={icon} />
                        }
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{cargando ? 'Subiendo...' : 'Subir archivo'}</TooltipContent>
            </Tooltip>
        </>
    )
}

function TipoBadge({ esObligatorio }: { esObligatorio: boolean }) {
    return esObligatorio ? (
        <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-4 text-red-600 border-red-200 bg-red-50 shrink-0"
        >
            Requerido
        </Badge>
    ) : (
        <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-4 text-slate-400 border-slate-200 bg-slate-50 shrink-0"
        >
            Opcional
        </Badge>
    )
}

function VacioState() {
    return (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="rounded-2xl bg-muted p-4">
                <ShieldCheck className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                    Sin documentos requeridos
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                    Este programa no tiene documentos configurados.
                </p>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Vista MOBILE: card por documento (< md)
// ─────────────────────────────────────────────────────────────────────────────

interface FilaDocProps {
    solicitudId: string
    doc: ResumenDocumento
    puedeSubir: boolean
    puedeValidar: boolean
    subiendo: boolean
    validandoId: string | null
    onArchivo: (tipoDocumentoId: string, file: File) => void
    onAbrirDialog: (documentoId: string, nombreDocumento: string, accion: 'APROBADO' | 'RECHAZADO') => void
    onVerHistorial: (tipoDocumentoId: string, nombre: string) => void
}

function DocumentoCard({
    solicitudId,
    doc,
    puedeSubir,
    puedeValidar,
    subiendo,
    validandoId,
    onArchivo,
    onAbrirDialog,
    onVerHistorial,
}: FilaDocProps) {
    const { tipoDocumento, documentoActivo, estatus, esObligatorio } = doc
    const esPendiente = estatus === 'PENDIENTE'
    const esValidable = puedeValidar && esPendiente && !!documentoActivo
    const tieneHistorial = estatus !== 'NO_SUBIDO'
    const colorAccent = accentColor[estatus] ?? accentColor['NO_SUBIDO']
    const puedeSubirEsteDoc = puedeSubir && estatus !== 'APROBADO'

    return (
        <div className="relative rounded-lg border border-border bg-card overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-0.75 ${colorAccent}`} />
            <div className="pl-4 pr-3 py-3.5 space-y-3">
                {/* Título + badges */}
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-foreground leading-snug">
                                {tipoDocumento.nombre}
                            </span>
                            <TipoBadge esObligatorio={esObligatorio} />
                        </div>
                        {tipoDocumento.descripcion && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {tipoDocumento.descripcion}
                            </p>
                        )}
                    </div>
                    <EstatusDocumentoBadge estatus={estatus} />
                </div>

                {/* Archivo + versión */}
                <div className="flex items-center justify-between gap-2">
                    {documentoActivo ? (
                        <CeldaArchivo
                            solicitudId={solicitudId}
                            documentoId={documentoActivo.id}
                            nombre={documentoActivo.nombreArchivo}
                        />
                    ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground/60">
                            <FileX className="h-3.5 w-3.5" />
                            <span className="text-xs">Sin archivo</span>
                        </div>
                    )}
                    {documentoActivo && (
                        <Badge
                            variant="outline"
                            className="font-mono text-[11px] px-2 h-5 text-muted-foreground shrink-0"
                        >
                            v{documentoActivo.version}
                        </Badge>
                    )}
                </div>

                {/* Observación */}
                {documentoActivo?.motivoRechazo && (
                    <MotivoRechazo motivo={documentoActivo.motivoRechazo} />
                )}

                {/* Acciones */}
                <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-border/60">
                    {puedeSubirEsteDoc && (
                        <BotonSubir
                            tipoDocumentoId={tipoDocumento.id}
                            cargando={subiendo}
                            onArchivo={onArchivo}
                            size="default"
                        />
                    )}
                    {esValidable && (
                        <BotonesValidacion
                            documentoId={documentoActivo!.id}
                            nombreDocumento={tipoDocumento.nombre}
                            cargando={validandoId === documentoActivo!.id}
                            onAbrir={onAbrirDialog}
                            size="default"
                        />
                    )}
                    {tieneHistorial && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-9 w-9 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                                    onClick={() => onVerHistorial(tipoDocumento.id, tipoDocumento.nombre)}
                                    aria-label={`Ver historial de ${tipoDocumento.nombre}`}
                                >
                                    <History className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver historial</TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>
        </div>
    )
}

function DocumentosListaMobile({
    solicitudId,
    documentos,
    puedeSubir,
    puedeValidar,
    subiendo,
    validandoId,
    onArchivo,
    onAbrirDialog,
    onVerHistorial,
}: {
    solicitudId: string
    documentos: ResumenDocumento[]
    puedeSubir: boolean
    puedeValidar: boolean
    subiendo: boolean
    validandoId: string | null
    onArchivo: (tipoDocumentoId: string, file: File) => void
    onAbrirDialog: (documentoId: string, nombreDocumento: string, accion: 'APROBADO' | 'RECHAZADO') => void
    onVerHistorial: (tipoDocumentoId: string, nombre: string) => void
}) {
    if (documentos.length === 0) return <VacioState />

    return (
        <div className="space-y-3 px-4 pb-4">
            {documentos.map((doc) => (
                <DocumentoCard
                    key={doc.tipoDocumento.id}
                    solicitudId={solicitudId}
                    doc={doc}
                    puedeSubir={puedeSubir}
                    puedeValidar={puedeValidar}
                    subiendo={subiendo}
                    validandoId={validandoId}
                    onArchivo={onArchivo}
                    onAbrirDialog={onAbrirDialog}
                    onVerHistorial={onVerHistorial}
                />
            ))}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Vista DESKTOP: tabla (>= md)
// ─────────────────────────────────────────────────────────────────────────────

function DocumentosTablaDesktop({
    solicitudId,
    documentos,
    puedeSubir,
    puedeValidar,
    subiendo,
    validandoId,
    onArchivo,
    onAbrirDialog,
    onVerHistorial,
}: {
    solicitudId: string
    documentos: ResumenDocumento[]
    puedeSubir: boolean
    puedeValidar: boolean
    subiendo: boolean
    validandoId: string | null
    onArchivo: (tipoDocumentoId: string, file: File) => void
    onAbrirDialog: (documentoId: string, nombreDocumento: string, accion: 'APROBADO' | 'RECHAZADO') => void
    onVerHistorial: (tipoDocumentoId: string, nombre: string) => void
}) {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent bg-muted/40">
                        <TableHead className="w-1 p-0" />
                        <TableHead className="pl-4 text-[11px] font-semibold uppercase tracking-wider">
                            Documento
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-wider">
                            Archivo
                        </TableHead>
                        <TableHead className="hidden lg:table-cell text-[11px] font-semibold uppercase tracking-wider text-center w-20">
                            Versión
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-wider w-32">
                            Estatus
                        </TableHead>
                        <TableHead className="hidden xl:table-cell text-[11px] font-semibold uppercase tracking-wider">
                            Observación
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-right pr-5">
                            Acciones
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {documentos.map((doc) => {
                        const { tipoDocumento, documentoActivo, estatus, esObligatorio } = doc
                        const esPendiente = estatus === 'PENDIENTE'
                        const esValidable = puedeValidar && esPendiente && !!documentoActivo
                        const tieneHistorial = estatus !== 'NO_SUBIDO'
                        const colorAccent = accentColor[estatus] ?? accentColor['NO_SUBIDO']
                        const puedeSubirEstaFila = puedeSubir && estatus !== 'APROBADO'

                        return (
                            <TableRow
                                key={tipoDocumento.id}
                                className="hover:bg-muted/20 transition-colors duration-100"
                            >
                                <TableCell className="w-1 p-0">
                                    <div className={`w-0.75 h-full min-h-13 rounded-r-full ${colorAccent}`} />
                                </TableCell>

                                <TableCell className="pl-4 py-3.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-foreground leading-snug">
                                            {tipoDocumento.nombre}
                                        </span>
                                        <TipoBadge esObligatorio={esObligatorio} />
                                    </div>
                                    {tipoDocumento.descripcion && (
                                        <p className="text-xs text-muted-foreground mt-0.5 max-w-65 truncate">
                                            {tipoDocumento.descripcion}
                                        </p>
                                    )}
                                </TableCell>

                                <TableCell className="py-3.5">
                                    {documentoActivo ? (
                                        <CeldaArchivo
                                            solicitudId={solicitudId}
                                            documentoId={documentoActivo.id}
                                            nombre={documentoActivo.nombreArchivo}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-muted-foreground/60">
                                            <FileX className="h-3.5 w-3.5" />
                                            <span className="text-xs">Sin archivo</span>
                                        </div>
                                    )}
                                </TableCell>

                                <TableCell className="hidden lg:table-cell text-center py-3.5">
                                    {documentoActivo ? (
                                        <Badge
                                            variant="outline"
                                            className="font-mono text-[11px] px-2 h-5 text-muted-foreground"
                                        >
                                            v{documentoActivo.version}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground/40 text-sm">—</span>
                                    )}
                                </TableCell>

                                <TableCell className="py-3.5">
                                    <EstatusDocumentoBadge estatus={estatus} />
                                </TableCell>

                                <TableCell className="hidden xl:table-cell py-3.5">
                                    {documentoActivo?.motivoRechazo ? (
                                        <MotivoRechazo motivo={documentoActivo.motivoRechazo} />
                                    ) : (
                                        <span className="text-muted-foreground/40 text-xs">Sin observación</span>
                                    )}
                                </TableCell>

                                <TableCell className="py-3.5 pr-5">
                                    <div className="flex items-center justify-end gap-1">
                                        {puedeSubirEstaFila && (
                                            <BotonSubir
                                                tipoDocumentoId={tipoDocumento.id}
                                                cargando={subiendo}
                                                onArchivo={onArchivo}
                                            />
                                        )}
                                        {esValidable && (
                                            <BotonesValidacion
                                                documentoId={documentoActivo!.id}
                                                nombreDocumento={tipoDocumento.nombre}
                                                cargando={validandoId === documentoActivo!.id}
                                                onAbrir={onAbrirDialog}
                                            />
                                        )}
                                        {tieneHistorial ? (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                                                        onClick={() =>
                                                            onVerHistorial(tipoDocumento.id, tipoDocumento.nombre)
                                                        }
                                                        aria-label={`Ver historial de ${tipoDocumento.nombre}`}
                                                    >
                                                        <History className="h-3.5 w-3.5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Ver historial</TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            <div className="w-7" aria-hidden />
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>

            {documentos.length === 0 && <VacioState />}
        </div>
    )
}

export function TablaDocumentos({
    solicitudId,
    documentos,
    validando,
    subiendo,
    rolUsuario,
    gestorAsignadoId,
    usuarioId,
    onValidar,
    onSubir,
    onVerHistorial,
}: TablaDocumentosProps) {
    const [dialog, setDialog] = useState<DialogState>(DIALOG_INICIAL)
    const esCliente = rolUsuario === 'CLIENTE'
    const esAdmin = rolUsuario === 'ADMIN'
    const esGestorAsignado = rolUsuario === 'GESTOR' && gestorAsignadoId === usuarioId
    const puedeValidar = esGestorAsignado || esAdmin
    const puedeSubir = esCliente || esGestorAsignado || esAdmin

    const abrirDialog = (
        documentoId: string,
        nombreDocumento: string,
        accion: 'APROBADO' | 'RECHAZADO'
    ) => setDialog({ open: true, documentoId, nombreDocumento, accion })

    const handleArchivo = async (tipoDocumentoId: string, file: File) => {
        await onSubir(tipoDocumentoId, file)
    }

    const totalDocs = documentos.length
    const obligatorios = documentos.filter((d) => d.esObligatorio).length
    const aprobados = documentos.filter((d) => d.estatus === 'APROBADO').length

    return (
        <>
            <Card className="w-full">
                <CardHeader className="pb-0 pt-5 px-4 sm:px-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <div className="rounded-lg bg-primary/10 p-1.5 ring-1 ring-primary/20">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                            </div>
                            Documentos requeridos
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{aprobados} de {totalDocs} documentos</span>
                            <span className="text-border">·</span>
                            <span>{obligatorios} obligatorios</span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="px-4 py-5">
                    {/* Mobile / tablet chico */}
                    <div className="md:hidden">
                        <DocumentosListaMobile
                            solicitudId={solicitudId}
                            documentos={documentos}
                            puedeSubir={puedeSubir}
                            puedeValidar={puedeValidar}
                            subiendo={subiendo}
                            validandoId={validando}
                            onArchivo={handleArchivo}
                            onAbrirDialog={abrirDialog}
                            onVerHistorial={onVerHistorial}
                        />
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:block">
                        <DocumentosTablaDesktop
                            solicitudId={solicitudId}
                            documentos={documentos}
                            puedeSubir={puedeSubir}
                            puedeValidar={puedeValidar}
                            subiendo={subiendo}
                            validandoId={validando}
                            onArchivo={handleArchivo}
                            onAbrirDialog={abrirDialog}
                            onVerHistorial={onVerHistorial}
                        />
                    </div>
                </CardContent>
            </Card>

            <ValidarDocumentoDialog
                open={dialog.open}
                onOpenChange={(open) => setDialog((prev) => ({ ...prev, open }))}
                documentoId={dialog.documentoId}
                nombreDocumento={dialog.nombreDocumento}
                accion={dialog.accion}
                loading={validando === dialog.documentoId}
                onConfirm={onValidar}
            />
        </>
    )
}