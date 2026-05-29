// components/admin/solicitudes/PromocionTable.tsx
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  User,
  Building2,
  FolderOpen,
  FileText,
  MoreHorizontal,
  SendHorizonal,
  RotateCcw,
  XCircle,
} from 'lucide-react'
import type { SolicitudPromocion, PaginacionMeta } from '@/lib/types/solicitudes.types'

const ESTATUS_STYLES: Record<string, { label: string; className: string; dotClass: string }> = {
  BORRADOR: {
    label: 'Borrador',
    className: 'border-border/60 text-muted-foreground bg-muted/40',
    dotClass: 'bg-muted-foreground/50',
  },
  PENDIENTE: {
    label: 'Pendiente',
    className: 'border-amber-300/70 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30',
    dotClass: 'bg-amber-500',
  },
  EN_REVISION: {
    label: 'En revisión',
    className: 'border-primary/30 text-primary bg-primary/5',
    dotClass: 'bg-primary',
  },
  APROBADO: {
    label: 'Aprobado',
    className: 'border-emerald-300/70 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
    dotClass: 'bg-emerald-500',
  },
  RECHAZADO: {
    label: 'Rechazado',
    className: 'border-destructive/30 text-destructive bg-destructive/5',
    dotClass: 'bg-destructive',
  },
}

const SECTOR_LABELS: Record<string, string> = {
  AGROPECUARIO: 'Agropecuario',
  INDUSTRIAL: 'Industrial',
  COMERCIAL: 'Comercial',
  SERVICIOS: 'Servicios',
  TECNOLOGIA: 'Tecnología',
  OTRO: 'Otro',
}

const TAMANO_LABELS: Record<string, string> = {
  MICRO: 'Micro',
  PEQUENA: 'Pequeña',
  MEDIANA: 'Mediana',
  GRANDE: 'Grande',
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatMonto(monto?: number) {
  if (!monto) return null
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(monto)
}

function NombreSolicitante({ s }: { s: SolicitudPromocion }) {
  const d = s.datosSolicitante
  if (!d) return <span className="text-muted-foreground text-xs italic">Sin datos</span>

  const nombre = [d.nombre, d.apellidoPaterno, d.apellidoMaterno].filter(Boolean).join(' ')
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-medium text-sm leading-tight text-foreground">{nombre}</span>
      {d.rfc && (
        <span className="text-[11px] text-muted-foreground font-mono tracking-wide">
          {d.rfc}
        </span>
      )}
    </div>
  )
}

interface Props {
  solicitudes: SolicitudPromocion[]
  meta: PaginacionMeta
  cargando: boolean
  onPaginar: (page: number) => void
}

export function PromocionTable({ solicitudes, meta, cargando, onPaginar }: Props) {
  const router = useRouter()

  if (cargando) {
    return (
      <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/60">
              {['Folio', 'Solicitante', 'Programa', 'Tipo / Sector', 'Tamaño', 'Fecha', 'Estatus', '', '', ''].map((h, i) => (
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

  if (solicitudes.length === 0) {
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

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-border/60 overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/60">
              {[
                { label: 'Folio', extra: '' },
                { label: 'Solicitante', extra: 'w-56' },
                { label: 'Programa', extra: '' },
                { label: 'Tipo / Sector', extra: '' },
                { label: 'Tamaño', extra: '' },
                { label: 'Fecha', extra: '' },
                { label: 'Estatus', extra: '' },
                { label: 'Exp.', extra: 'text-center w-10' },
                { label: 'PDF', extra: 'text-center w-10' },
                { label: '', extra: 'w-10' },
              ].map(({ label, extra }) => (
                <TableHead
                  key={label}
                  className={`text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest py-3 ${extra}`}
                >
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {solicitudes.map((sol, idx) => {
              const estatus = ESTATUS_STYLES[sol.estatus] ?? ESTATUS_STYLES.BORRADOR
              const monto = formatMonto(sol.montoSolicitado)

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
                    <div className="flex items-center gap-2.5">
                      <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                        sol.tipoPersona === 'MORAL'
                          ? 'bg-primary/10 border border-primary/15'
                          : 'bg-accent border border-accent-foreground/10'
                      }`}>
                        {sol.tipoPersona === 'MORAL'
                          ? <Building2 className="h-3.5 w-3.5 text-primary" />
                          : <User className="h-3.5 w-3.5 text-accent-foreground" />
                        }
                      </div>
                      <NombreSolicitante s={sol} />
                    </div>
                  </TableCell>

                  {/* Programa + Monto */}
                  <TableCell className="py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm text-foreground font-medium leading-tight">{sol.programa.nombre}</span>
                      {monto
                        ? <span className="text-xs text-muted-foreground tabular-nums">{monto}</span>
                        : <span className="text-xs text-muted-foreground/40">Sin monto</span>
                      }
                    </div>
                  </TableCell>

                  {/* Tipo / Sector */}
                  <TableCell className="py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-foreground">
                        {sol.tipoPersona === 'FISICA'
                          ? 'Persona Física'
                          : sol.tipoPersona === 'MORAL'
                            ? 'Persona Moral'
                            : <span className="text-muted-foreground">—</span>
                        }
                      </span>
                      {sol.sector && (
                        <span className="text-xs text-muted-foreground">
                          {SECTOR_LABELS[sol.sector] ?? sol.sector}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Tamaño */}
                  <TableCell className="py-3">
                    {sol.tamanoEmpresa
                      ? (
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md border border-border/40 font-medium">
                          {TAMANO_LABELS[sol.tamanoEmpresa]}
                        </span>
                      )
                      : <span className="text-muted-foreground text-xs">—</span>
                    }
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

                  {/* Expediente */}
                  <TableCell className="py-3 text-center" onClick={e => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Ver expediente digital"
                      onClick={() => router.push(`/dashboard/admin/solicitudes/${sol.id}/expediente`)}
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>

                  {/* PDF */}
                  <TableCell className="py-3 text-center" onClick={e => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Generar PDF de solicitud"
                      onClick={() => router.push(`/dashboard/admin/solicitudes/${sol.id}/pdf`)}
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>

                  {/* Dropdown acciones */}
                  <TableCell className="py-3" onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
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

      {/* Paginación */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">
          Mostrando{' '}
          <span className="font-semibold text-foreground">
            {Math.min((meta.page - 1) * meta.limit + 1, meta.total)}–{Math.min(meta.page * meta.limit, meta.total)}
          </span>{' '}
          de{' '}
          <span className="font-semibold text-foreground">{meta.total.toLocaleString('es-MX')}</span>{' '}
          solicitudes
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 border-border/60 hover:bg-accent hover:text-accent-foreground"
            disabled={meta.page <= 1}
            onClick={() => onPaginar(meta.page - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
            const p = Math.max(1, meta.page - 2) + i
            if (p > meta.totalPages) return null
            return (
              <Button
                key={p}
                variant={p === meta.page ? 'default' : 'outline'}
                size="icon"
                className={`h-7 w-7 text-xs border-border/60 ${
                  p === meta.page
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => onPaginar(p)}
              >
                {p}
              </Button>
            )
          })}

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 border-border/60 hover:bg-accent hover:text-accent-foreground"
            disabled={meta.page >= meta.totalPages}
            onClick={() => onPaginar(meta.page + 1)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}