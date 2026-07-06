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
import { EstatusDocumentoBadge } from './Estatusdocumentobadge'
import { ValidarDocumentoDialog } from './Validardocumentodialog'
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
} from '@/shared/lib/types/expediente.types'

// ─── Types ────────────────────────────────────────────────────────────────────
interface TablaDocumentosProps {
    solicitudId: string
    documentos: ResumenDocumento[]
    validando: string | null
    subiendo: boolean
    rolUsuario: string
    gestorAsignadoId: string | null
    usuarioId: string
    onValidar: (documentoId: string, dto: ValidarDocumentoDto) => Promise<void>
    onSubir: (tipoDocumentoId: string,archivo: File) => Promise<any> // ← SubirDocumentoForm
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

// ─── Acento de color por estatus ──────────────────────────────────────────────
const accentColor: Record<string, string> = {
    APROBADO:  'bg-emerald-400',
    PENDIENTE: 'bg-amber-400',
    RECHAZADO: 'bg-red-400',
    NO_SUBIDO: 'bg-border',
}



// ─── Sub-componentes ──────────────────────────────────────────────────────────
const MotivoRechazo = ({ motivo }: { motivo: string }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 max-w-[180px] cursor-help group">
                <XCircle className="h-3 w-3 shrink-0 text-red-400" />
                <p className="text-xs text-red-600 truncate group-hover:underline decoration-dashed underline-offset-2">
                    {motivo}
                </p>
            </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[260px] text-xs">
            {motivo}
        </TooltipContent>
    </Tooltip>
)

const CeldaArchivo = ({ url, nombre }: { url: string; nombre: string }) => (
    <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 max-w-[200px] text-xs text-primary font-medium hover:underline underline-offset-2 transition-opacity hover:opacity-80"
    >
        <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
        <span className="truncate">{nombre}</span>
    </a>
)

const BotonesValidacion = ({
    documentoId,
    nombreDocumento,
    cargando,
    onAbrir,
}: {
    documentoId: string
    nombreDocumento: string
    cargando: boolean
    onAbrir: (id: string, nombre: string, accion: 'APROBADO' | 'RECHAZADO') => void
}) => (
    <div className="flex items-center gap-1.5">
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0 rounded-lg border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all"
                    disabled={cargando}
                    onClick={() => onAbrir(documentoId, nombreDocumento, 'APROBADO')}
                    aria-label={`Aprobar ${nombreDocumento}`}
                >
                    <ThumbsUp className="h-3.5 w-3.5" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>Aprobar</TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0 rounded-lg border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all"
                    disabled={cargando}
                    onClick={() => onAbrir(documentoId, nombreDocumento, 'RECHAZADO')}
                    aria-label={`Rechazar ${nombreDocumento}`}
                >
                    <ThumbsDown className="h-3.5 w-3.5" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>Rechazar</TooltipContent>
        </Tooltip>
    </div>
)

// ─── Botón de subida por fila ─────────────────────────────────────────────────
const BotonSubir = ({
    tipoDocumentoId,
    cargando,
    onArchivo,
}: {
    tipoDocumentoId: string
    cargando: boolean
    onArchivo: (tipoDocumentoId: string, file: File) => void
}) => {
    const inputRef = useRef<HTMLInputElement>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) onArchivo(tipoDocumentoId, file)
        // Reset para permitir subir el mismo archivo de nuevo si es necesario
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
                        className="h-7 w-7 p-0 rounded-lg border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all"
                        disabled={cargando}
                        onClick={() => inputRef.current?.click()}
                        aria-label="Subir documento"
                    >
                        {cargando
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Upload className="h-3.5 w-3.5" />
                        }
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{cargando ? 'Subiendo...' : 'Subir archivo'}</TooltipContent>
            </Tooltip>
        </>
    )
}

// ─── Tabla ────────────────────────────────────────────────────────────────────
export const TablaDocumentos = ({
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
}: TablaDocumentosProps) => {
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

    // Cuando el usuario selecciona un archivo construimos el DTO y llamamos onSubir
    const handleArchivo = async (
        tipoDocumentoId: string,
        file: File
    ) => {
        await onSubir(
            tipoDocumentoId,
            file
        )
    }

    const totalDocs = documentos.length
    const obligatorios = documentos.filter((d) => d.esObligatorio).length
    const aprobados = documentos.filter((d) => d.estatus === 'APROBADO').length

    return (
        <>
            <Card>
                <CardHeader className="pb-0 pt-5 px-5">
                    <div className="flex items-center justify-between gap-3">
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

                <CardContent className="p-0 mt-4">
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
                                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-center w-20">
                                    Versión
                                </TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase tracking-wider w-32">
                                    Estatus
                                </TableHead>
                                <TableHead className="text-[11px] font-semibold uppercase tracking-wider">
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

                                // Cliente puede subir si el doc no existe o fue rechazado
                                const puedeSubirEstaFila =
                                    puedeSubir && estatus !== 'APROBADO'
                                const estaSubiendo = subiendo

                                return (
                                    <TableRow
                                        key={tipoDocumento.id}
                                        className="hover:bg-muted/20 transition-colors duration-100"
                                    >
                                        {/* Acento de color */}
                                        <TableCell className="w-1 p-0">
                                            <div className={`w-[3px] h-full min-h-[52px] rounded-r-full ${colorAccent}`} />
                                        </TableCell>

                                        {/* Documento */}
                                        <TableCell className="pl-4 py-3.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-medium text-foreground leading-snug">
                                                    {tipoDocumento.nombre}
                                                </span>
                                                {esObligatorio ? (
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
                                                )}
                                            </div>
                                            {tipoDocumento.descripcion && (
                                                <p className="text-xs text-muted-foreground mt-0.5 max-w-[260px] truncate">
                                                    {tipoDocumento.descripcion}
                                                </p>
                                            )}
                                        </TableCell>

                                        {/* Archivo */}
                                        <TableCell className="py-3.5">
                                            {documentoActivo ? (
                                                <CeldaArchivo
                                                    url={documentoActivo.urlArchivo}
                                                    nombre={documentoActivo.nombreArchivo}
                                                />
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-muted-foreground/60">
                                                    <FileX className="h-3.5 w-3.5" />
                                                    <span className="text-xs">Sin archivo</span>
                                                </div>
                                            )}
                                        </TableCell>

                                        {/* Versión */}
                                        <TableCell className="text-center py-3.5">
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

                                        {/* Estatus */}
                                        <TableCell className="py-3.5">
                                            <EstatusDocumentoBadge estatus={estatus} />
                                        </TableCell>

                                        {/* Observación */}
                                        <TableCell className="py-3.5">
                                            {documentoActivo?.motivoRechazo ? (
                                                <MotivoRechazo motivo={documentoActivo.motivoRechazo} />
                                            ) : (
                                                <span className="text-muted-foreground/40 text-xs">Sin observación</span>
                                            )}
                                        </TableCell>

                                        {/* Acciones */}
                                        <TableCell className="py-3.5 pr-5">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* Subir — solo cliente, solo en NO_SUBIDO o RECHAZADO */}
                                                {puedeSubirEstaFila && (
                                                    <BotonSubir
                                                        tipoDocumentoId={tipoDocumento.id}
                                                        cargando={estaSubiendo}
                                                        onArchivo={handleArchivo}
                                                    />
                                                )}

                                                {/* Validar — solo gestor asignado, solo en PENDIENTE */}
                                                {esValidable && (
                                                    <BotonesValidacion
                                                        documentoId={documentoActivo!.id}
                                                        nombreDocumento={tipoDocumento.nombre}
                                                        cargando={validando === documentoActivo!.id}
                                                        onAbrir={abrirDialog}
                                                    />
                                                )}

                                                {/* Historial */}
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

                    {documentos.length === 0 && (
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
                    )}
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