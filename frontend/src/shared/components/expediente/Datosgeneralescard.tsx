'use client'

import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import {
    User,
    FileText,
    Layers,
    Phone,
    Mail,
    UserCheck,
    DollarSign,
    Calendar,
    Building2,
    Hash,
} from 'lucide-react'
import type { Expediente } from '@/shared/lib/types/expediente.types'

// ─── Formatters ───────────────────────────────────────────────────────────────
const formatMonto = (monto: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(monto)

const formatFecha = (fecha: string) =>
    new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(fecha))

const labelTipoPersona: Record<string, string> = {
    FISICA: 'Persona física',
    MORAL: 'Persona moral',
}

const estatusBg: Record<string, string> = {
    BORRADOR: 'bg-slate-100 text-slate-600 border-slate-200',
    PENDIENTE: 'bg-amber-50 text-amber-700 border-amber-200',
    EN_REVISION: 'bg-blue-50 text-blue-700 border-blue-200',
    APROBADO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    RECHAZADO: 'bg-red-50 text-red-700 border-red-200',
}
const estatusLabel: Record<string, string> = {
    BORRADOR: 'Borrador',
    PENDIENTE: 'Pendiente',
    EN_REVISION: 'En revisión',
    APROBADO: 'Aprobado',
    RECHAZADO: 'Rechazado',
}

// ─── Campo ────────────────────────────────────────────────────────────────────
const Campo = ({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType
    label: string
    value: React.ReactNode
}) => {
    if (!value) return null
    return (
        <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-muted ring-1 ring-border">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70 leading-none mb-1">
                    {label}
                </p>
                <p className="text-sm font-medium text-foreground leading-snug truncate">
                    {value}
                </p>
            </div>
        </div>
    )
}

interface DatosGeneralesCardProps {
    expediente: Expediente
}

export const DatosGeneralesCard = ({ expediente }: DatosGeneralesCardProps) => {
    const { datosSolicitante, solicitante, gestor } = expediente

    const nombre = datosSolicitante
        ? `${datosSolicitante.nombre} ${datosSolicitante.apellidoPaterno} ${datosSolicitante.apellidoMaterno}`
        : `${solicitante.nombre} ${solicitante.apellidoPaterno} ${solicitante.apellidoMaterno}`

    const celular = datosSolicitante?.celular ?? null
    const correo = datosSolicitante?.correo ?? solicitante.correo
    const estatusClass = estatusBg[expediente.estatus] ?? 'bg-muted text-foreground border-border'

    return (
        <Card className="overflow-hidden">
            {/* ── Banda: folio + programa + estatus ─────────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                            Folio
                        </span>
                    </div>
                    <span className="font-mono text-base font-bold tracking-widest text-primary">
                        {expediente.folio}
                    </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                        variant="outline"
                        className="bg-accent/50 text-accent-foreground border-accent text-xs font-medium px-2.5"
                    >
                        <Building2 className="h-3 w-3 mr-1.5 opacity-70" />
                        {expediente.programa.nombre}
                    </Badge>
                    <Badge
                        variant="outline"
                        className={`text-xs font-medium px-2.5 ${estatusClass}`}
                    >
                        {estatusLabel[expediente.estatus] ?? expediente.estatus}
                    </Badge>
                </div>
            </div>

            {/* ── Campos: grid 2 columnas en el espacio disponible ──────── */}
            <CardContent className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-4">
                    <Campo icon={User} label="Solicitante" value={nombre} />
                    <Campo icon={Mail} label="Correo electrónico" value={correo} />
                    <Campo icon={Phone} label="Celular" value={celular} />
                    <Campo
                        icon={FileText}
                        label="Tipo de persona"
                        value={expediente.tipoPersona ? labelTipoPersona[expediente.tipoPersona] : null}
                    />
                    {expediente.montoSolicitado && (
                        <Campo
                            icon={DollarSign}
                            label="Monto solicitado"
                            value={formatMonto(expediente.montoSolicitado)}
                        />
                    )}
                    {expediente.plazoSolicitado && (
                        <Campo
                            icon={Calendar}
                            label="Plazo solicitado"
                            value={`${expediente.plazoSolicitado} meses`}
                        />
                    )}
                    {gestor && (
                        <Campo
                            icon={UserCheck}
                            label="Gestor asignado"
                            value={`${gestor.nombre} ${gestor.apellidoPaterno}`}
                        />
                    )}
                    <Campo
                        icon={Layers}
                        label="Fecha de solicitud"
                        value={formatFecha(expediente.creadoEn)}
                    />
                </div>
            </CardContent>
        </Card>
    )
}