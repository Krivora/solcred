'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import type { ValidarDocumentoDto } from '@/features/expediente/types/expediente.types'

type Accion = 'APROBADO' | 'RECHAZADO'

interface ValidarDocumentoDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    documentoId: string
    nombreDocumento: string
    accion: Accion
    loading: boolean
    onConfirm: (documentoId: string, dto: ValidarDocumentoDto) => Promise<void>
}

export const ValidarDocumentoDialog = ({
    open,
    onOpenChange,
    documentoId,
    nombreDocumento,
    accion,
    loading,
    onConfirm,
}: ValidarDocumentoDialogProps) => {
    const [motivo, setMotivo] = useState('')
    const [motivoError, setMotivoError] = useState('')

    const esRechazo = accion === 'RECHAZADO'

    const handleConfirm = async () => {
        if (esRechazo && motivo.trim().length < 10) {
            setMotivoError('El motivo debe tener al menos 10 caracteres')
            return
        }

        await onConfirm(documentoId, {
            estatus: accion,
            ...(esRechazo && { motivoRechazo: motivo.trim() }),
        })

        // Reset al cerrar
        setMotivo('')
        setMotivoError('')
        onOpenChange(false)
    }

    const handleClose = () => {
        setMotivo('')
        setMotivoError('')
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {esRechazo ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        )}
                        {esRechazo ? 'Rechazar documento' : 'Aprobar documento'}
                    </DialogTitle>
                    <DialogDescription>
                        {esRechazo
                            ? `Indica el motivo por el que se rechaza "${nombreDocumento}". El solicitante podrá verlo y resubir el documento corregido.`
                            : `¿Confirmas que el documento "${nombreDocumento}" es correcto y está completo?`}
                    </DialogDescription>
                </DialogHeader>

                {esRechazo && (
                    <div className="space-y-2 py-2">
                        <Label htmlFor="motivo">
                            Motivo del rechazo <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="motivo"
                            placeholder="Describe qué está mal o qué debe corregir el solicitante..."
                            value={motivo}
                            onChange={(e) => {
                                setMotivo(e.target.value)
                                if (motivoError) setMotivoError('')
                            }}
                            rows={3}
                            className={motivoError ? 'border-red-400 focus-visible:ring-red-400' : ''}
                        />
                        {motivoError && (
                            <p className="text-xs text-red-500">{motivoError}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {motivo.length} caracteres (mínimo 10)
                        </p>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={loading}
                        variant={esRechazo ? 'destructive' : 'default'}
                        className={!esRechazo ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : esRechazo ? (
                            <XCircle className="h-4 w-4 mr-2" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        {esRechazo ? 'Rechazar' : 'Aprobar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}