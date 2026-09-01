import { FileSearch } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/table'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Paginacion } from '@/shared/components/common/Paginacion'
import { cn } from '@/shared/lib/cn'
import { formatMontoCompacto } from '@/features/dashboard/lib/dashboard.format'
import { ESTATUS_STYLES, SECTOR_LABELS, formatFecha } from '@/shared/config/solicitudes.config'
import type { FilaReporte } from '@/features/reportes/types/reportes.types'
import type { PaginacionData } from '@/shared/types/api'

interface Props {
  filas: FilaReporte[]
  paginacion: PaginacionData
  cambiarPagina: (page: number) => void
  cargando: boolean
}

export function TablaReporte({ filas, paginacion, cambiarPagina, cargando }: Props) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">Vista previa</h2>
        <span className="text-[11px] text-muted-foreground">Primeras columnas — el Excel incluye el detalle completo</span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Folio</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estatus</TableHead>
            <TableHead>Solicitante</TableHead>
            <TableHead>Programa</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead>Gestor / Analista</TableHead>
            <TableHead className="text-right">Expediente</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cargando && filas.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 9 }).map((__, j) => (
                  <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                ))}
              </TableRow>
            ))
          ) : filas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="py-14 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <FileSearch className="size-7 opacity-40" />
                  <p className="text-sm">Ninguna solicitud coincide con estos filtros.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filas.map((f) => {
              const estilo = ESTATUS_STYLES[f.estatus]
              return (
                <TableRow key={f.folio}>
                  <TableCell className="font-mono text-xs text-primary">{f.folio}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatFecha(f.fechaSolicitud)}</TableCell>
                  <TableCell>
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium', estilo?.className)}>
                      <span className={cn('size-1.5 rounded-full', estilo?.dotClass)} />
                      {estilo?.label ?? f.estatus}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate text-xs">{f.nombreSolicitante ?? '—'}</TableCell>
                  <TableCell className="max-w-[140px] truncate text-xs">{f.programa}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{f.sector ? SECTOR_LABELS[f.sector] : '—'}</TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums">{formatMontoCompacto(f.montoSolicitado)}</TableCell>
                  <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground">
                    {f.analista ?? f.gestor ?? '—'}
                  </TableCell>
                  <TableCell className="text-right text-xs font-medium tabular-nums">{f.porcentajeExpediente}%</TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {paginacion.total > 0 && <Paginacion meta={paginacion} onPaginar={cambiarPagina} />}
    </section>
  )
}
