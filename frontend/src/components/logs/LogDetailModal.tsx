'use client';

import {
  X,
  Copy,
  Check,
  Monitor,
  Globe,
  Hash,
  User,
  Clock,
  Tag,
  FileText,
  Code2,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { LogAuditoria } from '@/lib/types/logs.types';
import {
  ACCION_CONFIG,
  MODULO_CONFIG,
  formatFullDate,
  formatRelativeTime,
} from '@/lib/config/logs.config';

interface LogDetailModalProps {
  log: LogAuditoria | null;
  loading: boolean;
  onClose: () => void;
}

export function LogDetailModal({ log, loading, onClose }: LogDetailModalProps) {
  const isOpen = loading || log !== null;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer from right */}
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col overflow-hidden bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del registro de auditoría"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Detalle del registro</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="Cerrar panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <LogDetailSkeleton />
          ) : log ? (
            <LogDetailContent log={log} />
          ) : null}
        </div>
      </aside>
    </>
  );
}

// ─────────────────────────────────────────
// CONTENT
// ─────────────────────────────────────────

function LogDetailContent({ log }: { log: LogAuditoria }) {
  const accionCfg = ACCION_CONFIG[log.accion];
  const moduloCfg = MODULO_CONFIG[log.modulo];
  const AccionIcon = (LucideIcons as Record<string, React.ElementType>)[accionCfg.icon] as React.ElementType;
  const ModuloIcon = (LucideIcons as Record<string, React.ElementType>)[moduloCfg.icon] as React.ElementType;

  return (
    <div className="space-y-5">
      {/* Badges acción + módulo */}
      <div className="flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${accionCfg.className}`}
        >
          {AccionIcon && <AccionIcon className="h-3.5 w-3.5" />}
          {accionCfg.label}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded border px-3 py-1 text-sm font-medium ${moduloCfg.className}`}
        >
          {ModuloIcon && <ModuloIcon className="h-3.5 w-3.5" />}
          {moduloCfg.label}
        </span>
      </div>

      {/* Descripción */}
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Descripción
        </p>
        <p className="rounded-lg bg-muted/50 px-3 py-2.5 text-sm text-foreground leading-relaxed">
          {log.descripcion}
        </p>
      </div>

      <Separator />

      {/* Campos clave */}
      <div className="grid gap-3">
        <DetailRow
          icon={Clock}
          label="Fecha y hora"
          value={formatFullDate(log.creadoEn)}
          subvalue={formatRelativeTime(log.creadoEn)}
        />

        <DetailRow
          icon={Hash}
          label="ID del registro"
          value={log.id}
          copyable
          mono
        />

        {log.entidadId && (
          <DetailRow
            icon={Tag}
            label="Entidad afectada"
            value={log.entidadId}
            copyable
            mono
          />
        )}

        {log.usuarioId && (
          <DetailRow
            icon={User}
            label="Usuario"
            value={
              log.usuario
                ? `${log.usuario.nombre} ${log.usuario.apellidoPaterno}`
                : log.usuarioId
            }
            subvalue={log.usuario?.correo ?? log.usuarioId}
            copyable={!log.usuario}
            mono={!log.usuario}
          />
        )}

        {log.ip && (
          <DetailRow
            icon={Globe}
            label="Dirección IP"
            value={log.ip}
            copyable
            mono
          />
        )}

        {log.userAgent && (
          <DetailRow
            icon={Monitor}
            label="User Agent"
            value={log.userAgent}
            truncate
          />
        )}
      </div>

      {/* Metadata */}
      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <>
          <Separator />
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Metadata adicional
              </p>
            </div>
            <MetadataViewer data={log.metadata} />
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// DETAIL ROW
// ─────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
  subvalue,
  copyable,
  mono,
  truncate,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subvalue?: string;
  copyable?: boolean;
  mono?: boolean;
  truncate?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex items-center gap-1.5">
          <p
            className={`text-sm text-foreground ${mono ? 'font-mono text-xs' : ''} ${truncate ? 'truncate' : 'break-all'}`}
            title={truncate ? value : undefined}
          >
            {value}
          </p>
          {copyable && (
            <button
              onClick={handleCopy}
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Copiar valor"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          )}
        </div>
        {subvalue && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subvalue}</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// METADATA VIEWER
// ─────────────────────────────────────────

function MetadataViewer({ data }: { data: Record<string, unknown> }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-3 font-mono text-xs leading-relaxed text-foreground">
        {json}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 flex items-center gap-1 rounded border bg-card px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Copiar JSON"
      >
        {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────

function LogDetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-20 rounded" />
      </div>
      <div>
        <Skeleton className="mb-2 h-3 w-20" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
      <Separator />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-7 w-7 rounded-md" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}