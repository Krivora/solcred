// components/admin/solicitudes/PromocionTable.tsx
'use client'

import { useRouter } from 'next/navigation'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/table'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Eye, FolderOpen, FileText, MoreHorizontal, SendHorizonal, RotateCcw, XCircle} from 'lucide-react'
import { Paginacion } from '@/shared/components/ui/Paginacion'
import {
  ESTATUS_STYLES, SECTOR_LABELS, TAMANO_LABELS, formatFecha, formatMonto,
} from '@/lib/config/solicitudes.config'
import type { SolicitudPromocion, PaginacionMeta } from '@/lib/types/solicitudes.types'
import { SolicitanteCell } from '@/shared/components/ui/SolicitanteCell'


function TableSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/60">
            {['Folio', 'Solicitante', 'Programa', 'Tamaño / Sector', 'Fecha', 'Estatus','Gestor', '', '', ''].map((h, i) => (
              <TableHead key={i} className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={i} className="border-b border-border/40">
              {Array.from({ length: 10 }).map((_, j) => (
                <TableCell key={j} className="py-3">
                  <Skeleton className="h-4 w-full rounded-md" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function TableVacio() {
  return (
    <div className="rounded-xl border border-border/60 bg-card flex flex-col items-center justify-center py-20 gap-4">
      <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
        <Eye className="h-7 w-7 text-primary/50" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">No se encontraron solicitudes</p>
        <p className="text-xs text-muted-foreground mt-1">Intenta ajustar los filtros de búsqueda</p>
      </div>
    </div>
  )
}
// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  solicitudes: SolicitudPromocion[]
  meta: PaginacionMeta
  cargando: boolean
  onPaginar: (page: number) => void
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function PromocionTable({ solicitudes, meta, cargando, onPaginar }: Props) {
  const router = useRouter()

  if (cargando) return <TableSkeleton />
  if (solicitudes.length === 0) return <TableVacio />

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-border/60 overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/60">
              {[
                { label: 'Folio',           extra: '' },
                { label: 'Solicitante',     extra: 'w-56' },
                { label: 'Programa',        extra: '' },
                { label: 'Tamaño / Sector', extra: '' },
                { label: 'Recibida',           extra: '' },
                { label: 'Estatus',         extra: '' },
                { label: 'Gestor', extra: 'w-40' },
                { label: 'Exp.',            extra: 'text-center w-10' },
                { label: 'PDF',             extra: 'text-center w-10' },
                { label: '',               extra: 'w-10' },
              ].map(({ label, extra }) => (
                <TableHead
                  key={label || 'acciones'}
                  className={`text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3 ${extra}`}
                >
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {solicitudes.map((sol) => {
              const estatus = ESTATUS_STYLES[sol.estatus] ?? ESTATUS_STYLES.BORRADOR
              const monto = formatMonto(sol.montoSolicitado ?? null)

              return (
                <TableRow
                  key={sol.id}
                  className="cursor-pointer hover:bg-accent/40 transition-colors duration-100 border-b border-border/40 last:border-0 group"
                  onClick={() => router.push(`/dashboard/admin/solicitudes/${sol.id}`)}
                >
                  {/* Folio */}
                  <TableCell className="py-3">
                    <span className="text-xs font-mono font-semibold text-primary/80 bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-md">
                      {sol.folio}
                    </span>
                  </TableCell>

                  {/* Solicitante */}
                  <TableCell className="py-3">                   
                      <SolicitanteCell datos={sol.datosSolicitante} tipoPersona={sol.tipoPersona} />
                  </TableCell>

                  {/* Programa + Monto */}
                  <TableCell className="py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm text-foreground font-medium leading-tight">
                        {sol.programa.nombre}
                      </span>
                      {monto
                        ? <span className="text-xs text-muted-foreground tabular-nums">{monto}</span>
                        : <span className="text-xs text-muted-foreground/40">Sin monto</span>
                      }
                    </div>
                  </TableCell>

                  {/* Tamaño / Sector */}
                  <TableCell className="py-3">
                    <div className="flex flex-col gap-0.5">
                      {sol.sector
                        ? <span className="text-xs font-medium text-foreground">{SECTOR_LABELS[sol.sector] ?? sol.sector}</span>
                        : <span className="text-xs text-muted-foreground/40">—</span>
                      }
                      {sol.tamanoEmpresa
                        ? <span className="text-xs text-muted-foreground">{TAMANO_LABELS[sol.tamanoEmpresa]}</span>
                        : <span className="text-xs text-muted-foreground/40">—</span>
                      }
                    </div>
                  </TableCell>

                  {/* Fecha */}
                  <TableCell className="py-3">
                    <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                      {formatFecha(sol.creadoEn)}
                    </span>
                  </TableCell>

                  {/* Estatus */}
                  <TableCell className="py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${estatus.className}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${estatus.dotClass}`} />
                      {estatus.label}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    {sol.asignacion ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-foreground leading-tight">
                          {sol.asignacion.gestor.nombre} {sol.asignacion.gestor.apellidoPaterno}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatFecha(sol.asignacion.fechaAsignacion)}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/50 bg-muted/40 border border-border/40 px-2 py-0.5 rounded-md">
                        Sin asignar
                      </span>
                    )}
                  </TableCell>

                  {/* Expediente */}
                  <TableCell className="py-3 text-center" onClick={e => e.stopPropagation()}>
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      title="Ver expediente digital"
                      onClick={() => router.push(`/dashboard/admin/solicitudes/${sol.id}/expediente`)}
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>

                  {/* PDF */}
                  <TableCell className="py-3 text-center" onClick={e => e.stopPropagation()}>
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      title="Generar PDF de solicitud"
                      onClick={() => router.push(`/dashboard/admin/solicitudes/${sol.id}/pdf`)}
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="py-3" onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/60 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 p-1.5 shadow-lg border-border/60">

                        <DropdownMenuItem
                          className="gap-3 cursor-pointer rounded-md px-2.5 py-2 focus:bg-accent group/item"
                          onClick={() => console.log('Enviar a financiamiento', sol.id)}
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover/item:bg-primary/15">
                            <SendHorizonal className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex flex-col gap-0">
                            <span className="text-xs font-medium text-foreground leading-tight">Enviar a Financiamiento</span>
                            <span className="text-[11px] text-muted-foreground leading-tight">Pasar al equipo de análisis financiero</span>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="gap-3 cursor-pointer rounded-md px-2.5 py-2 focus:bg-accent group/item"
                          onClick={() => console.log('Devolver al solicitante', sol.id)}
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover/item:bg-amber-500/15">
                            <RotateCcw className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex flex-col gap-0">
                            <span className="text-xs font-medium text-foreground leading-tight">Devolver al Solicitante</span>
                            <span className="text-[11px] text-muted-foreground leading-tight">Solicitar correcciones o información faltante</span>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-1 bg-border/60" />

                        <DropdownMenuItem
                          className="gap-3 cursor-pointer rounded-md px-2.5 py-2 focus:bg-destructive/10 group/item"
                          onClick={() => console.log('Rechazar solicitud', sol.id)}
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive group-hover/item:bg-destructive/15">
                            <XCircle className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex flex-col gap-0">
                            <span className="text-xs font-medium text-destructive leading-tight">Rechazar Solicitud</span>
                            <span className="text-[11px] text-muted-foreground leading-tight">Declinar definitivamente esta solicitud</span>
                          </div>
                        </DropdownMenuItem>

                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Paginacion meta={meta} onPaginar={onPaginar} />
    </div>
  )
}