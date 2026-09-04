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
    exportando,
    error,
    updateFilter,
    resetFilters,
    goToPage,
    refresh,
    fetchLogById,
    setSelectedLog,
    exportar,
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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-screen-8xl space-y-5 p-4 md:p-6">
        <PageHeader
          title="Auditoría del sistema"
          description="Registro completo de acciones y eventos"
          backHref="/dashboard/admin/configuracion"
          action={{
            label: 'Exportar Excel',
            onClick: exportar,
            loading: exportando,
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