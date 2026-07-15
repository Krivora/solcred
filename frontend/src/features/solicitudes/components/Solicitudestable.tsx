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
import { Pencil, Send, User, FolderOpen, FileText, Loader2, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { SolicitanteCell } from '@/shared/components/ui/SolicitanteCell'
import { useDescargarPDF } from '../hooks/useDescargarPDF'

const SECTOR_LABELS: Record<string, string> = {
  AGROPECUARIO: 'Agropecuario',
  INDUSTRIAL: 'Industrial',
  COMERCIAL: 'Comercial',
  SERVICIOS: 'Servicios',
  TECNOLOGIA: 'Tecnología',
  OTRO: 'Otro',
}

const currency = (n: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(n)

/* ────────────────────────────────────────────────────────────
   SKELETONS
──────────────────────────────────────────────────────────── */

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

function CardSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-start justify-between">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
          </div>
        </div>
      ))}
    </>
  )
}

/* ────────────────────────────────────────────────────────────
   MOBILE CARD
──────────────────────────────────────────────────────────── */

function SolicitudCard({
  s,
  onEnviarClick,
  onDescargar,
  idDescargando,
  router,
}: {
  s: Solicitud
  onEnviarClick: (s: Solicitud) => void
  onDescargar: (id: string, folio: string) => void
  idDescargando: string | null
  router: ReturnType<typeof useRouter>
}) {
  const editable = s.estatus === 'BORRADOR' || s.estatus === 'EN_CORRECCION'

  return (
    <div className="rounded-lg border border-border bg-card p-4 active:bg-muted/30 transition-colors">
      {/* Top row: folio + estatus */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="font-mono text-xs font-semibold text-primary">#{s.folio}</p>
        <EstatusBadge estatus={s.estatus} size="sm" />
      </div>

      {/* Solicitante */}
      <div className="mb-3">
        <SolicitanteCell datos={s.datosSolicitante} tipoPersona={s.tipoPersona} />
      </div>

      {/* Programa + monto */}
      <div className="mb-3">
        <p className="text-sm font-medium text-foreground">{s.programa.nombre}</p>
        {s.montoSolicitado ? (
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {currency(s.montoSolicitado)}
            {s.plazoSolicitado ? ` · ${s.plazoSolicitado} meses` : ''}
          </p>
        ) : null}
      </div>

      {/* Meta grid: sector, fecha, gestor */}
      <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 mb-4 text-xs">
        <div>
          <span className="text-muted-foreground/70">Sector</span>
          <p className="text-foreground">{s.sector ? SECTOR_LABELS[s.sector] : '—'}</p>
        </div>
        <div>
          <span className="text-muted-foreground/70">Fecha</span>
          <p className="text-foreground">
            {format(new Date(s.creadoEn), "d MMM, yyyy", { locale: es })}
          </p>
        </div>
        <div className="col-span-2">
          <span className="text-muted-foreground/70">Gestor asignado</span>
          {s.gestorAsignado ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-2.5 w-2.5 text-primary" />
              </div>
              <span className="text-foreground truncate">{s.gestorAsignado.nombre}</span>
            </div>
          ) : (
            <p className="text-muted-foreground">Sin asignar</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 pt-3 border-t border-border/60">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0"
          title="Ver expediente digital"
          onClick={() => router.push(`/dashboard/usuarios/expediente/${s.id}`)}
        >
          <FolderOpen className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0"
          title="Generar PDF"
          disabled={idDescargando === s.id}
          onClick={() => onDescargar(s.id, s.folio)}
        >
          {idDescargando === s.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </Button>

        {editable && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-9 flex-1 gap-1.5 text-xs rounded-full"
              onClick={() => router.push(`/dashboard/usuarios/solicitudes/${s.id}/editar`)}
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar
            </Button>
            <Button
              size="sm"
              className="h-9 flex-1 gap-1.5 text-xs rounded-full"
              onClick={() => onEnviarClick(s)}
            >
              <Send className="w-3.5 h-3.5" />
              Enviar
            </Button>
          </>
        )}

        {!editable && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 flex-1 gap-1.5 text-xs rounded-full ml-1"
            onClick={() => router.push(`/dashboard/usuarios/expediente/${s.id}`)}
          >
            Ver detalle
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   MAIN
──────────────────────────────────────────────────────────── */

interface SolicitudesTableProps {
  solicitudes: Solicitud[]
  isLoading: boolean
  onEnviada: () => void
}

export function SolicitudesTable({ solicitudes, isLoading, onEnviada }: SolicitudesTableProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Solicitud | null>(null)
  const { descargar, idDescargando } = useDescargarPDF()

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

  const isEmpty = !isLoading && solicitudes.length === 0

  return (
    <>
      {/* ── MOBILE / TABLET: cards (< md) ─────────────────────── */}
      <div className="md:hidden">
        {isEmpty ? (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <SolicitudesEmptyState />
          </div>
        ) : (
          <div className="space-y-3">
            {isLoading && <CardSkeleton />}
            {!isLoading &&
              solicitudes.map((s) => (
                <SolicitudCard
                  key={s.id}
                  s={s}
                  onEnviarClick={handleEnviarClick}
                  onDescargar={descargar}
                  idDescargando={idDescargando}
                  router={router}
                />
              ))}
          </div>
        )}
      </div>

      {/* ── DESKTOP: tabla (>= md) ─────────────────────────────── */}
      <div className="hidden md:block rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
                <TableHead className="py-2.5 pl-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground w-20">
                  Folio
                </TableHead>
                <TableHead className="py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground w-80">
                  Solicitante
                </TableHead>
                <TableHead className="py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground w-50">
                  Programa
                </TableHead>
                <TableHead className="hidden lg:table-cell py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground w-20">
                  Sector
                </TableHead>
                <TableHead className="py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground w-45">
                  Estatus
                </TableHead>
                <TableHead className="hidden lg:table-cell py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground w-35">
                  Fecha
                </TableHead>
                <TableHead className="hidden xl:table-cell py-2.5 pl-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground w-60">
                  Gestor Asignado
                </TableHead>
                <TableHead className="py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground text-left w-10">
                  Solicitud
                </TableHead>
                <TableHead className="py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground text-left w-15">
                  Expediente
                </TableHead>
                <TableHead className="py-2.5 pr-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && <TableSkeleton />}

              {isEmpty && (
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
                          {currency(s.montoSolicitado)}
                          {s.plazoSolicitado ? ` · ${s.plazoSolicitado} meses` : ''}
                        </p>
                      ) : null}
                    </TableCell>

                    {/* Sector */}
                    <TableCell className="hidden lg:table-cell py-3">
                      <span className="text-sm text-muted-foreground">
                        {s.sector ? SECTOR_LABELS[s.sector] : '—'}
                      </span>
                    </TableCell>

                    {/* Estatus */}
                    <TableCell className="py-3">
                      <EstatusBadge estatus={s.estatus} size="sm" />
                    </TableCell>

                    {/* Fecha */}
                    <TableCell className="hidden lg:table-cell py-3">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(s.creadoEn), "d MMM, yyyy", { locale: es })}
                      </span>
                    </TableCell>

                    {/* Gestor Asignado */}
                    <TableCell className="hidden xl:table-cell py-3">
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
                    <TableCell
                      className="py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto flex items-center gap-2"
                        title="Generar PDF"
                        disabled={idDescargando === s.id}
                        onClick={() => descargar(s.id, s.folio)}
                      >
                        {idDescargando === s.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Generando...</span>
                          </>
                        ) : (
                          <>
                            <span>Solicitud</span>
                            <FileText className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell
                      className="py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto flex items-center gap-2"
                        title="Generar PDF"
                        disabled={idDescargando === s.id}
                        onClick={() => router.push(`/dashboard/usuarios/expediente/${s.id}`)}
                      >
                        {idDescargando === s.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Generando...</span>
                          </>
                        ) : (
                          <>
                            <span>Expediente</span>
                            <FolderOpen className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="py-3 pr-4">
                      {s.estatus === 'BORRADOR' || s.estatus === 'EN_CORRECCION' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs rounded-full"
                            onClick={() => router.push(`/dashboard/usuarios/solicitudes/${s.id}/editar`)}
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
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
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