'use client'

import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
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
import type { Expediente } from '@/shared/lib/types/expediente.types'

const formatMonto = (monto: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto)

const formatFecha = (fecha: string) =>
    new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date(fecha))

interface DatosGeneralesCardProps {
    expediente: Expediente
}

const Campo = ({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType
    label: string
    value: React.ReactNode
}) => (
    <div className="flex items-start gap-2.5 min-w-0">
        <div className="mt-0.5 shrink-0 rounded-md bg-muted p-1.5">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium truncate">{value ?? '—'}</p>
        </div>
    </div>
)

export const DatosGeneralesCard = ({ expediente }: DatosGeneralesCardProps) => {
    const { datosSolicitante, solicitante } = expediente
    const nombre = datosSolicitante
        ? `${datosSolicitante.nombre} ${datosSolicitante.apellidoPaterno} ${datosSolicitante.apellidoMaterno}`
        : `${solicitante.nombre} ${solicitante.apellidoPaterno} ${solicitante.apellidoMaterno}`

    const celular = datosSolicitante?.celular ?? null
    const correo = datosSolicitante?.correo ?? solicitante.correo

    return (
        <Card>
            <CardContent className="pt-5 pb-5">
                {/* Header folio + programa */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Folio</p>
                        <p className="text-lg font-bold font-mono tracking-wide text-primary">
                            {expediente.folio}
                        </p>
                    </div>
                    <Badge variant="outline" className="text-sm px-3 py-1 font-medium">
                        {expediente.programa.nombre}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
                    <Campo icon={User} label="Solicitante" value={nombre} />
                    <Campo icon={Mail} label="Correo" value={correo} />
                    <Campo icon={Phone} label="Celular" value={celular} />

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
                            label="Plazo"
                            value={`${expediente.plazoSolicitado} meses`}
                        />
                    )}

                    {expediente.gestor && (
                        <Campo
                            icon={UserCheck}
                            label="Gestor asignado"
                            value={`${expediente.gestor.nombre} ${expediente.gestor.apellidoPaterno}`}
                        />
                    )}

                    <Campo
                        icon={FileText}
                        label="Tipo de persona"
                        value={expediente.tipoPersona === 'FISICA' ? 'Persona física' : expediente.tipoPersona === 'MORAL' ? 'Persona moral' : null}
                    />

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