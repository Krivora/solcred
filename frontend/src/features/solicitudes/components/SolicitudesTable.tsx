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
import { EstatusBadge } from './EstatusBadge'
import { SolicitudesEmptyState } from './SolicitudesEmptyState'
import { SolicitudEnviarDialog } from './SolicitudEnviarDialog'
import { solicitudesApi } from '@/features/solicitudes/api/solicitudes.api'
import type { SolicitudListItem } from '@/features/solicitudes/types/solicitud.types'
import { Pencil, Send, FolderOpen, FileText, Loader2, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { SolicitanteCell } from '@/shared/components/common/SolicitanteCell'
import { useDescargarPDF } from '@/features/solicitudes/hooks/useDescargarPDF'
import { solicitudesToast } from '@/shared/lib/toaster'

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

/** Navega al expediente marcando la transición como "avance" (slide de entrada). */
const irAExpediente = (router: ReturnType<typeof useRouter>, id: string) => {
  sessionStorage.setItem('nav-direction', 'adelante')
  router.push(`/dashboard/usuarios/expediente/${id}`)
}

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
  s: SolicitudListItem
  onEnviarClick: (s: SolicitudListItem) => void
  onDescargar: (id: string, folio: string) => void
  idDescargando: string | null
  router: ReturnType<typeof useRouter>
}) {
  const editable = s.estatus === 'BORRADOR' || s.estatus === 'EN_CORRECCION'
  const montoTotal = (s: SolicitudListItem) =>
  s.datosCredito?.conceptos.reduce((acc, c) => acc + c.monto, 0) ?? 0
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
        {montoTotal(s) > 0 ? (
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {currency(montoTotal(s))}
            {s.datosCredito?.plazoMeses ? ` · ${s.datosCredito.plazoMeses} meses` : ''}
          </p>
        ) : null}
      </div>

      {/* Meta grid: sector, fecha */}
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
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 pt-3 border-t border-border/60">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0"
          title="Ver expediente digital"
          onClick={() => irAExpediente(router, s.id)}
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
            onClick={() => irAExpediente(router, s.id)}
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
  solicitudes: SolicitudListItem[]
  isLoading: boolean
  onEnviada: () => void
}

export function SolicitudesTable({ solicitudes, isLoading, onEnviada }: SolicitudesTableProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<SolicitudListItem | null>(null)
  const { descargar, idDescargando } = useDescargarPDF()
  function handleEnviarClick(s: SolicitudListItem) {
    setSelected(s)
    setDialogOpen(true)
  }

  async function handleConfirmarEnvio(id: string): Promise<boolean> {
    try {
      await solicitudesApi.enviar(id)
      onEnviada()
      solicitudesToast.solicitudEnviada()
      return true
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al enviar la solicitud'
      solicitudesToast.error('Error al enviar la solicitud', msg)
      return false
    }
  }
  const isEmpty = !isLoading && solicitudes.length === 0
  const montoTotal = (s: SolicitudListItem) =>
    s.datosCredito?.conceptos.reduce((acc, c) => acc + c.monto, 0) ?? 0
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
            <div className="hidden md:block rounded-xl border border-border/60 overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/60">
                <TableHead className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3 w-28">
                  Folio
                </TableHead>
                <TableHead className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3 w-80">
                  Solicitante
                </TableHead>
                <TableHead className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3">
                  Programa
                </TableHead>
                <TableHead className="hidden lg:table-cell text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3">
                  Sector
                </TableHead>
                <TableHead className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3">
                  Estatus
                </TableHead>
                <TableHead className="hidden lg:table-cell text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3">
                  Fecha
                </TableHead>
                <TableHead className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3 text-center w-10">
                  Exp.
                </TableHead>
                <TableHead className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3 text-center w-10">
                  PDF
                </TableHead>
                <TableHead className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3 text-right pr-4">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && <TableSkeleton />}

              {isEmpty && (
                <TableRow>
                  <TableCell colSpan={8} className="p-0">
                    <SolicitudesEmptyState />
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                solicitudes.map((s) => (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer hover:bg-accent/40 transition-colors duration-100 border-b border-border/40 last:border-0 group"
                  >
                    {/* Folio */}
                    <TableCell className="py-3">
                      <span className="text-xs font-mono font-semibold text-primary/80 bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-md">
                        {s.folio}
                      </span>
                    </TableCell>

                    {/* Solicitante */}
                    <TableCell className="py-3">
                      <SolicitanteCell datos={s.datosSolicitante} tipoPersona={s.tipoPersona} />
                    </TableCell>

                    {/* Programa */}
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-foreground font-medium leading-tight">
                          {s.programa.nombre}
                        </span>
                        {montoTotal(s) > 0
                          ? <span className="text-xs text-muted-foreground tabular-nums">{currency(montoTotal(s))}</span>
                          : <span className="text-xs text-muted-foreground/40">Sin monto</span>
                        }
                      </div>
                    </TableCell>

                    {/* Sector */}
                    <TableCell className="hidden lg:table-cell py-3">
                      {s.sector
                        ? <span className="text-xs font-medium text-foreground">{SECTOR_LABELS[s.sector]}</span>
                        : <span className="text-xs text-muted-foreground/40">—</span>
                      }
                    </TableCell>

                    {/* Estatus */}
                    <TableCell className="py-3">
                      <EstatusBadge estatus={s.estatus} size="sm" />
                    </TableCell>

                    {/* Fecha */}
                    <TableCell className="hidden lg:table-cell py-3">
                      <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                        {format(new Date(s.creadoEn), "d MMM, yyyy", { locale: es })}
                      </span>
                    </TableCell>

                    {/* Expediente */}
                    <TableCell className="py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        title="Ver expediente digital"
                        onClick={() => irAExpediente(router, s.id)}
                      >
                        <FolderOpen className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>

                    {/* PDF */}
                    <TableCell className="py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        title="Generar PDF"
                        disabled={idDescargando === s.id}
                        onClick={() => descargar(s.id)}
                      >
                        {idDescargando === s.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <FileText className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="py-3 pr-4" onClick={(e) => e.stopPropagation()}>
                      {s.estatus === 'BORRADOR' || s.estatus === 'EN_CORRECCION' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1.5 text-xs rounded-full"
                            onClick={() => router.push(`/dashboard/usuarios/solicitudes/${s.id}/editar`)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 gap-1.5 text-xs rounded-full"
                            onClick={() => handleEnviarClick(s)}
                          >
                            <Send className="w-3.5 h-3.5" />
                            Enviar
                          </Button>
                        </div>
                      ) : null}
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