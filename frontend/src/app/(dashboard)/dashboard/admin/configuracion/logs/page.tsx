'use client';

import { Download } from 'lucide-react';
import { LogsStats } from '@/features/settings/components/logs/LogsStats';
import { LogsFilters } from '@/features/settings/components/logs/LogsFilters';
import { LogsTable } from '@/features/settings/components/logs/LogsTable';
import { LogDetailModal } from '@/features/settings/components/logs/LogDetailModal';
import { useLogs } from '@/features/settings/hooks/useLogs';
import { PageHeader } from '@/shared/components/common/PageHeader';

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
      <div className="mx-auto max-w-screen-8xl space-y-5 p-4 md:p-6">
        <PageHeader
          title="Auditoría del sistema"
          description="Registro completo de acciones y eventos"
          backHref="/dashboard/admin/configuracion"
          action={{
            label: 'Exportar CSV',
            onClick: handleExportCSV,
            loading: loading || !logs.length,
            icon: <Download className="h-4 w-4" />,
            variant: 'outline',
          }}
        />

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