// SolicitudTimeline.tsx
import { UserPlus, RefreshCw, ArrowRightLeft, User } from 'lucide-react'
import type { TimelineEvento, AsignacionDetalle } from '@/shared/lib/types/solicitudes.types'
import { ESTATUS_STYLES, formatFecha } from '@/shared/config/solicitudes.config'

interface Props {
    timeline: TimelineEvento[]
    gestorAsignado: AsignacionDetalle | null
}

function nombreCompleto(u: { nombre: string; apellidoPaterno: string; apellidoMaterno: string }) {
    return `${u.nombre} ${u.apellidoPaterno} ${u.apellidoMaterno}`
}

function EventoIcon({ tipo }: { tipo: TimelineEvento['tipo'] }) {
    const base = 'h-4 w-4'
    switch (tipo) {
        case 'CAMBIO_ESTATUS':
            return <ArrowRightLeft className={base} />
        case 'ASIGNACION':
            return <UserPlus className={base} />
        case 'REASIGNACION':
            return <RefreshCw className={base} />
    }
}

function EventoColor(tipo: TimelineEvento['tipo']) {
    switch (tipo) {
        case 'CAMBIO_ESTATUS':
            return 'bg-primary/10 text-primary border-primary/20'
        case 'ASIGNACION':
            return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
        case 'REASIGNACION':
            return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    }
}

function EventoContenido({ evento }: { evento: TimelineEvento }) {
    if (evento.tipo === 'CAMBIO_ESTATUS') {
        const anterior = ESTATUS_STYLES[evento.estatusAnterior]?.label ?? evento.estatusAnterior
        const nuevo = ESTATUS_STYLES[evento.estatusNuevo]?.label ?? evento.estatusNuevo
        return (
            <>
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-medium text-muted-foreground">
                        {anterior}
                    </span>
                    <ArrowRightLeft className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                    <span className="text-sm font-semibold text-foreground">
                        {nuevo}
                    </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                    Por <span className="font-medium text-foreground/70">{nombreCompleto(evento.realizadoPor)}</span>
                </p>
                {evento.comentario && (
                    <p className="text-[12px] text-foreground/80 mt-2 bg-muted/50 border border-border/40 rounded-md px-2.5 py-2 leading-relaxed">
                        {evento.comentario}
                    </p>
                )}
            </>
        )
    }

    if (evento.tipo === 'ASIGNACION') {
        return (
            <>
                <p className="text-sm font-semibold text-foreground leading-tight">
                    Asignado a {nombreCompleto(evento.gestor)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                    Grupo <span className="font-medium text-foreground/70">{evento.grupo.nombre}</span>
                    {' · '}
                    {evento.asignadoPor ? `Por ${nombreCompleto(evento.asignadoPor)}` : 'Asignación automática'}
                </p>
            </>
        )
    }

    return (
        <>
            <p className="text-sm font-semibold text-foreground leading-tight">
                Reasignado
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
                Dejó de ser <span className="font-medium text-foreground/70">{nombreCompleto(evento.gestorAnterior)}</span>
            </p>
            {evento.comentario && (
                <p className="text-[12px] text-foreground/80 mt-2 bg-muted/50 border border-border/40 rounded-md px-2.5 py-2 leading-relaxed">
                    {evento.comentario}
                </p>
            )}
        </>
    )
}

export function SolicitudTimeline({ timeline, gestorAsignado }: Props) {
    return (
        <div className="flex flex-col gap-5">
            {/* Gestor actual */}
            {gestorAsignado ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-0">
                        <span className="text-xs font-semibold text-foreground leading-tight">
                            {nombreCompleto(gestorAsignado.gestor)}
                        </span>
                        <span className="text-[11px] text-muted-foreground leading-tight">
                            Gestor actual · {gestorAsignado.grupo.nombre}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground/50">
                        <User className="h-4 w-4" />
                    </div>
                    <span className="text-xs text-muted-foreground">Sin gestor asignado</span>
                </div>
            )}

            {/* Línea de tiempo */}
            {timeline.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 text-center py-6">
                    Aún no hay eventos registrados
                </p>
            ) : (
                <ol className="flex flex-col max-h-[560px] overflow-y-auto pr-1 -mr-1">
                    {[...timeline].reverse().map((evento, i, arr) => {
                        const esUltimo = i === arr.length - 1
                        return (
                            <li key={i} className="relative flex gap-3.5">
                                {/* Columna del ícono + línea */}
                                <div className="relative flex flex-col items-center">
                                    <div
                                        className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 bg-card ${EventoColor(evento.tipo)}`}
                                    >
                                        <EventoIcon tipo={evento.tipo} />
                                    </div>
                                    {!esUltimo && (
                                        <div className="w-px flex-1 min-h-[2.75rem] bg-border" />
                                    )}
                                </div>

                                {/* Contenido */}
                                <div className={`flex-1 min-w-0 ${esUltimo ? 'pb-1' : 'pb-6'}`}>
                                    <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                                        {formatFecha(evento.fecha)}
                                    </span>
                                    <div className="mt-1">
                                        <EventoContenido evento={evento} />
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ol>
            )}
        </div>
    )
}