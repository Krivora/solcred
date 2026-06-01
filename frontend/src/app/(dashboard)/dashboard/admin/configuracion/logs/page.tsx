'use client';

import { ShieldCheck, Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { LogsStats } from '@/features/logs/components/LogsStats';
import { LogsFilters } from '@/features/logs/components/LogsFilters';
import { LogsTable } from '@/features/logs/components/LogsTable';
import { LogDetailModal } from '@/features/logs/components/LogDetailModal';
import { useLogs } from '@/lib/hooks/useLogs';

export default function LogsPage() {
  const {
    logs,
    resumen,
    paginacion,
    filters,
    selectedLog,
    loading,
    loadingResumen,
    loadingDetail,
    error,
    updateFilter,
    resetFilters,
    goToPage,
    refresh,
    fetchLogById,
    setSelectedLog,
  } = useLogs();

  const handleViewDetail = (log: typeof selectedLog) => {
    if (!log) return;
    // Si el log ya tiene datos completos lo mostramos directo,
    // si no lo cargamos por ID para obtener metadata completa
    if (log.metadata !== undefined) {
      setSelectedLog(log);
    } else {
      fetchLogById(log.id);
    }
  };

  const handleExportCSV = () => {
    if (!logs.length) return;

    const headers = ['Fecha', 'Acción', 'Módulo', 'Descripción', 'Usuario', 'IP'];
    const rows = logs.map((l) => [
      new Date(l.creadoEn).toLocaleString('es-MX'),
      l.accion,
      l.modulo,
      `"${l.descripcion.replace(/"/g, '""')}"`,
      l.usuario
        ? `${l.usuario.nombre} ${l.usuario.apellidoPaterno}`
        : l.usuarioId ?? '',
      l.ip ?? '',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_auditoria_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-screen-2xl space-y-5 p-4 md:p-6">
        {/* ── Page header ─────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Auditoría del sistema
              </h1>
              <p className="text-sm text-muted-foreground">
                Registro completo de acciones y eventos
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={loading || !logs.length}
            className="gap-2 self-start"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        {/* ── Error global ─────────────────────────── */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        )}

        {/* ── Stats ────────────────────────────────── */}
        <LogsStats resumen={resumen} loading={loadingResumen} />

        {/* ── Filters ──────────────────────────────── */}
        <LogsFilters
          filters={filters}
          onUpdate={updateFilter}
          onReset={resetFilters}
          loading={loading}
        />

        {/* ── Table ────────────────────────────────── */}
        <LogsTable
          logs={logs}
          loading={loading}
          paginacion={paginacion}
          onPageChange={goToPage}
          onViewDetail={handleViewDetail}
          onRefresh={refresh}
        />
      </div>

      {/* ── Detail drawer ────────────────────────── */}
      <LogDetailModal
        log={selectedLog}
        loading={loadingDetail}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}