'use client'

import { Card, CardContent } from '@/shared/components/ui/card'
import { EstatusBadge } from '@/features/solicitudes/components/EstatusBadge'
import {
    User,
    FileText,
    Layers,
    Phone,
    Mail,
    UserCheck,
    DollarSign,
    Calendar,
} from 'lucide-react'
import type { Expediente } from '@/features/expediente/types/expediente.types'
import type { EstatusSolicitud } from '@/shared/types/solicitudes.types'

// ─── Formatters ───────────────────────────────────────────────────────────────
const formatMonto = (monto: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(monto)

const formatFecha = (fecha: string) =>
    new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(fecha))

const labelTipoPersona: Record<string, string> = {
    FISICA: 'Persona física',
    MORAL: 'Persona moral',
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
        <div className="flex items-start gap-2.5 min-w-0">
            <Icon className="mt-0.5 size-4 shrink-0 text-ink-subtle" />
            <div className="min-w-0 flex-1">
                <p className="text-label uppercase tracking-wide text-ink-subtle mb-0.5">
                    {label}
                </p>
                <p className="text-body-sm font-medium text-ink leading-snug truncate">
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

    return (
        <Card className="w-full overflow-hidden">
            {/* ── Banda: folio + programa + estatus ─────────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-hairline bg-surface-sunken">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-label uppercase tracking-wide text-ink-subtle">Folio</span>
                    <span className="font-mono text-heading font-medium tracking-wide text-brand-ink">
                        {expediente.folio}
                    </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-0.5 text-caption font-medium text-ink-muted max-w-55 sm:max-w-none">
                        <span className="truncate">{expediente.programa.nombre}</span>
                    </span>
                    <EstatusBadge estatus={expediente.estatus as EstatusSolicitud} size="sm" />
                </div>
            </div>

            {/* ── Campos: grid en el espacio disponible ─────────────────── */}
            <CardContent className="px-4 py-5">
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
