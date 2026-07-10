'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { EstatusBadge } from './Estatusbadge'
import { SolicitudesEmptyState } from './SolicitudesEmptyState'
import { SolicitudEnviarDialog } from './Solicitudenviardialog'
import { solicitudesApi } from '../api/solicitudes.api'
import type { Solicitud } from '@/shared/lib/types/solicitudes.types'
import { Pencil, Send, Printer, Building2, User, FolderOpen, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { SolicitanteCell } from '@/shared/components/ui/SolicitanteCell'

const SECTOR_LABELS: Record<string, string> = {
  AGROPECUARIO: 'Agropecuario',
  INDUSTRIAL: 'Industrial',
  COMERCIAL: 'Comercial',
  SERVICIOS: 'Servicios',
  TECNOLOGIA: 'Tecnología',
  OTRO: 'Otro',
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell className="py-3 pl-4">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3 w-12" />
            </div>
          </TableCell>
          <TableCell className="py-3"><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell className="py-3"><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell className="py-3"><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
          <TableCell className="py-3"><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell className="py-3 pr-4"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

interface SolicitudesTableProps {
  solicitudes: Solicitud[]
  isLoading: boolean
  onEnviada: () => void
}

export function SolicitudesTable({ solicitudes, isLoading, onEnviada }: SolicitudesTableProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Solicitud | null>(null)

  function handleEnviarClick(s: Solicitud) {
    setSelected(s)
    setDialogOpen(true)
  }

  async function handleConfirmarEnvio(id: string): Promise<boolean> {
    try {
      await solicitudesApi.enviar(id)
      onEnviada()
      return true
    } catch {
      return false
    }
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
              <TableHead className="py-2.5 pl-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground w-20">
                Folio
              </TableHead>
              <TableHead className="py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground w-60">
                Solicitante
              </TableHead>
              <TableHead className="py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground w-40">
                Programa
              </TableHead>
              <TableHead className="py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground w-30">
                Sector
              </TableHead>
              <TableHead className="py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground w-35">
                Estatus
              </TableHead>
              <TableHead className="py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground w-35">
                Fecha
              </TableHead>
              <TableHead className="py-2.5 pl-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground w-40">
                Gestor Asignado
              </TableHead>
              <TableHead className="py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground text-right w-16">
                PDF
              </TableHead>
              <TableHead className="py-2.5 pr-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground text-right w-40">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>


          <TableBody>
            {isLoading && <TableSkeleton />}

            {!isLoading && solicitudes.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="p-0">
                  <SolicitudesEmptyState />
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              solicitudes.map((s) => (
                <TableRow
                  key={s.id}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors"
                >
                  {/* Folio */}
                  <TableCell className="py-3 pl-4">
                    <p className="font-mono text-xs font-semibold text-primary">
                      #{s.folio}
                    </p>
                  </TableCell>

                  {/* Solicitante */}
                  <TableCell className="py-3">
                    <SolicitanteCell datos={s.datosSolicitante} tipoPersona={s.tipoPersona} />
                  </TableCell>

                  {/* Programa */}
                  <TableCell className="py-3">
                    <p className="text-sm font-medium text-foreground">{s.programa.nombre}</p>
                    {s.montoSolicitado ? (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {new Intl.NumberFormat('es-MX', {
                          style: 'currency',
                          currency: 'MXN',
                          maximumFractionDigits: 0,
                        }).format(s.montoSolicitado)}
                        {s.plazoSolicitado ? ` · ${s.plazoSolicitado} meses` : ''}
                      </p>
                    ) : null}
                  </TableCell>

                  {/* Sector */}
                  <TableCell className="py-3">
                    <span className="text-sm text-muted-foreground">
                      {s.sector ? SECTOR_LABELS[s.sector] : '—'}
                    </span>
                  </TableCell>

                  {/* Estatus */}
                  <TableCell className="py-3">
                    <EstatusBadge estatus={s.estatus} size="sm" />
                  </TableCell>

                  {/* Fecha */}
                  <TableCell className="py-3">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(s.creadoEn), "d MMM, yyyy", { locale: es })}
                    </span>
                  </TableCell>

                  {/* Gestor Asignado */}
                  <TableCell className="py-3">
                    {s.gestorAsignado ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-foreground truncate">
                          {s.gestorAsignado.nombre}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-center text-muted-foreground">Sin asignar</span>
                    )}
                  </TableCell>

                  {/* PDF */}
                  <TableCell className="py-3 text-right" onClick={e => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 ml-auto"
                      title="Generar PDF"
                      onClick={() => router.push(`/dashboard/admin/solicitudes/${s.id}/pdf`)}
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="py-3 pr-4">
                    {s.estatus === 'BORRADOR' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          title="Ver expediente digital"
                          onClick={() => router.push(`/dashboard/usuarios/expediente/${s.id}`)}
                        >
                          <FolderOpen className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs rounded-full"
                          onClick={() => router.push(`/dashboard/usuarios/solicitudes/${s.id}`)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 gap-1.5 text-xs rounded-full"
                          onClick={() => handleEnviarClick(s)}
                        >
                          <Send className="w-3.5 h-3.5" />
                          Enviar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          title="Ver expediente digital"
                          onClick={() => router.push(`/dashboard/usuarios/expediente/${s.id}`)}
                        >
                          <FolderOpen className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <SolicitudEnviarDialog
        solicitud={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirmar={handleConfirmarEnvio}
      />
    </>
  )
}