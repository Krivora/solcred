// components/ui/SolicitanteCell.tsx

import { User, Building2 } from 'lucide-react'
import { TIPO_PERSONA_LABELS } from '@/shared/config/solicitudes.config'
import type { TipoPersona } from '@/shared/types/solicitudes.types'

interface DatosNombre {
    nombre: string
    apellidoPaterno: string
    apellidoMaterno?: string
}

interface SolicitanteCellProps {
    datos?: DatosNombre | null
    tipoPersona?: TipoPersona | null
}

export function SolicitanteCell({ datos, tipoPersona }: SolicitanteCellProps) {
    const esMoral = tipoPersona === 'MORAL'
    const tipoLabel = tipoPersona ? TIPO_PERSONA_LABELS[tipoPersona] : null
    const nombre = datos
        ? [datos.nombre, datos.apellidoPaterno, datos.apellidoMaterno].filter(Boolean).join(' ')
        : null

    return (
        <div className="flex items-center gap-2.5">
            {/* Ícono */}
            <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                esMoral
                    ? 'bg-primary/10 border border-primary/15'
                    : 'bg-accent border border-accent-foreground/10'
            }`}>
                {esMoral
                    ? <Building2 className="h-3.5 w-3.5 text-primary" />
                    : <User className="h-3.5 w-3.5 text-accent-foreground" />
                }
            </div>

            {/* Nombre */}
            {!nombre ? (
                <span className="text-muted-foreground text-xs italic">Sin datos</span>
            ) : (
                <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-medium text-sm leading-tight text-foreground truncate">{nombre}</span>
                    {tipoLabel
                        ? <span className="text-[11px] text-muted-foreground">{tipoLabel}</span>
                        : <span className="text-[11px] text-muted-foreground">—</span>
                    }
                </div>
            )}
        </div>
    )
}