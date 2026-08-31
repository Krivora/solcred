'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/shared/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import type { AnalistaConCarga } from '@/features/financiamiento/types/financiamiento.types'

interface Props {
  open: boolean
  analistas: AnalistaConCarga[]
  loading: boolean
  onConfirmar: (analistaId: string) => void
  onCerrar: () => void
}

export function AsignarAnalistaDialog({ open, analistas, loading, onConfirmar, onCerrar }: Props) {
  const [analistaId, setAnalistaId] = useState('')

  const cerrar = () => { setAnalistaId(''); onCerrar() }
  const confirmar = () => { onConfirmar(analistaId); setAnalistaId('') }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && cerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar analista</DialogTitle>
          <DialogDescription>
            La solicitud pasará a análisis del analista seleccionado.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Label className="text-xs font-medium text-foreground mb-2 block">Analista</Label>
          {analistas.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No hay analistas activos. Da de alta un usuario con rol Analista en Configuración.
            </p>
          ) : (
            <Select value={analistaId} onValueChange={setAnalistaId}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Selecciona un analista" />
              </SelectTrigger>
              <SelectContent>
                {analistas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.usuario.nombre} {a.usuario.apellidoPaterno}
                    <span className="text-muted-foreground"> · {a.carga} caso{a.carga === 1 ? '' : 's'}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={cerrar} disabled={loading}>
            Cerrar
          </Button>
          <Button
            size="sm"
            disabled={!analistaId || loading}
            onClick={confirmar}
          >
            {loading ? 'Asignando...' : 'Asignar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
