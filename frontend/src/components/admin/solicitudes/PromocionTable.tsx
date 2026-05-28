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

const ESTATUS_STYLES: Record<string, { label: string; variant: string; className: string }> = {
  BORRADOR: { label: 'Borrador', variant: 'outline', className: 'border-border text-muted-foreground' },
  PENDIENTE: { label: 'Pendiente', variant: 'outline', className: 'border-amber-400 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30' },
  EN_REVISION: { label: 'En revisión', variant: 'outline', className: 'border-blue-400 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30' },
  APROBADO: { label: 'Aprobado', variant: 'outline', className: 'border-emerald-400 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' },
  RECHAZADO: { label: 'Rechazado', variant: 'destructive', className: '' },
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
      <span className="font-medium text-sm leading-tight">{nombre}</span>
      {d.rfc && <span className="text-xs text-muted-foreground font-mono">{d.rfc}</span>}
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
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              {['Solicitante', 'Programa', 'Tipo / Sector', 'Tamaño', 'Fecha', 'Estatus', ''].map(h => (
                <TableHead key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
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
      <div className="rounded-lg border border-border/60 bg-muted/20 flex flex-col items-center justify-center py-16 gap-3">
        <div className="p-4 bg-muted rounded-full">
          <Eye className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No se encontraron solicitudes</p>
        <p className="text-xs text-muted-foreground/70">Intenta ajustar los filtros</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[220px]">Solicitante</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Programa</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo / Sector</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tamaño</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fecha</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estatus</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center w-10">Exp.</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center w-10">PDF</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {solicitudes.map(sol => {
              const estatus = ESTATUS_STYLES[sol.estatus] ?? ESTATUS_STYLES.BORRADOR
              const monto = formatMonto(sol.montoSolicitado)

              return (
                <TableRow
                  key={sol.id}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => router.push(`/dashboard/admin/solicitudes/${sol.id}`)}
                >
                  {/* Solicitante */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                        {sol.tipoPersona === 'MORAL'
                          ? <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          : <User className="h-3.5 w-3.5 text-muted-foreground" />
                        }
                      </div>
                      <NombreSolicitante s={sol} />
                    </div>
                  </TableCell>

                  {/* Programa + Monto */}
                  <TableCell className="py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm text-foreground">{sol.programa.nombre}</span>
                      {monto
                        ? <span className="text-xs text-muted-foreground tabular-nums">{monto}</span>
                        : <span className="text-xs text-muted-foreground/50">Sin monto</span>
                      }
                    </div>
                  </TableCell>

                  {/* Tipo / Sector */}
                  <TableCell className="py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium">
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
                      ? <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">{TAMANO_LABELS[sol.tamanoEmpresa]}</span>
                      : <span className="text-muted-foreground text-xs">—</span>
                    }
                  </TableCell>

                  {/* Fecha */}
                  <TableCell className="py-3">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatFecha(sol.creadoEn)}
                    </span>
                  </TableCell>

                  {/* Estatus */}
                  <TableCell className="py-3">
                    <Badge
                      variant={estatus.variant as any}
                      className={`text-xs font-medium ${estatus.className}`}
                    >
                      {estatus.label}
                    </Badge>
                  </TableCell>

                  {/* Acción */}
                  <TableCell className="py-3 text-center" onClick={e => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                      title="Ver expediente digital"
                      onClick={() => router.push(`/dashboard/admin/solicitudes/${sol.id}/expediente`)}
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>

                  {/* Generar PDF */}
                  <TableCell className="py-3 text-center" onClick={e => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                      title="Generar PDF de solicitud"
                      onClick={() => router.push(`/dashboard/admin/solicitudes/${sol.id}/pdf`)}
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>

                  {/* Acciones dropdown */}
                  <TableCell className="py-3" onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 p-1.5">

                        <DropdownMenuItem
                          className="gap-3 cursor-pointer rounded-md px-2.5 py-2 focus:bg-accent group"
                          onClick={() => console.log('Enviar a financiamiento', sol.id)}
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary/15">
                            <SendHorizonal className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex flex-col gap-0">
                            <span className="text-xs font-medium text-foreground leading-tight">Enviar a Financiamiento</span>
                            <span className="text-[11px] text-muted-foreground leading-tight">Pasar al equipo de análisis financiero</span>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="gap-3 cursor-pointer rounded-md px-2.5 py-2 focus:bg-accent group"
                          onClick={() => console.log('Devolver al solicitante', sol.id)}
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/15">
                            <RotateCcw className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex flex-col gap-0">
                            <span className="text-xs font-medium text-foreground leading-tight">Devolver al Solicitante</span>
                            <span className="text-[11px] text-muted-foreground leading-tight">Solicitar correcciones o información faltante</span>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-1" />

                        <DropdownMenuItem
                          className="gap-3 cursor-pointer rounded-md px-2.5 py-2 focus:bg-destructive/10 group"
                          onClick={() => console.log('Rechazar solicitud', sol.id)}
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive group-hover:bg-destructive/15">
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
          <span className="font-medium text-foreground">
            {Math.min((meta.page - 1) * meta.limit + 1, meta.total)}–{Math.min(meta.page * meta.limit, meta.total)}
          </span>{' '}
          de <span className="font-medium text-foreground">{meta.total.toLocaleString('es-MX')}</span> solicitudes
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
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
                className="h-7 w-7 text-xs"
                onClick={() => onPaginar(p)}
              >
                {p}
              </Button>
            )
          })}

          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
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