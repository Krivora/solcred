// SolicitudInfoGeneral.tsx
import { Building2, Calendar, Clock, User, Briefcase, DollarSign } from 'lucide-react'
import { Card } from '@/shared/components/ui/card'
import { SECTOR_LABELS, TAMANO_LABELS, formatFecha, formatMonto } from '@/shared/config/solicitudes.config'
import type { SolicitudDetalle } from '@/shared/lib/types/solicitudes.types'

interface Props {
    solicitud: SolicitudDetalle
}

function iniciales(nombre: string, apellido: string) {
    return `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase()
}

function Campo({ icon: Icon, label, valor }: { icon: React.ElementType; label: string; valor: string | null | undefined }) {
    return (
        <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground/70 mt-0.5">
                <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col gap-0 min-w-0">
                <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wide">
                    {label}
                </span>
                <span className="text-sm text-foreground truncate">
                    {valor || <span className="text-muted-foreground/40">—</span>}
                </span>
            </div>
        </div>
    )
}

export function SolicitudInfoGeneral({ solicitud }: Props) {
    const nombreSolicitante = solicitud.datosSolicitante
        ? `${solicitud.datosSolicitante.nombre} ${solicitud.datosSolicitante.apellidoPaterno} ${solicitud.datosSolicitante.apellidoMaterno}`
        : null

    return (
        <Card className="p-5">
            {/* Solicitante destacado */}
            <div className="flex items-center gap-3 pb-5 mb-5 border-b border-border/60">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {solicitud.datosSolicitante
                        ? iniciales(solicitud.datosSolicitante.nombre, solicitud.datosSolicitante.apellidoPaterno)
                        : <User className="h-4.5 w-4.5" />}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                        {nombreSolicitante ?? 'Solicitante no registrado'}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                        {solicitud.programa.nombre}
                    </span>
                </div>
            </div>

            {/* Campos secundarios */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5">
                <Campo
                    icon={Briefcase}
                    label="Tipo de persona"
                    valor={solicitud.tipoPersona === 'FISICA' ? 'Persona Física' : solicitud.tipoPersona === 'MORAL' ? 'Persona Moral' : null}
                />
                <Campo label="Sector" icon={Building2} valor={solicitud.sector ? SECTOR_LABELS[solicitud.sector] : null} />
                <Campo label="Monto solicitado" icon={DollarSign} valor={formatMonto(solicitud.montoSolicitado)} />
                <Campo label="Tamaño de empresa" icon={Building2} valor={solicitud.tamanoEmpresa ? TAMANO_LABELS[solicitud.tamanoEmpresa] : null} />
                <Campo label="Fecha de creación" icon={Calendar} valor={formatFecha(solicitud.creadoEn)} />
                <Campo label="Última actualización" icon={Clock} valor={formatFecha(solicitud.actualizadoEn)} />
            </div>
        </Card>
    )
}