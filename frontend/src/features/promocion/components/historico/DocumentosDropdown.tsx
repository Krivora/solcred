// components/DocumentosDropdown.tsx
'use client'

import { FileStack, FileText } from 'lucide-react'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Button } from '@/shared/components/ui/button'
import { DOCUMENTO_LABELS, getDocumentosDisponibles, type DocumentoTipo } from '@/shared/config/documentos.config'
import type { EstatusSolicitud } from '@/shared/lib/types/solicitudes.types'

interface Props {
    estatus: EstatusSolicitud
    onSeleccionar: (tipo: DocumentoTipo) => void
    disabled?: boolean
}

export function DocumentosDropdown({ estatus, onSeleccionar,disabled  }: Props) {
    const disponibles = getDocumentosDisponibles(estatus)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    title="Ver documentos"
                    disabled={disabled}
                >
                    <FileStack className="h-3.5 w-3.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-lg border-border/60">
                {disponibles.map((tipo) => (
                    <DropdownMenuItem
                        key={tipo}
                        className="gap-2.5 cursor-pointer rounded-md px-2.5 py-2"
                        onClick={() => onSeleccionar(tipo)}
                    >
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">{DOCUMENTO_LABELS[tipo]}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}