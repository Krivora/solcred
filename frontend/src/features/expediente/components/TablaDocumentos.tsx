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
import { VisorDocumentoDialog } from './VisorDocumentoDialog'
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
    CheckCircle2,
    FileText,
} from 'lucide-react'
import type {
    ResumenDocumento,
    ValidarDocumentoDto,
} from '@/features/expediente/types/expediente.types'
import { cn } from '@/shared/lib/cn'
import { estatusDocumento, TONE } from '@/shared/config/estatus.tokens'

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
    onSubir: (tipoDocumentoId: string, archivo: File) => Promise<unknown>
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

// Estilo por estatus derivado del módulo de tokens: chip con ícono, tinte de
// fila y color de barra de composición.
const metaDe = (estatus: string) => {
    const { tone, icon } = estatusDocumento(estatus)
    return { icon, chip: TONE[tone].chip, rowTint: TONE[tone].rowTint, bar: TONE[tone].solid }
}

function EstatusChip({ estatus, className }: { estatus: string; className?: string }) {
    const { icon: Icon, chip } = metaDe(estatus)
    return (
        <div
            className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1',
                chip,
                className,
            )}
        >
            <Icon className="h-4 w-4" />
        </div>
    )
}

/** Barra de composición: aprobados / en revisión / rechazados / faltantes. */
function BarraComposicion({ documentos }: { documentos: ResumenDocumento[] }) {
    const total = documentos.length
    if (total === 0) return null
    const orden: string[] = ['APROBADO', 'PENDIENTE', 'RECHAZADO', 'NO_SUBIDO']
    return (
        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
            {orden.map((estatus) => {
                const n = documentos.filter((d) => d.estatus === estatus).length
                if (n === 0) return null
                return (
                    <div
                        key={estatus}
                        className={metaDe(estatus).bar}
                        style={{ width: `${(n / total) * 100}%` }}
                    />
                )
            })}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componentes compartidos (usados en card y tabla)
// ─────────────────────────────────────────────────────────────────────────────

function MotivoRechazo({ motivo }: { motivo: string }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 max-w-full sm:max-w-45 cursor-help group">
                    <XCircle className="h-3 w-3 shrink-0 text-danger-ink" />
                    <p className="text-xs text-danger-ink truncate group-hover:underline decoration-dashed underline-offset-2">
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
    const [visorOpen, setVisorOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setVisorOpen(true)}
                className="inline-flex items-center gap-1.5 max-w-full sm:max-w-50 text-xs text-primary font-medium hover:underline underline-offset-2 transition-opacity hover:opacity-80"
            >
                <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                <span className="truncate">{nombre}</span>
            </button>

            <VisorDocumentoDialog
                open={visorOpen}
                onOpenChange={setVisorOpen}
                solicitudId={solicitudId}
                documentoId={documentoId}
                nombre={nombre}
            />
        </>
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
                        className={`${dim} p-0 rounded-lg border-ok/30 text-ok-ink hover:bg-ok-surface hover:border-ok/40 transition-colors`}
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
                        className={`${dim} p-0 rounded-lg border-danger/30 text-danger-ink hover:bg-danger-surface hover:border-danger/40 transition-colors`}
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
            className="text-caption px-1.5 py-0 h-4 text-warn-ink border-warn/25 bg-warn-surface shrink-0"
        >
            Requerido
        </Badge>
    ) : (
        <Badge
            variant="outline"
            className="text-caption px-1.5 py-0 h-4 text-ink-subtle border-hairline bg-surface-sunken shrink-0"
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
    const puedeSubirEsteDoc = puedeSubir && estatus !== 'APROBADO'

    return (
        <div className={cn('rounded-xl border border-border bg-card overflow-hidden', metaDe(estatus).rowTint)}>
            <div className="px-3.5 py-3.5 space-y-3">
                {/* Chip + título + badges */}
                <div className="flex items-start gap-3">
                    <EstatusChip estatus={estatus} />
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                                <span className="text-sm font-medium text-foreground leading-snug">
                                    {tipoDocumento.nombre}
                                </span>
                                <TipoBadge esObligatorio={esObligatorio} />
                            </div>
                            <EstatusDocumentoBadge estatus={estatus} />
                        </div>
                        {tipoDocumento.descripcion && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {tipoDocumento.descripcion}
                            </p>
                        )}
                    </div>
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
        <div className="space-y-2.5">
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
                        <TableHead className="w-14 pl-5" />
                        <TableHead className="text-[11px] font-semibold uppercase tracking-wider">
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
                        const puedeSubirEstaFila = puedeSubir && estatus !== 'APROBADO'

                        return (
                            <TableRow
                                key={tipoDocumento.id}
                                className={cn(
                                    'transition-colors duration-100 hover:bg-muted/30',
                                    metaDe(estatus).rowTint,
                                )}
                            >
                                <TableCell className="pl-5 py-3.5">
                                    <EstatusChip estatus={estatus} />
                                </TableCell>

                                <TableCell className="py-3.5">
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
    const aprobados = documentos.filter((d) => d.estatus === 'APROBADO').length
    const pendientesAccion = documentos.filter(
        (d) => d.esObligatorio && (d.estatus === 'NO_SUBIDO' || d.estatus === 'RECHAZADO'),
    ).length

    return (
        <>
            <Card className="w-full">
                <CardHeader className="pb-4 pt-5 px-4 sm:px-5 gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <div className="rounded-lg bg-primary/10 p-1.5 ring-1 ring-primary/20">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                            </div>
                            Documentos requeridos
                        </CardTitle>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {aprobados}<span className="text-muted-foreground/50">/{totalDocs}</span> aprobados
                            </span>
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                                    pendientesAccion > 0
                                        ? 'bg-warn-surface text-warn-ink'
                                        : 'bg-ok-surface text-ok-ink',
                                )}
                            >
                                {pendientesAccion > 0 ? (
                                    <><FileText className="h-3 w-3" /> {pendientesAccion} por atender</>
                                ) : (
                                    <><CheckCircle2 className="h-3 w-3" /> Al día</>
                                )}
                            </span>
                        </div>
                    </div>

                    <BarraComposicion documentos={documentos} />
                </CardHeader>

                <CardContent className="p-0 border-t border-border/60">
                    {/* Mobile / tablet chico */}
                    <div className="md:hidden p-4">
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