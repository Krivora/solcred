'use client'

import { useRouter } from 'next/navigation'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/table'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { FolderOpen, FileText, MoreHorizontal, Loader2 } from 'lucide-react'
import { Paginacion } from '@/shared/components/common/Paginacion'
import {
  ESTATUS_STYLES, SECTOR_LABELS, TAMANO_LABELS, formatFecha, formatMonto,
} from '@/shared/config/solicitudes.config'
import type { SolicitudPromocion, PaginacionMeta } from '@/features/promocion/types/solicitud.types'
import { SolicitanteCell } from '@/shared/components/common/SolicitanteCell'
import type { ReactNode } from 'react'
import { useDescargarPDF } from '@/features/promocion/hooks/useDescargarPDF'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface SolicitudesTableConfig {
  getDetalleUrl?: (id: string) => string
  getExpedienteUrl: (id: string) => string
  mostrarColumnaGestor?: boolean
  mostrarColumnaEstatus?: boolean
  mostrarColumnaComentario?: boolean
  mostrarColumnaPdf?: boolean

  labelFecha?: string
  vacioCopy?: { icon: ReactNode; titulo: string; descripcion: string }

  /** Opcional: si se provee, se agrega columna de acciones (dropdown ...) */
  renderAcciones?: (solicitudId: string) => ReactNode

  /** Opcional: si se provee, se agrega columna de documentos (ej. Histórico) */
  renderDocumentos?: (solicitudId: string, estatus: SolicitudPromocion['estatus']) => ReactNode
}

interface Props {
  solicitudes: SolicitudPromocion[]
  meta: PaginacionMeta
  cargando: boolean
  onPaginar: (page: number) => void
  config: SolicitudesTableConfig
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/60">
            {Array.from({ length: cols }).map((_, i) => (
              <TableHead key={i} className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                <Skeleton className="h-3 w-16 rounded" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={i} className="border-b border-border/40">
              {Array.from({ length: cols }).map((_, j) => (
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

// ─── Vacío ────────────────────────────────────────────────────────────────────

function TableVacio({ icon, titulo, descripcion }: { icon: ReactNode; titulo: string; descripcion: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card flex flex-col items-center justify-center py-20 gap-4">
      <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-primary/50">
        {icon}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{titulo}</p>
        <p className="text-xs text-muted-foreground mt-1">{descripcion}</p>
      </div>
    </div>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function SolicitudesTable({ solicitudes, meta, cargando, onPaginar, config }: Props) {
  const router = useRouter()
  const { descargar, idDescargando } = useDescargarPDF()
  const {
    getDetalleUrl = (id: string) => `/dashboard/admin/promocion/solicitud/${id}`,
    getExpedienteUrl,
    mostrarColumnaGestor = false,
    mostrarColumnaEstatus = true,
    mostrarColumnaComentario = false,
    mostrarColumnaPdf = true,
    labelFecha = 'Recibida',
    vacioCopy,
    renderAcciones,
    renderDocumentos,
  } = config

  // Calculamos cuántas columnas hay para el skeleton
  const colCount = 6
    + (mostrarColumnaGestor ? 1 : 0)
    + (mostrarColumnaEstatus ? 1 : 0)
    + (mostrarColumnaPdf ? 1 : 0)
    + (renderDocumentos ? 1 : 0)
    + (renderAcciones ? 1 : 0)
    + 2 // Exp, PDF (estas dos siempre están)

  if (cargando) return <TableSkeleton cols={colCount} />

  if (solicitudes.length === 0 && vacioCopy) {
    return (
      <TableVacio
        icon={vacioCopy.icon}
        titulo={vacioCopy.titulo}
        descripcion={vacioCopy.descripcion}
      />
    )
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-border/60 overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/60">
              <TableHead className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3 w-28">
                Folio
              </TableHead>
              <TableHead className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3 w-100">
                Solicitante
              </TableHead>
              <TableHead className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3">
                Programa
              </TableHead>
              <TableHead className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3">
                Tamaño / Sector
              </TableHead>
              <TableHead className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3">
                {labelFecha}
              </TableHead>
              {mostrarColumnaEstatus && (
                <TableHead className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3">
                  Estatus
                </TableHead>
              )}
              <TableHead className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3">
                Documentos
              </TableHead>
              {mostrarColumnaGestor && (
                <TableHead className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3 w-40">
                  Gestor
                </TableHead>
              )}
              {mostrarColumnaComentario && (
                <TableHead className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3 w-56">
                  Comentario
                </TableHead>
              )}
              <TableHead className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3 text-center w-10">
                Exp.
              </TableHead>
              {mostrarColumnaPdf && (
                <TableHead className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3 text-center w-10">
                  PDF
                </TableHead>
              )}
              {renderDocumentos && (
                <TableHead className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3 text-center w-10">
                  Docs
                </TableHead>
              )}
              {renderAcciones && (
                <TableHead className="w-15" />
              )}
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
                  onClick={() => {
                    sessionStorage.setItem('nav-direction', 'adelante')
                    router.push(getDetalleUrl(sol.id))
                  }}
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

                  {/* Estatus (opcional) */}
                  {mostrarColumnaEstatus && (
                    <TableCell className="py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${estatus.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${estatus.dotClass}`} />
                        {estatus.label}
                      </span>
                    </TableCell>
                  )}
                  {/* Documentos */}
                  <TableCell className="py-3">
                    {sol.metricas ? (
                      <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                        {sol.metricas.totalSubidos}/{sol.metricas.totalRequeridos}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                  {/* Gestor (opcional) */}
                  {mostrarColumnaGestor && (
                    <TableCell className="py-3">
                      {sol.gestorAsignado ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium text-foreground leading-tight">
                            {sol.gestorAsignado.gestor.usuario.nombre} {sol.gestorAsignado.gestor.usuario.apellidoPaterno}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {formatFecha(sol.gestorAsignado.fechaAsignacion)}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/50 bg-muted/40 border border-border/40 px-2 py-0.5 rounded-md">
                          Sin asignar
                        </span>
                      )}
                    </TableCell>
                  )}
                  {mostrarColumnaComentario && (
                    <TableCell className="py-3">
                      {sol.comentarioPromotor ? (
                        <span className="text-xs text-muted-foreground line-clamp-2" title={sol.comentarioPromotor}>
                          {sol.comentarioPromotor}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </TableCell>
                  )}

                  {/* Expediente */}
                  <TableCell className="py-3 text-center" onClick={e => e.stopPropagation()}>
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      title="Ver expediente digital"
                      onClick={() => router.push(getExpedienteUrl(sol.id))}
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>

                  {/* PDF */}
                  {mostrarColumnaPdf && (
                    <TableCell className="py-3 text-center" onClick={e => e.stopPropagation()}>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        title="Generar PDF"
                        disabled={idDescargando === sol.id}
                        onClick={() => descargar(sol.id)}
                      >
                        {idDescargando === sol.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </TableCell>
                  )}
                  {renderDocumentos && (
                    <TableCell className="py-3 text-center" onClick={e => e.stopPropagation()}>
                      {renderDocumentos(sol.id, sol.estatus)}
                    </TableCell>
                  )}
                  {/* Acciones dropdown */}
                  {renderAcciones && (
                    <TableCell className="py-3" onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-muted-foreground"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 p-1.5 shadow-lg border-border/60">
                          {renderAcciones(sol.id)}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Paginacion meta={{ ...meta, pageSize: 10 }} onPaginar={onPaginar} />
    </div>
  )
}